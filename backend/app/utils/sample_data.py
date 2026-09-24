import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models import Patient, MriAnalysis
from app.config import UPLOAD_DIR, REPORT_DIR, CLASSES

def generate_synthetic_mri_image(stage: str = "Non-Demented", seed: int = 42) -> Image.Image:
    """Generates a high-quality, standardized synthetic axial brain MRI slice."""
    np.random.seed(seed)
    size = (224, 224)
    img = Image.new("L", size, 0)
    draw = ImageDraw.Draw(img)

    # 1. Outer Skull Contour
    draw.ellipse([20, 15, 204, 209], fill=40, outline=90, width=3)
    # 2. Brain Parenchyma (Cerebral Cortex)
    draw.ellipse([30, 25, 194, 199], fill=160)
    
    # 3. Interhemispheric Fissure (Center Line)
    draw.line([112, 28, 112, 196], fill=30, width=2)

    # Modify ventricular size based on Alzheimer's stage
    ventricle_scales = {
        "Non-Demented": (12, 25),
        "Very Mild Dementia": (18, 30),
        "Mild Dementia": (26, 36),
        "Moderate Dementia": (34, 42)
    }
    vw, vh = ventricle_scales.get(stage, (16, 28))

    # 4. Left & Right Lateral Ventricles (dark cerebrospinal fluid)
    draw.ellipse([112 - vw - 4, 112 - vh // 2, 112 - 4, 112 + vh // 2], fill=25)
    draw.ellipse([112 + 4, 112 - vh // 2, 112 + vw + 4, 112 + vh // 2], fill=25)

    # 5. Temporal Horns / Hippocampal Fissure
    hipp_offset = 35
    draw.ellipse([112 - hipp_offset - 10, 140, 112 - hipp_offset + 10, 160], fill=60)
    draw.ellipse([112 + hipp_offset - 10, 140, 112 + hipp_offset + 10, 160], fill=60)

    # 6. Smooth & add realistic MR gradient noise
    img = img.filter(ImageFilter.GaussianBlur(radius=1.8))
    img_np = np.array(img, dtype=np.float32)
    noise = np.random.normal(0, 7.0, size)
    img_np = np.clip(img_np + noise, 0, 255).astype(np.uint8)
    
    return Image.fromarray(img_np).convert("RGB")


def seed_sample_database(db: Session):
    """Seeds patient records and baseline scans if database is empty."""
    if db.query(Patient).count() > 0:
        return

    sample_patients = [
        {
            "code": "PAT-7821",
            "name": "Eleanor Vance",
            "age": 73,
            "gender": "Female",
            "contact": "+1 (555) 234-8901",
            "history": "Hypertension, mild short-term memory complaints reported by spouse during past 6 months.",
            "stage": "Very Mild Dementia",
            "conf": 0.88
        },
        {
            "code": "PAT-9043",
            "name": "Arthur Pendelton",
            "age": 79,
            "gender": "Male",
            "contact": "+1 (555) 456-1122",
            "history": "Type 2 Diabetes, progressive spatial disorientation, MoCA score 18/30.",
            "stage": "Mild Dementia",
            "conf": 0.91
        },
        {
            "code": "PAT-1102",
            "name": "Clara Oswald",
            "age": 66,
            "gender": "Female",
            "contact": "+1 (555) 789-3344",
            "history": "No cognitive complaints, participating in healthy aging memory research cohort.",
            "stage": "Non-Demented",
            "conf": 0.96
        },
        {
            "code": "PAT-4491",
            "name": "Robert Chen",
            "age": 82,
            "gender": "Male",
            "contact": "+1 (555) 890-5566",
            "history": "Severe episodic memory deficit, wandering episodes, requires continuous daily assistance.",
            "stage": "Moderate Dementia",
            "conf": 0.89
        }
    ]

    for p_idx, p_data in enumerate(sample_patients):
        patient = Patient(
            patient_code=p_data["code"],
            name=p_data["name"],
            age=p_data["age"],
            gender=p_data["gender"],
            contact=p_data["contact"],
            medical_history=p_data["history"],
            created_at=datetime.utcnow() - timedelta(days=120 + p_idx * 30)
        )
        db.add(patient)
        db.commit()
        db.refresh(patient)

        # Create Baseline synthetic MRI
        orig_img = generate_synthetic_mri_image(stage=p_data["stage"], seed=100 + p_idx)
        orig_path = UPLOAD_DIR / f"patient_{patient.id}_baseline_orig.jpg"
        orig_img.save(orig_path)

        proc_path = UPLOAD_DIR / f"patient_{patient.id}_baseline_proc.jpg"
        orig_img.save(proc_path)

        grad_path = UPLOAD_DIR / f"patient_{patient.id}_baseline_gradcam.jpg"
        orig_img.save(grad_path)
        probs = {c: 0.0 for c in CLASSES}
        probs[p_data["stage"]] = p_data["conf"]

        remaining_classes = [c for c in CLASSES if c != p_data["stage"]]
        rem = (1.0 - p_data["conf"]) / len(remaining_classes)

        for c in remaining_classes:
            probs[c] = round(rem, 4)
        

        analysis = MriAnalysis(
            patient_id=patient.id,
            scan_date=datetime.utcnow() - timedelta(days=90),
            original_image_path=str(orig_path),
            processed_image_path=str(proc_path),
            gradcam_image_path=str(grad_path),
            report_pdf_path=str(REPORT_DIR / f"Report_PAT_{patient.id}_baseline.pdf"),
            predicted_stage=p_data["stage"],
            confidence=p_data["conf"],
            cdr_rating=f"CDR {0 if p_data['stage']=='Non-Demented' else 0.5 if 'Very Mild' in p_data['stage'] else 1.0 if 'Mild' in p_data['stage'] else 2.0}",
            probabilities=probs,
            atrophy_regions=[
                {"region_name": "Medial Temporal Lobe", "activation_intensity": 78.5, "atrophy_risk": "Moderate"},
                {"region_name": "Lateral Ventricles", "activation_intensity": 68.2, "atrophy_risk": "Mild Dilation"}
            ],
            ai_explanation=f"Baseline neuro-imaging assessment shows structural volumetric profile consistent with {p_data['stage']}.",
            clinical_recommendation="Continue 6-month cognitive and imaging surveillance.",
            pipeline_telemetry={"status": "INITIALIZED_DEMO_DATA"},
            is_demo_mode=1,
            created_at=datetime.utcnow() - timedelta(days=90)
        )
        db.add(analysis)
        db.commit()

    print("[AlzVision-X] Sample patients & MRI baseline analyses seeded successfully.")
