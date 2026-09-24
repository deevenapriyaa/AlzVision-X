import React from 'react';
import { 
  UploadCloud, Filter, Cpu, Layers, Sparkles, 
  Activity, Eye, FileText, Stethoscope,
  CheckCircle2, Clock, Loader2, ArrowRight
} from 'lucide-react';
import { PipelineStep } from '../types';

interface AgentPipelineVisualizerProps {
  currentStepIndex?: number;
  isProcessing?: boolean;
  completedSteps?: PipelineStep[];
  onSelectStep?: (stepId: number) => void;
  activeSelectedStep?: number;
}

export const PIPELINE_STAGES_SIMPLE = [
  { id: 1, name: 'MRI Upload', role: 'Intake', icon: UploadCloud, desc: 'Receives the brain MRI image.' },
  { id: 2, name: 'Preprocessing', role: 'Cleaner', icon: Filter, desc: 'Resizes to 224x224 and sharpens contrast.' },
  { id: 3, name: 'MobileNetV2', role: 'CNN Agent', icon: Cpu, desc: 'Extracts fine textures and local brain patterns.' },
  { id: 4, name: 'Vision Transformer', role: 'ViT Agent', icon: Layers, desc: 'Analyzes global brain shape and symmetry.' },
  { id: 5, name: 'Feature Fusion', role: 'Fusion Agent', icon: Sparkles, desc: 'Combines local and global brain features.' },
  { id: 6, name: 'Prediction', role: 'Classifier', icon: Activity, desc: 'Predicts 1 of 4 Alzheimer’s stages.' },
  { id: 7, name: 'Grad-CAM', role: 'Explainability', icon: Eye, desc: 'Highlights brain regions that influenced the AI.' },
  { id: 8, name: 'Report', role: 'Report Agent', icon: FileText, desc: 'Creates a clean patient summary and PDF.' },
  { id: 9, name: 'Recommendation', role: 'Medical Agent', icon: Stethoscope, desc: 'Provides simple follow-up guidance.' }
];

export const AgentPipelineVisualizer: React.FC<AgentPipelineVisualizerProps> = ({
  currentStepIndex = 9,
  isProcessing = false,
  completedSteps = [],
  onSelectStep,
  activeSelectedStep
}) => {
  return (
    <div className="bg-white rounded-lg p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Agentic AI Pipeline Workflow
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Step-by-step processing from raw MRI image to AI prediction and explanation
          </p>
        </div>

        {isProcessing && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-sky-50 text-sky-800 border border-sky-300 text-xs font-mono font-semibold">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
            <span>Running Step {Math.min(currentStepIndex + 1, 9)} of 9...</span>
          </div>
        )}
      </div>

      {/* Grid of Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2.5">
        {PIPELINE_STAGES_SIMPLE.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = !isProcessing || idx < currentStepIndex;
          const isCurrent = isProcessing && idx === currentStepIndex;
          const isSelected = activeSelectedStep === stage.id;

          return (
            <div
              key={stage.id}
              onClick={() => onSelectStep && onSelectStep(stage.id)}
              className={`relative p-3 rounded-md border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-sky-50 border-sky-500 ring-1 ring-sky-500 shadow-xs'
                  : isCurrent
                  ? 'bg-amber-50 border-amber-400 ring-1 ring-amber-400 animate-pulse'
                  : isDone
                  ? 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                  : 'bg-slate-50/40 border-slate-200/60 opacity-60'
              }`}
            >
              {/* Step indicator header */}
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center border ${
                    isDone
                      ? 'bg-white text-slate-800 border-slate-200'
                      : isCurrent
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-slate-200 text-slate-500 border-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>

                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                ) : (
                  <span className="text-[10px] font-mono text-slate-400 font-bold">#{stage.id}</span>
                )}
              </div>

              <div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {stage.name}
                </div>
                <div className="text-[10px] text-sky-700 font-mono font-medium mt-0.5">
                  {stage.role}
                </div>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                  {stage.desc}
                </p>
              </div>

              <div className="mt-2 pt-1 border-t border-slate-200/70 text-[9px] font-mono font-semibold text-slate-400">
                {isDone ? 'Completed' : isCurrent ? 'Processing' : 'Pending'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
