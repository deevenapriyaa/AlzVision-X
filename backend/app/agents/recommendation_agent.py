import time
from typing import Dict, Any, List

class RecommendationAgent:
    """
    Agent 4: Clinical Recommendation Agent
    Goal: Synthesizes model classification, CDR scale, patient age, and regional biomarker atrophy
    into actionable, evidence-based clinical next steps, cognitive screening schedules, and safety advisories.
    """
    def __init__(self):
        self.name = "Clinical Recommendation Agent"

    def run(self, predicted_stage: str, confidence: float, patient_info: Dict[str, Any], regions: List[Dict[str, Any]]) -> Dict[str, Any]:
        start_time = time.time()
        
        recommendations = {
            "Non-Demented": (
                "1. Routine Longitudinal Follow-up: Schedule repeat volumetric MRI and MoCA/MMSE cognitive screening in 24 months.\n"
                "2. Lifestyle & Cardiovascular Health: Maintain Mediterranean-DASH Intervention for Neurodegenerative Delay (MIND diet), aerobic exercise (150 min/wk), and active cognitive stimulation.\n"
                "3. Biomarker Baseline: Preserve current structural MRI as a healthy neuro-volumetric baseline."
            ),
            "Very Mild Dementia": (
                "1. Comprehensive Neuropsychological Evaluation: Administer in-depth memory battery (CDR, MoCA, ADAS-Cog) to confirm Mild Cognitive Impairment (MCI).\n"
                "2. Biomarker Confirmation: Consider CSF amyloid-beta (Aβ42/Aβ40) and p-tau181 assay or amyloid PET imaging.\n"
                "3. Follow-up Interval: Repeat high-resolution 3D T1 MRI in 6 to 12 months to monitor hippocampal atrophy velocity.\n"
                "4. Early Intervention: Structured cognitive rehabilitation therapy and risk factor management (blood pressure, sleep apnea screening)."
            ),
            "Mild Dementia": (
                "1. Neurologist / Memory Clinic Referral: Initiate clinical staging with a dementia specialist.\n"
                "2. Pharmacotherapy Consideration: Evaluate suitability for acetylcholinesterase inhibitors (e.g., Donepezil, Rivastigmine) or disease-modifying monoclonal antibodies under FDA/regulatory guidelines.\n"
                "3. Patient Safety & Family Counseling: Assess driving safety, home environment safety, and establish durable power of attorney.\n"
                "4. Follow-up: 6-month clinical review and volumetric scan tracking."
            ),
            "Moderate Dementia": (
                "1. Multidisciplinary Care Plan: Combine Cholinesterase inhibitor with NMDA receptor antagonist (Memantine).\n"
                "2. Caregiver Support & Structured Routine: Implement 24/7 supportive supervision, medication dispensers, and fall prevention protocols.\n"
                "3. Behavioral Symptom Management: Monitor for sleep disturbances, agitation, or wandering; apply non-pharmacological behavioral therapies.\n"
                "4. 3-to-6 Month Clinical Review: Track functional ADLs (Activities of Daily Living)."
            )
        }

        rec_text = recommendations.get(predicted_stage, recommendations["Very Mild Dementia"])
        
        duration = (time.time() - start_time) * 1000.0

        return {
            "step_id": 9,
            "name": "Evidence-Based Clinical Decision Support",
            "agent": self.name,
            "status": "completed",
            "duration_ms": round(duration, 2),
            "summary": f"Synthesized diagnostic findings into personalized multi-step clinical pathways tailored for {predicted_stage}.",
            "details": {
                "recommendation_text": rec_text,
                "urgency_level": "High" if "Moderate" in predicted_stage else "Moderate" if "Mild" in predicted_stage else "Standard"
            },
            "recommendation_text": rec_text
        }
