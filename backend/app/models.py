from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)
    contact = Column(String(50), nullable=True)
    medical_history = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    analyses = relationship(
        "MriAnalysis",
        back_populates="patient",
        cascade="all, delete-orphan"
    )


class MriAnalysis(Base):
    __tablename__ = "mri_analyses"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    scan_date = Column(DateTime, default=datetime.utcnow)

    original_image_path = Column(String(255), nullable=False)
    processed_image_path = Column(String(255), nullable=True)
    gradcam_image_path = Column(String(255), nullable=True)
    report_pdf_path = Column(String(255), nullable=True)

    predicted_stage = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)
    cdr_rating = Column(String(100), nullable=True)

    # Store full probability distribution as JSON
    probabilities = Column(JSON, nullable=False)

    # Explainability & Agent findings
    atrophy_regions = Column(JSON, nullable=True)
    ai_explanation = Column(Text, nullable=True)
    clinical_recommendation = Column(Text, nullable=True)
    pipeline_telemetry = Column(JSON, nullable=True)

    is_demo_mode = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="analyses")