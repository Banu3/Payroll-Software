import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  CreditCard,
  Building,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Play,
  Users,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import api from '../../../lib/axios';

export default function CreatePaymentBatchPage() {
  const navigate = useNavigate();
  const [selectedRunId, setSelectedRunId] = useState('');
  const [selectedBankAccountId, setSelectedBankAccountId] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch Finalized Payroll Runs
  const { data: runs, isLoading: runsLoading } = useQuery({
    queryKey: ['finalized-payroll-runs'],
    queryFn: async () => {
      const res = await api.get('/payroll-processing/runs');
      const allRuns = res.data?.data || res.data || [];
      return allRuns.filter((r) => r.status === 'FINALIZED' || r.status === 'APPROVED');
    }
  });

  // Fetch Company Bank Accounts
  const { data: bankAccounts } = useQuery({
    queryKey: ['company-bank-accounts'],
    queryFn: async () => {
      const res = await api.get('/payments/bank-accounts');
      return res.data?.data || res.data || [];
    }
  });

  // Create Payment Batch Mutation
  const createBatchMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/payments/batches', {
        payrollRunId: selectedRunId,
        companyBankAccountId: selectedBankAccountId || null,
        notes
      });
      return res.data?.data || res.data;
    },
    onSuccess: (data) => {
      const bId = data.batch?.id || data.id;
      navigate(`/hr/payments/batches/${bId}`);
    }
  });

  const selectedRun = runs?.find((r) => r.id === selectedRunId);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-blue-400" /> Create Salary Payment Batch
        </h1>
        <p className="text-sm text-slate-400">
          Prepare bank disbursement instructions from finalized payroll and validate employee bank credentials.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        {/* Step 1: Select Finalized Payroll Run */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">Select Finalized Payroll Run</label>
          {runsLoading ? (
            <div className="text-xs text-slate-500">Loading finalized payroll runs...</div>
          ) : (
            <select
              value={selectedRunId}
              onChange={(e) => setSelectedRunId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value="">Select Payroll Run...</option>
              {runs?.map((r) => (
                <option key={r.id} value={r.id}>
                  Run #{r.run_number || r.id.slice(0, 8)} • Period: {r.payroll_period?.month_year || 'N/A'} • Total Net: ₹{Number(r.total_net_pay || r.total_net || 0).toLocaleString()} [{r.status}]
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Step 2: Select Company Debit Bank Account */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">Select Company Debit Bank Account</label>
          <select
            value={selectedBankAccountId}
            onChange={(e) => setSelectedBankAccountId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
          >
            <option value="">Use Default Company Account...</option>
            {bankAccounts?.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.bank_name} • {acc.account_name} ({acc.account_number}) • IFSC: {acc.ifsc_code}
              </option>
            ))}
          </select>
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">Payment Batch Notes / Remarks</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="E.g. Monthly salary bank transfer file for September cycle..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 focus:outline-none"
          />
        </div>

        {selectedRun && (
          <div className="p-4 bg-blue-950/20 border border-blue-800/40 rounded-xl space-y-2 text-xs">
            <div className="font-bold text-blue-300">Run Summary:</div>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div>Total Employees: <strong>{selectedRun.total_employees}</strong></div>
              <div>Net Payable: <strong className="text-emerald-400 font-mono">₹{Number(selectedRun.total_net_pay || selectedRun.total_net || 0).toLocaleString()}</strong></div>
            </div>
          </div>
        )}

        <button
          onClick={() => createBatchMutation.mutate()}
          disabled={!selectedRunId || createBatchMutation.isPending}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2"
        >
          {createBatchMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
          Generate Payment Batch & Instructions
        </button>
      </div>
    </div>
  );
}
