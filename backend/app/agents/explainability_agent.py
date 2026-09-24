import time
from typing import Dict, Any
from PIL import Image
from pathlib import Path
from app.explainability.gradcam import GradCAMGenerator

class ExplainabilityAgent:
    """
    Agent 3: Grad-CAM Explainability Agent
    Goal: Computes class activation gradients over cortical regions, generates JET visual heatmaps,
    and quantifies anatomical atrophy scores across Medial Temporal Lobe, Hippocampus, and Ventricles.
    """
    def __init__(self):
        self.name = "Grad-CAM Explainability Agent"
        self.generator = GradCAMGenerator()

    def run(
        self,
        pil_image: Image.Image,
        predicted_stage: str,
        confidence: float,
        overlay_path: Path,
        heatmap_path: Path
    ) -> Dict[str, Any]:
        start_time = time.time()
        
        explanation, regions, metrics = self.generator.generate_heatmap_and_overlay(
            pil_image=pil_image,
            predicted_stage=predicted_stage,
            confidence=confidence,
            output_overlay_path=overlay_path,
            output_heatmap_path=heatmap_path
        )
        
        duration = (time.time() - start_time) * 1000.0
        
        return {
            "step_id": 7,
            "name": "Visual Saliency & Neuro-Biomarker Attribution",
            "agent": self.name,
            "status": "completed",
            "duration_ms": round(duration, 2),
            "summary": f"Generated Grad-CAM saliency map identifying high focal activation in {regions[0]['region_name']}.",
            "details": {
                "explanation": explanation,
                "regions": regions,
                "metrics": metrics
            },
            "explanation_text": explanation,
            "atrophy_regions": regions
        }
