import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
REPORT_DIR = BASE_DIR / "generated_reports"
MODEL_DIR = BASE_DIR / "models"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
REPORT_DIR.mkdir(parents=True, exist_ok=True)
MODEL_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/alzvision.db")
MODEL_PATH = os.getenv("MODEL_PATH", str(MODEL_DIR / "hybrid_mobilenet_vit.pth"))
DEMO_MODE_DEFAULT = os.getenv("DEMO_MODE", "true").lower() == "true"

CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*"
]

CLASSES = [
    "Non-Demented",
    "Very Mild Dementia",
    "Mild Dementia",
    "Moderate Dementia"
]

CDR_MAPPINGS = {
    "Non-Demented": "CDR 0 (No Cognitive Impairment)",
    "Very Mild Dementia": "CDR 0.5 (Very Mild Impairment / MCI)",
    "Mild Dementia": "CDR 1.0 (Mild Cognitive Decline)",
    "Moderate Dementia": "CDR 2.0 (Moderate Impairment)"
}
