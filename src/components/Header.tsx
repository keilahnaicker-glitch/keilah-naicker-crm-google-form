import React from 'react';
import { 
  FileText, 
  Table, 
  Code2, 
  CheckCircle2, 
  LayoutDashboard, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Mail
} from 'lucide-react';
import { GoogleAuthState, PipelineStepId } from '../types';

interface HeaderProps {
  currentTab: PipelineStepId | 'dashboard';
  onSelectTab: (tab: PipelineStepId | 'dashboard') => void;
  authState: GoogleAuthState;
  onConnectGoogle: () => void;
  onResetDemo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  authState,
  onConnectGoogle,
  onResetDemo,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight">Google Workspace CRM</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                  Form → Sheet → Script
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Free automated client intake CRM for <span className="font-semibold text-slate-700">keilahnaicker@gmail.com</span>
              </p>
            </div>
          </div>

          {/* Navigation Mode */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              id="nav-pipeline-btn"
              onClick={() => onSelectTab('form')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab !== 'dashboard'
                  ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>4-Step Setup & Test</span>
            </button>
            <button
              id="nav-dashboard-btn"
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-indigo-500" />
              <span>CRM Client Hub</span>
            </button>
          </div>

          {/* User Account / Google Workspace Status */}
          <div className="flex items-center space-x-2.5">
            <div className="hidden md:flex items-center space-x-2 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-medium text-slate-700">keilahnaicker@gmail.com</span>
            </div>

            <button
              id="btn-reset-demo"
              onClick={onResetDemo}
              title="Reset configuration to defaults"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
