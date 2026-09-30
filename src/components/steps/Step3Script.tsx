import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  ExternalLink, 
  Mail, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Settings, 
  Sliders, 
  Bell, 
  CheckCircle,
  Clock,
  Laptop
} from 'lucide-react';
import { ScriptConfig } from '../../types';
import { generateAppsScriptCode } from '../../services/appsScriptGenerator';
import { crmStorage } from '../../services/crmStorage';

interface Step3ScriptProps {
  scriptConfig: ScriptConfig;
  onUpdateScriptConfig: (newConfig: ScriptConfig) => void;
  onPrevStep: () => void;
  onNextStep: () => void;
}

export const Step3Script: React.FC<Step3ScriptProps> = ({
  scriptConfig,
  onUpdateScriptConfig,
  onPrevStep,
  onNextStep,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'instructions' | 'emailPreview' | 'settings'>('code');

  const generatedCode = generateAppsScriptCode(scriptConfig);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleUpdateField = (field: keyof ScriptConfig, value: any) => {
    const updated = { ...scriptConfig, [field]: value };
    onUpdateScriptConfig(updated);
    crmStorage.saveScriptConfig(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-amber-900 via-orange-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-amber-500/20 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-semibold text-amber-200">
              <Code2 className="w-3.5 h-3.5" />
              <span>Step 3 of 4 • Welcome Email Automation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Google Apps Script Engine
            </h1>
            <p className="text-sm text-amber-200/80 max-w-2xl leading-relaxed">
              Automated trigger that executes the moment a client submits the Google Form. It parses the intake details, emails a personalized welcome message to the client, and sends an alert copy to <strong className="text-white underline decoration-amber-400">keilahnaicker@gmail.com</strong>.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            <button
              id="btn-copy-script"
              onClick={handleCopyCode}
              className="flex items-center space-x-2 bg-white text-amber-950 hover:bg-amber-50 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-amber-600" />}
              <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Apps Script Code'}</span>
            </button>
            <a
              id="link-open-appsscript"
              href="https://script.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 bg-amber-800/60 hover:bg-amber-800 border border-amber-400/30 text-white px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-colors"
            >
              <span>Apps Script Editor</span>
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
            onClick={() => setActiveTab('code')}
            className={`flex items-center space-x-2 py-3.5 px-4 font-semibold text-xs border-b-2 transition-all ${
              activeTab === 'code'
                ? 'border-amber-600 text-amber-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Generated Code.gs</span>
          </button>
          <button
            onClick={() => setActiveTab('emailPreview')}
            className={`flex items-center space-x-2 py-3.5 px-4 font-semibold text-xs border-b-2 transition-all ${
              activeTab === 'emailPreview'
                ? 'border-amber-600 text-amber-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Client Welcome Email Preview</span>
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`flex items-center space-x-2 py-3.5 px-4 font-semibold text-xs border-b-2 transition-all ${
              activeTab === 'instructions'
                ? 'border-amber-600 text-amber-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>1-Minute Trigger Setup Guide</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-2 py-3.5 px-4 font-semibold text-xs border-b-2 transition-all ${
              activeTab === 'settings'
                ? 'border-amber-600 text-amber-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Email & Trigger Settings</span>
          </button>
        </div>

        <div className="p-6">
          {/* TAB 1: CODE VIEWER */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <span className="font-bold text-slate-700">Code.gs</span>
                  <span>• Target:</span>
                  <span className="font-mono text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {scriptConfig.recipientAdminEmail}
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy All'}</span>
                </button>
              </div>

              {/* Code Box */}
              <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto text-slate-200 font-mono text-xs leading-relaxed max-h-[500px] shadow-inner border border-slate-800">
                <pre>
                  <code>{generatedCode}</code>
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: EMAIL PREVIEW */}
          {activeTab === 'emailPreview' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-amber-700" />
                  <span className="text-amber-900 font-medium">
                    This email is automatically formatted and sent to the client immediately upon submitting the Google Form.
                  </span>
                </div>
              </div>

              {/* Simulated Inbox / Email View */}
              <div className="bg-white border border-slate-300 rounded-2xl shadow-md overflow-hidden">
                {/* Email Header */}
                <div className="bg-slate-100/80 px-6 py-4 border-b border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="text-slate-800 font-bold text-sm">{scriptConfig.emailSubject}</div>
                    <span className="text-[11px] text-slate-400">Just now</span>
                  </div>
                  <div className="text-slate-600 flex items-center gap-1.5">
                    <span className="font-semibold">From:</span>
                    <span>{scriptConfig.senderName} &lt;{scriptConfig.recipientAdminEmail}&gt;</span>
                  </div>
                  <div className="text-slate-600 flex items-center gap-1.5">
                    <span className="font-semibold">To:</span>
                    <span className="text-indigo-600 font-medium">alexandra@millerdesigns.com</span>
                  </div>
                  <div className="text-slate-500 flex items-center gap-1.5 text-[11px]">
                    <span className="font-semibold">Bcc / Admin Alert:</span>
                    <span>{scriptConfig.recipientAdminEmail}</span>
                  </div>
                </div>

                {/* Email Body */}
                <div className="p-8 space-y-5 text-slate-800">
                  <div className="border-b-2 border-indigo-600 pb-3">
                    <h3 className="text-xl font-bold text-slate-900">{scriptConfig.brandName}</h3>
                    <p className="text-xs text-slate-500">Client Intake & Onboarding Confirmation</p>
                  </div>

                  <p className="text-sm font-medium">Hello <strong>Alexandra</strong>,</p>

                  <p className="text-xs leading-relaxed text-slate-600">
                    Thank you for contacting us! We have successfully received your inquiry through our client intake portal.
                  </p>

                  <div className="bg-slate-50 border-l-4 border-indigo-600 p-4 rounded-r-lg space-y-2 text-xs">
                    <p className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
                      Your Submission Summary
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-slate-600">
                      <div>
                        <span className="font-semibold text-slate-700">Service Focus:</span> Custom Software Development
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">Organization:</span> Miller Brand Studio
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">Budget Range:</span> $15,000 - $50,000
                      </div>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-600">
                    {scriptConfig.customWelcomeBody}
                  </p>

                  <div className="pt-6 border-t border-slate-200 text-xs text-slate-500 space-y-0.5">
                    <p className="font-bold text-slate-800">{scriptConfig.senderName}</p>
                    <p>{scriptConfig.brandName}</p>
                    <p className="text-indigo-600">{scriptConfig.recipientAdminEmail}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STEP BY STEP INSTRUCTIONS */}
          {activeTab === 'instructions' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                How to activate the automatic trigger in Google Workspace
              </h3>

              <div className="space-y-3">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Open Apps Script from your Google Sheet</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Open your CRM Google Spreadsheet, then click <strong>Extensions &gt; Apps Script</strong> in the top menu bar.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Paste the generated Code.gs</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Delete the default code in <code className="font-mono text-amber-700">Code.gs</code>, paste the code copied from this tab, and click <strong>Save (Ctrl+S)</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Add the OnFormSubmit Trigger</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      In the left sidebar of Apps Script, click the <strong>Triggers</strong> icon (alarm clock) &gt; <strong>+ Add Trigger</strong>:
                    </p>
                    <ul className="text-xs text-slate-600 mt-1.5 list-disc list-inside space-y-0.5 pl-2 font-medium">
                      <li>Function to run: <code className="font-mono text-indigo-600">onFormSubmit</code></li>
                      <li>Event source: <code className="font-mono text-indigo-600">From spreadsheet</code></li>
                      <li>Event type: <code className="font-mono text-indigo-600">On form submit</code></li>
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Save & Authorize</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Click <strong>Save</strong> and approve the Google permissions. From that moment onward, every client submission is emailed within 1 second!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admin Notification Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={scriptConfig.recipientAdminEmail}
                  onChange={(e) => handleUpdateField('recipientAdminEmail', e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sender Name
                  </label>
                  <input
                    type="text"
                    value={scriptConfig.senderName}
                    onChange={(e) => handleUpdateField('senderName', e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Brand / Company Name
                  </label>
                  <input
                    type="text"
                    value={scriptConfig.brandName}
                    onChange={(e) => handleUpdateField('brandName', e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Welcome Email Subject
                </label>
                <input
                  type="text"
                  value={scriptConfig.emailSubject}
                  onChange={(e) => handleUpdateField('emailSubject', e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Custom Welcome Message Text
                </label>
                <textarea
                  rows={3}
                  value={scriptConfig.customWelcomeBody}
                  onChange={(e) => handleUpdateField('customWelcomeBody', e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 space-y-2 border-t border-slate-200">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scriptConfig.includeAdminNotification}
                    onChange={(e) => handleUpdateField('includeAdminNotification', e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Send instant lead notification alert to {scriptConfig.recipientAdminEmail}</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scriptConfig.updateSheetStatus}
                    onChange={(e) => handleUpdateField('updateSheetStatus', e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Automatically mark Google Sheet row as 'Sent (Automated)' with timestamp</span>
                </label>
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
            <span>Back to Step 2 (Google Sheets)</span>
          </button>
          <button
            id="btn-next-step4"
            onClick={onNextStep}
            className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all"
          >
            <span>Proceed to Step 4: Run End-to-End Test</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
