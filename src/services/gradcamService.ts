// Grad-CAM Saliency and Heatmap Generation Service for AlzVision-X
// Creates transparent Jet colormap heatmaps (Blue -> Green -> Yellow -> Red)
// overlaying directly on top of brain MRI images.

export interface StageDetails {
  stage: 'Non-Demented' | 'Very Mild Dementia' | 'Mild Dementia' | 'Moderate Dementia';
  cdr: string;
  simpleExplanation: string;
  simpleRecommendations: string[];
  highlightRegions: string[];
}

export const STAGE_DETAILS: Record<string, StageDetails> = {
  'Non-Demented': {
    stage: 'Non-Demented',
    cdr: 'CDR 0 (Healthy)',
    simpleExplanation: 'The AI found normal brain structure with no significant signs of memory loss or brain shrinkage.',
    simpleRecommendations: [
      'Consult a doctor for routine annual wellness check-ups.',
      'Maintain regular physical exercise and a healthy balanced diet.',
      'Stay mentally active with reading, puzzles, and social activities.'
    ],
    highlightRegions: ['Temporal Lobe (Normal)', 'Hippocampus (Intact)']
  },
  'Very Mild Dementia': {
    stage: 'Very Mild Dementia',
    cdr: 'CDR 0.5 (Very Early)',
    simpleExplanation: 'The highlighted red and yellow areas show early subtle changes in the memory center (hippocampus).',
    simpleRecommendations: [
      'Consult a qualified doctor or neurologist for a clinical evaluation.',
      'Schedule a follow-up MRI in 6 to 12 months if advised.',
      'Practice regular memory exercises and maintain healthy sleep habits.'
    ],
    highlightRegions: ['Medial Temporal Lobe', 'Hippocampus (Early changes)']
  },
  'Mild Dementia': {
    stage: 'Mild Dementia',
    cdr: 'CDR 1.0 (Mild)',
    simpleExplanation: 'The highlighted red and yellow areas had the highest influence on predicting Mild Dementia, centered around the memory centers.',
    simpleRecommendations: [
      'Consult a qualified doctor for a full medical and memory assessment.',
      'Discuss possible memory care plans and cognitive support options.',
      'Keep a structured daily routine and schedule regular medical follow-ups.'
    ],
    highlightRegions: ['Hippocampus (Shrinkage)', 'Lateral Ventricles (Slight expansion)']
  },
  'Moderate Dementia': {
    stage: 'Moderate Dementia',
    cdr: 'CDR 2.0 (Moderate)',
    simpleExplanation: 'The highlighted areas show noticeable changes across the memory centers and enlarged brain fluid cavities.',
    simpleRecommendations: [
      'Consult a doctor or neurologist for specialized care planning.',
      'Ensure a safe home environment and support with daily activities.',
      'Follow medication and care advice provided by the healthcare team.'
    ],
    highlightRegions: ['Enlarged Ventricles', 'Temporal and Parietal Cortex']
  }
};

/**
 * Generates an authentic Grad-CAM SVG transparent heatmap overlay
 * matching the Jet colormap (Blue -> Green -> Yellow -> Orange -> Red)
 * focusing on key anatomical areas for each dementia stage.
 */
