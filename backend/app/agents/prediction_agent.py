import time
from typing import Dict, Any
import numpy as np
from app.ml.hybrid_model import HybridInferenceEngine
from app.config import MODEL_PATH

class PredictionAgent:
    """
    Agent 2: Disease Prediction Agent
    Goal: Orchestrates multi-branch neural network inference:
    - MobileNetV2 (Local Cortical Texture Extractor)
    - Vision Transformer (Global Spatial Attention Tokens)
    - Feature Fusion Layer & Multi-class Softmax Calibrated Staging.
    """
    def __init__(self):
        self.name = "Prediction Agent"
        self.engine = HybridInferenceEngine(model_path=MODEL_PATH)

    def run(self, tensor_chw: np.ndarray, patient_meta: Dict[str, Any]) -> Dict[str, Any]:
        start_time = time.time()
        
        # ACT: Perform neural forward pass
        result = self.engine.predict(tensor_chw, metadata=patient_meta)
        
        duration = (time.time() - start_time) * 1000.0
        
        mode_str = "Trained Hybrid Model (MobileNet + ViT)" if not result["is_demo_mode"] else "Demo Simulation Engine (Research Prototype)"
        
        return {
            "step_id": 6,
            "name": "Hybrid Neural Feature Fusion & Staging",
            "agent": self.name,
            "status": "completed",
            "duration_ms": round(duration, 2),
            "summary": f"Classified as {result['predicted_stage']} ({result['cdr_rating']}) with {round(result['confidence'] * 100, 1)}% confidence using {mode_str}.",
            "details": result,
            "prediction": result
        }
