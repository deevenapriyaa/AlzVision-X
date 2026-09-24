import { Patient } from '../types';
import { getOriginalMriSvg, getGradCamOverlaySvg, STAGE_DETAILS } from './gradcamService';

export interface BrainSample {
  id: string;
  title: string;
  stage: 'Non-Demented' | 'Very Mild Dementia' | 'Mild Dementia' | 'Moderate Dementia';
  cdr: string;
  description: string;
  dataUrl: string;
  gradcamUrl: string;
}

export const SAMPLE_BRAIN_IMAGES: BrainSample[] = [
  {
    id: 'sample-non-demented',
    title: 'Cognitively Normal (Healthy)',
    stage: 'Non-Demented',
    cdr: 'CDR 0',
    description: 'Normal brain structure, healthy memory areas, and normal fluid spaces.',
    dataUrl: getOriginalMriSvg('Non-Demented'),
    gradcamUrl: getGradCamOverlaySvg('Non-Demented')
  },
  {
    id: 'sample-very-mild',
    title: 'Very Mild Dementia (Early Stage)',
    stage: 'Very Mild Dementia',
    cdr: 'CDR 0.5',
    description: 'Very early subtle changes in memory center (hippocampus).',
    dataUrl: getOriginalMriSvg('Very Mild Dementia'),
    gradcamUrl: getGradCamOverlaySvg('Very Mild Dementia')
  },
  {
    id: 'sample-mild',
    title: 'Mild Dementia (Mild Stage)',
    stage: 'Mild Dementia',
    cdr: 'CDR 1.0',
    description: 'Noticeable shrinkage in memory areas and slightly wider fluid spaces.',
    dataUrl: getOriginalMriSvg('Mild Dementia'),
    gradcamUrl: getGradCamOverlaySvg('Mild Dementia')
  },
  {
    id: 'sample-moderate',
    title: 'Moderate Dementia (Moderate Stage)',
    stage: 'Moderate Dementia',
    cdr: 'CDR 2.0',
    description: 'Expanded fluid cavities and clear volume loss in memory regions.',
    dataUrl: getOriginalMriSvg('Moderate Dementia'),
    gradcamUrl: getGradCamOverlaySvg('Moderate Dementia')
  }
];

export const INITIAL_DEMO_PATIENTS: Patient[] = [
  {
    id: 1,
    patient_code: 'PAT-7821',
    name: 'Eleanor Vance',
    age: 73,
    gender: 'Female',
    contact: '+1 (555) 234-8901',
    medical_history: 'Mild short-term memory complaints reported over past 6 months.',
    created_at: '2026-05-12T10:30:00Z',
    analyses_count: 2
  },
  {
    id: 2,
    patient_code: 'PAT-9043',
    name: 'Arthur Pendelton',
    age: 79,
    gender: 'Male',
    contact: '+1 (555) 456-1122',
    medical_history: 'Gradual memory difficulty and occasional spatial confusion.',
    created_at: '2026-04-18T14:15:00Z',
    analyses_count: 2
  },
  {
    id: 3,
    patient_code: 'PAT-1102',
    name: 'Clara Oswald',
    age: 66,
    gender: 'Female',
    contact: '+1 (555) 789-3344',
    medical_history: 'No memory complaints; participating in healthy aging memory screening.',
    created_at: '2026-06-01T09:00:00Z',
    analyses_count: 1
  },
  {
    id: 4,
    patient_code: 'PAT-4491',
    name: 'Robert Chen',
    age: 82,
    gender: 'Male',
    contact: '+1 (555) 890-5566',
    medical_history: 'Significant memory loss and difficulty with routine daily tasks.',
    created_at: '2026-03-20T11:45:00Z',
    analyses_count: 1
  }
];
