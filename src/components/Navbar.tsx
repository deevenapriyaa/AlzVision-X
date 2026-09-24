import React from 'react';
import { Activity, Brain, Users, GitCompare, Network, Sparkles, FileText } from 'lucide-react';
import { DemoBadge } from './DemoBadge';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isDemoMode?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, isDemoMode = true }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'analyze', label: 'MRI Analysis', icon: Brain },
    { id: 'history', label: 'Patient History', icon: Users },
    { id: 'compare', label: 'MRI Comparison', icon: GitCompare },
    { id: 'architecture', label: 'AI Architecture', icon: Network },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => onSelectTab('dashboard')}>
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white border border-slate-800 shadow-xs ring-1 ring-sky-500/30">
              <Brain className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  AlzVision<span className="text-sky-600">-X</span>
                </span>
                <span className="text-[10px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-700 border border-slate-200">
                  v1.0 DL
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">Hybrid MobileNetV2 + ViT Multi-Agent Framework</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-lg border border-slate-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-950 shadow-xs border border-slate-200/80 font-bold ring-1 ring-slate-900/5'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600' : 'text-slate-500'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Status Actions */}
          <div className="flex items-center gap-2.5">
            <DemoBadge isDemo={isDemoMode} />
            <button
              onClick={() => onSelectTab('analyze')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition shadow-xs cursor-pointer active:scale-98"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>New Analysis</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-200 text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center gap-1 py-1 px-2 rounded-md ${
                  isActive ? 'text-sky-600 font-bold bg-sky-50/50' : 'text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
