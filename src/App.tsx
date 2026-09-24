import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { AnalysisPage } from './pages/AnalysisPage';
import { ResultsPage } from './pages/ResultsPage';
import { PatientHistoryPage } from './pages/PatientHistoryPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { ModelArchitecturePage } from './pages/ModelArchitecturePage';
import { fetchDashboardStats, getStoredAnalysisById, getLatestAnalysis } from './services/api';
import { DashboardData, AnalysisResult, Patient } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisResult | null>(null);
  // Navigation contextual parameters
  const [historyPatientId, setHistoryPatientId] = useState<number>(1);
  const [compareParams, setCompareParams] = useState<{ 
    patientId: number | undefined; 
    baselineId: number | undefined; 
    followupId: number | undefined
  }>({
    patientId:undefined,
    baselineId:undefined,
    followupId:undefined
  });

  const refreshDashboard = async () => {
    const stats = await fetchDashboardStats();
    setDashboardData(stats);
  };

  useEffect(() => {
    async function init() {
      const stats = await fetchDashboardStats();
      setDashboardData(stats);
      if (!activeAnalysis && stats.latest_analysis) {
        setActiveAnalysis(stats.latest_analysis);
      }
    }
    init();
  }, []);

  const handleTabChange = async (tab: string) => {
    setCurrentTab(tab);
    if (tab === 'dashboard') {
      await refreshDashboard();
    }
  };

  const handleAnalysisCompleted = async (result: AnalysisResult) => {
    setActiveAnalysis(result);
    await refreshDashboard();
    setCurrentTab('results');
  };

  const handleSelectRecentAnalysis = (recentItem: any) => {
    // 1. Check if we have the exact saved analysis in storage
    const saved = getStoredAnalysisById(recentItem.id);
    if (saved) {
      setActiveAnalysis(saved);
      setCurrentTab('results');
      return;
    }
  };

  const handleNavigateToHistory = (patientId: number) => {
    setHistoryPatientId(patientId);
    setCurrentTab('history');
  };

  const handleNavigateToCompare = (patientId: number, analysisId: number) => {
    setCompareParams({
      patientId,
      baselineId: undefined,
      followupId: analysisId
    });
    setCurrentTab('compare');
  };

  const handleNewAnalysisForPatient = (patient: Patient) => {
    setCurrentTab('analyze');
  };
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-sky-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleTabChange}
        isDemoMode={dashboardData?.system_status.demo_mode ?? true}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'dashboard' && dashboardData && (
          <Dashboard
            data={dashboardData}
            onNavigate={handleTabChange}
            onSelectRecentAnalysis={handleSelectRecentAnalysis}
          />
        )}

        {currentTab === 'analyze' && (
          <AnalysisPage
            onAnalysisComplete={handleAnalysisCompleted}
            isDemoMode={dashboardData?.system_status.demo_mode ?? true}
          />
        )}

        {currentTab === 'results' && activeAnalysis && (
          <ResultsPage
            result={activeAnalysis}
            onNewAnalysis={() => handleTabChange('analyze')}
            onNavigateToHistory={handleNavigateToHistory}
            onNavigateToCompare={handleNavigateToCompare}
          />
        )}

        {currentTab === 'history' && (
          <PatientHistoryPage
            initialPatientId={historyPatientId}
            onSelectAnalysis={(analysis) => {
              setActiveAnalysis(analysis);
              setCurrentTab('results');
            }}
            onCompareScans={(patientId, baselineId, followupId) => {
              setCompareParams({ patientId, baselineId, followupId });
              setCurrentTab('compare');
            }}
            onNewAnalysisForPatient={handleNewAnalysisForPatient}
          />
        )}

        {currentTab === 'compare' && (
          <ComparisonPage
            initialPatientId={compareParams.patientId}
            initialBaselineId={compareParams.baselineId}
            initialFollowupId={compareParams.followupId}
          />
        )}

        {currentTab === 'architecture' && (
          <ModelArchitecturePage />
        )}
      </main>

      {/* Institutional Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-bold text-slate-800 tracking-tight">AlzVision-X Framework</span> • Hybrid MobileNetV2 + Vision Transformer & Multi-Agentic Decision Support
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-mono text-[11px]">Academic Mini Project</span>
            <span>•</span>
            <button onClick={() => handleTabChange('architecture')} className="text-sky-700 hover:text-sky-900 font-semibold cursor-pointer">
              System Architecture
            </button>
            <span>•</span>
            <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-xs border border-slate-200">
              v1.0.0 (Research Prototype)
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
