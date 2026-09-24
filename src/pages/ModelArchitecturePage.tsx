import React from 'react';
import { 
  Network, Cpu, Layers, Sparkles, Activity, 
  Eye, FileText, Stethoscope, Database, CheckCircle2, 
  ArrowRight, ShieldAlert, BookOpen, Terminal
} from 'lucide-react';
import { DemoBadge } from '../components/DemoBadge';

export const ModelArchitecturePage: React.FC = () => {
  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-slate-900 rounded-lg p-6 sm:p-8 text-white shadow-xs border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold uppercase tracking-wider bg-sky-950 text-sky-300 border border-sky-700">
            Methodology & Technical Specifications
          </span>
          <DemoBadge isDemo={true} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          AlzVision-X: Hybrid Deep Learning & Multi-Agent Architecture
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Detailed breakdown of the dual-branch neural feature extractor (MobileNetV2 + Vision Transformer), 
          cross-attention feature fusion layer, and the 6 autonomous clinical diagnostic agents.
        </p>
      </div>

      {/* End-to-End Architectural Pipeline Diagram */}
      <div className="bg-white rounded-lg p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 tracking-tight">
              <Network className="w-4 h-4 text-sky-600" />
              Project PPT Architecture & Diagnostic Pipeline
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              The continuous multi-stage pipeline as defined in the project methodology
            </p>
          </div>
        </div>

        {/* Visual Flow Stages */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Stage 1: Input & Preprocess */}
          <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-6 h-6 rounded-xs bg-slate-200 text-slate-800 flex items-center justify-center font-mono font-bold text-xs border border-slate-300">
              1
            </div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Input & Preprocessing
            </h4>
            <ul className="text-xs text-slate-600 space-y-1.5 font-normal">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                <span>Raw Axial T1 Brain MRI Intake</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                <span>CLAHE Contrast Enhancement</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                <span>224 x 224 x 3 Tensor Formulation</span>
              </li>
            </ul>
          </div>

          {/* Stage 2: Dual Hybrid Neural Backbones */}
          <div className="p-4 rounded-md bg-sky-50/60 border border-sky-200 space-y-3">
            <div className="w-6 h-6 rounded-xs bg-sky-600 text-white flex items-center justify-center font-mono font-bold text-xs">
              2
            </div>
            <h4 className="text-xs font-bold text-sky-950 uppercase tracking-wider font-mono">
              Hybrid Feature Extractors
            </h4>
            <ul className="text-xs text-slate-700 space-y-1.5 font-normal">
              <li className="flex items-start gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                <span><b className="font-semibold text-slate-900">MobileNetV2:</b> 1280-d local textures</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                <span><b className="font-semibold text-slate-900">ViT:</b> 16x16 patch attention (192-d)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                <span><b className="font-semibold text-slate-900">Fusion:</b> 704-d → 512-d dense layer</span>
              </li>
            </ul>
          </div>

          {/* Stage 3: Explainability & Prediction */}
          <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-6 h-6 rounded-xs bg-indigo-100 text-indigo-800 flex items-center justify-center font-mono font-bold text-xs border border-indigo-200">
              3
            </div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Staging & Explainability
            </h4>
            <ul className="text-xs text-slate-600 space-y-1.5 font-normal">
              <li className="flex items-start gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <span>4-Class Softmax Classification</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Eye className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <span>Grad-CAM Visual Heatmap (JET)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <span>Hippocampal Atrophy Scoring</span>
              </li>
            </ul>
          </div>

          {/* Stage 4: Agentic Reports & Database */}
          <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-6 h-6 rounded-xs bg-emerald-100 text-emerald-800 flex items-center justify-center font-mono font-bold text-xs border border-emerald-200">
              4
            </div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Reports & Persistence
            </h4>
            <ul className="text-xs text-slate-600 space-y-1.5 font-normal">
              <li className="flex items-start gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Evidence-Based Clinical Pathways</span>
              </li>
              <li className="flex items-start gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Institutional PDF Dossier Generation</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>SQLite Longitudinal Patient Store</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Deep-Dive Technical Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MobileNetV2 Branch */}
        <div className="bg-white rounded-lg p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <Cpu className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              MobileNetV2: Local Cortical Feature Extractor
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            MobileNetV2 utilizes depthwise separable convolutions and inverted residual bottlenecks with linear squeeze layers. 
            In AlzVision-X, it specializes in capturing localized micro-structural cortical textures, sulcal depth variations, 
            and hippocampal boundary density within the 224x224 input image slice.
          </p>
          <div className="bg-slate-900 text-slate-200 p-3.5 rounded-md font-mono text-[11px] space-y-1 border border-slate-800">
            <div className="text-sky-400"># MobileNet Feature Extraction Dimension</div>
            <div>Input: Tensor (1, 3, 224, 224)</div>
            <div>Conv Backbone: InvertedResidualBlocks x 19</div>
            <div>Output Feature Map: (1, 1280, 7, 7) → (1, 1280)</div>
          </div>
        </div>

        {/* Vision Transformer Branch */}
        <div className="bg-white rounded-lg p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <Layers className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Vision Transformer (ViT): Global Self-Attention
            </h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            Standard CNNs possess limited receptive fields. The ViT branch decomposes the brain slice into 196 non-overlapping 
            16x16 spatial patches, encoding them with learnable position embeddings. Multi-head self-attention models global bilateral 
            symmetry, hemisphere volume ratios, and ventricular enlargement.
          </p>
          <div className="bg-slate-900 text-slate-200 p-3.5 rounded-md font-mono text-[11px] space-y-1 border border-slate-800">
            <div className="text-sky-400"># ViT Self-Attention Dimension</div>
            <div>Patch Size: 16x16 → 196 Tokens</div>
            <div>Embedding Dim: 192 (Heads: 4, Layers: 3)</div>
            <div>Output CLS Token: (1, 192)</div>
          </div>
        </div>
      </div>

      {/* 4-Class Classification Schema & Clinical Dementia Rating */}
      <div className="bg-white rounded-lg p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
            4-Stage Alzheimer's Staging & Clinical Dementia Rating (CDR)
          </h3>
          <span className="text-xs font-mono text-slate-500">Standardized Medical Hierarchy</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            { name: 'Non-Demented', cdr: 'CDR 0', color: 'border-emerald-300 bg-emerald-50/70 text-emerald-950', desc: 'Healthy aging, no impairment.' },
            { name: 'Very Mild Dementia', cdr: 'CDR 0.5', color: 'border-amber-300 bg-amber-50/70 text-amber-950', desc: 'Mild Cognitive Impairment (MCI).' },
            { name: 'Mild Dementia', cdr: 'CDR 1.0', color: 'border-orange-300 bg-orange-50/70 text-orange-950', desc: 'Early Alzheimer\'s stage.' },
            { name: 'Moderate Dementia', cdr: 'CDR 2.0', color: 'border-rose-300 bg-rose-50/70 text-rose-950', desc: 'Moderate cognitive decline.' }
          ].map((cls, idx) => (
            <div key={idx} className={`p-3 rounded-md border ${cls.color} space-y-1`}>
              <div className="font-bold text-xs tracking-tight">{cls.name}</div>
              <div className="font-mono text-[11px] font-bold">{cls.cdr}</div>
              <p className="text-[10px] opacity-80 mt-1">{cls.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How to Run Locally in VS Code */}
      <div className="bg-slate-900 rounded-lg p-6 sm:p-8 text-white shadow-xs border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-bold text-white font-mono tracking-tight">How to Run in VS Code Locally</h3>
        </div>

        <p className="text-xs text-slate-300">
          AlzVision-X is structured for local execution with separate FastAPI backend and React frontend:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-md bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-sky-400 block font-mono">1. Start Python FastAPI Backend</span>
            <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-2.5 bg-slate-900/90 rounded-sm border border-slate-800">
              {`cd backend\npython -m venv venv\nsource venv/bin/activate  # (Windows: venv\\Scripts\\activate)\npip install -r requirements.txt\npython run.py`}
            </pre>
            <span className="text-[10px] text-slate-400 block font-mono">Runs on http://127.0.0.1:8000 (Swagger docs at /docs)</span>
          </div>

          <div className="p-4 rounded-md bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-sky-400 block font-mono">2. Start React Frontend</span>
            <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-2.5 bg-slate-900/90 rounded-sm border border-slate-800">
              {`npm install\nnpm run dev`}
            </pre>
            <span className="text-[10px] text-slate-400 block font-mono">Runs on http://localhost:3000</span>
          </div>
        </div>
      </div>
    </div>
  );
};
