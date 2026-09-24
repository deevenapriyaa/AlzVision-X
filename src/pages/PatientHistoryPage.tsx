import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Clock, GitCompare, Brain, 
  ChevronRight, Search, Plus, FileDown, Activity
} from 'lucide-react';
import { Patient, AnalysisResult } from '../types';
import { fetchPatients, fetchPatientHistory } from '../services/api';
import { downloadClientPdfReport } from '../services/reportGenerator';

interface PatientHistoryPageProps {
  initialPatientId?: number;
  onSelectAnalysis: (analysis: AnalysisResult) => void;
  onCompareScans: (patientId: number, baselineId: number, followupId: number) => void;
  onNewAnalysisForPatient: (patient: Patient) => void;
}

export const PatientHistoryPage: React.FC<PatientHistoryPageProps> = ({
  initialPatientId,
  onSelectAnalysis,
  onCompareScans,
  onNewAnalysisForPatient
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number>(initialPatientId || 1);
  const [historyData, setHistoryData] = useState<{ patient: Patient; analyses: AnalysisResult[] } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Compare selection state
  const [selectedScanIds, setSelectedScanIds] = useState<number[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const patList = await fetchPatients();
      setPatients(patList);

      const targetId = initialPatientId || (patList[0] ? patList[0].id : 1);
      setSelectedPatientId(targetId);

      const hist = await fetchPatientHistory(targetId);
      setHistoryData(hist);
      setLoading(false);
    }
    loadData();
  }, [initialPatientId]);

  const handleSelectPatient = async (pId: number) => {
    setSelectedPatientId(pId);
    setSelectedScanIds([]);
    setLoading(true);
    const hist = await fetchPatientHistory(pId);
    setHistoryData(hist);
    setLoading(false);
  };

  const handleToggleScanSelection = (scanId: number) => {
  setSelectedScanIds((prev) => {
    if (prev.includes(scanId)) {
      return prev.filter((id) => id !== scanId);
    }

    if (prev.length === 2) {
      return [prev[1], scanId];
    }

    return [...prev, scanId];
  });
};

  const handleTriggerCompare = () => {
    if (selectedScanIds.length === 2 && historyData) {
      onCompareScans(historyData.patient.id, selectedScanIds[0], selectedScanIds[1]);
    }
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patient_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 tracking-tight">
            <Users className="w-5 h-5 text-sky-600" />
            Patient Registry & Longitudinal MRI History
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit chronological volumetric MRI progression, CDR trajectory, and comparative scans
          </p>
        </div>

        {selectedScanIds.length === 2 && historyData && (
          <button
            onClick={handleTriggerCompare}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 border border-slate-900 shadow-xs transition cursor-pointer"
          >
            <GitCompare className="w-4 h-4 text-sky-400" />
            <span>Compare {selectedScanIds.length} Selected Scans</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Patient List Directory */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-lg p-4 border border-slate-200/90 shadow-xs space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search patient by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 bg-slate-50/50 transition font-sans"
              />
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredPatients.map((p) => {
                const isSelected = p.id === selectedPatientId;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPatient(p.id)}
                    className={`p-3 rounded-md border transition cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 border-sky-500 ring-1 ring-sky-500 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 tracking-tight">{p.name}</span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs bg-slate-200 text-slate-700">
                        {p.patient_code}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                      <span>{p.age} yrs • {p.gender}</span>
                      <span className="text-sky-700 font-mono font-semibold">{p.analyses_count || 0} Scans</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Patient Dossier & Longitudinal Timeline */}
        <div className="lg:col-span-8 space-y-5">
          {historyData && (
            <>
              {/* Patient Header Card */}
              <div className="bg-white rounded-lg p-5 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">{historyData.patient.name}</h3>
                    <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded-xs bg-sky-50 text-sky-800 border border-sky-200">
                      {historyData.patient.patient_code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">
                    {historyData.patient.age} yrs • {historyData.patient.gender} • Contact: {historyData.patient.contact || 'N/A'}
                  </p>
                  {historyData.patient.medical_history && (
                    <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-md border border-slate-200 font-sans leading-relaxed">
                      <span className="font-semibold text-slate-800 font-mono">History: </span>
                      {historyData.patient.medical_history}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => onNewAnalysisForPatient(historyData.patient)}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 border border-slate-900 shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Scan</span>
                </button>
              </div>

              {/* Scans Timeline */}
              <div className="bg-white rounded-lg p-6 border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                      Longitudinal MRI Analyses ({historyData.analyses.length})
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">Select any 2 scans to launch side-by-side comparison</p>
                  </div>

                  {selectedScanIds.length > 0 && (
                    <span className="text-xs font-mono font-semibold text-sky-700">
                      {selectedScanIds.length} / 2 Selected for Comparison
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {historyData.analyses.map((scan, idx) => {
                    const isSelectedForCompare = scan.id !== undefined && selectedScanIds.includes(scan.id);

                    return (
                      <div
                        key={scan.id}
                        onClick={() => {
                          if (scan.id !== undefined) {
                              handleToggleScanSelection(scan.id);
                          }
                        }}
                        className={`p-3.5 rounded-md border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer ${
                          isSelectedForCompare
                            ? 'bg-sky-50/70 border-sky-400 ring-1 ring-sky-400/40 shadow-xs'
                            : 'bg-slate-50/60 hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          {/* Checkbox for compare */}
                          <input
                            type="checkbox"
                            checked={isSelectedForCompare}
                            onChange={() => {
                              if (scan.id !== undefined) {
                                handleToggleScanSelection(scan.id);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 rounded-xs text-sky-600 focus:ring-sky-500 cursor-pointer accent-sky-600"
                            title="Select for comparison"
                          />

                          {/* MRI Thumbnail */}
                          <div className="w-14 h-14 rounded-sm bg-slate-950 p-1 border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                            <img
                              src={scan.original_image_url}
                              alt="MRI Scan"
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">{scan.predicted_stage}</span>
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs bg-slate-200 text-slate-800">
                                {scan.cdr_rating || 'CDR ?'}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-mono">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                {scan.scan_date}
                              </span>
                              <span className="font-semibold text-slate-700">
                                Conf: {(scan.confidence * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                               e.stopPropagation();
                               onSelectAnalysis(scan);
                            }}
                            className="px-2.5 py-1 rounded-sm text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 shadow-xs transition cursor-pointer"
                          >
                            View Dossier
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadClientPdfReport(scan);
                            }}
                            className="p-1 rounded-sm text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
                            title="Download PDF"
                          >
                            <FileDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
