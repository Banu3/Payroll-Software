import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { FileCheck, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../../services/api';

export const HRRequestsPage = () => {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [requests, setRequests] = useState([
    { id: 'req-1', employee: 'Eleanor Sterling', request_type: 'Bank Details Update', details: 'HDFC Account change request', amount: '₹1,20,000 / mo', date: '2026-09-28', current_step: 'Step 2: HR Admin Sign-off', status: 'PENDING' },
    { id: 'req-2', employee: 'David Miller', request_type: 'Reimbursement Claim', details: 'Travel & Client Dinner', amount: '₹4,850', date: '2026-09-27', current_step: 'Step 1: Manager Verified', status: 'PENDING' },
    { id: 'req-3', employee: 'Sarah Jenkins', request_type: 'Address Change Proof', details: 'Updated Rental Agreement PDF', amount: 'N/A', date: '2026-09-25', current_step: 'Completed', status: 'APPROVED' },
  ]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/hr/requests');
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setRequests(res.data);
      }
    } catch (err) {
      console.warn('Requests fetch fallback:', err);
    }
  };

  const handleAction = (id, status) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const filteredRequests = requests.filter(r => {
    if (activeFilter === 'ALL') return true;
    return r.status === activeFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in text-[#17221C]">
      <PageHeader
        title="Employee Requests & Approval Queue"
        description="Profile update, bank details change, and document verification approvals"
        badge={<Badge variant="primary">APPROVAL QUEUE</Badge>}
      />

      {/* Segmented Filter Control */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="inline-flex items-center p-[3px] bg-[#EEF3F0] border border-[#CBD8D1] rounded-[10px] space-x-1">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-[7px] text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === filter
                  ? 'bg-white text-[#167C63] shadow-xs border border-[#CFE6DC]'
                  : 'text-[#33413A] hover:text-[#12201A] hover:bg-[#F0F6F3]'
              }`}
            >
              {filter.charAt(0) + filter.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <span className="text-xs text-[#5A6A61] font-semibold">
          Showing {filteredRequests.length} request(s)
        </span>
      </div>

      <Card>
        <CardHeader title="Pending HR & Manager Approvals" description="Review requests requiring administrative authorization" />
        <CardBody className="p-0">
          <DataTable
            columns={[
              { header: 'Employee', accessor: 'employee', render: (r) => <span className="font-semibold text-[#17221C]">{r.employee}</span> },
              { header: 'Request Category', accessor: 'request_type', render: (r) => <Badge variant="primary">{r.request_type}</Badge> },
              { header: 'Request Details', accessor: 'details', render: (r) => <span className="text-[#3D4A43] font-medium">{r.details}</span> },
              { header: 'Amount / Value', accessor: 'amount', render: (r) => <span className="font-mono text-[#17221C] font-semibold tabular-nums">{r.amount}</span> },
              { header: 'Date Filed', accessor: 'date', render: (r) => <span className="font-mono text-[#65736B]">{r.date}</span> },
              { header: 'Current Step', accessor: 'current_step', render: (r) => <span className="text-[#3D4A43] text-xs">{r.current_step}</span> },
              { header: 'Status', accessor: 'status', render: (r) => <Badge variant={r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'danger' : 'warning'}>{r.status}</Badge> },
              {
                header: 'Action',
                accessor: 'actions',
                render: (r) =>
                  r.status === 'PENDING' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAction(r.id, 'APPROVED')}
                        className="h-8 px-3 rounded-[9px] text-xs font-semibold bg-[#167C63] hover:bg-[#11664F] text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleAction(r.id, 'REJECTED')}
                        className="h-8 px-3 rounded-[9px] text-xs font-semibold bg-[#FFF1F1] border border-[#F8C4C4] text-[#C24141] hover:bg-[#FDE2E2] transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-[#65736B] italic font-medium">Completed</span>
                  ),
              },
            ]}
            data={filteredRequests}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default HRRequestsPage;
