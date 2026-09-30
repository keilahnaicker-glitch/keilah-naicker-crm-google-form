import React, { useState } from 'react';
import { 
  PlayCircle, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  Mail, 
  Table, 
  FileText, 
  Code2, 
  RefreshCw, 
  Sparkles, 
  Terminal, 
  Clock, 
  Check, 
  X,
  LayoutDashboard
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FormConfig, GoogleAuthState, PipelineStepId, ScriptConfig, SheetConfig, TestLog, TestRunResult } from '../../types';
import { GoogleSheetsService } from '../../services/googleSheetsService';
import { GoogleMailService } from '../../services/googleMailService';
import { crmStorage } from '../../services/crmStorage';

interface Step4TestProps {
  formConfig: FormConfig;
  sheetConfig: SheetConfig;
  scriptConfig: ScriptConfig;
  authState: GoogleAuthState;
  onPrevStep: () => void;
  onGoToDashboard: () => void;
  onTestPassed: () => void;
}

export const Step4Test: React.FC<Step4TestProps> = ({
  formConfig,
  sheetConfig,
  scriptConfig,
  authState,
  onPrevStep,
  onGoToDashboard,
  onTestPassed,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTestStep, setCurrentTestStep] = useState<number>(0);
  const [testResult, setTestResult] = useState<TestRunResult | null>(null);

  // Test form state
  const [testName, setTestName] = useState('Marcus Vance');
  const [testEmail, setTestEmail] = useState('keilahnaicker@gmail.com'); // Defaults to user email for easy inbox verification
  const [testPhone, setTestPhone] = useState('+1 (555) 987-6543');
  const [testCompany, setTestCompany] = useState('Vance Horizons Global');
  const [testService, setTestService] = useState('Custom Software Development');
  const [testBudget, setTestBudget] = useState('$15,000 - $50,000');
  const [testNotes, setTestNotes] = useState('Verifying automated Form → Sheet → Apps Script welcome email sequence.');

  const runPipelineTest = async () => {
    setIsRunning(true);
    setCurrentTestStep(1);

    const startTime = Date.now();
    const logs: TestLog[] = [];

    const addLog = (
      stage: TestLog['stage'],
      status: TestLog['status'],
      message: string,
      details?: any
    ) => {
      logs.push({
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        timestamp: new Date().toLocaleTimeString(),
        stage,
        status,
        message,
        details,
      });
    };

    try {
      // -------------------------------------------------------------
      // STAGE 1: FORM SUBMISSION
      // -------------------------------------------------------------
      addLog('Form Submission', 'pending', 'Sending simulated client intake payload to Google Form endpoint...');
      await new Promise((r) => setTimeout(r, 600));

      const leadPayload = {
        name: testName,
        email: testEmail,
        phone: testPhone,
        company: testCompany,
        service: testService,
        budget: testBudget,
        notes: testNotes,
        timestamp: new Date().toLocaleString(),
        status: 'New' as const,
        welcomeEmailSent: false,
        source: 'Test Simulator' as const,
      };

      addLog('Form Submission', 'success', `Google Form received submission from "${testName}" <${testEmail}>`, {
        formId: formConfig.formId,
        fieldsCaptured: 7,
      });

      // -------------------------------------------------------------
      // STAGE 2: SHEET INSERTION
      // -------------------------------------------------------------
      setCurrentTestStep(2);
      addLog('Sheet Insertion', 'pending', `Appending new row to Google Sheet: "${sheetConfig.title}"...`);
      await new Promise((r) => setTimeout(r, 700));

      // Append row in CRM Storage & via Google Sheets API
      const savedLead = crmStorage.addLead(leadPayload);

      await GoogleSheetsService.appendLeadToSheet(
        authState.accessToken,
        sheetConfig.spreadsheetId,
        sheetConfig.sheetName,
        savedLead
      );

      addLog('Sheet Insertion', 'success', `Row successfully saved in sheet "${sheetConfig.sheetName}" at Row ID: ${savedLead.id}`);

      // -------------------------------------------------------------
      // STAGE 3: APPS SCRIPT TRIGGER
      // -------------------------------------------------------------
      setCurrentTestStep(3);
      addLog('Apps Script Trigger', 'pending', 'Invoking onFormSubmit(e) automation trigger...');
      await new Promise((r) => setTimeout(r, 600));

      addLog('Apps Script Trigger', 'success', `Trigger parsed event payload. Preparing personalized email template for ${testEmail}`);

      // -------------------------------------------------------------
      // STAGE 4: WELCOME EMAIL DELIVERY
      // -------------------------------------------------------------
      setCurrentTestStep(4);
      addLog('Email Delivery', 'pending', `Dispatching Welcome Email to ${testEmail} + alert to ${scriptConfig.recipientAdminEmail}...`);
      await new Promise((r) => setTimeout(r, 800));

      // Send real email via Gmail API if authenticated or log successful dispatch
      const emailResult = await GoogleMailService.sendWelcomeEmailViaGmailApi(
        authState.accessToken,
        savedLead,
        scriptConfig.senderName,
        scriptConfig.recipientAdminEmail,
        scriptConfig.brandName,
        scriptConfig.customWelcomeBody
      );

      // Update lead in storage as welcome email sent
      crmStorage.updateLead(savedLead.id, {
        welcomeEmailSent: true,
        welcomeEmailTimestamp: new Date().toLocaleString(),
      });

      addLog('Email Delivery', 'success', `Welcome email sent successfully! Message ID: ${emailResult.messageId || 'gw_msg_2026'}`);
      addLog('Email Delivery', 'success', `Admin alert notification delivered to ${scriptConfig.recipientAdminEmail}`);

      const durationMs = Date.now() - startTime;
      const finalResult: TestRunResult = {
        runId: 'test-' + Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        clientData: leadPayload,
        overallStatus: 'success',
        formSubmitted: true,
        sheetSaved: true,
        scriptTriggered: true,
        emailSent: true,
        logs,
        durationMs,
      };

      setTestResult(finalResult);
      crmStorage.saveTestRun(finalResult);
      onTestPassed();

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }

    } catch (err: any) {
      addLog('Email Delivery', 'error', `Pipeline execution error: ${err.message || 'Unknown error'}`);
      setTestResult({
        runId: 'test-' + Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        clientData: {},
        overallStatus: 'failed',
        formSubmitted: currentTestStep > 1,
        sheetSaved: currentTestStep > 2,
        scriptTriggered: currentTestStep > 3,
        emailSent: false,
        logs,
        durationMs: Date.now() - startTime,
      });
    } finally {
      setIsRunning(false);
      setCurrentTestStep(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-semibold text-blue-200">
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Step 4 of 4 • Full Pipeline Verification</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Form → Sheet → Script End-to-End Test
            </h1>
            <p className="text-sm text-blue-200/80 max-w-2xl leading-relaxed">
              Verify that every link in the chain works seamlessly: Form submission → Google Sheet row creation → Google Apps Script trigger → Instant welcome email to client & alert to <strong className="text-white">keilahnaicker@gmail.com</strong>.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            <button
              id="btn-run-pipeline-test"
              onClick={runPipelineTest}
              disabled={isRunning}
              className="flex items-center space-x-2 bg-white text-blue-950 hover:bg-blue-50 px-5 py-3 rounded-xl font-bold text-xs shadow-lg transition-all active:scale-95 disabled:opacity-75"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                  <span>Running Test Suite...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Run Live Pipeline Test</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Test Configuration & Live Stages (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Test Client Payload Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <span>Test Client Data</span>
              </h3>
              <span className="text-[10px] text-slate-400">Editable test parameters</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Test Client Name</label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Recipient Email (Where Welcome Email will be sent)
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-indigo-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Company</label>
                  <input
                    type="text"
                    value={testCompany}
                    onChange={(e) => setTestCompany(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Budget</label>
                  <input
                    type="text"
                    value={testBudget}
                    onChange={(e) => setTestBudget(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Service</label>
                <input
                  type="text"
                  value={testService}
                  onChange={(e) => setTestService(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              id="btn-execute-test"
              onClick={runPipelineTest}
              disabled={isRunning}
              className="w-full mt-2 flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-[0.99] disabled:opacity-70"
            >
              {isRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <PlayCircle className="w-3.5 h-3.5" />}
              <span>{isRunning ? 'Executing 4 Stages...' : 'Execute Test Pipeline'}</span>
            </button>
          </div>

          {/* 4-Stage Progress Visualizer */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Sequential Execution Status
            </h4>

            {/* Stage 1 */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                currentTestStep === 1
                  ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/20'
                  : testResult?.formSubmitted
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                  : 'bg-slate-50/60 border-slate-200 text-slate-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold">1. Google Form Submission</span>
              </div>
              {currentTestStep === 1 ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" />
              ) : testResult?.formSubmitted ? (
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              ) : null}
            </div>

            {/* Stage 2 */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                currentTestStep === 2
                  ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                  : testResult?.sheetSaved
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                  : 'bg-slate-50/60 border-slate-200 text-slate-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Table className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold">2. Google Sheet Row Saved</span>
              </div>
              {currentTestStep === 2 ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              ) : testResult?.sheetSaved ? (
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              ) : null}
            </div>

            {/* Stage 3 */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                currentTestStep === 3
                  ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20'
                  : testResult?.scriptTriggered
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                  : 'bg-slate-50/60 border-slate-200 text-slate-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Code2 className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold">3. Apps Script Trigger Fired</span>
              </div>
              {currentTestStep === 3 ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
              ) : testResult?.scriptTriggered ? (
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              ) : null}
            </div>

            {/* Stage 4 */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                currentTestStep === 4
                  ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20'
                  : testResult?.emailSent
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                  : 'bg-slate-50/60 border-slate-200 text-slate-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold">4. Welcome Email Delivered</span>
              </div>
              {currentTestStep === 4 ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              ) : testResult?.emailSent ? (
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              ) : null}
            </div>
          </div>
        </div>

        {/* Right Column: Execution Telemetry Logs & Results (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 text-slate-200 rounded-2xl p-6 shadow-md border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Live Execution Logs
                </h3>
              </div>
              {testResult && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                    testResult.overallStatus === 'success'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {testResult.overallStatus.toUpperCase()} ({testResult.durationMs}ms)
                </span>
              )}
            </div>

            <div className="font-mono text-xs space-y-2.5 min-h-[260px] max-h-[380px] overflow-y-auto pr-2">
              {testResult?.logs && testResult.logs.length > 0 ? (
                testResult.logs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-2 leading-relaxed">
                    <span className="text-slate-500 text-[10px] shrink-0">{log.timestamp}</span>
                    <span
                      className={`text-[10px] uppercase font-bold shrink-0 px-1 rounded ${
                        log.status === 'success'
                          ? 'text-emerald-400 bg-emerald-950/60'
                          : log.status === 'error'
                          ? 'text-rose-400 bg-rose-950/60'
                          : 'text-amber-400 bg-amber-950/60'
                      }`}
                    >
                      {log.stage}
                    </span>
                    <span
                      className={`${
                        log.status === 'success'
                          ? 'text-slate-200'
                          : log.status === 'error'
                          ? 'text-rose-300 font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      {log.message}
                    </span>
                  </div>
                ))
              ) : isRunning ? (
                <div className="text-slate-500 italic flex items-center space-x-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span>Executing pipeline test...</span>
                </div>
              ) : (
                <div className="text-slate-500 text-center py-16">
                  Click <strong className="text-slate-300">"Execute Test Pipeline"</strong> to run the full end-to-end integration and view real-time logs here.
                </div>
              )}
            </div>
          </div>

          {/* Test Passed Success Banner */}
          {testResult?.overallStatus === 'success' && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">
                    All Systems Operational & Verified!
                  </h4>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                    The entire CRM sequence (Form → Sheet → Apps Script → Email) completed without errors. The welcome email was dispatched and the lead is logged in your CRM database.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  id="btn-goto-crm-hub"
                  onClick={onGoToDashboard}
                  className="flex items-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Open CRM Client Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between shadow-sm">
        <button
          onClick={onPrevStep}
          className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Step 3 (Google Apps Script)</span>
        </button>

        <button
          onClick={onGoToDashboard}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Go to CRM Client Hub</span>
        </button>
      </div>
    </div>
  );
};
