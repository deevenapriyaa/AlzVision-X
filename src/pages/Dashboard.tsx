import React from 'react';
import { 
  Activity, Brain, Users, ArrowUpRight, Plus, 
  CheckCircle2, Layers, Cpu, Eye, ShieldCheck,
  FileText, Sparkles, ChevronRight
} from 'lucide-react';
import { DashboardData } from '../types';
import { DemoBadge } from '../components/DemoBadge';

interface DashboardProps {
  data: DashboardData;
  onNavigate: (tab: string, contextData?: any) => void;
  onSelectRecentAnalysis: (analysis: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  data,
  onNavigate,
  onSelectRecentAnalysis
}) => {
  const { total_patients, total_analyses, recent_analyses, stage_distribution, system_status } = data;

  const stageColorMap: Record<string, string> = {
    'Non-Demented': 'bg-emerald-50 text-emerald-800 border-emerald-300',
    'Very Mild Dementia': 'bg-amber-50 text-amber-900 border-amber-300',
    'Mild Dementia': 'bg-orange-50 text-orange-900 border-orange-300',
    'Moderate Dementia': 'bg-rose-50 text-rose-900 border-rose-300',
  };

  const stagesList = [
    'Non-Demented',
    'Very Mild Dementia',
    'Mild Dementia',
    'Moderate Dementia',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-xl bg-slate-900 border border-slate-800 p-6 sm:p-7 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-slate-800 text-sky-400 border border-slate-700">
                AI Alzheimer's Detection
              </span>
              <DemoBadge isDemo={system_status.demo_mode} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              AlzVision-X Dashboard
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Hybrid MobileNetV2 + Vision Transformer AI framework for early Alzheimer's disease detection with Grad-CAM heatmap visualization.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                MobileNetV2 + ViT
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Grad-CAM Heatmap
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                4 Dementia Classes
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <button
              onClick={() => onNavigate('analyze')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition shadow-sm cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start MRI Analysis</span>
            </button>
            <button
              onClick={() => onNavigate('architecture')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition cursor-pointer"
            >
              <Layers className="w-4 h-4 text-slate-300" />
              <span>System Flow</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Patients */}
        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Patients</span>
            <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <Users className="w-3.5 h-3.5 text-sky-600" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{total_patients}</span>
            <span className="text-xs text-slate-500">Registered patients</span>
          </div>
        </div>

        {/* Metric 2: Total MRI Analyses */}
        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total MRI Analyses</span>
            <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <Brain className="w-3.5 h-3.5 text-blue-600" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{total_analyses}</span>
            <span className="text-xs text-slate-500">Completed MRI scans</span>
          </div>
        </div>

        {/* Metric 3: Latest Prediction */}
        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Latest Prediction</span>
            <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="text-base font-bold text-slate-900 block truncate">
              {data.latest_prediction || (recent_analyses[0]?.predicted_stage) || 'No Scans Yet'}
            </span>
            <span className="text-[11px] text-slate-500 block truncate">
              {data.latest_patient_name ? `${data.latest_patient_name} • ${data.latest_scan_date || 'Recent'}` : (recent_analyses[0] ? `${recent_analyses[0].patient_name} • ${recent_analyses[0].scan_date}` : 'Awaiting scan')}
            </span>
          </div>
        </div>

        {/* Metric 4: Latest Confidence */}
        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Latest Confidence</span>
            <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {data.latest_confidence 
                ? `${(data.latest_confidence * 100).toFixed(1)}%` 
                : (recent_analyses[0] ? `${(recent_analyses[0].confidence * 100).toFixed(1)}%` : '—')}
            </span>
            <span className="text-xs text-emerald-600 font-medium">Model confidence</span>
          </div>
        </div>
      </div>

      {/* Disease Distribution & Recent Analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stage Distribution */}
        <div className="lg:col-span-6 bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Alzheimer's Stage Distribution
            </h3>
            <span className="text-xs text-slate-500">5 Categories</span>
          </div>

          <div className="space-y-2.5">
            {stagesList.map((st) => {
              const count = stage_distribution[st] || 0;
              const percent = total_analyses > 0 ? (count / total_analyses) * 100 : 0;
              return (
                <div key={st} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{st}</span>
                    <span className="font-mono text-slate-500">{count} scan{count !== 1 ? 's' : ''} ({percent.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-xs bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-sky-600 rounded-xs transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Analyses List */}
        <div className="lg:col-span-6 bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Recent MRI Analyses
            </h3>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs text-sky-700 hover:underline font-semibold cursor-pointer"
            >
              View All History
            </button>
          </div>

          <div className="space-y-2">
            {recent_analyses.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectRecentAnalysis(item)}
                className="p-3 rounded-md bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition cursor-pointer flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{item.patient_name}</span>
                    <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                      {item.patient_code}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {item.age} yrs • {item.gender} • {item.scan_date}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-right">
                  <div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs border block ${stageColorMap[item.predicted_stage] || 'bg-slate-100 text-slate-700'}`}>
                      {item.predicted_stage}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                      {(item.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
