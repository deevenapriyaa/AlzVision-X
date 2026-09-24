import React, { useState } from 'react';
import { 
  FileDown, Brain, Activity, Sparkles, CheckCircle2, 
  ArrowLeft, GitCompare, Users, Stethoscope, AlertTriangle,
  Layers, ShieldAlert, Share2, Printer
} from 'lucide-react';
import { AnalysisResult } from '../types';
import { GradCamViewer } from '../components/GradCamViewer';
import { ProbabilityBarChart } from '../components/ProbabilityBarChart';
import { AgentPipelineVisualizer } from '../components/AgentPipelineVisualizer';
import { downloadClientPdfReport } from '../services/reportGenerator';
import { DemoBadge } from '../components/DemoBadge';
import { STAGE_DETAILS } from '../services/gradcamService';

interface ResultsPageProps {
  result: AnalysisResult;
  onNewAnalysis: () => void;
  onNavigateToHistory: (patientId: number) => void;
  onNavigateToCompare: (patientId: number, analysisId: number) => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  result,
  onNewAnalysis,
  onNavigateToHistory,
  onNavigateToCompare
}) => {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const stageInfo = STAGE_DETAILS[result.predicted_stage] || STAGE_DETAILS['Mild Dementia'];

  const handleDownloadPdf = () => {
    setIsDownloadingPdf(true);
    try {
      if (result.report_pdf_url) {
        window.open(result.report_pdf_url, '_blank');
      }
      downloadClientPdfReport(result);
    } catch (e) {
      downloadClientPdfReport(result);
    } finally {
      setTimeout(() => setIsDownloadingPdf(false), 600);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onNewAnalysis}
            className="p-2 rounded-md border border-slate-200 hover:bg-slate-100 text-slate-700 bg-white shadow-xs transition cursor-pointer"
            title="Upload New MRI"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                MRI Analysis Results
              </h2>
              <DemoBadge isDemo={result.is_demo_mode} />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Patient: {result.patient_name} ({result.patient_code}) • Scan Date: {result.scan_date}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateToCompare(result.patient_id, result.id || 1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition cursor-pointer"
          >
            <GitCompare className="w-3.5 h-3.5 text-slate-600" />
            <span>Compare Scans</span>
          </button>

          <button
            onClick={() => onNavigateToHistory(result.patient_id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-slate-600" />
            <span>Patient History</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 border border-slate-900 shadow-xs transition cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-sky-400" />
            <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download Report'}</span>
          </button>
        </div>
      </div>

      {/* 1. Patient Details & Clean Prediction Result Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Patient Details */}
        <div className="md:col-span-4 bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-2.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
            Patient Details
          </span>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">{result.patient_name}</h3>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-xs bg-slate-100 text-slate-700 border border-slate-200">
              {result.patient_code}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-200">
            <div>
              <span className="text-slate-400 block text-[10px]">Age & Gender</span>
              <span className="font-semibold text-slate-800">{result.patient_age} yrs • {result.patient_gender}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Scan Date</span>
              <span className="font-semibold text-slate-800">{result.scan_date}</span>
            </div>
          </div>
        </div>

        {/* Prediction Result Card */}
        <div className="md:col-span-8 bg-slate-900 rounded-lg p-5 text-white shadow-xs border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400 block mb-1">
              AI Prediction Result
            </span>
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {result.predicted_stage}
              </h3>
              <span className="px-2 py-0.5 rounded-xs text-xs font-mono font-semibold bg-sky-950 text-sky-300 border border-sky-700">
                {stageInfo.cdr}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-2">
              Analyzed with Hybrid MobileNetV2 and Vision Transformer (ViT).
            </p>
          </div>

          {/* Confidence Badge */}
          <div className="shrink-0 bg-slate-800/90 rounded-md p-4 border border-slate-700 text-center min-w-[130px]">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">
              Confidence
            </span>
            <span className="text-2xl font-black text-white font-mono block mt-0.5">
              {(result.confidence * 100).toFixed(1)}%
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold block mt-0.5">
              High Confidence
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Grid: Grad-CAM MRI Highlight on Left/Right & Probabilities on Left */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 4-Class Probability Distribution */}
        <div className="lg:col-span-5 bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                Class Probabilities (4 Classes)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Model probability score for each Alzheimer’s stage</p>
            </div>
            <Activity className="w-4 h-4 text-sky-600" />
          </div>

          <ProbabilityBarChart
            probabilities={result.probabilities}
            predictedStage={result.predicted_stage}
          />
        </div>

        {/* Right: Grad-CAM MRI Highlight with transparent heatmap over MRI */}
        <div className="lg:col-span-7">
          <GradCamViewer
            originalImageUrl={result.original_image_url}
            gradcamImageUrl={result.gradcam_image_url}
            predictedStage={result.predicted_stage}
            confidence={result.confidence}
            atrophyRegions={result.atrophy_regions}
            isDemoMode={result.is_demo_mode}
          />
        </div>
      </div>

      {/* 3. Simple Recommendations */}
      <div className="bg-white rounded-lg p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Simple Recommendations
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs bg-sky-50 text-sky-800 border border-sky-200">
            Next Steps
          </span>
        </div>

        <ul className="space-y-2 text-xs text-slate-700">
          {stageInfo.simpleRecommendations.map((rec, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 4. Agentic AI Pipeline (9 Steps) */}
      <AgentPipelineVisualizer
        completedSteps={result.pipeline_steps}
        currentStepIndex={9}
        isProcessing={false}
      />

      {/* 5. Simple Medical Disclaimer */}
      <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-700">Medical Disclaimer: </span>
          AlzVision-X is an AI research tool. This result is for educational and screening assistance only.
          Always consult a qualified medical doctor or neurologist for final clinical diagnosis.
        </div>
      </div>
    </div>
  );
};
