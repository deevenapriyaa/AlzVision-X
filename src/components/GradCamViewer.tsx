import React, { useState } from 'react';
import { Eye, Sliders, Info, MapPin, Sparkles, Layers } from 'lucide-react';
import { AtrophyRegion } from '../types';
import { STAGE_DETAILS, getGradCamOverlaySvg } from '../services/gradcamService';

interface GradCamViewerProps {
  originalImageUrl: string;
  gradcamImageUrl?: string;
  predictedStage: string;
  confidence: number;
  atrophyRegions?: AtrophyRegion[];
  isDemoMode?: boolean;
}

export const GradCamViewer: React.FC<GradCamViewerProps> = ({
  originalImageUrl,
  gradcamImageUrl,
  predictedStage,
  confidence,
  atrophyRegions = [],
  isDemoMode = true
}) => {
  const [opacity, setOpacity] = useState<number>(65);
  const [viewMode, setViewMode] = useState<'overlay' | 'side-by-side' | 'original'>('overlay');

  // Fallback to dynamic SVG heatmap if not provided
  const effectiveHeatmapUrl = gradcamImageUrl || getGradCamOverlaySvg(predictedStage);
  const stageInfo = STAGE_DETAILS[predictedStage] || STAGE_DETAILS['Mild Dementia'];

  return (
    <div className="bg-white rounded-lg p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Grad-CAM MRI Highlight
            </h3>
            {isDemoMode ? (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs bg-amber-50 text-amber-800 border border-amber-300">
                Demo Grad-CAM
              </span>
            ) : (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs bg-sky-50 text-sky-800 border border-sky-300">
                Grad-CAM Heatmap
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent heatmap shows the exact brain areas that guided the AI prediction
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-md border border-slate-200 text-xs">
          <button
            onClick={() => setViewMode('overlay')}
            className={`px-3 py-1 rounded-sm font-semibold transition cursor-pointer ${
              viewMode === 'overlay'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overlay View
          </button>
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`px-3 py-1 rounded-sm font-semibold transition cursor-pointer ${
              viewMode === 'side-by-side'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => setViewMode('original')}
            className={`px-3 py-1 rounded-sm font-semibold transition cursor-pointer ${
              viewMode === 'original'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Original Only
          </button>
        </div>
      </div>

      {/* Main Visualizer Stage */}
      {viewMode === 'overlay' && (
        <div className="flex flex-col items-center justify-center pt-2">
          {/* Centered MRI + Transparent Grad-CAM Overlay Container */}
          <div className="relative w-full max-w-[340px] aspect-square rounded-lg bg-slate-950 p-2 border-2 border-slate-800 shadow-md overflow-hidden flex items-center justify-center">
            {/* Layer 1: Base Grayscale MRI Image */}
            <img
              src={originalImageUrl}
              alt="Original MRI Slice"
              className="absolute inset-0 w-full h-full object-contain p-2 select-none"
              referrerPolicy="no-referrer"
            />

            {/* Layer 2: Transparent Grad-CAM Heatmap Overlay directly ON TOP of the MRI */}
            <img
              src={effectiveHeatmapUrl}
              alt="Grad-CAM Saliency Heatmap"
              className="absolute inset-0 w-full h-full object-contain p-2 pointer-events-none transition-opacity duration-200 select-none"
              style={{
                opacity: opacity / 100,
                mixBlendMode: 'screen'
              }}
              referrerPolicy="no-referrer"
            />

            {/* Overlay Status Badge */}
            <div className="absolute top-3 left-3 text-[10px] font-mono font-bold text-sky-300 bg-slate-950/80 px-2 py-0.5 rounded-xs border border-sky-800/60">
              Grad-CAM Overlay ({opacity}%)
            </div>
            <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded-xs border border-slate-800">
              Axial Brain Slice
            </div>
          </div>

          {/* Opacity Slider Control */}
          <div className="w-full max-w-[340px] mt-4 px-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                Heatmap Overlay Opacity
              </span>
              <span className="font-mono font-bold text-sky-700">{opacity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={(e) => setOpacity(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-sm appearance-none cursor-pointer accent-sky-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>0% (MRI Only)</span>
              <span>50% (Balanced)</span>
              <span>100% (Full Heatmap)</span>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'side-by-side' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Box 1: Original MRI */}
          <div className="flex flex-col items-center bg-slate-950 p-4 rounded-lg border border-slate-800">
            <span className="text-xs font-bold text-slate-300 mb-2 font-mono">
              1. Original MRI (Grayscale)
            </span>
            <div className="relative w-full max-w-[240px] aspect-square rounded bg-slate-900 flex items-center justify-center p-2 border border-slate-800">
              <img
                src={originalImageUrl}
                alt="Original MRI"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              Normal brain MRI without heatmap
            </p>
          </div>

          {/* Box 2: Grad-CAM Overlay on MRI */}
          <div className="flex flex-col items-center bg-slate-950 p-4 rounded-lg border border-slate-800">
            <span className="text-xs font-bold text-sky-400 mb-2 font-mono">
              2. Grad-CAM Highlight (Overlay)
            </span>
            <div className="relative w-full max-w-[240px] aspect-square rounded bg-slate-900 flex items-center justify-center p-2 border border-slate-800 overflow-hidden">
              <img
                src={originalImageUrl}
                alt="Original Base"
                className="absolute inset-0 w-full h-full object-contain p-2"
                referrerPolicy="no-referrer"
              />
              <img
                src={effectiveHeatmapUrl}
                alt="Grad-CAM Overlay"
                className="absolute inset-0 w-full h-full object-contain p-2 mix-blend-screen"
                style={{ opacity: 0.75 }}
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-[11px] text-sky-300 mt-2 text-center">
              MRI with transparent heatmap on top
            </p>
          </div>
        </div>
      )}

      {viewMode === 'original' && (
        <div className="flex flex-col items-center justify-center pt-2">
          <div className="relative w-full max-w-[340px] aspect-square rounded-lg bg-slate-950 p-2 border-2 border-slate-800 shadow-md flex items-center justify-center">
            <img
              src={originalImageUrl}
              alt="Original MRI Slice"
              className="w-full h-full object-contain p-2"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="text-xs text-slate-500 mt-3 font-mono">
            Original Brain MRI (Axial View)
          </p>
        </div>
      )}

      {/* Heatmap Legend */}
      <div className="bg-slate-50 p-3.5 rounded-md border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <Info className="w-4 h-4 text-sky-600 shrink-0" />
          <span className="font-medium">
            <strong>Attention Legend:</strong> Colored areas show where the AI looked to decide the result.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-slate-500">Low</span>
          <div className="h-3 w-32 rounded-xs bg-gradient-to-r from-blue-600 via-green-400 via-yellow-400 to-red-600 border border-slate-300 shadow-2xs" />
          <span className="text-[11px] font-bold text-red-600">High</span>
        </div>
      </div>

      {/* Simple AI Explanation Box */}
      <div className="p-4 rounded-md bg-sky-50/60 border border-sky-200">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-sky-700" />
          <h4 className="text-xs font-bold text-sky-950 uppercase tracking-wider font-mono">
            AI Explanation
          </h4>
        </div>
        <p className="text-xs text-slate-800 leading-relaxed font-medium">
          “{stageInfo.simpleExplanation}”
        </p>
        <div className="mt-2 pt-2 border-t border-sky-200/60 flex items-center gap-2 text-[11px] text-slate-600">
          <MapPin className="w-3.5 h-3.5 text-sky-600" />
          <span><strong>Key Highlighted Areas:</strong> {stageInfo.highlightRegions.join(' • ')}</span>
        </div>
      </div>
    </div>
  );
};
