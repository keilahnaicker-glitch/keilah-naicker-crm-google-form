/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PipelineStepper } from './components/PipelineStepper';
import { Step1Form } from './components/steps/Step1Form';
import { Step2Sheet } from './components/steps/Step2Sheet';
import { Step3Script } from './components/steps/Step3Script';
import { Step4Test } from './components/steps/Step4Test';
import { CrmDashboard } from './components/dashboard/CrmDashboard';
import { ClientLead, FormConfig, GoogleAuthState, PipelineStepId, ScriptConfig, SheetConfig } from './types';
import { crmStorage } from './services/crmStorage';
import { googleAuthService } from './services/googleAuth';
import { GoogleMailService } from './services/googleMailService';
import { GoogleSheetsService } from './services/googleSheetsService';

export default function App() {
  const [currentTab, setCurrentTab] = useState<PipelineStepId | 'dashboard'>('form');
  const [leads, setLeads] = useState<ClientLead[]>(() => crmStorage.getLeads());
  const [formConfig, setFormConfig] = useState<FormConfig>(() => crmStorage.getFormConfig());
  const [sheetConfig, setSheetConfig] = useState<SheetConfig>(() => crmStorage.getSheetConfig());
  const [scriptConfig, setScriptConfig] = useState<ScriptConfig>(() => crmStorage.getScriptConfig());
  const [authState, setAuthState] = useState<GoogleAuthState>(() => googleAuthService.getState());
  const [testPassed, setTestPassed] = useState<boolean>(() => {
    const runs = crmStorage.getTestRuns();
    return runs.some((r) => r.overallStatus === 'success');
  });

  useEffect(() => {
    // Subscribe to Google Auth
    const unsubAuth = googleAuthService.subscribe((state) => {
      setAuthState(state);
    });

    // Listen for CRM storage events
    const handleLeadsUpdated = () => setLeads(crmStorage.getLeads());
    const handleFormUpdated = () => setFormConfig(crmStorage.getFormConfig());
    const handleSheetUpdated = () => setSheetConfig(crmStorage.getSheetConfig());
    const handleScriptUpdated = () => setScriptConfig(crmStorage.getScriptConfig());
    const handleTestsUpdated = () => {
      const runs = crmStorage.getTestRuns();
      setTestPassed(runs.some((r) => r.overallStatus === 'success'));
    };

    window.addEventListener('crm_leads_updated', handleLeadsUpdated);
    window.addEventListener('crm_form_updated', handleFormUpdated);
    window.addEventListener('crm_sheet_updated', handleSheetUpdated);
    window.addEventListener('crm_script_updated', handleScriptUpdated);
    window.addEventListener('crm_tests_updated', handleTestsUpdated);

    return () => {
      unsubAuth();
      window.removeEventListener('crm_leads_updated', handleLeadsUpdated);
      window.removeEventListener('crm_form_updated', handleFormUpdated);
      window.removeEventListener('crm_sheet_updated', handleSheetUpdated);
      window.removeEventListener('crm_script_updated', handleScriptUpdated);
      window.removeEventListener('crm_tests_updated', handleTestsUpdated);
    };
  }, []);

  const handleConnectGoogle = async () => {
    try {
      await googleAuthService.requestToken();
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset all CRM configurations and test data to default?')) {
      crmStorage.resetAllDefaults();
      setLeads(crmStorage.getLeads());
      setFormConfig(crmStorage.getFormConfig());
      setSheetConfig(crmStorage.getSheetConfig());
      setScriptConfig(crmStorage.getScriptConfig());
      setTestPassed(false);
      setCurrentTab('form');
    }
  };

  // Intake Form simulator submission handler (Step 1)
  const handleSimulateIntakeSubmit = async (formData: Record<string, string>) => {
    const newLead = crmStorage.addLead({
      timestamp: new Date().toLocaleString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone || '',
      company: formData.company || '',
      service: formData.service || 'General Inquiry',
      budget: formData.budget || '< $2,500',
      notes: formData.notes || '',
      status: 'New',
      welcomeEmailSent: true,
      welcomeEmailTimestamp: new Date().toLocaleString(),
      source: 'Google Form',
    });

    // Append to sheet
    await GoogleSheetsService.appendLeadToSheet(
      authState.accessToken,
      sheetConfig.spreadsheetId,
      sheetConfig.sheetName,
      newLead
    );

    // Send Welcome Email
    await GoogleMailService.sendWelcomeEmailViaGmailApi(
      authState.accessToken,
      newLead,
      scriptConfig.senderName,
      scriptConfig.recipientAdminEmail,
      scriptConfig.brandName,
      scriptConfig.customWelcomeBody
    );
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header Bar */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        authState={authState}
        onConnectGoogle={handleConnectGoogle}
        onResetDemo={handleResetDemo}
      />

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Top Pipeline Stepper shown when in Step-by-Step wizard mode */}
        {currentTab !== 'dashboard' && (
          <PipelineStepper
            currentStep={currentTab}
            onSelectStep={(step) => setCurrentTab(step)}
            formConfigured={formConfig.isCreated}
            sheetConfigured={sheetConfig.isCreated}
            scriptConfigured={true}
            testPassed={testPassed}
          />
        )}

        {/* Dynamic Views */}
        {currentTab === 'form' && (
          <Step1Form
            formConfig={formConfig}
            onUpdateFormConfig={setFormConfig}
            authState={authState}
            onNextStep={() => setCurrentTab('sheet')}
            onSimulateIntakeSubmit={handleSimulateIntakeSubmit}
          />
        )}

        {currentTab === 'sheet' && (
          <Step2Sheet
            sheetConfig={sheetConfig}
            onUpdateSheetConfig={setSheetConfig}
            leads={leads}
            authState={authState}
            onPrevStep={() => setCurrentTab('form')}
            onNextStep={() => setCurrentTab('script')}
          />
        )}

        {currentTab === 'script' && (
          <Step3Script
            scriptConfig={scriptConfig}
            onUpdateScriptConfig={setScriptConfig}
            onPrevStep={() => setCurrentTab('sheet')}
            onNextStep={() => setCurrentTab('test')}
          />
        )}

        {currentTab === 'test' && (
          <Step4Test
            formConfig={formConfig}
            sheetConfig={sheetConfig}
            scriptConfig={scriptConfig}
            authState={authState}
            onPrevStep={() => setCurrentTab('script')}
            onGoToDashboard={() => setCurrentTab('dashboard')}
            onTestPassed={() => setTestPassed(true)}
          />
        )}

        {currentTab === 'dashboard' && (
          <CrmDashboard
            leads={leads}
            onAddLead={(lead) => crmStorage.addLead(lead)}
            onUpdateLead={(id, updates) => crmStorage.updateLead(id, updates)}
            onDeleteLead={(id) => crmStorage.deleteLead(id)}
            formConfig={formConfig}
            sheetConfig={sheetConfig}
            scriptConfig={scriptConfig}
            authState={authState}
            onSelectPipelineStep={(step) => setCurrentTab(step)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white/70 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Google Workspace CRM Pipeline • Form → Sheet → Script → Test
          </p>
          <p className="text-slate-400">
            Admin Recipient: <span className="font-mono text-slate-600">keilahnaicker@gmail.com</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
