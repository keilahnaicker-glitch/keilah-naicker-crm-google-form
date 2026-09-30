import React, { useState } from 'react';
import { 
  Table, 
  ExternalLink, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  Database, 
  Columns3, 
  RefreshCw, 
  Check, 
  Mail,
  Calendar,
  Layers
} from 'lucide-react';
import { ClientLead, GoogleAuthState, SheetConfig } from '../../types';
import { GoogleSheetsService } from '../../services/googleSheetsService';
import { crmStorage } from '../../services/crmStorage';

interface Step2SheetProps {
  sheetConfig: SheetConfig;
  onUpdateSheetConfig: (newConfig: SheetConfig) => void;
  leads: ClientLead[];
  authState: GoogleAuthState;
  onPrevStep: () => void;
  onNextStep: () => void;
}

export const Step2Sheet: React.FC<Step2SheetProps> = ({
  sheetConfig,
  onUpdateSheetConfig,
  leads,
  authState,
  onPrevStep,
  onNextStep,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'table' | 'columns' | 'formula'>('table');

  const handleSyncSheet = async () => {
    setIsSyncing(true);
    try {
      const updated = await GoogleSheetsService.createGoogleSheet(
        authState.accessToken,
        sheetConfig.title,
        sheetConfig.sheetName,
        sheetConfig.columns
      );
      onUpdateSheetConfig(updated);
      crmStorage.saveSheetConfig(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-200">
              <Table className="w-3.5 h-3.5" />
              <span>Step 2 of 4 • Central CRM Database</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Google Sheets CRM Database
            </h1>
            <p className="text-sm text-emerald-200/80 max-w-2xl leading-relaxed">
              Every client submission from Google Form is automatically saved as a new row with timestamping, structured lead status, and automated email confirmation tracking.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            <button
              id="btn-sync-sheet"
              onClick={handleSyncSheet}
              disabled={isSyncing}
              className="flex items-center space-x-2 bg-white text-emerald-950 hover:bg-emerald-50 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-75"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{isSyncing ? 'Syncing Sheet...' : 'Sync Google Sheet'}</span>
            </button>
            <a
              id="link-open-sheet"
              href={sheetConfig.spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 bg-emerald-800/60 hover:bg-emerald-800 border border-emerald-400/30 text-white px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-colors"
            >
              <span>Open in Sheets</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-4 sm:px-6">
          <button
            onClick={() => setActiveTab('table')}
            className={`flex items-center space-x-2 py-3.5 px-4 font-semibold text-xs border-b-2 transition-all ${
              activeTab === 'table'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Live Spreadsheet Rows ({leads.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('columns')}
            className={`flex items-center space-x-2 py-3.5 px-4 font-semibold text-xs border-b-2 transition-all ${
              activeTab === 'columns'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Columns3 className="w-4 h-4" />
            <span>Column Schema & Mapping ({sheetConfig.columns.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('formula')}
            className={`flex items-center space-x-2 py-3.5 px-4 font-semibold text-xs border-b-2 transition-all ${
              activeTab === 'formula'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Form ↔ Sheet Auto-Link Logic</span>
          </button>
        </div>

        <div className="p-6">
          {/* TAB 1: SPREADSHEET VIEWER */}
          {activeTab === 'table' && (
            <div className="space-y-4">
              {/* Sheet summary header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{sheetConfig.title}</h3>
                    <p className="text-[11px] text-slate-500">
                      Worksheet tab: <span className="font-semibold text-emerald-800">{sheetConfig.sheetName}</span> • Last synchronized: {new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                    ● {leads.length} Records Logged
                  </span>
                </div>
              </div>

              {/* Data Table */}
              <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-2xs">
                <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-3 px-3.5 w-12 text-center text-slate-400">#</th>
                      <th className="py-3 px-3.5">Timestamp</th>
                      <th className="py-3 px-3.5">Client Name</th>
                      <th className="py-3 px-3.5">Email Address</th>
                      <th className="py-3 px-3.5">Company</th>
                      <th className="py-3 px-3.5">Service Requested</th>
                      <th className="py-3 px-3.5">Budget</th>
                      <th className="py-3 px-3.5">Lead Status</th>
                      <th className="py-3 px-3.5 text-center">Welcome Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {leads.map((lead, idx) => (
                      <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3.5 text-center text-slate-400 font-mono font-medium">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3.5 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                          {lead.timestamp}
                        </td>
                        <td className="py-3 px-3.5 font-bold text-slate-900 whitespace-nowrap">
                          {lead.name}
                        </td>
                        <td className="py-3 px-3.5 text-indigo-600 font-medium">
                          {lead.email}
                        </td>
                        <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">
                          {lead.company || '—'}
                        </td>
                        <td className="py-3 px-3.5 text-slate-700 font-medium">
                          {lead.service}
                        </td>
                        <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap">
                          {lead.budget}
                        </td>
                        <td className="py-3 px-3.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              lead.status === 'New'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : lead.status === 'In Progress'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : lead.status === 'Qualified'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : lead.status === 'Converted'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          {lead.welcomeEmailSent ? (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Sent</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px]">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: COLUMNS SCHEMA */}
          {activeTab === 'columns' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                These standardized column headers are generated in Row 1 of your Google Sheet. Google Apps Script reads and updates these columns automatically.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {sheetConfig.columns.map((col, idx) => (
                  <div
                    key={col}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-3"
                  >
                    <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{col}</p>
                      <p className="text-[10px] text-slate-400">Column {idx + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: AUTO-LINK LOGIC */}
          {activeTab === 'formula' && (
            <div className="space-y-4 max-w-2xl">
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                  How Form ↔ Sheet Linking Works in Google Workspace
                </h4>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  In Google Forms, clicking <strong>Responses &gt; Link to Sheets</strong> routes all incoming submissions directly into this spreadsheet in real-time. No manual data entry or Zapier subscriptions are needed — it is 100% free and native to Google Workspace.
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 shrink-0">1. Automatic Row Creation:</span>
                  <span>Google Forms appends every submission as a fresh row with timestamp in Column A.</span>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 shrink-0">2. Apps Script Trigger:</span>
                  <span>The Google Apps Script trigger (<code className="font-mono text-indigo-600">onFormSubmit</code>) receives the exact row payload instantly.</span>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 shrink-0">3. Status Confirmation:</span>
                  <span>Apps Script writes back to Column J & K confirming that the Welcome Email was sent.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onPrevStep}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-200/60 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Step 1 (Google Form)</span>
          </button>
          <button
            id="btn-next-step3"
            onClick={onNextStep}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all"
          >
            <span>Proceed to Step 3: Google Apps Script</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
