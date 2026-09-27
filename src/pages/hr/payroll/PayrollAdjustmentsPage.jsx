import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  SlidersHorizontal,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  FileText,
  DollarSign,
  AlertCircle,
  Loader2
} from 'lucide-react';
import api from '../../../lib/axios';

export default function PayrollAdjustmentsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: '',
    adjustmentType: 'ARREARS',
    amount: '',
    reason: '',
    effectiveYear: new Date().getFullYear(),
    effectiveMonth: new Date().getMonth() + 1
  });

  // Fetch Adjustments List
  const { data: adjustments, isLoading } = useQuery({
    queryKey: ['payroll-adjustments'],
    queryFn: async () => {
      const res = await api.get('/payroll-processing/adjustments');
      return res.data?.data || res.data || [];
    }
  });

  // Fetch Active Employees for dropdown
  const { data: employees } = useQuery({
    queryKey: ['employees-light'],
    queryFn: async () => {
      const res = await api.get('/hr/employees');
      return res.data?.data || res.data || [];
    }
  });

  // Create Adjustment Mutation
  const createAdjustmentMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/payroll-processing/adjustments', {
        ...formData,
        amount: parseFloat(formData.amount),
        effectiveYear: parseInt(formData.effectiveYear),
        effectiveMonth: parseInt(formData.effectiveMonth)
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-adjustments'] });
      setShowModal(false);
      setFormData({
        employeeId: '',
        adjustmentType: 'ARREARS',
        amount: '',
        reason: '',
        effectiveYear: new Date().getFullYear(),
        effectiveMonth: new Date().getMonth() + 1
      });
    }
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">Approved</span>;
      case 'APPLIED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-950 text-blue-400 border border-blue-800">Applied to Payroll</span>;
      case 'REJECTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-950 text-red-400 border border-red-800">Rejected</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950 text-amber-400 border border-amber-800">Pending Approval</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-blue-400" /> Payroll Adjustments & Arrears
          </h1>
          <p className="text-sm text-slate-400">
            Log post-finalization adjustments, arrears, recovery, or tax corrections without mutating history.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Adjustment
        </button>
      </div>

      {/* Adjustments Table */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-400" /> Loading adjustments...
        </div>
      ) : !adjustments || adjustments.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-sm">
          No payroll adjustments recorded yet.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Employee</th>
                <th className="p-3">Type</th>
                <th className="p-3">Effective Month</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Status</th>
                <th className="p-3">Logged Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {adjustments.map((adj) => (
                <tr key={adj.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-sans font-semibold text-slate-100">
                    {adj.employee?.first_name} {adj.employee?.last_name}
                    <span className="block text-[10px] text-slate-500 font-mono">{adj.employee?.employee_code}</span>
                  </td>
                  <td className="p-3 font-sans font-semibold text-blue-400">{adj.adjustment_type}</td>
                  <td className="p-3 text-slate-300">{adj.effective_month}/{adj.effective_year}</td>
                  <td className={`p-3 font-bold ${Number(adj.amount) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ₹{Number(adj.amount).toLocaleString()}
                  </td>
                  <td className="p-3 font-sans text-slate-400 max-w-xs truncate">{adj.reason || 'N/A'}</td>
                  <td className="p-3 font-sans">{getStatusBadge(adj.status)}</td>
                  <td className="p-3 text-slate-500 font-sans text-[11px]">{new Date(adj.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Creating Adjustment */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-blue-400" /> New Payroll Adjustment
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Select Employee</label>
                <select
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none"
                >
                  <option value="">Select Employee...</option>
                  {employees?.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Adjustment Type</label>
                <select
                  value={formData.adjustmentType}
                  onChange={(e) => setFormData({ ...formData, adjustmentType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none"
                >
                  <option value="ARREARS">Salary Arrears (Positive)</option>
                  <option value="RECOVERY">Salary Recovery (Negative)</option>
                  <option value="BONUS_ADJUSTMENT">Bonus Adjustment</option>
                  <option value="DEDUCTION_ADJUSTMENT">Deduction Adjustment</option>
                  <option value="OVERTIME_CORRECTION">Overtime Correction</option>
                  <option value="TAX_ADJUSTMENT">Tax / TDS Adjustment</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Effective Month</label>
                  <select
                    value={formData.effectiveMonth}
                    onChange={(e) => setFormData({ ...formData, effectiveMonth: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>{new Date(2000, m - 1, 1).toLocaleString('default', { month: 'short' })}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Effective Year</label>
                  <select
                    value={formData.effectiveYear}
                    onChange={(e) => setFormData({ ...formData, effectiveYear: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none"
                  >
                    {[2024, 2025, 2026, 2027].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Adjustment Amount (₹)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="E.g. 2500"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Reason / Remarks</label>
                <textarea
                  rows={2}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Explain reason for adjustment..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => createAdjustmentMutation.mutate()}
                disabled={!formData.employeeId || !formData.amount || createAdjustmentMutation.isPending}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                {createAdjustmentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Submit Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
