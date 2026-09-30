import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  ExternalLink, 
  Table, 
  FileText, 
  Code2, 
  CheckCircle2, 
  Clock, 
  MoreVertical, 
  Mail, 
  Phone, 
  TrendingUp, 
  Trash2, 
  Eye, 
  Check, 
  PlayCircle,
  Sparkles
} from 'lucide-react';
import { ClientLead, FormConfig, GoogleAuthState, PipelineStepId, ScriptConfig, SheetConfig } from '../../types';
import { NewClientModal } from '../modals/NewClientModal';
import { ClientDetailsModal } from '../modals/ClientDetailsModal';
import { GoogleMailService } from '../../services/googleMailService';
import { GoogleSheetsService } from '../../services/googleSheetsService';
import { crmStorage } from '../../services/crmStorage';

interface CrmDashboardProps {
  leads: ClientLead[];
  onAddLead: (lead: Omit<ClientLead, 'id'>) => void;
  onUpdateLead: (id: string, updates: Partial<ClientLead>) => void;
  onDeleteLead: (id: string) => void;
  formConfig: FormConfig;
  sheetConfig: SheetConfig;
  scriptConfig: ScriptConfig;
  authState: GoogleAuthState;
  onSelectPipelineStep: (step: PipelineStepId) => void;
}

