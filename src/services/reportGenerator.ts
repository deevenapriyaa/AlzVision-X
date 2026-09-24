import { jsPDF } from 'jspdf';
import { AnalysisResult } from '../types';
import { STAGE_DETAILS } from './gradcamService';

export function downloadClientPdfReport(analysis: AnalysisResult) {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'letter'
  });

  const stageInfo = STAGE_DETAILS[analysis.predicted_stage] || STAGE_DETAILS['Mild Dementia'];

  const primaryColor = [2, 132, 199]; // #0284c7 (sky-600)
  const darkColor = [15, 23, 42]; // #0f172a (slate-900)
  const slateColor = [100, 116, 139]; // #64748b (slate-500)

  // 1. Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('AlzVision-X — Alzheimer’s MRI Analysis Report', 40, 46);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(slateColor[0], slateColor[1], slateColor[2]);
  doc.text('Hybrid MobileNetV2 + Vision Transformer AI Framework', 40, 60);
  doc.text(`Date: ${analysis.scan_date} | Scan ID: #${analysis.id || 'NEW'}`, 572, 46, { align: 'right' });

  // Divider
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(2);
  doc.line(40, 68, 572, 68);

  // 2. Patient Details Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(40, 78, 532, 42, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text(`Patient Name:`, 50, 95);
  doc.setFont('helvetica', 'normal');
  doc.text(`${analysis.patient_name}`, 125, 95);

  doc.setFont('helvetica', 'bold');
  doc.text(`Patient ID:`, 240, 95);
  doc.setFont('helvetica', 'normal');
  doc.text(`${analysis.patient_code}`, 295, 95);

  doc.setFont('helvetica', 'bold');
  doc.text(`Age & Gender:`, 410, 95);
  doc.setFont('helvetica', 'normal');
  doc.text(`${analysis.patient_age} yrs / ${analysis.patient_gender}`, 480, 95);

  doc.setFont('helvetica', 'bold');
  doc.text(`Scan Date:`, 50, 110);
  doc.setFont('helvetica', 'normal');
  doc.text(`${analysis.scan_date}`, 125, 110);

  // 3. Prediction & Confidence Banner
  doc.setFillColor(240, 249, 255);
  doc.setDrawColor(186, 230, 253);
  doc.rect(40, 128, 532, 40, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('Prediction Result:', 50, 153);

  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`${analysis.predicted_stage}`, 155, 153);

  doc.setFontSize(10);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text(`Confidence: ${(analysis.confidence * 100).toFixed(1)}%`, 360, 153);
  doc.text(`Stage: ${stageInfo.cdr}`, 465, 153);

  // 4. Class Probabilities Table (4 Classes)
  let y = 186;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('Class Probabilities (4 Classes)', 40, y);

  y += 12;
  doc.setFillColor(15, 23, 42);
  doc.rect(40, y, 532, 18, 'F');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Alzheimer’s Stage Class', 50, y + 12);
  doc.text('Description', 220, y + 12);
  doc.text('Probability', 520, y + 12, { align: 'right' });

  y += 18;
  const stages = [
    { name: 'Non-Demented', desc: 'Normal healthy brain structure' },
    { name: 'Very Mild Dementia', desc: 'Very early subtle changes in memory areas' },
    { name: 'Mild Dementia', desc: 'Noticeable memory loss and shrinkage in memory centers' },
    { name: 'Moderate Dementia', desc: 'Clear memory challenges and enlarged fluid spaces' }
  ];

  stages.forEach((st, idx) => {
    const probVal = analysis.probabilities[st.name] || 0;
    const isSelected = st.name === analysis.predicted_stage;

    doc.setFillColor(isSelected ? 238 : idx % 2 === 0 ? 255 : 248, isSelected ? 242 : idx % 2 === 0 ? 255 : 250, isSelected ? 255 : idx % 2 === 0 ? 255 : 252);
    doc.rect(40, y, 532, 16, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(40, y + 16, 572, y + 16);

    doc.setFont('helvetica', isSelected ? 'bold' : 'normal');
    doc.setTextColor(isSelected ? primaryColor[0] : darkColor[0], isSelected ? primaryColor[1] : darkColor[1], isSelected ? primaryColor[2] : darkColor[2]);
    doc.text(st.name, 50, y + 11);
    doc.text(st.desc, 220, y + 11);
    doc.text(`${(probVal * 100).toFixed(1)}%`, 520, y + 11, { align: 'right' });

    y += 16;
  });

  // 5. Short AI Explanation
  y += 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('AI Explanation & Grad-CAM Findings', 40, y);

  y += 12;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(40, y, 532, 46, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`“${stageInfo.simpleExplanation}”`, 50, y + 16);

  doc.setFont('helvetica', 'bold');
  doc.text('Key Highlighted Regions:', 50, y + 34);
  doc.setFont('helvetica', 'normal');
  doc.text(`${stageInfo.highlightRegions.join(' • ')}`, 180, y + 34);

  // 6. Simple Recommendations
  y += 58;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('Recommendations (Next Steps)', 40, y);

  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  stageInfo.simpleRecommendations.forEach((rec, idx) => {
    doc.text(`• ${rec}`, 50, y);
    y += 14;
  });

  // 7. Medical Disclaimer
  y += 14;
  doc.setDrawColor(203, 213, 225);
  doc.line(40, y, 572, y);

  y += 12;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  const disclaimerText = "MEDICAL DISCLAIMER: AlzVision-X is an academic research prototype framework. It is intended for educational and research purposes only and does not constitute a clinical medical diagnosis. Always consult a qualified medical doctor or neurologist for final evaluation.";
  const splitDisc = doc.splitTextToSize(disclaimerText, 532);
  doc.text(splitDisc, 40, y);

  // Save to PDF file
  doc.save(`AlzVision_Report_${analysis.patient_code}_${analysis.predicted_stage.replace(/\s+/g, '_')}.pdf`);
}
