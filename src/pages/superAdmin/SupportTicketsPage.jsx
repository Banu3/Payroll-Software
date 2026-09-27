import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '../../components/ui/Modal';
import {
  HelpCircle,
  MessageSquare,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  Search,
  Send,
  UserCheck,
  ChevronRight,
  LifeBuoy
} from 'lucide-react';

const MOCK_TICKETS = [
  { id: 'TICK-801', company: 'Apex Global Enterprises', subject: 'Tax calculation discrepancy in September run', priority: 'HIGH', status: 'OPEN', date: '2026-09-27 10:15 AM', requester: 'John Davis (HR Lead)', slaHours: 2, messages: [{ sender: 'John Davis', text: 'Hi Team, tax deductions for 5 employees in SG region appear 2% lower than expected. Please audit.' }] },
  { id: 'TICK-802', company: 'Acme Software Solutions', subject: 'Requesting SSO Integration with Okta', priority: 'MEDIUM', status: 'IN_PROGRESS', date: '2026-09-26 04:30 PM', requester: 'Sarah Jenkins (IT Admin)', slaHours: 12, messages: [{ sender: 'Sarah Jenkins', text: 'We want to enable SAML 2.0 Okta SSO for our 240 staff members.' }] },
  { id: 'TICK-803', company: 'Vanguard Financial', subject: 'Bulk Employee Import CSV Format Guidance', priority: 'LOW', status: 'RESOLVED', date: '2026-09-25 11:00 AM', requester: 'Michael Chang', slaHours: 0, messages: [{ sender: 'Michael Chang', text: 'Where can I find the updated CSV headers format?' }, { sender: 'Super Admin', text: 'Hi Michael, you can download the sample template directly under HR > Bulk Import page.' }] },
  { id: 'TICK-804', company: 'TechFlow Labs', subject: 'Unable to approve salary structure for DevOps team', priority: 'CRITICAL', status: 'OPEN', date: '2026-09-27 02:45 PM', requester: 'Evelyn Reed', slaHours: 1, messages: [{ sender: 'Evelyn Reed', text: 'Approval button throws a permissions error when saving.' }] },
];

