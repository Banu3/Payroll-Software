import React, { useState } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { FileText, Plus, CheckCircle2, Clock, Paperclip } from 'lucide-react';
import { formatCurrency } from '../../../services/financialCalculationService';

export const EmployeeReimbursementsPage = () => {
  const STORAGE_KEY = 'payroll_employee_reimbursements';

  const [claims, setClaims] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load employee reimbursements cache:', e);
    }
    return [
      {
        id: 'clm-301',
        category: 'Travel & Lodging',
        title: 'Client Onsite Visit Flight Ticket',
        claim_amount: 12500,
        approved_amount: 12500,
        paid_amount: 12500,
        receipt_name: 'flight_boarding_pass.pdf',
        status: 'PAID',
        claim_date: '2026-09-10',
      },
      {
        id: 'clm-302',
        category: 'Fuel & Conveyance',
        title: 'Monthly Local Travel Expenses',
        claim_amount: 3200,
        approved_amount: 3200,
        paid_amount: 0,
        receipt_name: 'fuel_bills_sept.pdf',
        status: 'APPROVED',
        claim_date: '2026-09-22',
      },
    ];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [form, setForm] = useState({
    category: 'Travel & Lodging',
    title: '',
    claim_amount: 2500,
    receipt_name: 'expense_receipt.pdf',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSubmitClaim = (e) => {
    e.preventDefault();
    if (!form.title || !form.claim_amount) {
      alert('Please fill in required fields');
      return;
    }

    const claimAmt = Number(form.claim_amount);

    const created = {
      id: `clm-${Date.now()}`,
      category: form.category,
      title: form.title,
      claim_amount: claimAmt,
      approved_amount: 0,
      paid_amount: 0,
      receipt_name: form.receipt_name || 'receipt.pdf',
      status: 'PENDING',
      claim_date: new Date().toISOString().slice(0, 10),
    };

    const updated = [created, ...claims];
    setClaims(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }

    setIsModalOpen(false);
    setForm({ category: 'Travel & Lodging', title: '', claim_amount: 2500, receipt_name: 'expense_receipt.pdf' });
    showToast(`Claim '${form.title}' for ${formatCurrency(claimAmt)} submitted successfully!`);
  };

  const totalClaimed = claims.reduce((sum, c) => sum + c.claim_amount, 0);
  const totalApproved = claims.filter((c) => c.status === 'APPROVED' || c.status === 'PAID').reduce((sum, c) => sum + c.approved_amount, 0);
  const totalPaid = claims.filter((c) => c.status === 'PAID').reduce((sum, c) => sum + c.paid_amount, 0);

  return (
    <div className="space-y-6 animate-fade-in text-slate-900">
      <PageHeader
        title="My Expense Reimbursements"
        description="Submit official business expense receipts, track HR auditing status, and receive reimbursement payouts"
        action={
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
            Submit New Expense Claim
          </Button>
        }
      />

      {toastMessage && (
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-300 text-teal-900 font-medium text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-teal-600">
          <div className="text-xs text-slate-600 font-semibold">Total Submitted Claims</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalClaimed)}</div>
          <div className="text-[11px] text-teal-700 mt-1 font-mono font-medium">{claims.length} Claims Filed</div>
        </Card>

        <Card className="p-4 border-l-4 border-blue-600">
          <div className="text-xs text-slate-600 font-semibold">Approved Amount</div>
          <div className="text-2xl font-bold text-blue-900 mt-1">{formatCurrency(totalApproved)}</div>
          <div className="text-[11px] text-blue-700 mt-1 font-mono font-medium">Audited & Verified</div>
        </Card>

        <Card className="p-4 border-l-4 border-emerald-600">
          <div className="text-xs text-slate-600 font-semibold">Disbursed Payouts</div>
          <div className="text-2xl font-bold text-emerald-900 mt-1">{formatCurrency(totalPaid)}</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-mono font-medium">Transferred to Bank</div>
        </Card>
      </div>

      {/* Claims Table */}
      <Card className="overflow-hidden">
        <CardHeader
          title="Expense Claim History"
          description="Track audit progress, approved settlement amounts, and receipt attachments"
        />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="p-4">Claim Description & Category</th>
                  <th className="p-4">Claimed Amount</th>
                  <th className="p-4">Approved Amount</th>
                  <th className="p-4">Attached Receipt</th>
                  <th className="p-4">Submission Date</th>
                  <th className="p-4">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {claims.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{c.title}</div>
                      <span className="text-[11px] text-slate-500">{c.category}</span>
                    </td>
                    <td className="p-4 font-bold text-slate-900">{formatCurrency(c.claim_amount)}</td>
                    <td className="p-4 font-mono font-bold text-teal-700">
                      {c.status === 'PENDING' ? '—' : formatCurrency(c.approved_amount)}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 font-mono text-slate-700 font-medium">
                        <Paperclip className="w-3.5 h-3.5 text-slate-500" /> {c.receipt_name}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 font-mono">{c.claim_date}</td>
                    <td className="p-4">
                      {c.status === 'PAID' && <Badge variant="success">PAID DISBURSED</Badge>}
                      {c.status === 'APPROVED' && <Badge variant="info">APPROVED</Badge>}
                      {c.status === 'PENDING' && <Badge variant="warning">PENDING REVIEW</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Submit New Expense Reimbursement Claim">
        <form onSubmit={handleSubmitClaim} className="space-y-4 text-slate-900">
          <Select
            label="Expense Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            options={[
              { value: 'Travel & Lodging', label: 'Travel & Lodging' },
              { value: 'Fuel & Conveyance', label: 'Fuel & Conveyance' },
              { value: 'Health & Medical', label: 'Health & Medical' },
              { value: 'Client Meal / Hospitality', label: 'Client Meal / Hospitality' },
              { value: 'Office Supplies / Broadband', label: 'Office Supplies / Broadband' },
            ]}
          />

          <Input
            label="Claim Title / Expense Description"
            placeholder="e.g. Flight ticket for Client Onsite Visit"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            isRequired
          />

          <Input
            label="Expense Amount (₹)"
            type="number"
            min="100"
            step="100"
            value={form.claim_amount}
            onChange={(e) => setForm({ ...form, claim_amount: e.target.value })}
            isRequired
          />

          <Input
            label="Receipt Proof Document Name"
            placeholder="e.g. flight_invoice.pdf"
            value={form.receipt_name}
            onChange={(e) => setForm({ ...form, receipt_name: e.target.value })}
            isRequired
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit Expense Claim
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeReimbursementsPage;
