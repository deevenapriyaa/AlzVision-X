import React from 'react';

interface ProbabilityBarChartProps {
  probabilities: Record<string, number>;
  predictedStage: string;
}

const STAGE_CONFIG: Record<string, { color: string; barBg: string; simpleDesc: string }> = {
  'Non-Demented': {
    color: 'text-emerald-800 bg-emerald-50 border-emerald-300',
    barBg: 'bg-emerald-500',
    simpleDesc: 'Normal healthy brain structure with no dementia signs.'
  },
  'Very Mild Dementia': {
    color: 'text-amber-900 bg-amber-50 border-amber-300',
    barBg: 'bg-amber-500',
    simpleDesc: 'Very early subtle changes in memory areas.'
  },
  'Mild Dementia': {
    color: 'text-orange-900 bg-orange-50 border-orange-300',
    barBg: 'bg-orange-500',
    simpleDesc: 'Noticeable memory loss and shrinkage in memory centers.'
  },
  'Moderate Dementia': {
    color: 'text-rose-900 bg-rose-50 border-rose-300',
    barBg: 'bg-rose-500',
    simpleDesc: 'Clear memory challenges and enlarged brain fluid spaces.'
  }
};

export const ProbabilityBarChart: React.FC<ProbabilityBarChartProps> = ({
  probabilities = {},
  predictedStage
}) => {
  const stages = [
    'Non-Demented',
    'Very Mild Dementia',
    'Mild Dementia',
    'Moderate Dementia'
  ];

  return (
    <div className="space-y-2.5">
      {stages.map((stage) => {
        const prob = probabilities[stage] || 0.0;
        const percent = (prob * 100).toFixed(1);
        const isPredicted = stage === predictedStage;
        const config = STAGE_CONFIG[stage] || {
          color: 'text-slate-700 bg-slate-50 border-slate-200',
          barBg: 'bg-sky-500',
          simpleDesc: ''
        };

        return (
          <div
            key={stage}
            className={`p-3 rounded-md border transition-all ${
              isPredicted
                ? 'bg-sky-50/70 border-sky-400 ring-1 ring-sky-400/40 shadow-xs'
                : 'bg-slate-50/60 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs ${isPredicted ? 'text-slate-950 font-bold' : 'text-slate-700 font-semibold'}`}>
                  {stage}
                </span>
                {isPredicted && (
                  <span className="text-[9px] font-mono uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-xs bg-slate-900 text-white">
                    Prediction
                  </span>
                )}
              </div>

              <span className={`text-xs font-mono font-bold ${isPredicted ? 'text-sky-700' : 'text-slate-600'}`}>
                {percent}%
              </span>
            </div>

            {/* Simple Clean Bar */}
            <div className="w-full h-2 rounded-xs bg-slate-200 overflow-hidden">
              <div
                className={`h-full rounded-xs transition-all duration-700 ${
                  isPredicted ? config.barBg : 'bg-slate-400'
                }`}
                style={{ width: `${Math.max(parseFloat(percent), 2)}%` }}
              />
            </div>

            <div className="text-[11px] text-slate-500 mt-1">
              {config.simpleDesc}
            </div>
          </div>
        );
      })}
    </div>
  );
};
