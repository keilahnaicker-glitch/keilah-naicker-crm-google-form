import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Send, 
  Tag, 
  DollarSign, 
  FileText,
  UserCheck
} from 'lucide-react';
import { ClientLead } from '../../types';

interface ClientDetailsModalProps {
  client: ClientLead | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: ClientLead['status']) => void;
  onSendFollowUp: (client: ClientLead, message: string) => void;
}

export const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({
  client,
  isOpen,
  onClose,
  onUpdateStatus,
  onSendFollowUp,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'email'>('details');
  const [followUpSubject, setFollowUpSubject] = useState('Following up on your inquiry');
  const [followUpBody, setFollowUpBody] = useState('');
  const [emailSentNotice, setEmailSentNotice] = useState(false);

  if (!isOpen || !client) return null;

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    onSendFollowUp(client, followUpBody);
    setEmailSentNotice(true);
    setTimeout(() => {
      setEmailSentNotice(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              {client.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
            </div>
            <div>
              <h3 className="font-bold text-base">{client.name}</h3>
              <p className="text-xs text-slate-400">{client.company} • {client.service}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 font-semibold text-xs border-b-2 transition-all ${
              activeTab === 'details'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Client Profile & History
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`py-3 px-4 font-semibold text-xs border-b-2 transition-all ${
              activeTab === 'email'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Direct Follow-Up Email
          </button>
        </div>

        {/* Tab 1: Profile & History */}
        {activeTab === 'details' && (
          <div className="p-6 space-y-5">
            {/* Status change bar */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700">Lead Status:</span>
              <select
                value={client.status}
                onChange={(e) => onUpdateStatus(client.id, e.target.value as any)}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="In Progress">In Progress</option>
                <option value="Qualified">Qualified</option>
                <option value="Converted">Converted (Won)</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" /> Email
                </span>
                <p className="font-semibold text-slate-900 select-all">{client.email}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" /> Phone
                </span>
                <p className="font-semibold text-slate-900">{client.phone || 'Not specified'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-slate-400" /> Budget Range
                </span>
                <p className="font-semibold text-slate-900">{client.budget || 'Not specified'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" /> Intake Date
                </span>
                <p className="font-semibold text-slate-900">{client.timestamp}</p>
              </div>
            </div>

            {/* Welcome Email Log */}
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="font-bold text-emerald-950">Automated Welcome Email</p>
                  <p className="text-[11px] text-emerald-700">
                    Dispatched at {client.welcomeEmailTimestamp || client.timestamp} via Google Apps Script trigger.
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-200/60 text-emerald-900">
                Delivered
              </span>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Client Inquiries & Project Notes</label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed min-h-[70px]">
                {client.notes || 'No extra notes provided during intake.'}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveTab('email')}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Direct Follow-Up Email</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Send Email */}
        {activeTab === 'email' && (
          <form onSubmit={handleSendEmail} className="p-6 space-y-4">
            {emailSentNotice ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Follow-up email dispatched to {client.email}!</span>
              </div>
            ) : null}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">To</label>
              <input
                type="text"
                disabled
                value={`${client.name} <${client.email}>`}
                className="w-full text-xs px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={followUpSubject}
                onChange={(e) => setFollowUpSubject(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Message</label>
              <textarea
                rows={4}
                required
                value={followUpBody}
                onChange={(e) => setFollowUpBody(e.target.value)}
                placeholder={`Hi ${client.name.split(' ')[0]},\n\nI reviewed your inquiry for ${client.service} and would love to arrange a call this week...`}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-bold text-xs shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
