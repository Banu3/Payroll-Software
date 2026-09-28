import React, { useState } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import {
  Banknote,
  Plus,
  Check,
  X,
  Clock,
  TrendingDown,
  Building,
  Users,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '../../../services/financialCalculationService';

export const HRLoansAdvancesPage = () => {
  const STORAGE_KEY = 'payroll_hr_loans_advances';

  const [records, setRecords] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.warn('Failed to load loans/advances cache:', err);
    }
    return [
      {
        id: 'ln-101',
        employee_name: 'Eleanor Sterling',
        employee_code: 'EMP-1001',
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
        employee_name: 'Marcus Brooke',
        employee_code: 'EMP-1002',
        type: 'ADVANCE',
        title: 'Medical Advance',
        principal: 25000,
        outstanding: 10000,
        emi: 5000,
        interest_rate: 0,
        tenure_months: 5,
        repaid_months: 3,
        status: 'ACTIVE',
        created_at: '2026-07-01',
      },
      {
        id: 'ln-103',
        employee_name: 'Sarah Jenkins',
        employee_code: 'EMP-1003',
        type: 'LOAN',
        title: 'Education Loan',
        principal: 150000,
        outstanding: 150000,
        emi: 12500,
        interest_rate: 7.0,
        tenure_months: 12,
        repaid_months: 0,
        status: 'PENDING',
        created_at: '2026-09-24',
      },
      {
        id: 'adv-104',
        employee_name: 'David Miller',
        employee_code: 'EMP-1004',
        type: 'ADVANCE',
        title: 'Festival Salary Advance',
        principal: 20000,
        outstanding: 20000,
        emi: 10000,
        interest_rate: 0,
        tenure_months: 2,
        repaid_months: 0,
        status: 'PENDING',
        created_at: '2026-09-26',
      },
    ];
  });

  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // New Loan Form state
  const [newLoan, setNewLoan] = useState({
    employee_name: '',
    employee_code: '',
    type: 'LOAN',
    title: '',
    principal: 50000,
    tenure_months: 10,
    interest_rate: 6.0,
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const saveRecords = (updated) => {
    setRecords(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  };

  const handleApprove = (id) => {
    const updated = records.map((r) => (r.id === id ? { ...r, status: 'ACTIVE' } : r));
    saveRecords(updated);
    showToast('Loan/Advance request has been APPROVED and added to active payroll deductions.');
  };

  const handleReject = (id) => {
    const updated = records.map((r) => (r.id === id ? { ...r, status: 'REJECTED' } : r));
    saveRecords(updated);
    showToast('Loan/Advance request has been REJECTED.');
  };

  const handleCreateNew = (e) => {
    e.preventDefault();
    if (!newLoan.employee_name || !newLoan.title || !newLoan.principal) {
      alert('Please fill in all required fields');
      return;
    }

    const principalNum = Number(newLoan.principal);
    const monthsNum = Number(newLoan.tenure_months) || 1;
    const rateNum = Number(newLoan.interest_rate) || 0;

    // Simple Interest EMI Calculation
    const totalInterest = (principalNum * rateNum * (monthsNum / 12)) / 100;
    const emi = Math.round((principalNum + totalInterest) / monthsNum);

    const created = {
      id: `ln-${Date.now()}`,
      employee_name: newLoan.employee_name,
      employee_code: newLoan.employee_code || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      type: newLoan.type,
      title: newLoan.title,
      principal: principalNum,
      outstanding: principalNum,
      emi,
      interest_rate: rateNum,
      tenure_months: monthsNum,
      repaid_months: 0,
      status: 'ACTIVE',
      created_at: new Date().toISOString().slice(0, 10),
    };

    const updated = [created, ...records];
    saveRecords(updated);
    setIsModalOpen(false);
    setNewLoan({
      employee_name: '',
      employee_code: '',
      type: 'LOAN',
      title: '',
      principal: 50000,
      tenure_months: 10,
      interest_rate: 6.0,
    });
    showToast(`New ${newLoan.type === 'LOAN' ? 'Loan' : 'Salary Advance'} of ${formatCurrency(principalNum)} created successfully!`);
  };

  const filteredRecords = records.filter((r) => {
    const matchesType = filterType === 'ALL' || r.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesSearch =
      r.employee_name.toLowerCase().includes(search.toLowerCase()) ||
      r.employee_code.toLowerCase().includes(search.toLowerCase()) ||
      r.title.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const totalActivePrincipal = records.filter((r) => r.status === 'ACTIVE').reduce((sum, r) => sum + r.principal, 0);
  const totalOutstanding = records.filter((r) => r.status === 'ACTIVE').reduce((sum, r) => sum + r.outstanding, 0);
  const totalMonthlyEmi = records.filter((r) => r.status === 'ACTIVE').reduce((sum, r) => sum + r.emi, 0);
  const pendingCount = records.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="space-y-6 animate-fade-in text-slate-900">
      <PageHeader
        title="Employee Loans & Salary Advances Management"
        description="Disburse loans, manage EMI recovery schedules, and approve monthly advance salary requests"
        action={
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
            Disburse New Loan / Advance
          </Button>
        }
      />

      {toastMessage && (
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-300 text-teal-900 font-medium text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-teal-600">
          <div className="text-xs text-slate-600 font-semibold">Total Disbursed Principal</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalActivePrincipal)}</div>
          <div className="text-[11px] text-teal-700 mt-1 font-mono font-medium">Active Borrowings</div>
        </Card>

        <Card className="p-4 border-l-4 border-amber-500">
          <div className="text-xs text-slate-600 font-semibold">Total Outstanding Balance</div>
          <div className="text-2xl font-bold text-amber-900 mt-1">{formatCurrency(totalOutstanding)}</div>
          <div className="text-[11px] text-amber-700 mt-1 font-mono font-medium">To be recovered</div>
        </Card>

        <Card className="p-4 border-l-4 border-blue-600">
          <div className="text-xs text-slate-600 font-semibold">Monthly EMI Recoveries</div>
          <div className="text-2xl font-bold text-blue-900 mt-1">{formatCurrency(totalMonthlyEmi)}</div>
          <div className="text-[11px] text-blue-700 mt-1 font-mono font-medium">Deducted in Payroll Cycle</div>
        </Card>

        <Card className="p-4 border-l-4 border-purple-600">
          <div className="text-xs text-slate-600 font-semibold">Pending Approvals</div>
          <div className="text-2xl font-bold text-purple-900 mt-1">{pendingCount} Requests</div>
          <div className="text-[11px] text-purple-700 mt-1 font-mono font-medium">Awaiting HR Sign-off</div>
        </Card>
      </div>

      {/* Toolbar Controls */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search employee or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-teal-600"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <span>Category:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="LOAN">Loans</option>
                <option value="ADVANCE">Salary Advances</option>
              </select>
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
                <option value="ACTIVE">Active Repayment</option>
                <option value="REPAID">Fully Repaid</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <Card className="overflow-hidden">
        <CardHeader
          title="Loans & Advance Salary Register"
          description="Track principal amounts, interest rates, monthly EMI recovery, and outstanding balances"
        />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="p-4">Employee</th>
                  <th className="p-4">Category & Purpose</th>
                  <th className="p-4">Disbursed Principal</th>
                  <th className="p-4">Monthly EMI</th>
                  <th className="p-4">Outstanding Balance</th>
                  <th className="p-4">Tenure & Progress</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-semibold text-slate-900">
                      <div>{r.employee_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{r.employee_code}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{r.title}</div>
                      <Badge variant={r.type === 'LOAN' ? 'purple' : 'info'} size="sm">
                        {r.type === 'LOAN' ? `LOAN (${r.interest_rate}% p.a.)` : 'SALARY ADVANCE (0%)'}
                      </Badge>
                    </td>
                    <td className="p-4 font-bold text-slate-900">{formatCurrency(r.principal)}</td>
                    <td className="p-4 font-mono font-bold text-blue-700">{formatCurrency(r.emi)}/mo</td>
                    <td className="p-4 font-mono font-bold text-amber-700">{formatCurrency(r.outstanding)}</td>
                    <td className="p-4">
                      <div className="font-medium text-slate-700">
                        {r.repaid_months} of {r.tenure_months} months
                      </div>
                      <div className="w-24 bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className="bg-teal-600 h-full rounded-full"
                          style={{ width: `${Math.min(100, (r.repaid_months / r.tenure_months) * 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      {r.status === 'ACTIVE' && <Badge variant="success">ACTIVE</Badge>}
                      {r.status === 'PENDING' && <Badge variant="warning">PENDING REVIEW</Badge>}
                      {r.status === 'REPAID' && <Badge variant="default">REPAID</Badge>}
                      {r.status === 'REJECTED' && <Badge variant="danger">REJECTED</Badge>}
                    </td>
                    <td className="p-4 text-right">
                      {r.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApprove(r.id)}
                            className="h-7 px-2.5 rounded-md bg-teal-600 text-white font-bold hover:bg-teal-700 transition-all flex items-center gap-1 shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(r.id)}
                            className="h-7 px-2.5 rounded-md bg-rose-100 text-rose-800 font-bold hover:bg-rose-200 transition-all flex items-center gap-1 border border-rose-300"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">Managed in Payroll</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 font-medium">
                      No loan or advance salary records matching the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Disburse Loan Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Disburse New Loan / Salary Advance">
        <form onSubmit={handleCreateNew} className="space-y-4 text-slate-900">
          <Input
            label="Employee Full Name"
            placeholder="e.g. Samantha Reed"
            value={newLoan.employee_name}
            onChange={(e) => setNewLoan({ ...newLoan, employee_name: e.target.value })}
            isRequired
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Employee Code"
              placeholder="e.g. EMP-1005"
              value={newLoan.employee_code}
              onChange={(e) => setNewLoan({ ...newLoan, employee_code: e.target.value })}
            />
            <Select
              label="Category Type"
              value={newLoan.type}
              onChange={(e) => setNewLoan({ ...newLoan, type: e.target.value })}
              options={[
                { value: 'LOAN', label: 'Company Loan (Interest Bearing)' },
                { value: 'ADVANCE', label: 'Salary Advance (Interest Free 0%)' },
              ]}
            />
          </div>

          <Input
            label="Purpose / Title"
            placeholder="e.g. Personal Emergency / Medical Advance"
            value={newLoan.title}
            onChange={(e) => setNewLoan({ ...newLoan, title: e.target.value })}
            isRequired
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Principal Amount (₹)"
              type="number"
              min="1000"
              step="1000"
              value={newLoan.principal}
              onChange={(e) => setNewLoan({ ...newLoan, principal: e.target.value })}
              isRequired
            />
            <Input
              label="Tenure (Months)"
              type="number"
              min="1"
              max="60"
              value={newLoan.tenure_months}
              onChange={(e) => setNewLoan({ ...newLoan, tenure_months: e.target.value })}
              isRequired
            />
            <Input
              label="Interest Rate (% p.a.)"
              type="number"
              step="0.5"
              value={newLoan.type === 'ADVANCE' ? 0 : newLoan.interest_rate}
              disabled={newLoan.type === 'ADVANCE'}
              onChange={(e) => setNewLoan({ ...newLoan, interest_rate: e.target.value })}
            />
          </div>

          <div className="p-3 rounded-lg bg-slate-100 border border-slate-300 text-xs font-mono flex justify-between items-center">
            <span>Estimated Monthly EMI Recovery:</span>
            <span className="text-sm font-bold text-teal-700">
              {formatCurrency(
                Math.round(
                  (Number(newLoan.principal || 0) +
                    (Number(newLoan.principal || 0) * (newLoan.type === 'ADVANCE' ? 0 : Number(newLoan.interest_rate || 0)) * (Number(newLoan.tenure_months || 1) / 12)) / 100) /
                    Number(newLoan.tenure_months || 1)
                )
              )}
              /month
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Confirm Disbursement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HRLoansAdvancesPage;
