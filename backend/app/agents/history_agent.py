import time
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models import Patient, MriAnalysis

class HistoryAgent:
    """
    Agent 6: Data & History Agent
    Goal: Persists patient analyses into SQLite / SQLAlchemy database, calculates longitudinal progression rates,
    and performs cross-scan comparative differential analysis across multiple scanning intervals.
    """
    def __init__(self):
        self.name = "Data & History Agent"

    def run_store(self, db: Session, patient_id: int, analysis_payload: Dict[str, Any]) -> Dict[str, Any]:
        start_time = time.time()
        
        # ACT: Persist record to DB
        analysis_record = MriAnalysis(
            patient_id=patient_id,
            original_image_path=analysis_payload["original_image_path"],
            processed_image_path=analysis_payload["processed_image_path"],
            gradcam_image_path=analysis_payload["gradcam_image_path"],
            report_pdf_path=analysis_payload.get("report_pdf_path"),
            predicted_stage=analysis_payload["predicted_stage"],
            confidence=analysis_payload["confidence"],
            cdr_rating=analysis_payload.get("cdr_rating"),
            probabilities=analysis_payload["probabilities"],
            atrophy_regions=analysis_payload.get("atrophy_regions"),
            ai_explanation=analysis_payload.get("ai_explanation"),
            clinical_recommendation=analysis_payload.get("clinical_recommendation"),
            pipeline_telemetry=analysis_payload.get("pipeline_telemetry"),
            is_demo_mode=1 if analysis_payload.get("is_demo_mode") else 0
        )
        
        db.add(analysis_record)
        db.commit()
        db.refresh(analysis_record)

        duration = (time.time() - start_time) * 1000.0

        return {
            "step_id": 10,
            "name": "Database Persistence & Longitudinal Auditing",
            "agent": self.name,
            "status": "completed",
            "duration_ms": round(duration, 2),
            "summary": f"Committed analysis #{analysis_record.id} to SQLite database with foreign key linking to Patient #{patient_id}.",
            "details": {
                "record_id": analysis_record.id,
                "patient_id": patient_id
            },
            "saved_record": analysis_record
        }

    def compare_scans(self, baseline: MriAnalysis, followup: MriAnalysis) -> Dict[str, Any]:
        """Calculates trajectory between two MRI scans."""
        stage_order = {
            "Non-Demented": 0,
            "Very Mild Dementia": 1,
            "Mild Dementia": 2,
            "Moderate Dementia": 3
        }

        b_rank = stage_order.get(baseline.predicted_stage, 0)
        f_rank = stage_order.get(followup.predicted_stage, 0)
        
        if f_rank > b_rank:
            trajectory = "Progressive Cognitive Decline"
            alert = "WARNING: Observable deterioration detected. Elevated neurodegeneration rate compared to baseline."
        elif f_rank < b_rank:
            trajectory = "Observed Cognitive Stabilization / Apparent Improvement"
            alert = "NOTICE: Improved diagnostic metrics observed. Re-confirm with clinical cognitive testing."
        else:
            trajectory = "Stable Staging"
            alert = "INFO: Disease stage remains consistent between scans. Continue routine therapeutic regimen."

        interval_days = (followup.scan_date - baseline.scan_date).days if (followup.scan_date and baseline.scan_date) else 90

        return {
            "interval_days": max(interval_days, 1),
            "stage_progression": f"{baseline.predicted_stage} (Baseline) → {followup.predicted_stage} (Follow-up)",
            "trajectory": trajectory,
            "confidence_delta": round(float(followup.confidence - baseline.confidence), 4),
            "alert": alert
        }
