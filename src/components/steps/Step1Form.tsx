import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Check, 
  Send, 
  Sparkles, 
  Settings2, 
  ArrowRight,
  HelpCircle,
  Eye
} from 'lucide-react';
import { FormConfig, FormField, GoogleAuthState } from '../../types';
import { GoogleFormsService } from '../../services/googleFormsService';
import { crmStorage } from '../../services/crmStorage';

interface Step1FormProps {
  formConfig: FormConfig;
  onUpdateFormConfig: (newConfig: FormConfig) => void;
  authState: GoogleAuthState;
  onNextStep: () => void;
  onSimulateIntakeSubmit: (formData: Record<string, string>) => void;
}

export const Step1Form: React.FC<Step1FormProps> = ({
  formConfig,
  onUpdateFormConfig,
  authState,
  onNextStep,
  onSimulateIntakeSubmit,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'fields' | 'simulator'>('preview');

  // Intake Form Simulator local state
  const [simName, setSimName] = useState('Alexandra Miller');
  const [simEmail, setSimEmail] = useState('alexandra@millerdesigns.com');
  const [simPhone, setSimPhone] = useState('+1 (555) 432-8901');
  const [simCompany, setSimCompany] = useState('Miller Brand Studio');
  const [simService, setSimService] = useState('Custom Software Development');
  const [simBudget, setSimBudget] = useState('$15,000 - $50,000');
  const [simNotes, setSimNotes] = useState('We need a full CRM integration to connect our client inquiries with Google Sheets & automated email triggers.');
  const [submittedAlert, setSubmittedAlert] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(formConfig.responderUri);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCreateOrSyncForm = async () => {
    setIsDeploying(true);
    try {
      const newConfig = await GoogleFormsService.createGoogleForm(
        authState.accessToken,
        formConfig.title,
        formConfig.description,
        formConfig.fields
      );
      onUpdateFormConfig(newConfig);
      crmStorage.saveFormConfig(newConfig);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleSimulatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simName || !simEmail) return;

    onSimulateIntakeSubmit({
      name: simName,
      email: simEmail,
      phone: simPhone,
      company: simCompany,
      service: simService,
      budget: simBudget,
      notes: simNotes,
    });

    setSubmittedAlert(true);
    setTimeout(() => setSubmittedAlert(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-purple-500/20 border border-purple-400/30 px-3 py-1 rounded-full text-xs font-semibold text-purple-200">
              <FileText className="w-3.5 h-3.5" />
              <span>Step 1 of 4 • Client Intake Gateway</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Google Form Configuration
            </h1>
            <p className="text-sm text-purple-200/80 max-w-2xl leading-relaxed">
              This is where your clients enter their information. Every submission created here will be automatically forwarded to your Google Sheet database and trigger the Google Apps Script welcome email sequence.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            <button
              id="btn-sync-form"
              onClick={handleCreateOrSyncForm}
              disabled={isDeploying}
              className="flex items-center space-x-2 bg-white text-purple-950 hover:bg-purple-50 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-75"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>{isDeploying ? 'Syncing Form...' : 'Sync with Google Forms'}</span>
            </button>
            <a
              id="link-open-form"
              href={formConfig.responderUri}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 bg-purple-800/60 hover:bg-purple-800 border border-purple-400/30 text-white px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-colors"
            >
              <span>Live Form</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-4 sm:px-6">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center space-x-2 py-3.5 px-4 font-semibold text-xs border-b-2 transition-all ${
              activeTab === 'preview'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Form Preview & Link</span>
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center space-x-2 py-3.5 px-4 font-semibold text-xs border-b-2 transition-all ${
              activeTab === 'simulator'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Client Intake Simulator</span>
            <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
              Try It
            </span>
          </button>
          <button
            onClick={() => setActiveTab('fields')}
            className={`flex items-center space-x-2 py-3.5 px-4 font-semibold text-xs border-b-2 transition-all ${
              activeTab === 'fields'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Settings2 className="w-4 h-4" />
            <span>Form Schema & Questions ({formConfig.fields.length})</span>
          </button>
        </div>

        <div className="p-6">
          {/* TAB 1: PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-6">
              {/* Form Metadata Card */}
              <div className="p-6 bg-purple-50/40 rounded-xl border border-purple-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold tracking-wider uppercase text-purple-700">Form Title</span>
                    <h3 className="text-xl font-bold text-slate-900 mt-0.5">{formConfig.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 max-w-2xl">{formConfig.description}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-purple-200/80 shrink-0">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">Form Status</span>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Ready & Accepting Submissions
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-purple-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-2 text-xs text-slate-600 truncate">
                    <span className="font-semibold text-slate-800">Public Link:</span>
                    <code className="bg-white px-2.5 py-1 rounded border border-purple-200 text-purple-900 font-mono text-xs truncate max-w-md">
                      {formConfig.responderUri}
                    </code>
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied Link!' : 'Copy Form URL'}</span>
                  </button>
                </div>
              </div>

              {/* Questions Overview */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Included Client Questions ({formConfig.fields.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {formConfig.fields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 flex items-start space-x-3"
                    >
                      <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 truncate">{field.title}</p>
                          {field.required && (
                            <span className="text-[10px] text-rose-500 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          Type: {field.type} {field.options ? `(${field.options.length} options)` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CLIENT INTAKE SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-900">
                  <p className="font-bold">Test the Google Form Client Intake</p>
                  <p className="mt-0.5 text-indigo-700">
                    Fill out this form to simulate a prospective client submitting details. It will immediately push to Step 2 (Google Sheets) and trigger Step 3 (Google Apps Script Welcome Email to the client with an admin alert to <strong>keilahnaicker@gmail.com</strong>).
                  </p>
                </div>
              </div>

              {submittedAlert && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center space-x-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Form submission successful! Record added to Google Sheet and welcome email sequence triggered!
                  </span>
                </div>
              )}

              <form onSubmit={handleSimulatorSubmit} className="space-y-4 bg-slate-50/70 p-6 rounded-2xl border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={simName}
                      onChange={(e) => setSimName(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. Alexandra Miller"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={simEmail}
                      onChange={(e) => setSimEmail(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="client@company.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={simPhone}
                      onChange={(e) => setSimPhone(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Company / Organization</label>
                    <input
                      type="text"
                      value={simCompany}
                      onChange={(e) => setSimCompany(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. Miller Brand Studio"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Service Interested In <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={simService}
                      onChange={(e) => setSimService(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Custom Software Development">Custom Software Development</option>
                      <option value="Strategic Advisory & Consulting">Strategic Advisory & Consulting</option>
                      <option value="Cloud Architecture & Integration">Cloud Architecture & Integration</option>
                      <option value="Automation & Workflow Optimization">Automation & Workflow Optimization</option>
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Project Budget Range</label>
                    <select
                      value={simBudget}
                      onChange={(e) => setSimBudget(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="< $2,500">&lt; $2,500</option>
                      <option value="$2,500 - $5,000">$2,500 - $5,000</option>
                      <option value="$5,000 - $15,000">$5,000 - $15,000</option>
                      <option value="$15,000 - $50,000">$15,000 - $50,000</option>
                      <option value="$50,000+">$50,000+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Project Goals & Notes</label>
                  <textarea
                    rows={3}
                    value={simNotes}
                    onChange={(e) => setSimNotes(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Describe project requirements..."
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-xl font-bold text-xs shadow-md transition-all active:scale-[0.99]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Client Intake Form (Trigger Pipeline)</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: SCHEMA & QUESTIONS */}
          {activeTab === 'fields' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  These fields match the columns that Google Sheets will capture.
                </p>
              </div>

              <div className="space-y-2">
                {formConfig.fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className="w-6 h-6 rounded bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{field.title}</p>
                        <p className="text-[11px] text-slate-500">{field.description || 'Standard field'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-700">
                        {field.type}
                      </span>
                      {field.required && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded">
                          Required
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Next: Google Sheets CRM Database receives each submission automatically.
          </div>
          <button
            id="btn-next-step2"
            onClick={onNextStep}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all"
          >
            <span>Proceed to Step 2: Google Sheets</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
