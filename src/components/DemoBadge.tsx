import React from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

interface DemoBadgeProps {
  isDemo?: boolean;
}

export const DemoBadge: React.FC<DemoBadgeProps> = ({ isDemo = true }) => {
  if (!isDemo) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span className="font-mono text-[11px]">Trained Model Active</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300 shadow-xs">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
      <span className="font-mono text-[11px] font-bold">Research Prototype Mode</span>
    </span>
  );
};
