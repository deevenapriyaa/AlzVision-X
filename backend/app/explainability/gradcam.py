import cv2
import numpy as np
import torch
from PIL import Image
from typing import Dict, Any, List, Tuple, Optional
from pathlib import Path

from app.ml.hybrid_model import HybridMobileNetViT
from app.config import CLASSES


class GradCAMGenerator:
    """
    Genuine Gradient-weighted Class Activation Mapping (Grad-CAM)
    for the Hybrid MobileNetV2 + Vision Transformer model.

    Grad-CAM is calculated from the actual MobileNetV2 convolutional
    feature maps and gradients produced by the trained model.
    """

    def __init__(self):
        self.device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )

        self.model = None
        self.activations = None
        self.gradients = None

        self._load_model()

    # ============================================================
    # LOAD TRAINED MODEL
    # ============================================================

    def _load_model(self):

        try:
            self.model = HybridMobileNetViT(
                num_classes=4
            )

            model_path = Path(
                "backend/models/hybrid_mobilenet_vit.pth"
            )

            if not model_path.exists():
                model_path = Path(
                    "models/hybrid_mobilenet_vit.pth"
                )

            if not model_path.exists():
                raise FileNotFoundError(
                    f"Model weights not found: {model_path}"
                )

            state_dict = torch.load(
                model_path,
                map_location=self.device
            )

            self.model.load_state_dict(
                state_dict,
                strict=True
            )

            self.model.to(self.device)
            self.model.eval()

            self._register_hooks()

            print(
                "[GradCAM] Genuine Grad-CAM model loaded successfully."
            )

        except Exception as e:

            print(
                f"[GradCAM] Model loading failed: {e}"
            )

            self.model = None

    # ============================================================
    # REGISTER GRAD-CAM HOOKS
    # ============================================================

    def _register_hooks(self):

        if self.model is None:
            return

        # Exact target used by your HybridMobileNetViT
        target_layer = self.model.mobilenet.features[-1]

        target_layer.register_forward_hook(
            self._forward_hook
        )

        target_layer.register_full_backward_hook(
            self._backward_hook
        )

        print(
            "[GradCAM] Hook registered on "
            "MobileNetV2 final convolutional feature layer."
        )

    def _forward_hook(
        self,
        module,
        inputs,
        output
    ):

        self.activations = output

    def _backward_hook(
        self,
        module,
        grad_input,
        grad_output
    ):

        self.gradients = grad_output[0]

    # ============================================================
    # IMAGE PREPROCESSING
    # ============================================================

    def _preprocess(
        self,
        pil_image: Image.Image
    ):

        image = pil_image.convert("RGB")

        image = image.resize(
            (224, 224)
        )

        image_np = np.asarray(
            image
        ).astype(
            np.float32
        ) / 255.0

        mean = np.array(
            [0.485, 0.456, 0.406],
            dtype=np.float32
        )

        std = np.array(
            [0.229, 0.224, 0.225],
            dtype=np.float32
        )

        image_np = (
            image_np - mean
        ) / std

        tensor = torch.from_numpy(
            image_np.transpose(2, 0, 1)
        ).float()

        tensor = tensor.unsqueeze(0)

        return tensor.to(
            self.device
        )

    # ============================================================
    # GENERATE GRAD-CAM
    # ============================================================

    def _generate_gradcam(self):

        if self.activations is None:
            raise RuntimeError(
                "Grad-CAM activations were not captured."
            )

        if self.gradients is None:
            raise RuntimeError(
                "Grad-CAM gradients were not captured."
            )

        activations = self.activations
        gradients = self.gradients

        # Global Average Pooling of gradients
        weights = gradients.mean(
            dim=(2, 3),
            keepdim=True
        )

        # Weighted feature maps
        cam = (
            weights * activations
        ).sum(
            dim=1
        )

        # ReLU
        cam = torch.relu(
            cam
        )

        cam = cam.squeeze(
            0
        ).detach().cpu().numpy()

        # Normalize between 0 and 1
        cam -= cam.min()

        max_value = cam.max()

        if max_value > 0:
            cam /= max_value

        return cam

    # ============================================================
    # MAIN GRAD-CAM FUNCTION
    # ============================================================

    def generate_heatmap_and_overlay(
        self,
        pil_image: Image.Image,
        predicted_stage: str,
        confidence: float,
        output_overlay_path: Path,
        output_heatmap_path: Optional[Path] = None
    ) -> Tuple[
        str,
        List[Dict[str, Any]],
        Dict[str, Any]
    ]:

        if self.model is None:
            raise RuntimeError(
                "Trained model is not available for Grad-CAM."
            )

        original = pil_image.convert(
            "RGB"
        )

        original_np = np.asarray(
            original
        )

        height, width = original_np.shape[:2]

        input_tensor = self._preprocess(
            original
        )

        # Clear previous gradients
        self.model.zero_grad(
            set_to_none=True
        )

        self.activations = None
        self.gradients = None

        # --------------------------------------------------------
        # FORWARD + BACKWARD
        # --------------------------------------------------------

        with torch.enable_grad():

            logits, fused_rep, mob_feat = self.model(
                input_tensor
            )

            predicted_index = int(
                torch.argmax(
                    logits,
                    dim=1
                ).item()
            )

            # Use the class actually predicted by the model
            target_score = logits[
                0,
                predicted_index
            ]

            target_score.backward()

        # --------------------------------------------------------
        # GENERATE ACTUAL GRAD-CAM
        # --------------------------------------------------------

        cam = self._generate_gradcam()

        cam = cv2.resize(
            cam,
            (width, height),
            interpolation=cv2.INTER_LINEAR
        )

        cam = np.clip(
            cam,
            0.0,
            1.0
        )

        # Convert to uint8
        heatmap_uint8 = np.uint8(
            cam * 255.0
        )

        # JET heatmap
        colored_heatmap = cv2.applyColorMap(
            heatmap_uint8,
            cv2.COLORMAP_JET
        )

        # Original image → BGR
        original_bgr = cv2.cvtColor(
            original_np,
            cv2.COLOR_RGB2BGR
        )

        # --------------------------------------------------------
        # OVERLAY
        # --------------------------------------------------------

        alpha = 0.45

        overlay = cv2.addWeighted(
            original_bgr,
            1.0 - alpha,
            colored_heatmap,
            alpha,
            0
        )

        # Create output directories
        output_overlay_path.parent.mkdir(
            parents=True,
            exist_ok=True
        )

        cv2.imwrite(
            str(output_overlay_path),
            overlay
        )

        if output_heatmap_path:

            output_heatmap_path.parent.mkdir(
                parents=True,
                exist_ok=True
            )

            cv2.imwrite(
                str(output_heatmap_path),
                colored_heatmap
            )

        # ========================================================
        # GRAD-CAM METRICS
        # ========================================================

        peak_activation = float(
            cam.max()
        )

        mean_activation = float(
            cam.mean()
        )

        threshold = 0.60

        high_activation_mask = (
            cam >= threshold
        )

        high_activation_percentage = (
            float(
                high_activation_mask.mean()
            ) * 100.0
        )

        # Activation center
        ys, xs = np.where(
            high_activation_mask
        )

        if len(xs) > 0:

            center_x = float(
                xs.mean()
            )

            center_y = float(
                ys.mean()
            )

        else:

            center_x = width / 2.0
            center_y = height / 2.0

        normalized_x = (
            center_x / width
        )

        normalized_y = (
            center_y / height
        )

        # Broad spatial location only.
        # This is NOT anatomical segmentation.
        if normalized_y < 0.33:

            spatial_region = (
                "Superior Cerebral Region"
            )

        elif normalized_y < 0.66:

            spatial_region = (
                "Central Cerebral Region"
            )

        else:

            spatial_region = (
                "Inferior Cerebral Region"
            )

        if normalized_x < 0.33:

            hemisphere = "Left"

        elif normalized_x > 0.66:

            hemisphere = "Right"

        else:

            hemisphere = "Central/Bilateral"

        # ========================================================
        # REGION INFORMATION
        # ========================================================

        regions = [
            {
                "region_name": spatial_region,

                "hemisphere": hemisphere,

                "activation_intensity": round(
                    peak_activation * 100.0,
                    1
                ),

                "atrophy_risk": (
                    "Model-attributed activation"
                ),

                "clinical_significance": (
                    "This region was highlighted by "
                    "gradient-based model attribution. "
                    "Grad-CAM does not independently "
                    "establish anatomical atrophy or "
                    "clinical diagnosis."
                )
            }
        ]

        # ========================================================
        # EXPLANATION
        # ========================================================

        explanation_text = (
            f"Gradient-based Grad-CAM attribution "
            f"for the predicted class '{predicted_stage}' "
            f"identified the strongest model activation "
            f"in the {spatial_region}. "
            f"The peak activation was "
            f"{peak_activation * 100:.1f}%, with "
            f"{high_activation_percentage:.1f}% of the "
            f"image exceeding the high-activation threshold."
        )

        # ========================================================
        # METRICS
        # ========================================================

        metrics = {

            "predicted_class_index":
                predicted_index,

            "predicted_class":
                CLASSES[predicted_index],

            "model_confidence":
                round(
                    float(confidence),
                    4
                ),

            "gradcam_peak_activation":
                round(
                    peak_activation,
                    4
                ),

            "gradcam_mean_activation":
                round(
                    mean_activation,
                    4
                ),

            "high_activation_area_percent":
                round(
                    high_activation_percentage,
                    2
                ),

            "activation_center_x":
                round(
                    normalized_x,
                    4
                ),

            "activation_center_y":
                round(
                    normalized_y,
                    4
                ),

            "target_layer":
                "MobileNetV2 features[-1]",

            "method":
                "Gradient-weighted Class Activation Mapping",

            "colormap_type":
                "JET_OVERLAY_ALPHA_45"
        }

        return (
            explanation_text,
            regions,
            metrics
        )