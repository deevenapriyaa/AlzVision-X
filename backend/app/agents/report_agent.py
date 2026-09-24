import time
from typing import Dict, Any
from pathlib import Path
from app.reports.pdf_generator import ClinicalPDFReportGenerator

class ReportAgent:
    """
    Agent 5: Report Generation Agent
    Goal: Compiles multi-modal diagnostic data (patient demographics, MRI thumbnails, Grad-CAM overlays,
    confidence metrics, and clinical recommendations) into an institutional-grade PDF medical dossier.
    """
    def __init__(self):
        self.name = "Report Generation Agent"
        self.generator = ClinicalPDFReportGenerator()

    def run(self, analysis_data: Dict[str, Any], output_pdf_path: Path) -> Dict[str, Any]:
        start_time = time.time()
        
        pdf_path = self.generator.generate_report(analysis_data, output_pdf_path)
        
        duration = (time.time() - start_time) * 1000.0
        
        return {
            "step_id": 8,
            "name": "Clinical Diagnostic PDF Compilation",
            "agent": self.name,
            "status": "completed",
            "duration_ms": round(duration, 2),
            "summary": f"Generated comprehensive ReportLab PDF report containing full visual explainability breakdown and CDR staging ({output_pdf_path.name}).",
            "details": {
                "file_path": str(pdf_path),
                "file_name": output_pdf_path.name
            },
            "pdf_path": str(pdf_path),
            "pdf_filename": output_pdf_path.name
        }