export const SupportTicketsPage = () => {
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedTicket) return;

    const updated = tickets.map((t) => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: 'IN_PROGRESS',
          messages: [...t.messages, { sender: 'Super Admin', text: replyText }],
        };
      }
      return t;
    });

    setTickets(updated);
    setSelectedTicket({
      ...selectedTicket,
      status: 'IN_PROGRESS',
      messages: [...selectedTicket.messages, { sender: 'Super Admin', text: replyText }],
    });
    setReplyText('');
  };

  const handleResolve = (ticketId) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: 'RESOLVED' } : t))
    );
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket((prev) => ({ ...prev, status: 'RESOLVED' }));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#111827]">
      {/* HEADER TOP BANNER */}
      <div className="bg-white border border-[#CBD5E1] rounded-xl p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F766E]">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#111827] tracking-tight flex items-center gap-2">
                Support & Tenant Tickets
              </h1>
              <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                Tenant support requests, SLA escalation tracking, and administrative ticket resolution.
              </p>
            </div>
          </div>
        </div>
        <Badge variant="purple" className="self-start sm:self-center px-3 py-1 text-xs">
          HELP DESK HQ
        </Badge>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* KPI 1: Total Tickets */}
        <div className="bg-white border border-[#D1D5DB] rounded-xl p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-[#111827] tracking-tight">{tickets.length}</div>
            <div className="text-xs font-bold text-[#374151] uppercase tracking-wider mt-1">Total Tickets</div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-[#0F766E]">
            <HelpCircle className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2: Open Tickets */}
        <div className="bg-white border border-[#D1D5DB] rounded-xl p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-[#B45309] tracking-tight">
              {tickets.filter((t) => t.status === 'OPEN').length}
            </div>
            <div className="text-xs font-bold text-[#B45309] uppercase tracking-wider mt-1">Open Tickets</div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#FFFBEB] border border-[#FCD34D] text-[#B45309]">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: In Progress */}
        <div className="bg-white border border-[#D1D5DB] rounded-xl p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-[#2563EB] tracking-tight">
              {tickets.filter((t) => t.status === 'IN_PROGRESS').length}
            </div>
            <div className="text-xs font-bold text-[#2563EB] uppercase tracking-wider mt-1">In Progress</div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#EFF6FF] border border-[#93C5FD] text-[#2563EB]">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Resolved */}
        <div className="bg-white border border-[#D1D5DB] rounded-xl p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-[#15803D] tracking-tight">
              {tickets.filter((t) => t.status === 'RESOLVED').length}
            </div>
            <div className="text-xs font-bold text-[#15803D] uppercase tracking-wider mt-1">Resolved</div>
          </div>
          <div className="p-2.5 rounded-lg bg-[#F0FDF4] border border-[#86EFAC] text-[#15803D]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* FILTER BAR CARD */}
      <div className="bg-white border border-[#D1D5DB] rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-[#374151] font-semibold">
            <div className="flex items-center gap-1.5 text-[#0F766E] font-bold">
              <Filter className="w-4 h-4" />
              <span>Status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-[#CBD5E1] rounded-lg px-3 py-1.5 text-xs text-[#111827] font-semibold focus:outline-none focus:border-[#0F766E] cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            <span className="ml-2 font-bold text-[#374151]">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-white border border-[#CBD5E1] rounded-lg px-3 py-1.5 text-xs text-[#111827] font-semibold focus:outline-none focus:border-[#0F766E] cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="text-xs text-[#6B7280] font-mono">
            Showing <strong className="text-[#111827]">{filteredTickets.length}</strong> of {tickets.length} tickets
          </div>
        </div>
      </div>

      {/* TICKET DATA TABLE */}
      <div className="bg-white border border-[#D1D5DB] rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#CBD5E1] text-[#374151] font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Ticket ID</th>
                <th className="p-4">Tenant Company</th>
                <th className="p-4">Subject & Requester</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-[#F8FAFC] transition-colors border-b border-[#E5E7EB] last:border-b-0">
                  <td className="p-4 font-mono font-bold text-[#0F766E]">{ticket.id}</td>
                  <td className="p-4 font-bold text-[#111827]">{ticket.company}</td>
                  <td className="p-4">
                    <div className="font-bold text-[#111827]">{ticket.subject}</div>
                    <div className="text-[11px] text-[#6B7280] mt-0.5">{ticket.requester}</div>
                  </td>
                  <td className="p-4">
                    {ticket.priority === 'CRITICAL' && <Badge variant="danger">CRITICAL</Badge>}
                    {ticket.priority === 'HIGH' && <Badge variant="warning">HIGH</Badge>}
                    {ticket.priority === 'MEDIUM' && <Badge variant="info">MEDIUM</Badge>}
                    {ticket.priority === 'LOW' && <Badge variant="default">LOW</Badge>}
                  </td>
                  <td className="p-4">
                    {ticket.status === 'OPEN' && <Badge variant="warning">Open</Badge>}
                    {ticket.status === 'IN_PROGRESS' && <Badge variant="info">In Progress</Badge>}
                    {ticket.status === 'RESOLVED' && <Badge variant="success">Resolved</Badge>}
                  </td>
                  <td className="p-4 text-[#6B7280] font-mono">{ticket.date}</td>
                  <td className="p-4 text-right">
                    <Button variant="outline" size="sm" icon={MessageSquare} onClick={() => setSelectedTicket(ticket)}>
                      View Ticket
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TICKET DETAILS MODAL */}
      {selectedTicket && (
        <Modal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} size="lg">
          <ModalHeader
            title={`[${selectedTicket.id}] ${selectedTicket.subject}`}
            description={`Requested by ${selectedTicket.requester} (${selectedTicket.company})`}
          />
          <ModalBody className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg text-xs">
              <span className="text-[#374151] font-medium">Status: <strong className="text-[#111827]">{selectedTicket.status}</strong></span>
              <span className="text-[#374151] font-medium">Priority: <strong className="text-[#111827]">{selectedTicket.priority}</strong></span>
              {selectedTicket.status !== 'RESOLVED' && (
                <Button variant="ghost" size="sm" onClick={() => handleResolve(selectedTicket.id)}>
                  Mark as Resolved
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {selectedTicket.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-lg text-xs space-y-1 border ${
                    msg.sender === 'Super Admin'
                      ? 'bg-[#E6F4F1] border-[#93C5FD] text-[#0F766E] ml-6'
                      : 'bg-white border-[#E5E7EB] text-[#111827] mr-6 shadow-2xs'
                  }`}
                >
                  <div className="font-bold text-[11px] text-[#374151]">{msg.sender}</div>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>

            {selectedTicket.status !== 'RESOLVED' && (
              <div className="pt-3 border-t border-[#E5E7EB] space-y-2">
                <textarea
                  rows={3}
                  placeholder="Type your official Super Admin response..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-3 bg-white border border-[#CBD5E1] rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#0F766E]"
                />
                <div className="flex justify-end">
                  <Button variant="primary" size="sm" icon={Send} onClick={handleSendReply}>
                    Send Reply
                  </Button>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" size="sm" onClick={() => setSelectedTicket(null)}>
              Close
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
};

export default SupportTicketsPage;
