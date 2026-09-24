import React, { useState, useRef } from 'react';
import { 
  Upload, Sparkles, Brain, AlertCircle, CheckCircle2, 
  Image as ImageIcon, User, RefreshCw, Layers, Sliders,
  ArrowRight, ShieldCheck, Info
} from 'lucide-react';
import { AgentPipelineVisualizer } from '../components/AgentPipelineVisualizer';
import { AnalysisResult } from '../types';
import { runMriAnalysis } from '../services/api';

interface AnalysisPageProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  isDemoMode?: boolean;
}

export const AnalysisPage: React.FC<AnalysisPageProps> = ({
  onAnalysisComplete,
  isDemoMode = true
}) => {
  // Patient details state
  const [patientName, setPatientName] = useState('');
  const [patientCode, setPatientCode] = useState('');
  const [age, setAge] = useState(70);
  const [gender, setGender] = useState('Female');
  const [medicalHistory, setMedicalHistory] = useState('');
  
  // MRI image state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Pipeline execution state
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please upload a valid image file (JPG, PNG, WebP).');
        return;
      }
      setSelectedFile(file);
      setErrorMessage(null);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Please upload a valid image file (JPG, PNG, WebP).');
        return;
      }
      setSelectedFile(file);
      setErrorMessage(null);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setErrorMessage('Patient Name is required.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);
    setCurrentStepIndex(0);

    const formData = new FormData();
    formData.append('patient_name', patientName);
    formData.append('patient_code', patientCode);
    formData.append('age', age.toString());
    formData.append('gender', gender);
    formData.append('medical_history', medicalHistory);
    if (!selectedFile) {
     setIsProcessing(false);
     setErrorMessage('Please upload an MRI image before running the analysis.');
     return;
}

formData.append('mri_file', selectedFile);

    // Step-by-step progress animation through the 9-stage pipeline
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < 8) {
          return prev + 1;
        }
        return prev;
      });
    }, 320);

    try {
      const result = await runMriAnalysis(formData);
      clearInterval(stepInterval);
      setCurrentStepIndex(9);
      setTimeout(() => {
        setIsProcessing(false);
        onAnalysisComplete(result);
      }, 400);
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsProcessing(false);
      setErrorMessage(err.message || 'Analysis failed. Please check your connection.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 tracking-tight">
            <Brain className="w-5 h-5 text-sky-600" />
            Upload & Analyze Brain MRI
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload an axial brain MRI scan to run the Hybrid MobileNetV2 + Vision Transformer AI model
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-md bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Error: </span>
            {errorMessage}
          </div>
        </div>
      )}

      {/* Main Analysis Form */}
      <form onSubmit={handleRunAnalysis} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Patient Details */}
        <div className="lg:col-span-5 space-y-4 bg-white rounded-lg p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
            <User className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Patient Details
            </h3>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Patient Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                disabled={isProcessing}
                placeholder="e.g. Eleanor Vance"
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 bg-slate-50/50 transition"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 font-mono">
                  Patient ID
                </label>
                <input
                  type="text"
                  value={patientCode}
                  onChange={(e) => setPatientCode(e.target.value)}
                  disabled={isProcessing}
                  placeholder="PAT-7821"
                  className="w-full px-3 py-2 text-xs font-mono rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 bg-slate-50/50 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Age <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="20"
                  max="110"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value) || 70)}
                  disabled={isProcessing}
                  className="w-full px-3 py-2 text-xs font-mono rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 bg-slate-50/50 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gender <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Female', 'Male', 'Other'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    disabled={isProcessing}
                    onClick={() => setGender(g)}
                    className={`py-1.5 text-xs font-semibold rounded-sm border transition cursor-pointer ${
                      gender === g
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notes & Symptoms
              </label>
              <textarea
                rows={2}
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                disabled={isProcessing}
                placeholder="Memory complaints, routine check-up, etc."
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 bg-slate-50/50 transition"
              />
            </div>
          </div>

          {/* Simple AI Model Info Box */}
          <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="flex items-center justify-between font-bold text-slate-800">
              <span className="flex items-center gap-1.5 font-mono text-[11px]">
                <Layers className="w-3.5 h-3.5 text-sky-600" />
                AI Model Pipeline
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-emerald-100 text-emerald-800 border border-emerald-300">
                Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Combines MobileNetV2 (local features) + Vision Transformer (global shape) for 4-class staging.
            </p>
          </div>
        </div>

        {/* Right Column: MRI Upload & Preview */}
        <div className="lg:col-span-7 space-y-4 bg-white rounded-lg p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-sky-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                Brain MRI Image
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">224 x 224 Slice</span>
          </div>

          {/* Dropzone & Live Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Upload Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`sm:col-span-7 h-48 rounded-md border-2 border-dashed transition flex flex-col items-center justify-center p-4 text-center cursor-pointer ${
                isDragOver
                  ? 'border-sky-500 bg-sky-50/50'
                  : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isProcessing}
              />
              <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center mb-2">
                <Upload className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900">
                {selectedFile ? selectedFile.name : 'Upload Your Brain MRI Scan'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Drag and drop image or <span className="text-sky-600 font-semibold underline">Browse</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                JPG, PNG, WebP supported
              </p>
            </div>

            {/* Live Preview Display */}
            <div className="sm:col-span-5 flex flex-col items-center">
              <div className="relative w-40 h-40 rounded-md bg-slate-950 p-1.5 border-2 border-slate-800 shadow-sm flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="MRI Preview"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-slate-600 text-xs font-mono">No Image</div>
                )}
                <div className="absolute bottom-1 right-1 text-[8px] font-mono text-cyan-400 bg-slate-950/80 px-1 py-0.5 rounded-xs border border-cyan-900/50">
                  MRI Slice
                </div>
              </div>
              <span className="text-[11px] font-mono font-medium text-slate-600 mt-1.5">
                {selectedFile ? selectedFile.name : 'No MRI uploaded'}
              </span>
            </div>
          </div>
          {/* Run Analysis Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full py-3 px-6 rounded-md text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                isProcessing
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 hover:bg-slate-800 border border-slate-900'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                  <span className="font-mono">Running AI Pipeline (Step {Math.min(currentStepIndex + 1, 9)} of 9)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <span className="tracking-wide">RUN MRI ANALYSIS & GRAD-CAM HIGHLIGHT</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* 9-Stage Pipeline Workflow */}
      <AgentPipelineVisualizer
        currentStepIndex={currentStepIndex}
        isProcessing={isProcessing}
      />
    </div>
  );
};
