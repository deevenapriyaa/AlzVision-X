export interface Patient {
  id: number;
  patient_code: string;
  name: string;
  age: number;
  gender: string;
  contact?: string;
  medical_history?: string;
  created_at: string;
  analyses_count?: number;
}

export interface PipelineStep {
  step_id: number;
  name: string;
  agent: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  duration_ms: number;
  summary: string;
  details?: Record<string, any>;
}

export interface AtrophyRegion {
  region_name: string;
  hemisphere: string;
  activation_intensity: number;
  atrophy_risk: string;
  clinical_significance: string;
}

export interface AnalysisResult {
  id?: number;
  patient_id: number;
  patient_code: string;
  patient_name: string;
  patient_age: number;
  patient_gender: string;
  scan_date: string;
  original_image_url: string;
  processed_image_url: string;
  gradcam_image_url: string;
  report_pdf_url?: string;
  status?: string;
  
  predicted_stage: 'Non-Demented' | 'Very Mild Dementia' | 'Mild Dementia' | 'Moderate Dementia';
  confidence: number;
  cdr_rating: string;
  probabilities: Record<string, number>;
  
  atrophy_regions: AtrophyRegion[];
  ai_explanation: string;
  clinical_recommendation: string;
  pipeline_steps: PipelineStep[];
  is_demo_mode: boolean;
}

export interface DashboardData {
  total_patients: number;
  total_analyses: number;
  latest_prediction?: string;
  latest_confidence?: number;
  latest_patient_name?: string;
  latest_scan_date?: string;
  latest_analysis?: AnalysisResult | null;
  recent_analyses: Array<{
    id: number;
    patient_id: number;
    patient_name: string;
    patient_code: string;
    age: number;
    gender: string;
    predicted_stage: string;
    confidence: number;
    scan_date: string;
    cdr_rating: string;
    is_demo_mode: boolean;
    status?: string;
    image_url?: string;
  }>;
  stage_distribution: Record<string, number>;
  system_status: {
    model_architecture: string;
    pipeline_status: string;
    agents_active: number;
    demo_mode: boolean;
    framework: string;
  };
}

export interface CompareResult {
  patient: {
    id: number;
    name: string;
    code: string;
    age: number;
    gender: string;
  };
  baseline: {
    id: number;
    scan_date: string;
    predicted_stage: string;
    confidence: number;
    cdr_rating: string;
    probabilities: Record<string, number>;
    original_image_url: string;
    gradcam_image_url: string;
    ai_explanation: string;
  };
  followup: {
    id: number;
    scan_date: string;
    predicted_stage: string;
    confidence: number;
    cdr_rating: string;
    probabilities: Record<string, number>;
    original_image_url: string;
    gradcam_image_url: string;
    ai_explanation: string;
  };
  interval_days: number;
  stage_progression: string;
  atrophy_progression: {
    trajectory: string;
    confidence_delta: number;
  };
  comparative_summary: string;
  clinical_alert: string;
}
