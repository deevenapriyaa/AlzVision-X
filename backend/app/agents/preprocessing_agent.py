import time
from typing import Dict, Any, Tuple
from PIL import Image
import numpy as np
from pathlib import Path
from app.preprocessing.mri_processor import MRIPreprocessor

class PreprocessingAgent:
    """
    Agent 1: Preprocessing Agent
    Goal: Inspects raw DICOM/MRI inputs, checks signal fidelity, applies CLAHE contrast equalization,
    resizes to 224x224, normalizes tensors, and certifies image quality for downstream neural inference.
    """
    def __init__(self):
        self.name = "Preprocessing Agent"
        self.preprocessor = MRIPreprocessor()

    def run(self, image_bytes: bytes, original_path: Path, processed_path: Path) -> Dict[str, Any]:
        start_time = time.time()
        
        # ACT: Execute image transformation
        chw_tensor, processed_pil, telemetry = self.preprocessor.process_image_bytes(image_bytes)
        
        # Save processed version
        self.preprocessor.save_processed_image(processed_pil, processed_path)
        
        duration = (time.time() - start_time) * 1000.0
        
        return {
            "step_id": 2,
            "name": "MRI Preprocessing & Normalization",
            "agent": self.name,
            "status": "completed",
            "duration_ms": round(duration, 2),
            "summary": f"Brain slice normalized to 224x224x3 with CLAHE contrast enhancement (SNR: {telemetry['snr_db']} dB, Sharpness: {telemetry['sharpness_score']}).",
            "details": telemetry,
            "tensor": chw_tensor,
            "pil_image": processed_pil
        }
