import React, { useState } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Paperclip,
  Download
} from 'lucide-react';
import { formatCurrency } from '../../../services/financialCalculationService';

export const HRReimbursementsPage = () => {
  const STORAGE_KEY = 'payroll_hr_reimbursements';

  const [claims, setClaims] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load reimbursements cache:', e);
    }
    return [
      {
        id: 'clm-201',
        employee_name: 'Marcus Brooke',
        employee_code: 'EMP-1002',
        category: 'Travel & Lodging',
        title: 'Client Onsite Visit Flight & Hotel',
        claim_amount: 12500,
        approved_amount: 12500,
        paid_amount: 12500,
        receipt_count: 2,
        status: 'PAID',
        claim_date: '2026-09-10',
        approved_date: '2026-09-12',
      },
      {
        id: 'clm-202',
        employee_name: 'Sarah Jenkins',
        employee_code: 'EMP-1003',
        type: 'Medical',
        category: 'Health & Wellness',
        title: 'Annual Executive Health Checkup',
        claim_amount: 5500,
        approved_amount: 4800,
        paid_amount: 4800,
        receipt_count: 1,
        status: 'APPROVED',
        claim_date: '2026-09-15',
        approved_date: '2026-09-18',
      },
      {
        id: 'clm-203',
        employee_name: 'David Miller',
        employee_code: 'EMP-1004',
        category: 'Fuel & Conveyance',
        title: 'Local Client Meetings Fuel Claim',
        claim_amount: 3200,
        approved_amount: 3200,
        paid_amount: 0,
        receipt_count: 3,
        status: 'PENDING',
        claim_date: '2026-09-22',
        approved_date: null,
      },
      {
        id: 'clm-204',
        employee_name: 'Eleanor Sterling',
        employee_code: 'EMP-1001',
        category: 'Client Meal / Hospitality',
        title: 'Enterprise Client Dinner Hosting',
        claim_amount: 8400,
        approved_amount: 8400,
        paid_amount: 0,
        receipt_count: 1,
        status: 'PENDING',
        claim_date: '2026-09-25',
        approved_date: null,
      },
    ];
  });

  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [approvedAmountInput, setApprovedAmountInput] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const saveClaims = (updated) => {
    setClaims(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  };

  const handleOpenApproveModal = (claim) => {
    setSelectedClaim(claim);
    setApprovedAmountInput(claim.claim_amount);
  };

  const handleConfirmApproval = () => {
    if (!selectedClaim) return;
    const appAmt = Number(approvedAmountInput) || selectedClaim.claim_amount;
    const updated = claims.map((c) =>
      c.id === selectedClaim.id
        ? {
            ...c,
            approved_amount: appAmt,
            status: 'APPROVED',
            approved_date: new Date().toISOString().slice(0, 10),
          }
        : c
    );
    saveClaims(updated);
    setSelectedClaim(null);
    showToast(`Claim '${selectedClaim.title}' APPROVED for ${formatCurrency(appAmt)}!`);
  };

  const handleReject = (id) => {
    const updated = claims.map((c) => (c.id === id ? { ...c, status: 'REJECTED' } : c));
    saveClaims(updated);
    showToast('Reimbursement claim REJECTED.');
  };

  const filteredClaims = claims.filter((c) => {
    const matchesCategory = filterCategory === 'ALL' || c.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const matchesSearch =
      c.employee_name.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.employee_code.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const totalClaimed = claims.reduce((sum, c) => sum + c.claim_amount, 0);
  const totalApproved = claims.filter((c) => c.status === 'APPROVED' || c.status === 'PAID').reduce((sum, c) => sum + c.approved_amount, 0);
  const totalPaid = claims.filter((c) => c.status === 'PAID').reduce((sum, c) => sum + c.paid_amount, 0);
  const pendingCount = claims.filter((c) => c.status === 'PENDING').length;

  return (
    <div className="space-y-6 animate-fade-in text-slate-900">
      <PageHeader
        title="Employee Expense Reimbursements Hub"
        description="Audit expense receipts, approve travel/medical claims, and disburse reimbursements in monthly payroll"
      />

      {toastMessage && (
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-300 text-teal-900 font-medium text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-teal-600">
          <div className="text-xs text-slate-600 font-semibold">Total Claimed Amount</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalClaimed)}</div>
          <div className="text-[11px] text-teal-700 mt-1 font-mono font-medium">Submitted by Employees</div>
        </Card>

        <Card className="p-4 border-l-4 border-blue-600">
          <div className="text-xs text-slate-600 font-semibold">Total Approved Amount</div>
          <div className="text-2xl font-bold text-blue-900 mt-1">{formatCurrency(totalApproved)}</div>
          <div className="text-[11px] text-blue-700 mt-1 font-mono font-medium">Audited & Verified</div>
        </Card>

        <Card className="p-4 border-l-4 border-emerald-600">
          <div className="text-xs text-slate-600 font-semibold">Total Paid Out</div>
          <div className="text-2xl font-bold text-emerald-900 mt-1">{formatCurrency(totalPaid)}</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-mono font-medium">Disbursed into Accounts</div>
        </Card>

        <Card className="p-4 border-l-4 border-amber-500">
          <div className="text-xs text-slate-600 font-semibold">Pending Review</div>
          <div className="text-2xl font-bold text-amber-900 mt-1">{pendingCount} Claims</div>
          <div className="text-[11px] text-amber-700 mt-1 font-mono font-medium">Requires HR Auditing</div>
        </Card>
      </div>

      {/* Toolbar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search claim or employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-teal-600"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <span>Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Review</option>
                <option value="APPROVED">Approved</option>
                <option value="PAID">Paid Out</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Reimbursements Table */}
      <Card className="overflow-hidden">
        <CardHeader
          title="Expense Claim Audit Table"
          description="Verify employee receipts, perform partial/full approvals, and send approved claims to payroll"
        />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="p-4">Employee</th>
                  <th className="p-4">Claim Description</th>
                  <th className="p-4">Claimed Amount</th>
                  <th className="p-4">Approved Amount</th>
                  <th className="p-4">Receipts Attached</th>
                  <th className="p-4">Claim Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredClaims.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-semibold text-slate-900">
                      <div>{c.employee_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{c.employee_code}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{c.title}</div>
                      <span className="text-[11px] text-slate-500">{c.category}</span>
                    </td>
                    <td className="p-4 font-bold text-slate-900">{formatCurrency(c.claim_amount)}</td>
                    <td className="p-4 font-mono font-bold text-teal-700">
                      {c.status === 'PENDING' ? '—' : formatCurrency(c.approved_amount)}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 font-mono text-slate-700 font-semibold">
                        <Paperclip className="w-3.5 h-3.5 text-slate-500" /> {c.receipt_count} Receipts
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 font-mono">{c.claim_date}</td>
                    <td className="p-4">
                      {c.status === 'PAID' && <Badge variant="success">PAID DISBURSED</Badge>}
                      {c.status === 'APPROVED' && <Badge variant="info">APPROVED</Badge>}
                      {c.status === 'PENDING' && <Badge variant="warning">PENDING REVIEW</Badge>}
                      {c.status === 'REJECTED' && <Badge variant="danger">REJECTED</Badge>}
                    </td>
                    <td className="p-4 text-right">
                      {c.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenApproveModal(c)}
                            className="h-7 px-2.5 rounded-md bg-teal-600 text-white font-bold hover:bg-teal-700 transition-all flex items-center gap-1 shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(c.id)}
                            className="h-7 px-2.5 rounded-md bg-rose-100 text-rose-800 font-bold hover:bg-rose-200 transition-all flex items-center gap-1 border border-rose-300"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">Audited</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredClaims.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 font-medium">
                      No reimbursement claims matching the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Approval Modal */}
      {selectedClaim && (
        <Modal isOpen={!!selectedClaim} onClose={() => setSelectedClaim(null)} title="Approve Reimbursement Claim">
          <div className="space-y-4 text-slate-900">
            <div className="p-3 rounded-lg bg-slate-100 space-y-1 text-xs font-medium">
              <div>Employee: <strong>{selectedClaim.employee_name} ({selectedClaim.employee_code})</strong></div>
              <div>Title: <strong>{selectedClaim.title}</strong></div>
              <div>Submitted Amount: <strong className="text-teal-700">{formatCurrency(selectedClaim.claim_amount)}</strong></div>
            </div>

            <Input
              label="Approved Amount (₹)"
              type="number"
              max={selectedClaim.claim_amount}
              value={approvedAmountInput}
              onChange={(e) => setApprovedAmountInput(e.target.value)}
              helperText={`You can approve up to full claimed amount ${formatCurrency(selectedClaim.claim_amount)}.`}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setSelectedClaim(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmApproval}>
                Confirm Approval
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default HRReimbursementsPage;
