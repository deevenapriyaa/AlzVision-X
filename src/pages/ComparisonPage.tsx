import React, { useState, useEffect } from 'react';
import { 
  GitCompare, AlertTriangle, CheckCircle2, 
  Brain, Sliders, ArrowRight
} from 'lucide-react';
import { CompareResult } from '../types';
import { compareScans } from '../services/api';
import { getGradCamOverlaySvg } from '../services/gradcamService';

interface ComparisonPageProps {
  initialPatientId?: number;
  initialBaselineId?: number;
  initialFollowupId?: number;
}

export const ComparisonPage: React.FC<ComparisonPageProps> = ({
  initialPatientId,
  initialBaselineId,
  initialFollowupId
}) => {
  const [compareData, setCompareData] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [opacity, setOpacity] = useState(65);

  useEffect(() => {
  async function loadComparison() {
    setLoading(true);

    if (initialBaselineId === undefined || initialFollowupId === undefined) {
      setCompareData(null);
      setLoading(false);
      return;
    }

    const res = await compareScans(initialBaselineId, initialFollowupId);

    setCompareData(res);

    setLoading(false);
  }

  loadComparison();
}, [initialBaselineId, initialFollowupId]);
if (loading) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
        <span className="text-xs text-slate-500 font-medium">
          Loading MRI comparison...
        </span>
      </div>
    </div>
  );
}

if (!initialBaselineId || !initialFollowupId || !compareData) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Brain className="w-10 h-10 mx-auto text-slate-400 mb-3" />
        <h3 className="text-sm font-bold text-slate-800">
          MRI Comparison Unavailable
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Upload at least two genuine MRI scans for the same patient to compare them.
        </p>
      </div>
    </div>
  );
}

  const { baseline, followup, patient, interval_days, stage_progression, comparative_summary, clinical_alert } = compareData;

  const baselineOverlay = baseline.gradcam_image_url || getGradCamOverlaySvg(baseline.predicted_stage);
  const followupOverlay = followup.gradcam_image_url || getGradCamOverlaySvg(followup.predicted_stage);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 tracking-tight">
            <GitCompare className="w-5 h-5 text-sky-600" />
            MRI Comparison Across Scans
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare two MRI scans side-by-side for {patient.name} ({patient.code})
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Opacity slider for comparing heatmaps */}
          <div className="flex items-center gap-2 text-xs bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-xs">
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-600 font-medium">Heatmap:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={(e) => setOpacity(parseInt(e.target.value))}
              className="w-20 h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-sky-600"
            />
            <span className="font-mono text-slate-700 font-bold">{opacity}%</span>
          </div>

          <span className="text-xs font-mono font-bold px-2.5 py-1.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200 shadow-xs">
            {interval_days} Days Apart
          </span>
        </div>
      </div>

      {/* Progression Notice */}
      <div className="p-4 rounded-lg border bg-amber-50/70 border-amber-300 text-amber-950 flex items-start gap-3 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-sm">{clinical_alert}</div>
          <p className="text-xs text-slate-700 leading-relaxed">{comparative_summary}</p>
          <div className="text-xs font-semibold pt-1 flex items-center gap-2">
            <span className="text-slate-600">Stage Shift:</span>
            <span className="bg-white px-2 py-0.5 rounded-xs border border-amber-300 font-bold text-slate-900 shadow-xs font-mono">
              {stage_progression}
            </span>
          </div>
        </div>
      </div>

      {/* Side-by-side Dual MRI Comparison View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Baseline Scan */}
        <div className="bg-white rounded-lg p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-mono">
                First Scan (Baseline)
              </span>
              <h3 className="text-sm font-bold text-slate-900">{baseline.scan_date}</h3>
            </div>
            <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
              {baseline.predicted_stage}
            </span>
          </div>

          {/* MRI with Overlay */}
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-[280px] aspect-square rounded-md bg-slate-950 p-2 border-2 border-slate-800 shadow-sm flex items-center justify-center overflow-hidden">
              <img
                src={baseline.original_image_url}
                alt="Baseline MRI"
                className="absolute inset-0 w-full h-full object-contain p-2"
                referrerPolicy="no-referrer"
              />
              <img
                src={baselineOverlay}
                alt="Baseline Heatmap"
                className="absolute inset-0 w-full h-full object-contain p-2 mix-blend-screen"
                style={{ opacity: opacity / 100 }}
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-xs font-mono text-slate-500 mt-2">
              Confidence: {(baseline.confidence * 100).toFixed(1)}%
            </span>
          </div>

          <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <strong className="block text-slate-900 mb-0.5">Finding:</strong>
            {baseline.ai_explanation}
          </div>
        </div>

        {/* Followup Scan */}
        <div className="bg-white rounded-lg p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block font-mono">
                Recent Scan (Follow-up)
              </span>
              <h3 className="text-sm font-bold text-slate-900">{followup.scan_date}</h3>
            </div>
            <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-xs bg-amber-50 text-amber-900 border border-amber-300">
              {followup.predicted_stage}
            </span>
          </div>

          {/* MRI with Overlay */}
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-[280px] aspect-square rounded-md bg-slate-950 p-2 border-2 border-slate-800 shadow-sm flex items-center justify-center overflow-hidden">
              <img
                src={followup.original_image_url}
                alt="Followup MRI"
                className="absolute inset-0 w-full h-full object-contain p-2"
                referrerPolicy="no-referrer"
              />
              <img
                src={followupOverlay}
                alt="Followup Heatmap"
                className="absolute inset-0 w-full h-full object-contain p-2 mix-blend-screen"
                style={{ opacity: opacity / 100 }}
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-xs font-mono text-slate-500 mt-2">
              Confidence: {(followup.confidence * 100).toFixed(1)}%
            </span>
          </div>

          <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <strong className="block text-slate-900 mb-0.5">Finding:</strong>
            {followup.ai_explanation}
          </div>
        </div>
      </div>
    </div>
  );
};