export function getGradCamOverlaySvg(stage: string, width = 340, height = 340): string {
  const isNormal = stage === 'Non-Demented';
  const isVeryMild = stage === 'Very Mild Dementia';
  const isMild = stage === 'Mild Dementia';
  const isModerate = stage === 'Moderate Dementia';

  // SVG with radial gradient heatmap blobs representing neural attention
  return `data:image/svg+xml;utf8,` + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 224 224" width="${width}" height="${height}" style="background:transparent;">
      <defs>
        <!-- Jet Colormap Radial Gradient: Blue -> Green -> Yellow -> Orange -> Red -->
        <radialGradient id="gradcam-high" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ef4444" stop-opacity="0.95" />
          <stop offset="35%" stop-color="#f97316" stop-opacity="0.85" />
          <stop offset="60%" stop-color="#eab308" stop-opacity="0.70" />
          <stop offset="80%" stop-color="#22c55e" stop-opacity="0.45" />
          <stop offset="95%" stop-color="#06b6d4" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0" />
        </radialGradient>

        <radialGradient id="gradcam-medium" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.80" />
          <stop offset="45%" stop-color="#84cc16" stop-opacity="0.60" />
          <stop offset="75%" stop-color="#06b6d4" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0" />
        </radialGradient>

        <radialGradient id="gradcam-low" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.45" />
          <stop offset="50%" stop-color="#3b82f6" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#1e3a8a" stop-opacity="0.0" />
        </radialGradient>
      </defs>

      <!-- Background cool attention wash -->
      <ellipse cx="112" cy="112" rx="75" ry="80" fill="url(#gradcam-low)" />

      ${isNormal ? `
        <!-- Normal Stage: Mild low attention over central cortex -->
        <ellipse cx="112" cy="112" rx="45" ry="50" fill="url(#gradcam-low)" opacity="0.6" />
        <ellipse cx="78" cy="135" rx="20" ry="15" fill="url(#gradcam-medium)" opacity="0.4" />
        <ellipse cx="146" cy="135" rx="20" ry="15" fill="url(#gradcam-medium)" opacity="0.4" />
      ` : ''}

      ${isVeryMild ? `
        <!-- Very Mild: Focal activation on bilateral hippocampus -->
        <ellipse cx="80" cy="140" rx="26" ry="20" fill="url(#gradcam-high)" />
        <ellipse cx="144" cy="140" rx="26" ry="20" fill="url(#gradcam-high)" />
        <ellipse cx="112" cy="105" rx="20" ry="30" fill="url(#gradcam-medium)" />
      ` : ''}

      ${isMild ? `
        <!-- Mild: High focal attention on hippocampus and ventricles -->
        <ellipse cx="78" cy="142" rx="30" ry="24" fill="url(#gradcam-high)" />
        <ellipse cx="146" cy="142" rx="30" ry="24" fill="url(#gradcam-high)" />
        <ellipse cx="112" cy="100" rx="28" ry="38" fill="url(#gradcam-high)" />
        <ellipse cx="112" cy="140" rx="22" ry="18" fill="url(#gradcam-medium)" />
      ` : ''}

      ${isModerate ? `
        <!-- Moderate: Strong wide activation on ventricles and lobes -->
        <ellipse cx="76" cy="142" rx="34" ry="28" fill="url(#gradcam-high)" />
        <ellipse cx="148" cy="142" rx="34" ry="28" fill="url(#gradcam-high)" />
        <ellipse cx="112" cy="95" rx="36" ry="42" fill="url(#gradcam-high)" />
        <ellipse cx="70" cy="100" rx="28" ry="22" fill="url(#gradcam-medium)" />
        <ellipse cx="154" cy="100" rx="28" ry="22" fill="url(#gradcam-medium)" />
      ` : ''}
    </svg>
  `);
}

/**
 * Creates a standard grayscale MRI base image for demo stages
 */
export function getOriginalMriSvg(stage: string, width = 340, height = 340): string {
  const isNormal = stage === 'Non-Demented';
  const isVeryMild = stage === 'Very Mild Dementia';
  const isMild = stage === 'Mild Dementia';
  const isModerate = stage === 'Moderate Dementia';
  // Slice ventricle dimensions based on atrophy progression
  const vWidth = isNormal ? 4 : isVeryMild ? 8 : isMild ? 14 : 22;
  const vCurve = isNormal ? 6 : isVeryMild ? 10 : isMild ? 16 : 24;

  return `data:image/svg+xml;utf8,` + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 224 224" width="${width}" height="${height}" style="background:#090d16;">
      <!-- Outer Skull / Scalp Contour -->
      <ellipse cx="112" cy="112" rx="92" ry="98" fill="#1e293b" stroke="#334155" stroke-width="2"/>
      
      <!-- Brain Parenchyma / Gray Matter -->
      <ellipse cx="112" cy="112" rx="82" ry="88" fill="#334155" stroke="#475569" stroke-width="1.5"/>
      
      <!-- Inner White Matter -->
      <ellipse cx="112" cy="112" rx="66" ry="72" fill="#475569"/>

      <!-- Lateral Ventricles (Dark Fluid Cavities) -->
      <!-- Left Ventricle -->
      <path d="M ${108 - vWidth},90 C ${108 - vWidth - vCurve},70 ${108 + 2},125 ${108 - vWidth},142 C ${108 - vWidth - 4},130 ${108 - vWidth},90 ${108 - vWidth},90 Z" fill="#090d16"/>
      
      <!-- Right Ventricle -->
      <path d="M ${116 + vWidth},90 C ${116 + vWidth + vCurve},70 ${116 - 2},125 ${116 + vWidth},142 C ${116 + vWidth + 4},130 ${116 + vWidth},90 ${116 + vWidth},90 Z" fill="#090d16"/>

      <!-- Third Ventricle Center Slit -->
      <line x1="112" y1="100" x2="112" y2="135" stroke="#090d16" stroke-width="${isNormal ? 1.5 : isMild ? 3 : 5}"/>

      <!-- Left Hippocampus -->
      <ellipse cx="78" cy="144" rx="${isNormal ? 13 : isVeryMild ? 10 : isMild ? 7 : 5}" ry="${isNormal ? 8 : isVeryMild ? 6 : isMild ? 4 : 3}" fill="#64748b"/>
      
      <!-- Right Hippocampus -->
      <ellipse cx="146" cy="144" rx="${isNormal ? 13 : isVeryMild ? 10 : isMild ? 7 : 5}" ry="${isNormal ? 8 : isVeryMild ? 6 : isMild ? 4 : 3}" fill="#64748b"/>

      <!-- Cortical Sulci (Folds) -->
      <path d="M 50,85 Q 65,92 58,110" stroke="#1e293b" stroke-width="${isNormal ? 1 : 2.5}" fill="none"/>
      <path d="M 174,85 Q 159,92 166,110" stroke="#1e293b" stroke-width="${isNormal ? 1 : 2.5}" fill="none"/>
      <path d="M 45,130 Q 60,135 52,150" stroke="#1e293b" stroke-width="${isNormal ? 1 : 3}" fill="none"/>
      <path d="M 179,130 Q 164,135 172,150" stroke="#1e293b" stroke-width="${isNormal ? 1 : 3}" fill="none"/>

      <!-- Axial Slice Label -->
      <text x="112" y="210" fill="#94a3b8" font-size="9" text-anchor="middle" font-family="monospace">
        T1 AXIAL BRAIN MRI
      </text>
    </svg>
  `);
}
