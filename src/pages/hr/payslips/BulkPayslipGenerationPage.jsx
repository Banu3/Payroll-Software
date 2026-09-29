import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Sparkles,
  Play,
  Clock,
  Loader2
} from 'lucide-react';
import api from '../../../lib/axios';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Select from '../../../components/ui/Select';

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
      <PageHeader
        title="Bulk Payslip Generation Engine"
        subtitle="Execute asynchronous background generation of official payslips for all finalized employees."
        icon={Sparkles}
      />

      {/* Form Card */}
      <Card className="p-6 space-y-6">
        <div>
          <label className="block text-xs font-semibold text-muted mb-2">Select Finalized Payroll Run</label>
          {runsLoading ? (
            <div className="text-xs text-muted">Loading finalized runs...</div>
          ) : (
            <Select
              value={selectedRunId}
              onChange={(e) => setSelectedRunId(e.target.value)}
              className="font-mono"
            >
              <option value="">Select Payroll Run...</option>
              {runs?.map((r) => (
                <option key={r.id} value={r.id}>
                  Run #{r.run_number || r.id.slice(0, 8)} • Period: {r.payroll_period?.month_year || 'N/A'} • ({r.total_employees || 0} employees) [{r.status}]
                </option>
              ))}
            </Select>
          )}
        </div>

        <div className="flex items-center gap-3 p-4 bg-subtle border border-default rounded-lg">
          <input
            type="checkbox"
            id="autoEmail"
            checked={sendEmailImmediately}
            onChange={(e) => setSendEmailImmediately(e.target.checked)}
            className="w-4 h-4 rounded border-strong text-brand focus:ring-brand"
          />
          <label htmlFor="autoEmail" className="text-xs text-heading font-medium cursor-pointer">
            Automatically trigger email delivery to employee inbox upon generation
          </label>
        </div>

        <Button
          onClick={() => bulkGenMutation.mutate()}
          disabled={!selectedRunId || bulkGenMutation.isPending}
          loading={bulkGenMutation.isPending}
          icon={Play}
          className="w-full justify-center py-3"
        >
          Initialize Bulk Background Job
        </Button>
      </Card>

      {/* Real-time Job Progress Tracker */}
      {job && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-heading uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand" /> Background Job Tracker (ID: {job.id?.slice(0, 8)})
            </h2>
            <Badge variant={job.status === 'COMPLETED' ? 'success' : job.status === 'PROCESSING' ? 'brand' : 'warning'}>
              {job.status}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted font-mono">
              <span>Progress: {job.processed_count} / {job.total_employees} employees</span>
              <span>{Math.round(((job.processed_count || 0) / (job.total_employees || 1)) * 100)}%</span>
            </div>
            <div className="w-full h-2.5 bg-subtle rounded-full overflow-hidden border border-default">
              <div
                className="h-full bg-brand transition-all duration-300 rounded-full"
                style={{ width: `${Math.min(100, Math.round(((job.processed_count || 0) / (job.total_employees || 1)) * 100))}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono pt-2">
            <div className="p-3 bg-subtle border border-default rounded-lg">
              <span className="text-muted text-[10px] block">Total Included</span>
              <span className="font-bold text-heading text-sm">{job.total_employees}</span>
            </div>
            <div className="p-3 bg-subtle border border-default rounded-lg">
              <span className="text-muted text-[10px] block">Generated</span>
              <span className="font-bold text-emerald-700 text-sm">{job.success_count}</span>
            </div>
            <div className="p-3 bg-subtle border border-default rounded-lg">
              <span className="text-muted text-[10px] block">Failed</span>
              <span className="font-bold text-rose-700 text-sm">{job.failed_count}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

