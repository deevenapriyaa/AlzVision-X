import os
from pathlib import Path
from typing import Dict, Any
from datetime import datetime

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, KeepTogether, HRFlowable
    from reportlab.lib.units import inch
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


class ClinicalPDFReportGenerator:
    """
    Generates professional medical report PDFs containing:
    - AlzVision-X Clinical Diagnostic Header & Metadata
    - Patient Demographics & Identification
    - Deep Learning Architecture: Hybrid MobileNetV2 + Vision Transformer
    - Prediction & Calibrated Confidence
    - Full Class Probability Distribution Table
    - Side-by-side Original MRI & Grad-CAM Explainability Heatmap
    - Regional Saliency Biomarker Breakdown
    - Clinical Recommendations & Research Prototype Disclaimer
    """

    def generate_report(self, analysis_data: Dict[str, Any], output_pdf_path: Path) -> str:
        if not REPORTLAB_AVAILABLE:
            # Generate markdown/text fallback report if reportlab missing
            with open(output_pdf_path, "w") as f:
                f.write(f"AlzVision-X Report for Patient {analysis_data.get('patient_name')}\n")
                f.write(f"Predicted Stage: {analysis_data.get('predicted_stage')} ({analysis_data.get('confidence')})\n")
            return str(output_pdf_path)

        doc = SimpleDocTemplate(
            str(output_pdf_path),
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=18,
            leading=22,
            textColor=colors.HexColor('#0F172A')
        )
        subtitle_style = ParagraphStyle(
            'DocSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#64748B')
        )
        heading_style = ParagraphStyle(
            'SectionHeading',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=16,
            textColor=colors.HexColor('#1E293B'),
            spaceBefore=8,
            spaceAfter=4
        )
        body_style = ParagraphStyle(
            'BodyTextCustom',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor('#334155')
        )
        bold_body_style = ParagraphStyle(
            'BoldBodyCustom',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor('#0F172A')
        )
        disclaimer_style = ParagraphStyle(
            'DisclaimerCustom',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=7.5,
            leading=10,
            textColor=colors.HexColor('#94A3B8')
        )

        story = []

        # 1. Header with AlzVision-X Branding
        header_data = [
            [
                Paragraph("<b>AlzVision-X</b> | Neuro-Diagnostic AI", title_style),
                Paragraph(f"Date: <b>{datetime.now().strftime('%Y-%m-%d %H:%M')}</b><br/>Status: <b>RESEARCH PROTOTYPE</b>", subtitle_style)
            ],
            [
                Paragraph("Hybrid Deep Learning (MobileNetV2 + ViT) & Agentic Framework for Alzheimer's Staging", subtitle_style),
                Paragraph(f"Analysis ID: <b>#{analysis_data.get('id', 'NEW')}</b>", subtitle_style)
            ]
        ]
        header_table = Table(header_data, colWidths=[340, 200])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ]))
        story.append(header_table)
        story.append(Spacer(1, 6))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0284C7"), spaceBefore=2, spaceAfter=8))

        # 2. Patient Demographics Box
        patient_data = [
            [
                Paragraph(f"<b>Patient Name:</b> {analysis_data.get('patient_name')}", body_style),
                Paragraph(f"<b>Patient Code:</b> {analysis_data.get('patient_code')}", body_style),
                Paragraph(f"<b>Age / Gender:</b> {analysis_data.get('patient_age')} yrs / {analysis_data.get('patient_gender')}", body_style)
            ]
        ]
        patient_table = Table(patient_data, colWidths=[180, 180, 180])
        patient_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E2E8F0')),
            ('PADDING', (0, 0), (-1, -1), 6),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(patient_table)
        story.append(Spacer(1, 8))

        # 3. Diagnostic Classification Result
        pred_stage = analysis_data.get('predicted_stage', 'Unknown')
        confidence = float(analysis_data.get('confidence', 0.0))
        cdr_rating = analysis_data.get('cdr_rating', 'N/A')

        result_data = [
            [
                Paragraph("<b>Predicted Diagnostic Stage:</b>", bold_body_style),
                Paragraph(f"<font color='#0284C7' size='11'><b>{pred_stage}</b></font>", bold_body_style),
                Paragraph(f"<b>Confidence:</b> {round(confidence * 100, 1)}%", bold_body_style),
                Paragraph(f"<b>Clinical Staging:</b> {cdr_rating}", bold_body_style)
            ]
        ]
        result_table = Table(result_data, colWidths=[140, 150, 110, 140])
        result_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F0F9FF')),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#BAE6FD')),
            ('PADDING', (0, 0), (-1, -1), 6),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(result_table)
        story.append(Spacer(1, 8))

        # 4. Multi-class Probability Breakdown Table
        story.append(Paragraph("Hybrid Neural Probability Distribution", heading_style))
        probs = analysis_data.get('probabilities', {})
        prob_rows = [["Classification Category", "Clinical Dementia Rating (CDR)", "Model Probability"]]
        
        cdr_labels = {
            "Non-Demented": "CDR 0 (No Cognitive Impairment)",
            "Very Mild Dementia": "CDR 0.5 (MCI / Very Mild)",
            "Mild Dementia": "CDR 1.0 (Mild Cognitive Decline)",
            "Moderate Dementia": "CDR 2.0 (Moderate Impairment)"
        }

        for stage_name, p_val in probs.items():
            prob_rows.append([
                stage_name,
                cdr_labels.get(stage_name, "-"),
                f"{round(float(p_val) * 100, 2)}%"
            ])

        prob_table = Table(prob_rows, colWidths=[200, 220, 120])
        prob_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8.5),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('PADDING', (0, 0), (-1, -1), 4),
            ('ALIGN', (2, 0), (2, -1), 'RIGHT'),
        ]))
        story.append(prob_table)
        story.append(Spacer(1, 8))

        # 5. Visual MRI & Grad-CAM Overlay (if image paths exist)
        orig_img_path = analysis_data.get('processed_image_path') or analysis_data.get('original_image_path')
        gradcam_img_path = analysis_data.get('gradcam_image_path')

        if orig_img_path and os.path.exists(orig_img_path) and gradcam_img_path and os.path.exists(gradcam_img_path):
            story.append(Paragraph("Visual Explainability & Class Activation Saliency", heading_style))
            img_table_data = [
                [
                    Paragraph("<b>Preprocessed T1-Weighted MRI Slice</b>", body_style),
                    Paragraph("<b>Grad-CAM Neuro-Anatomical Heatmap Overlay</b>", body_style)
                ],
                [
                    RLImage(orig_img_path, width=2.2*inch, height=2.2*inch),
                    RLImage(gradcam_img_path, width=2.2*inch, height=2.2*inch)
                ]
            ]
            img_table = Table(img_table_data, colWidths=[270, 270])
            img_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('PADDING', (0, 0), (-1, -1), 4),
            ]))
            story.append(img_table)
            story.append(Spacer(1, 6))

        # 6. AI Agent Findings & Explainability
        story.append(Paragraph("Agentic Analysis & Regional Saliency Attribution", heading_style))
        ai_exp = analysis_data.get('ai_explanation', 'Visual attribution analysis performed by Explainability Agent.')
        story.append(Paragraph(ai_exp, body_style))
        story.append(Spacer(1, 6))

        # 7. Clinical Recommendation
        story.append(Paragraph("Clinical Decision Support Pathways", heading_style))
        rec_text = analysis_data.get('clinical_recommendation', 'Standard longitudinal follow-up recommended.')
        rec_paragraphs = rec_text.split("\n")
        for line in rec_paragraphs:
            if line.strip():
                story.append(Paragraph(line, body_style))
                story.append(Spacer(1, 2))

        # 8. Disclaimer Footer
        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#CBD5E1"), spaceBefore=4, spaceAfter=4))
        disclaimer = (
            "<b>DISCLAIMER:</b> AlzVision-X is an academic research prototype framework combining MobileNetV2 and Vision Transformer deep learning architectures "
            "with Agentic AI workflows for experimental research and clinical decision support. It is NOT FDA-approved or a standalone diagnostic medical device. "
            "All findings must be corroborated by a licensed board-certified neurologist or neuroradiologist."
        )
        story.append(Paragraph(disclaimer, disclaimer_style))

        # Build document
        doc.build(story)
        return str(output_pdf_path)
