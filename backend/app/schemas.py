from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from datetime import datetime


class PatientBase(BaseModel):
    patient_code: str
    name: str
    age: int
    gender: str
    contact: Optional[str] = None
    medical_history: Optional[str] = None


class PatientCreate(PatientBase):
    pass


class PatientResponse(PatientBase):
    id: int
    created_at: datetime
    analyses_count: Optional[int] = 0

    class Config:
        from_attributes = True


class PipelineStepResult(BaseModel):
    step_id: int
    name: str
    agent: str
    status: str
    duration_ms: float
    summary: str
    details: Dict[str, Any] = {}


class AnalysisResponse(BaseModel):
    id: Optional[int] = None
    patient_id: int
    patient_code: str
    patient_name: str
    patient_age: int
    patient_gender: str
    scan_date: str
    original_image_url: str
    processed_image_url: str
    gradcam_image_url: str
    report_pdf_url: Optional[str] = None

    predicted_stage: str
    confidence: float
    cdr_rating: str
    probabilities: Dict[str, float]

    atrophy_regions: List[Dict[str, Any]]
    ai_explanation: str
    clinical_recommendation: str
    pipeline_steps: List[PipelineStepResult]
    is_demo_mode: bool


class DashboardStats(BaseModel):
    total_patients: int
    total_analyses: int
    recent_analyses: List[Dict[str, Any]]
    stage_distribution: Dict[str, int]
    system_status: Dict[str, Any]


class CompareRequest(BaseModel):
    baseline_analysis_id: int
    followup_analysis_id: int


class CompareResponse(BaseModel):
    patient: Dict[str, Any]
    baseline: Dict[str, Any]
    followup: Dict[str, Any]
    interval_days: int
    stage_progression: str
    atrophy_progression: Dict[str, Any]
    comparative_summary: str
    clinical_alert: str