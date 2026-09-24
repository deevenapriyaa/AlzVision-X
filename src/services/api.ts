import { Patient, AnalysisResult, DashboardData, CompareResult } from '../types';
import { STAGE_DETAILS, getOriginalMriSvg, getGradCamOverlaySvg } from './gradcamService';

const API_BASE = '/api';
const STORAGE_KEY_ANALYSES = 'alzvision_saved_analyses_v2';
const STORAGE_KEY_PATIENTS = 'alzvision_saved_patients_v2';

// Helper to get initial default analyses with full fields
function getInitialDefaultAnalyses(): AnalysisResult[] {
  return [];
}

// Local Storage Helpers
export function getStoredAnalyses(): AnalysisResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ANALYSES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[AlzVision-X] Error reading localStorage analyses:', e);
  }
  const initial = getInitialDefaultAnalyses();
  saveStoredAnalyses(initial);
  return initial;
}

export function saveStoredAnalyses(analyses: AnalysisResult[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ANALYSES, JSON.stringify(analyses));
  } catch (e) {
    console.warn('[AlzVision-X] Error saving analyses to localStorage:', e);
  }
}

export function getStoredAnalysisById(id: number): AnalysisResult | null {
  const all = getStoredAnalyses();
  return all.find(a => a.id === id) || null;
}

export function getLatestAnalysis(): AnalysisResult | null {
  const all = getStoredAnalyses();
  return all.length > 0 ? all[0] : null;
}

export function getStoredPatients(): Patient[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PATIENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[AlzVision-X] Error reading localStorage patients:', e);
  }
  return [];
}

export function saveStoredPatients(patients: Patient[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PATIENTS, JSON.stringify(patients));
  } catch (e) {
    console.warn('[AlzVision-X] Error saving patients to localStorage:', e);
  }
}

export async function fetchDashboardStats(): Promise<DashboardData> {
  const analyses = getStoredAnalyses();
  const patients = getStoredPatients();

  // Try fetching backend for synchronization
  try {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (res.ok) {
      const serverData = await res.json();
      // Merge with server if server has more
      if (serverData && serverData.total_analyses >= analyses.length) {
        return serverData;
      }
    }
  } catch {
    // Proceed with client-side unified storage
  }

  // Compute live statistics from stored analyses and patients
  const latestAnalysis = analyses.length > 0 ? analyses[0] : null;

  const stageDist: Record<string, number> = {
    'Non-Demented': 0,
    'Very Mild Dementia': 0,
    'Mild Dementia': 0,
    'Moderate Dementia': 0
  };

  analyses.forEach(a => {
    if (stageDist[a.predicted_stage] !== undefined) {
      stageDist[a.predicted_stage] += 1;
    } else {
      stageDist[a.predicted_stage] = 1;
    }
  });

  const recentList = analyses.slice(0, 6).map(a => ({
    id: a.id || 101,
    patient_id: a.patient_id,
    patient_name: a.patient_name,
    patient_code: a.patient_code,
    age: a.patient_age,
    gender: a.patient_gender,
    predicted_stage: a.predicted_stage,
    confidence: a.confidence,
    scan_date: a.scan_date,
    cdr_rating: a.cdr_rating,
    is_demo_mode: a.is_demo_mode,
    status: a.status || 'completed',
    image_url: a.original_image_url
  }));

  return {
    total_patients: patients.length,
    total_analyses: analyses.length,
    latest_prediction: latestAnalysis ? latestAnalysis.predicted_stage : 'No scans yet',
    latest_confidence: latestAnalysis ? latestAnalysis.confidence : 0,
    latest_patient_name: latestAnalysis ? latestAnalysis.patient_name : '',
    latest_scan_date: latestAnalysis ? latestAnalysis.scan_date : '',
    latest_analysis: latestAnalysis,
    recent_analyses: recentList,
    stage_distribution: stageDist,
    system_status: {
      model_architecture: 'Hybrid MobileNetV2 + Vision Transformer (ViT)',
      pipeline_status: 'ONLINE',
      agents_active: 9,
      demo_mode: true,
      framework: 'AlzVision-X Agentic Deep Learning'
    }
  };
}

export async function fetchPatients(): Promise<Patient[]> {
  try {
    const res = await fetch(`${API_BASE}/patients`);
    if (res.ok) {
      const serverPatients = await res.json();
      if (Array.isArray(serverPatients) && serverPatients.length > 0) {
        saveStoredPatients(serverPatients);
        return serverPatients;
      }
    }
  } catch {
    // fallback to local
  }
  return getStoredPatients();
}

export async function createPatient(patientData: Partial<Patient>): Promise<Patient> {
  const patients = getStoredPatients();
  const newPat: Patient = {
    id: Math.floor(Math.random() * 8999) + 100,
    patient_code: patientData.patient_code || `PAT-${Math.floor(Math.random() * 8999 + 1000)}`,
    name: patientData.name || 'New Patient',
    age: patientData.age || 70,
    gender: patientData.gender || 'Female',
    contact: patientData.contact || '',
    medical_history: patientData.medical_history || '',
    created_at: new Date().toISOString(),
    analyses_count: 0
  };

  patients.push(newPat);
  saveStoredPatients(patients);

  try {
    await fetch(`${API_BASE}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPat)
    });
  } catch {
    // offline / fallback
  }

  return newPat;
}

export async function fetchPatientHistory(patientId: number): Promise<{ patient: Patient; analyses: AnalysisResult[] }> {
  const patients = getStoredPatients();
  const allAnalyses = getStoredAnalyses();

  const foundPatient = patients.find(p => p.id === patientId) || patients[0];
  const patientAnalyses = allAnalyses.filter(a => a.patient_id === foundPatient.id || a.patient_code === foundPatient.patient_code);

  return {
    patient: foundPatient,
    analyses: patientAnalyses
  };
}

export async function runMriAnalysis(formData: FormData): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let message = 'MRI analysis failed.';

    try {
      const errorData = await response.json();
      message = errorData.detail || message;
    } catch {
      // Keep default error message
    }

    throw new Error(message);
  }

  const result: AnalysisResult = await response.json();

  // Save the real backend result locally so the UI can display
  // the latest analysis even after navigation.
  const storedAnalyses = getStoredAnalyses();
  storedAnalyses.unshift(result);
  saveStoredAnalyses(storedAnalyses);

  return result;
}
export async function compareScans(
  baselineId: number,
  followupId: number
): Promise<CompareResult> {
  const response = await fetch(`${API_BASE}/compare`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      baseline_analysis_id: baselineId,
      followup_analysis_id: followupId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.detail || 'Failed to compare MRI scans.'
    );
  }

  return await response.json();
}