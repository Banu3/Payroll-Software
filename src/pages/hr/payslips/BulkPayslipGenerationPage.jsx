import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Sparkles,
  Play,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Clock,
  Send,
  Loader2,
  Users
} from 'lucide-react';
import api from '../../../lib/axios';

export default function BulkPayslipGenerationPage() {
  const [selectedRunId, setSelectedRunId] = useState('');
  const [sendEmailImmediately, setSendEmailImmediately] = useState(false);
  const [activeJob, setActiveJob] = useState(null);

  // Fetch Finalized Payroll Runs
  const { data: runs, isLoading: runsLoading } = useQuery({
    queryKey: ['finalized-payroll-runs'],
    queryFn: async () => {
      const res = await api.get('/payroll-processing/runs');
      const allRuns = res.data?.data || res.data || [];
      return allRuns.filter((r) => r.status === 'FINALIZED' || r.status === 'APPROVED' || r.status === 'REVIEW');
    }
  });

  // Bulk Generation Mutation
  const bulkGenMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/payslips/bulk-generate', {
        payrollRunId: selectedRunId,
        sendEmailImmediately
      });
      return res.data?.data || res.data;
    },
    onSuccess: (jobData) => {
      setActiveJob(jobData);
    }
  });

  // Poll Job Status if active
  const { data: polledJob } = useQuery({
    queryKey: ['payslip-job', activeJob?.id],
    queryFn: async () => {
      if (!activeJob?.id) return null;
      const res = await api.get(`/payslips/jobs/${activeJob.id}`);
      return res.data?.data || res.data;
    },
    enabled: !!activeJob?.id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'PROCESSING' || status === 'QUEUED' ? 1000 : false;
    }
  });

  const job = polledJob || activeJob;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-400" /> Bulk Payslip Generation Engine
        </h1>
        <p className="text-sm text-slate-400">
          Execute asynchronous background generation of official payslips for all finalized employees.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">Select Finalized Payroll Run</label>
          {runsLoading ? (
            <div className="text-xs text-slate-500">Loading finalized runs...</div>
          ) : (
            <select
              value={selectedRunId}
              onChange={(e) => setSelectedRunId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
            >
              <option value="">Select Payroll Run...</option>
              {runs?.map((r) => (
                <option key={r.id} value={r.id}>
                  Run #{r.run_number || r.id.slice(0, 8)} • Period: {r.payroll_period?.month_year || 'N/A'} • ({r.total_employees || 0} employees) [{r.status}]
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-950/60 border border-slate-800 rounded-lg">
          <input
            type="checkbox"
            id="autoEmail"
            checked={sendEmailImmediately}
            onChange={(e) => setSendEmailImmediately(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
          />
          <label htmlFor="autoEmail" className="text-xs text-slate-300 font-medium cursor-pointer">
            Automatically trigger email delivery to employee inbox upon generation
          </label>
        </div>

        <button
          onClick={() => bulkGenMutation.mutate()}
          disabled={!selectedRunId || bulkGenMutation.isPending}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2"
        >
          {bulkGenMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-white" />
          )}
          Initialize Bulk Background Job
        </button>
      </div>

      {/* Real-time Job Progress Tracker */}
      {job && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" /> Background Job Tracker (ID: {job.id?.slice(0, 8)})
            </h2>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
              job.status === 'COMPLETED'
                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                : job.status === 'PROCESSING'
                ? 'bg-blue-950 text-blue-400 border-blue-800 animate-pulse'
                : 'bg-amber-950 text-amber-400 border-amber-800'
            }`}>
              {job.status}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>Progress: {job.processed_count} / {job.total_employees} employees</span>
              <span>{Math.round(((job.processed_count || 0) / (job.total_employees || 1)) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round(((job.processed_count || 0) / (job.total_employees || 1)) * 100))}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono pt-2">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="text-slate-500 text-[10px] block">Total Included</span>
              <span className="font-bold text-slate-200 text-sm">{job.total_employees}</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="text-slate-500 text-[10px] block">Generated</span>
              <span className="font-bold text-emerald-400 text-sm">{job.success_count}</span>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <span className="text-slate-500 text-[10px] block">Failed</span>
              <span className="font-bold text-red-400 text-sm">{job.failed_count}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
