import React, { useState } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Banknote, Plus, CheckCircle2, Clock, CalendarDays, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../../services/financialCalculationService';

export const EmployeeLoansAdvancesPage = () => {
  const STORAGE_KEY = 'payroll_employee_loans_advances';

  const [myLoans, setMyLoans] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load employee loans cache:', e);
    }
    return [
      {
        id: 'ln-101',
        type: 'LOAN',
        title: 'Emergency Housing Loan',
        principal: 100000,
        outstanding: 75000,
        emi: 8500,
        interest_rate: 6.5,
        tenure_months: 12,
        repaid_months: 3,
        status: 'ACTIVE',
        created_at: '2026-06-15',
      },
      {
        id: 'adv-102',
        type: 'ADVANCE',
        title: 'Medical Salary Advance',
        principal: 25000,
        outstanding: 10000,
        emi: 5000,
        interest_rate: 0,
        tenure_months: 5,
        repaid_months: 3,
        status: 'ACTIVE',
        created_at: '2026-07-01',
      },
    ];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [form, setForm] = useState({
    type: 'LOAN',
    title: '',
    principal: 30000,
    tenure_months: 6,
    reason: '',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApply = (e) => {
    e.preventDefault();
    if (!form.title || !form.principal) {
      alert('Please fill in required fields');
      return;
    }

    const principalNum = Number(form.principal);
    const monthsNum = Number(form.tenure_months) || 1;
    const rateNum = form.type === 'LOAN' ? 6.5 : 0;

    const totalInterest = (principalNum * rateNum * (monthsNum / 12)) / 100;
    const emi = Math.round((principalNum + totalInterest) / monthsNum);

    const created = {
      id: `ln-${Date.now()}`,
      type: form.type,
      title: form.title,
      principal: principalNum,
      outstanding: principalNum,
      emi,
      interest_rate: rateNum,
      tenure_months: monthsNum,
      repaid_months: 0,
      status: 'PENDING',
      created_at: new Date().toISOString().slice(0, 10),
    };

    const updated = [created, ...myLoans];
    setMyLoans(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }

    setIsModalOpen(false);
    setForm({ type: 'LOAN', title: '', principal: 30000, tenure_months: 6, reason: '' });
    showToast('Your request has been submitted to HR for approval.');
  };

  const totalOutstanding = myLoans.filter((l) => l.status === 'ACTIVE').reduce((sum, l) => sum + l.outstanding, 0);
  const totalEmi = myLoans.filter((l) => l.status === 'ACTIVE').reduce((sum, l) => sum + l.emi, 0);

  return (
    <div className="space-y-6 animate-fade-in text-slate-900">
      <PageHeader
        title="My Loans & Salary Advances"
        description="View active loan balances, monthly payroll EMI deductions, and apply for advance salary"
        action={
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
            Apply for Loan / Advance
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
        <Card className="p-4 border-l-4 border-amber-500">
          <div className="text-xs text-slate-600 font-semibold">Total Outstanding Principal</div>
          <div className="text-2xl font-bold text-amber-900 mt-1">{formatCurrency(totalOutstanding)}</div>
          <div className="text-[11px] text-amber-700 mt-1 font-mono font-medium">To be repaid</div>
        </Card>

        <Card className="p-4 border-l-4 border-blue-600">
          <div className="text-xs text-slate-600 font-semibold">Monthly EMI Deduction</div>
          <div className="text-2xl font-bold text-blue-900 mt-1">{formatCurrency(totalEmi)}</div>
          <div className="text-[11px] text-blue-700 mt-1 font-mono font-medium">Deducted from monthly salary</div>
        </Card>

        <Card className="p-4 border-l-4 border-teal-600">
          <div className="text-xs text-slate-600 font-semibold">Active Borrowing Accounts</div>
          <div className="text-2xl font-bold text-teal-900 mt-1">{myLoans.filter((l) => l.status === 'ACTIVE').length} Active</div>
          <div className="text-[11px] text-teal-700 mt-1 font-mono font-medium">Auto Deduction Enabled</div>
        </Card>
      </div>

      {/* My Loans Table */}
      <Card className="overflow-hidden">
        <CardHeader
          title="My Loan & Salary Advance Accounts"
          description="Repayment schedule, EMI amounts, interest rates, and remaining balance"
        />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="p-4">Loan Title & Category</th>
                  <th className="p-4">Principal Disbursed</th>
                  <th className="p-4">Monthly EMI</th>
                  <th className="p-4">Outstanding Balance</th>
                  <th className="p-4">Repayment Progress</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {myLoans.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{l.title}</div>
                      <Badge variant={l.type === 'LOAN' ? 'purple' : 'info'} size="sm">
                        {l.type === 'LOAN' ? `LOAN (${l.interest_rate}% p.a.)` : 'SALARY ADVANCE (0%)'}
                      </Badge>
                    </td>
                    <td className="p-4 font-bold text-slate-900">{formatCurrency(l.principal)}</td>
                    <td className="p-4 font-mono font-bold text-blue-700">{formatCurrency(l.emi)}/mo</td>
                    <td className="p-4 font-mono font-bold text-amber-700">{formatCurrency(l.outstanding)}</td>
                    <td className="p-4">
                      <div className="font-medium text-slate-700">
                        {l.repaid_months} of {l.tenure_months} months
                      </div>
                      <div className="w-28 bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className="bg-teal-600 h-full rounded-full"
                          style={{ width: `${Math.min(100, (l.repaid_months / l.tenure_months) * 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      {l.status === 'ACTIVE' && <Badge variant="success">ACTIVE</Badge>}
                      {l.status === 'PENDING' && <Badge variant="warning">PENDING HR APPROVAL</Badge>}
                      {l.status === 'REPAID' && <Badge variant="default">REPAID</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Apply for Loan or Salary Advance">
        <form onSubmit={handleApply} className="space-y-4 text-slate-900">
          <Select
            label="Application Category"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={[
              { value: 'LOAN', label: 'Company Emergency Loan (6.5% interest)' },
              { value: 'ADVANCE', label: 'Salary Advance (Interest-free 0%)' },
            ]}
          />

          <Input
            label="Request Title / Purpose"
            placeholder="e.g. Medical Expense / Festival Salary Advance"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            isRequired
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Requested Amount (₹)"
              type="number"
              min="1000"
              step="1000"
              value={form.principal}
              onChange={(e) => setForm({ ...form, principal: e.target.value })}
              isRequired
            />

            <Input
              label="Repayment Tenure (Months)"
              type="number"
              min="1"
              max="36"
              value={form.tenure_months}
              onChange={(e) => setForm({ ...form, tenure_months: e.target.value })}
              isRequired
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeLoansAdvancesPage;
