export interface ClientLead {
  id: string;
  timestamp: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  budget: string;
  notes: string;
  status: 'New' | 'Contacted' | 'In Progress' | 'Qualified' | 'Converted' | 'Lost';
  welcomeEmailSent: boolean;
  welcomeEmailTimestamp?: string;
  source: 'Google Form' | 'Direct Entry' | 'Test Simulator';
}

export interface FormField {
  id: string;
  title: string;
  type: 'TEXT' | 'PARAGRAPH' | 'CHOICE' | 'DROPDOWN';
  required: boolean;
  options?: string[];
  description?: string;
}

export interface FormConfig {
  formId: string;
  title: string;
  description: string;
  responderUri: string;
  editUrl: string;
  isCreated: boolean;
  fields: FormField[];
  connectedAt?: string;
}

export interface SheetConfig {
  spreadsheetId: string;
  title: string;
  spreadsheetUrl: string;
  sheetName: string;
  isCreated: boolean;
  columns: string[];
  connectedAt?: string;
}

export interface ScriptConfig {
  scriptName: string;
  recipientAdminEmail: string;
  senderName: string;
  emailSubject: string;
  brandName: string;
  includeAdminNotification: boolean;
  updateSheetStatus: boolean;
  customWelcomeBody?: string;
}

export type PipelineStepId = 'form' | 'sheet' | 'script' | 'test' | 'dashboard';

export interface PipelineStep {
  id: PipelineStepId;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
  isLocked: boolean;
}

export interface TestLog {
  id: string;
  timestamp: string;
  stage: 'Form Submission' | 'Sheet Insertion' | 'Apps Script Trigger' | 'Email Delivery';
  status: 'pending' | 'success' | 'warning' | 'error';
  message: string;
  details?: Record<string, unknown> | string;
}

export interface TestRunResult {
  runId: string;
  timestamp: string;
  clientData: Partial<ClientLead>;
  overallStatus: 'running' | 'success' | 'failed';
  formSubmitted: boolean;
  sheetSaved: boolean;
  scriptTriggered: boolean;
  emailSent: boolean;
  logs: TestLog[];
  durationMs: number;
}

export interface GoogleAuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  userEmail: string | null;
  userName: string | null;
  userPicture: string | null;
  expiresAt: number | null;
  error?: string | null;
}
