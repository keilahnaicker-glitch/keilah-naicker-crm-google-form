import { ClientLead, FormConfig, PipelineStepId, ScriptConfig, SheetConfig, TestRunResult } from '../types';
import { DEFAULT_FORM_CONFIG } from './googleFormsService';
import { DEFAULT_SHEET_CONFIG } from './googleSheetsService';
import { DEFAULT_SCRIPT_CONFIG } from './appsScriptGenerator';

const CRM_LEADS_KEY = 'gw_crm_leads_data';
const CRM_FORM_KEY = 'gw_crm_form_config';
const CRM_SHEET_KEY = 'gw_crm_sheet_config';
const CRM_SCRIPT_KEY = 'gw_crm_script_config';
const CRM_TESTS_KEY = 'gw_crm_test_runs';

const INITIAL_DEMO_LEADS: ClientLead[] = [
  {
    id: 'lead-1',
    timestamp: '2026-08-19 09:15 AM',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@acmecorp.com',
    phone: '+1 (555) 234-5678',
    company: 'Acme Cloud Dynamics',
    service: 'Custom Software Development',
    budget: '$15,000 - $50,000',
    notes: 'Looking to migrate legacy client onboarding into automated Google Workspace integrations.',
    status: 'In Progress',
    welcomeEmailSent: true,
    welcomeEmailTimestamp: '2026-08-19 09:15 AM',
    source: 'Google Form',
  },
  {
    id: 'lead-2',
    timestamp: '2026-08-19 11:30 AM',
    name: 'David Thorne',
    email: 'david@thorneventures.io',
    phone: '+1 (555) 876-5432',
    company: 'Thorne Capital Ventures',
    service: 'Strategic Advisory & Consulting',
    budget: '$5,000 - $15,000',
    notes: 'Need automated intake workflow for prospective angel investment pitches.',
    status: 'New',
    welcomeEmailSent: true,
    welcomeEmailTimestamp: '2026-08-19 11:30 AM',
    source: 'Google Form',
  },
  {
    id: 'lead-3',
    timestamp: '2026-08-18 04:45 PM',
    name: 'Elena Rostova',
    email: 'elena@novadesign.studio',
    phone: '+1 (555) 349-1122',
    company: 'Nova Design Studio',
    service: 'Automation & Workflow Optimization',
    budget: '$2,500 - $5,000',
    notes: 'Connect our client briefs directly with Google Drive folders and send email receipts.',
    status: 'Qualified',
    welcomeEmailSent: true,
    welcomeEmailTimestamp: '2026-08-18 04:45 PM',
    source: 'Direct Entry',
  },
];

export class CrmStorage {
  private static instance: CrmStorage;

  private constructor() {}

  public static getInstance(): CrmStorage {
    if (!CrmStorage.instance) {
      CrmStorage.instance = new CrmStorage();
    }
    return CrmStorage.instance;
  }

  // Leads Management
  public getLeads(): ClientLead[] {
    try {
      const raw = localStorage.getItem(CRM_LEADS_KEY);
      if (!raw) {
        this.saveLeads(INITIAL_DEMO_LEADS);
        return INITIAL_DEMO_LEADS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_DEMO_LEADS;
    }
  }

  public saveLeads(leads: ClientLead[]): void {
    localStorage.setItem(CRM_LEADS_KEY, JSON.stringify(leads));
    window.dispatchEvent(new CustomEvent('crm_leads_updated'));
  }

  public addLead(lead: Omit<ClientLead, 'id'>): ClientLead {
    const leads = this.getLeads();
    const newLead: ClientLead = {
      ...lead,
      id: 'lead-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    };
    leads.unshift(newLead);
    this.saveLeads(leads);
    return newLead;
  }

  public updateLead(id: string, updates: Partial<ClientLead>): ClientLead | null {
    const leads = this.getLeads();
    const index = leads.findIndex((l) => l.id === id);
    if (index === -1) return null;

    leads[index] = { ...leads[index], ...updates };
    this.saveLeads(leads);
    return leads[index];
  }

  public deleteLead(id: string): void {
    const leads = this.getLeads().filter((l) => l.id !== id);
    this.saveLeads(leads);
  }

  // Form Config
  public getFormConfig(): FormConfig {
    try {
      const raw = localStorage.getItem(CRM_FORM_KEY);
      if (!raw) {
        this.saveFormConfig(DEFAULT_FORM_CONFIG);
        return DEFAULT_FORM_CONFIG;
      }
      return JSON.parse(raw);
    } catch {
      return DEFAULT_FORM_CONFIG;
    }
  }

  public saveFormConfig(config: FormConfig): void {
    localStorage.setItem(CRM_FORM_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('crm_form_updated'));
  }

  // Sheet Config
  public getSheetConfig(): SheetConfig {
    try {
      const raw = localStorage.getItem(CRM_SHEET_KEY);
      if (!raw) {
        this.saveSheetConfig(DEFAULT_SHEET_CONFIG);
        return DEFAULT_SHEET_CONFIG;
      }
      return JSON.parse(raw);
    } catch {
      return DEFAULT_SHEET_CONFIG;
    }
  }

  public saveSheetConfig(config: SheetConfig): void {
    localStorage.setItem(CRM_SHEET_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('crm_sheet_updated'));
  }

  // Script Config
  public getScriptConfig(): ScriptConfig {
    try {
      const raw = localStorage.getItem(CRM_SCRIPT_KEY);
      if (!raw) {
        this.saveScriptConfig(DEFAULT_SCRIPT_CONFIG);
        return DEFAULT_SCRIPT_CONFIG;
      }
      return JSON.parse(raw);
    } catch {
      return DEFAULT_SCRIPT_CONFIG;
    }
  }

  public saveScriptConfig(config: ScriptConfig): void {
    localStorage.setItem(CRM_SCRIPT_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('crm_script_updated'));
  }

  // Test Runs
  public getTestRuns(): TestRunResult[] {
    try {
      const raw = localStorage.getItem(CRM_TESTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public saveTestRun(run: TestRunResult): void {
    const runs = this.getTestRuns();
    runs.unshift(run);
    localStorage.setItem(CRM_TESTS_KEY, JSON.stringify(runs.slice(0, 20)));
    window.dispatchEvent(new CustomEvent('crm_tests_updated'));
  }

  public resetAllDefaults(): void {
    localStorage.removeItem(CRM_LEADS_KEY);
    localStorage.removeItem(CRM_FORM_KEY);
    localStorage.removeItem(CRM_SHEET_KEY);
    localStorage.removeItem(CRM_SCRIPT_KEY);
    localStorage.removeItem(CRM_TESTS_KEY);
    window.dispatchEvent(new CustomEvent('crm_leads_updated'));
    window.dispatchEvent(new CustomEvent('crm_form_updated'));
    window.dispatchEvent(new CustomEvent('crm_sheet_updated'));
    window.dispatchEvent(new CustomEvent('crm_script_updated'));
    window.dispatchEvent(new CustomEvent('crm_tests_updated'));
  }
}

export const crmStorage = CrmStorage.getInstance();