export const CrmDashboard: React.FC<CrmDashboardProps> = ({
  leads,
  onAddLead,
  onUpdateLead,
  onDeleteLead,
  formConfig,
  sheetConfig,
  scriptConfig,
  authState,
  onSelectPipelineStep,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isNewClientOpen, setIsNewClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientLead | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Statistics
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === 'New').length;
  const inProgressLeads = leads.filter((l) => l.status === 'In Progress' || l.status === 'Contacted').length;
  const convertedLeads = leads.filter((l) => l.status === 'Converted').length;
  const emailSentCount = leads.filter((l) => l.welcomeEmailSent).length;
  const autoReplyRate = totalLeads > 0 ? Math.round((emailSentCount / totalLeads) * 100) : 100;

  // Filtered Leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.service.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenClientDetails = (client: ClientLead) => {
    setSelectedClient(client);
    setIsDetailsOpen(true);
  };

  const handleSendFollowUp = async (client: ClientLead, message: string) => {
    await GoogleMailService.sendWelcomeEmailViaGmailApi(
      authState.accessToken,
      client,
      scriptConfig.senderName,
      scriptConfig.recipientAdminEmail,
      scriptConfig.brandName,
      message
    );
    onUpdateLead(client.id, { status: 'Contacted' });
  };

  const handleCreateNewClient = async (leadData: Omit<ClientLead, 'id'>) => {
    const saved = crmStorage.addLead(leadData);

    // Append to sheet
    await GoogleSheetsService.appendLeadToSheet(
      authState.accessToken,
      sheetConfig.spreadsheetId,
      sheetConfig.sheetName,
      saved
    );

    // Send welcome email
    await GoogleMailService.sendWelcomeEmailViaGmailApi(
      authState.accessToken,
      saved,
      scriptConfig.senderName,
      scriptConfig.recipientAdminEmail,
      scriptConfig.brandName,
      scriptConfig.customWelcomeBody
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Fast Actions */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Connected Google Workspace CRM</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Client Relationship Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            Real-time management for leads captured via Google Forms, synchronized to Google Sheets, and answered via Google Apps Script.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 items-center">
          <button
            id="btn-quick-add-client"
            onClick={() => setIsNewClientOpen(true)}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Client Lead</span>
          </button>

          <button
            onClick={() => onSelectPipelineStep('test')}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-colors"
          >
            <PlayCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>Test Pipeline</span>
          </button>
        </div>
      </div>

      {/* Metric Cards (5 KPI cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Leads */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Total Leads</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{totalLeads}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Logged in Google Sheets</div>
        </div>

        {/* New Leads */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-600 uppercase">New Inquiries</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600 mt-2">{newLeads}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Awaiting initial call</div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-600 uppercase">In Progress</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{inProgressLeads}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Discussions ongoing</div>
        </div>

        {/* Converted */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 uppercase">Converted (Won)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{convertedLeads}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Active contracts</div>
        </div>

        {/* Email Auto-Reply Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-600 uppercase">Auto-Welcome Rate</span>
            <Mail className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-600 mt-2">{autoReplyRate}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{emailSentCount} emails delivered</div>
        </div>
      </div>

      {/* Connected Tools Quick Link Bar */}
      <div className="bg-slate-100/80 rounded-xl p-3 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-slate-700 font-semibold">
          <span className="text-slate-500">Connected Workspace Resources:</span>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={formConfig.responderUri}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 bg-white border border-purple-200 text-purple-800 hover:bg-purple-50 px-2.5 py-1 rounded-lg font-medium transition-colors shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-purple-600" />
            <span>Google Form</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <a
            href={sheetConfig.spreadsheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 px-2.5 py-1 rounded-lg font-medium transition-colors shadow-2xs"
          >
            <Table className="w-3.5 h-3.5 text-emerald-600" />
            <span>Google Sheet</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <a
            href="https://script.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 bg-white border border-amber-200 text-amber-800 hover:bg-amber-50 px-2.5 py-1 rounded-lg font-medium transition-colors shadow-2xs"
          >
            <Code2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Apps Script</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Main Leads Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search leads by name, email, company, service..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Statuses ({leads.length})</option>
              <option value="New">New ({leads.filter((l) => l.status === 'New').length})</option>
              <option value="Contacted">Contacted ({leads.filter((l) => l.status === 'Contacted').length})</option>
              <option value="In Progress">In Progress ({leads.filter((l) => l.status === 'In Progress').length})</option>
              <option value="Qualified">Qualified ({leads.filter((l) => l.status === 'Qualified').length})</option>
              <option value="Converted">Converted ({leads.filter((l) => l.status === 'Converted').length})</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Client Contact</th>
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Service & Budget</th>
                <th className="py-3 px-4">Lead Status</th>
                <th className="py-3 px-4 text-center">Welcome Email</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Client Name & Email */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-xs">{lead.name}</div>
                      <div className="text-[11px] text-indigo-600 font-medium">{lead.email}</div>
                      {lead.phone && <div className="text-[10px] text-slate-400">{lead.phone}</div>}
                    </td>

                    {/* Company */}
                    <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">
                      {lead.company || '—'}
                    </td>

                    {/* Service & Budget */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 text-xs">{lead.service}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{lead.budget}</div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3 px-4">
                      <select
                        value={lead.status}
                        onChange={(e) => onUpdateLead(lead.id, { status: e.target.value as any })}
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
                          lead.status === 'New'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : lead.status === 'Contacted'
                            ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                            : lead.status === 'In Progress'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : lead.status === 'Qualified'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : lead.status === 'Converted'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="New">● New</option>
                        <option value="Contacted">● Contacted</option>
                        <option value="In Progress">● In Progress</option>
                        <option value="Qualified">● Qualified</option>
                        <option value="Converted">● Converted</option>
                        <option value="Lost">● Lost</option>
                      </select>
                    </td>

                    {/* Welcome Email Sent */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {lead.welcomeEmailSent ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                          <span>Sent</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px]">
                          Pending
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap font-mono">
                      {lead.timestamp.split(' ')[0]}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenClientDetails(lead)}
                          title="View Profile & Inquiries"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteLead(lead.id)}
                          title="Delete Lead"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No leads matching "{searchTerm}" were found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <NewClientModal
        isOpen={isNewClientOpen}
        onClose={() => setIsNewClientOpen(false)}
        onSubmit={handleCreateNewClient}
      />

      <ClientDetailsModal
        client={selectedClient}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onUpdateStatus={(id, status) => {
          onUpdateLead(id, { status });
          if (selectedClient && selectedClient.id === id) {
            setSelectedClient({ ...selectedClient, status });
          }
        }}
        onSendFollowUp={handleSendFollowUp}
      />
    </div>
  );
};
