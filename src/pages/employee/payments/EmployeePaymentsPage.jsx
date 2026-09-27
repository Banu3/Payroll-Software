import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import {
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  Download,
  DollarSign,
  ShieldCheck,
  Eye,
  EyeOff,
  Edit,
  Send
} from 'lucide-react';

export default function EmployeePaymentsPage() {
  const { user, company } = useAuth();

  const [showAccount, setShowAccount] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [bankRequestSent, setBankRequestSent] = useState(false);

  const [formData, setFormData] = useState({
    bankName: 'HDFC Bank',
    accountNumber: '98765432104892',
    ifscCode: 'HDFC0001234',
    accountType: 'Savings Account',
    reason: 'Update to new salary primary account',
  });

  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Samantha Reed';

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    setBankRequestSent(true);
    setTimeout(() => {
      setShowModal(false);
      setBankRequestSent(false);
      alert('Bank Account Change Request submitted to HR Admin for verification!');
    }, 800);
  };

  const paymentHistory = [
    {
      id: 'pay-txn-001',
      period: 'September 2026 Salary',
      date: 'Sep 30, 2026',
      amount: 82500,
      bank: 'HDFC Bank (•••• 4892)',
      utr: 'NEFT-20260930-881920',
      status: 'TRANSFERRED',
    },
    {
      id: 'pay-txn-002',
      period: 'August 2026 Salary',
      date: 'Aug 31, 2026',
      amount: 82500,
      bank: 'HDFC Bank (•••• 4892)',
      utr: 'NEFT-20260831-772819',
      status: 'TRANSFERRED',
    },
    {
      id: 'pay-txn-003',
      period: 'July 2026 Salary',
      date: 'Jul 31, 2026',
      amount: 79800,
      bank: 'HDFC Bank (•••• 4892)',
      utr: 'NEFT-20260731-663910',
      status: 'TRANSFERRED',
    },
    {
      id: 'pay-txn-004',
      period: 'June 2026 Salary',
      date: 'Jun 30, 2026',
      amount: 82500,
      bank: 'HDFC Bank (•••• 4892)',
      utr: 'NEFT-20260630-551029',
      status: 'TRANSFERRED',
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-400" /> Direct Deposit & Payment Details
          </h1>
          <p className="text-sm text-slate-400">
            View verified salary payment deposits and manage your registered bank payout account.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm shrink-0"
        >
          <Edit className="w-4 h-4" /> Request Bank Detail Change
        </button>
      </div>

      {/* Active Bank Account Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> DIRECT DEPOSIT ACTIVE
              </span>
              <span className="text-xs text-slate-400 font-mono">PRIMARY SALARY ACCOUNT</span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-100">{fullName}</h2>
              <p className="text-xs text-slate-400">HDFC Bank &bull; Corporate Salary Branch</p>
            </div>

            <div className="flex items-center gap-6 pt-2 text-xs font-mono">
              <div>
                <span className="text-slate-500 block text-[10px] font-sans uppercase">Account Number</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-bold text-slate-200">
                    {showAccount ? '98765432104892' : '•••• •••• •••• 4892'}
                  </span>
                  <button
                    onClick={() => setShowAccount(!showAccount)}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    {showAccount ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] font-sans uppercase">IFSC / Branch Code</span>
                <span className="font-bold text-emerald-400 mt-0.5 block">HDFC0001234</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs w-full md:w-64">
            <div className="flex justify-between">
              <span className="text-slate-400">Payroll Cycle:</span>
              <span className="font-bold text-slate-200">Monthly</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Payout Currency:</span>
              <span className="font-bold text-slate-200">INR (₹)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Verification:</span>
              <span className="font-bold text-emerald-400">PENNY DROP VERIFIED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" /> Salary Direct Deposit History
          </h3>
          <span className="text-xs text-slate-400">Showing last 4 salary disbursements</span>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Salary Period</th>
                <th className="p-3">Transfer Date</th>
                <th className="p-3">Payout Account</th>
                <th className="p-3">Bank UTR Ref</th>
                <th className="p-3">Net Paid</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {paymentHistory.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-bold text-slate-100 font-sans">{p.period}</td>
                  <td className="p-3 text-slate-400">{p.date}</td>
                  <td className="p-3 text-slate-300 font-sans">{p.bank}</td>
                  <td className="p-3 text-emerald-400 font-mono text-[11px]">{p.utr}</td>
                  <td className="p-3 text-emerald-400 font-bold text-sm">₹{p.amount.toLocaleString()}</td>
                  <td className="p-3 font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      TRANSFERRED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPDATE BANK MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" /> Request Bank Account Change
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Bank Name</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">New Account Number</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 font-mono uppercase focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Reason for Update</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 h-20 resize-none"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bankRequestSent}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
