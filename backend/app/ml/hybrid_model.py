import os
import numpy as np
from typing import Dict, Any, Optional

from app.config import CLASSES, CDR_MAPPINGS

try:
    import torch
    import torch.nn as nn
    import torchvision.models as models
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False


if TORCH_AVAILABLE:

    # ============================================================
    # PATCH EMBEDDING
    # ============================================================
    class PatchEmbedding(nn.Module):
        """
        Converts an image into 16x16 patches and projects
        them into a 192-dimensional embedding space.
        """

        def __init__(self, in_channels=3, patch_size=16, emb_dim=192):
            super().__init__()

            self.patch_size = patch_size

            self.projection = nn.Conv2d(
                in_channels,
                emb_dim,
                kernel_size=patch_size,
                stride=patch_size
            )

            self.cls_token = nn.Parameter(
                torch.zeros(1, 1, emb_dim)
            )

            num_patches = (224 // patch_size) ** 2

            self.pos_embedding = nn.Parameter(
                torch.zeros(1, num_patches + 1, emb_dim)
            )

        def forward(self, x):

            B = x.shape[0]

            # Convert image into patch embeddings
            x = self.projection(x)

            # (B, 192, 14, 14)
            x = x.flatten(2)

            # (B, 196, 192)
            x = x.transpose(1, 2)

            # Add CLS token
            cls_tokens = self.cls_token.expand(B, -1, -1)

            # (B, 197, 192)
            x = torch.cat((cls_tokens, x), dim=1)

            # Add positional embeddings
            x = x + self.pos_embedding

            return x


    # ============================================================
    # VISION TRANSFORMER ENCODER BLOCK
    # ============================================================
    class ViTEncoderBlock(nn.Module):
        """
        Lightweight Vision Transformer encoder block.
        """

        def __init__(
            self,
            dim=192,
            num_heads=4,
            mlp_ratio=4.0
        ):
            super().__init__()

            self.norm1 = nn.LayerNorm(dim)

            self.attention = nn.MultiheadAttention(
                dim,
                num_heads,
                batch_first=True
            )

            self.norm2 = nn.LayerNorm(dim)

            mlp_hidden_dim = int(dim * mlp_ratio)

            self.mlp = nn.Sequential(
                nn.Linear(dim, mlp_hidden_dim),
                nn.GELU(),
                nn.Dropout(0.1),
                nn.Linear(mlp_hidden_dim, dim),
                nn.Dropout(0.1)
            )

        def forward(self, x):

            # Self-attention
            norm_x = self.norm1(x)

            attn_out, _ = self.attention(
                norm_x,
                norm_x,
                norm_x
            )

            x = x + attn_out

            # Feed-forward network
            x = x + self.mlp(
                self.norm2(x)
            )

            return x


    # ============================================================
    # HYBRID MOBILENETV2 + VISION TRANSFORMER
    # ============================================================
    class HybridMobileNetViT(nn.Module):
        """
        Hybrid Deep Learning Architecture

        Branch A:
            MobileNetV2 → 1280 features → 512 projection

        Branch B:
            Vision Transformer → 192-dimensional CLS feature

        Fusion:
            512 + 192 = 704
            → 512-dimensional fused representation

        Classifier:
            512 → 128 → 4 Alzheimer stages
        """

        def __init__(self, num_classes=4):

            super().__init__()

            # ====================================================
            # 1. MobileNetV2 BACKBONE
            # ====================================================

            mobilenet = models.mobilenet_v2(
                weights=(
                    models.MobileNet_V2_Weights.DEFAULT
                    if hasattr(models, "MobileNet_V2_Weights")
                    else None
                )
            )

            self.mobilenet = mobilenet

            # Remove original ImageNet classifier
            self.mobilenet.classifier = nn.Identity()

            # 1280 → 512
            self.mobile_projection = nn.Sequential(
                nn.Linear(1280, 512),
                nn.ReLU(),
                nn.Dropout(0.2)
            )

            # ====================================================
            # 2. VISION TRANSFORMER
            # ====================================================

            self.vit_emb_dim = 192

            self.patch_embedding = PatchEmbedding(
                in_channels=3,
                patch_size=16,
                emb_dim=self.vit_emb_dim
            )

            self.vit_blocks = nn.Sequential(
                ViTEncoderBlock(
                    dim=self.vit_emb_dim,
                    num_heads=4
                ),

                ViTEncoderBlock(
                    dim=self.vit_emb_dim,
                    num_heads=4
                ),

                ViTEncoderBlock(
                    dim=self.vit_emb_dim,
                    num_heads=4
                )
            )

            self.vit_norm = nn.LayerNorm(
                self.vit_emb_dim
            )

            # ====================================================
            # 3. FEATURE FUSION
            # ====================================================

            # MobileNet = 512
            # ViT = 192
            # Total = 704

            self.fusion = nn.Sequential(
                nn.Linear(512 + 192, 512),
                nn.ReLU(),
                nn.Dropout(0.3)
            )

            # ====================================================
            # 4. CLASSIFIER
            # ====================================================

            self.classifier = nn.Sequential(
                nn.Linear(512, 128),
                nn.ReLU(),
                nn.Dropout(0.3),
                nn.Linear(128, num_classes)
            )

        # ========================================================
        # FORWARD PASS
        # ========================================================

        def forward(self, x):

            # ----------------------------------------------------
            # Branch A: MobileNetV2
            # ----------------------------------------------------

            mob_feat = self.mobilenet.features(x)

            mob_pooled = torch.nn.functional.adaptive_avg_pool2d(
                mob_feat,
                (1, 1)
            ).flatten(1)

            # 1280 → 512
            mob_proj = self.mobile_projection(
                mob_pooled
            )

            # ----------------------------------------------------
            # Branch B: Vision Transformer
            # ----------------------------------------------------

            vit_tokens = self.patch_embedding(x)

            vit_encoded = self.vit_blocks(
                vit_tokens
            )

            # CLS token
            vit_cls = self.vit_norm(
                vit_encoded[:, 0]
            )

            # ----------------------------------------------------
            # Feature Fusion
            # ----------------------------------------------------

            fused = torch.cat(
                [mob_proj, vit_cls],
                dim=1
            )

            # 704 → 512
            fused_rep = self.fusion(
                fused
            )

            # ----------------------------------------------------
            # Classification
            # ----------------------------------------------------

            logits = self.classifier(
                fused_rep
            )

            # Keep this return format because backend expects it
            return logits, fused_rep, mob_feat


# =================================================================
# INFERENCE ENGINE
# =================================================================

class HybridInferenceEngine:
    """
    Inference engine supporting:

    1. Real trained model mode
    2. Demo mode if trained weights cannot be loaded
    """

    def __init__(
        self,
        model_path: Optional[str] = None
    ):

        self.model_path = model_path

        self.model = None

        self.is_demo_mode = True

        self._init_model()

    # =============================================================
    # LOAD TRAINED MODEL
    # =============================================================

    def _init_model(self):

        if (
            self.model_path
            and os.path.exists(self.model_path)
            and TORCH_AVAILABLE
        ):

            try:

                print(
                    f"[AlzVision-X] Loading trained model from: "
                    f"{self.model_path}"
                )

                # Create exact same architecture
                self.model = HybridMobileNetViT(
                    num_classes=4
                )

                # Load trained weights
                state_dict = torch.load(
                    self.model_path,
                    map_location="cpu"
                )

                self.model.load_state_dict(
                    state_dict
                )

                self.model.eval()

                self.is_demo_mode = False

                print(
                    "[AlzVision-X] Successfully loaded trained "
                    "Hybrid MobileNetV2 + ViT model."
                )

                return

            except Exception as e:

                print(
                    "[AlzVision-X] Error loading model weights:"
                )

                print(e)

                print(
                    "[AlzVision-X] Defaulting to Demo Mode."
                )

        self.is_demo_mode = True

        print(
            "[AlzVision-X] Running in Demo Mode — "
            "Research Prototype"
        )

    # =============================================================
    # PREDICTION
    # =============================================================

    def predict(
        self,
        tensor_chw: np.ndarray,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:

        # =========================================================
        # REAL MODEL MODE
        # =========================================================

        if (
            not self.is_demo_mode
            and self.model is not None
            and TORCH_AVAILABLE
        ):

            with torch.no_grad():

                input_tensor = torch.from_numpy(
                    tensor_chw
                ).unsqueeze(0).float()

                logits, fused_rep, _ = self.model(
                    input_tensor
                )

                probs = torch.softmax(
                    logits,
                    dim=1
                ).cpu().numpy()[0]

                pred_idx = int(
                    np.argmax(probs)
                )

                pred_class = CLASSES[pred_idx]

                confidence = float(
                    probs[pred_idx]
                )

                prob_dict = {
                    cls_name: float(round(p, 4))
                    for cls_name, p in zip(
                        CLASSES,
                        probs
                    )
                }

                fused_sample = (
                    fused_rep[0, :8]
                    .cpu()
                    .numpy()
                    .tolist()
                )

                return {
                    "predicted_stage": pred_class,

                    "confidence": round(
                        confidence,
                        4
                    ),

                    "cdr_rating": CDR_MAPPINGS[
                        pred_class
                    ],

                    "probabilities": prob_dict,

                    "feature_fusion_summary": {

                        "mobilenet_features_dim": 1280,

                        "vit_attention_tokens_dim": 192,

                        "fused_representation_dim": 512,

                        "sample_vector": [
                            round(float(v), 4)
                            for v in fused_sample
                        ]
                    },

                    "is_demo_mode": False
                }

        # =========================================================
        # DEMO MODE
        # =========================================================

        img_slice = tensor_chw[0]

        mean_val = float(
            np.mean(img_slice)
        )

        var_val = float(
            np.var(img_slice)
        )

        # Deterministic image-dependent score
        seed_score = (
            abs(mean_val * 10)
            + var_val * 5
        ) % 4.0

        # ---------------------------------------------------------
        # 4 CLASSES ONLY
        # ---------------------------------------------------------

        if seed_score < 1.0:

            probs = [
                0.84,
                0.11,
                0.035,
                0.015
            ]

            pred_class = "Non-Demented"

        elif seed_score < 2.0:

            probs = [
                0.12,
                0.74,
                0.11,
                0.03
            ]

            pred_class = "Very Mild Dementia"

        elif seed_score < 3.0:

            probs = [
                0.03,
                0.14,
                0.74,
                0.09
            ]

            pred_class = "Mild Dementia"

        else:

            probs = [
                0.01,
                0.05,
                0.16,
                0.78
            ]

            pred_class = "Moderate Dementia"

        prob_dict = {
            cls_name: float(round(p, 4))
            for cls_name, p in zip(
                CLASSES,
                probs
            )
        }

        pred_idx = CLASSES.index(
            pred_class
        )

        confidence = probs[pred_idx]

        return {

            "predicted_stage": pred_class,

            "confidence": round(
                confidence,
                4
            ),

            "cdr_rating": CDR_MAPPINGS[
                pred_class
            ],

            "probabilities": prob_dict,

            "feature_fusion_summary": {

                "mobilenet_features_dim": 1280,

                "vit_attention_tokens_dim": 192,

                "fused_representation_dim": 512,

                "sample_vector": [
                    round(
                        float(
                            0.12 * i + var_val
                        ),
                        4
                    )
                    for i in range(8)
                ]
            },

            "is_demo_mode": True
        }