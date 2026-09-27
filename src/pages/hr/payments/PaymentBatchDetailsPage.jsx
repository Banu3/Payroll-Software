import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreditCard,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  RefreshCw,
  Send,
  Building,
  ShieldCheck,
  Search,
  Loader2
} from 'lucide-react';
import api from '../../../lib/axios';

export default function PaymentBatchDetailsPage() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [downloadNotice, setDownloadNotice] = useState(null);

  // Fetch Batch Details
  const { data: batchData, isLoading, refetch } = useQuery({
    queryKey: ['payment-batch-details', batchId],
    queryFn: async () => {
      const res = await api.get(`/payments/batches/${batchId}`);
      return res.data?.data || res.data;
    }
  });

  // Approve Batch Mutation
  const approveMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/payments/batches/${batchId}/approve`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-batch-details', batchId] });
      refetch();
    }
  });

  // Generate Bank Transfer File Mutation
  const generateFileMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/payments/batches/${batchId}/generate-file`, { fileFormat: 'CSV' });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payment-batch-details', batchId] });
      setDownloadNotice(data.message || 'Bank transfer file generated. Upload this file through your bank’s authorized portal.');

      // Trigger file download in browser
      const csvText = data.data?.csvText;
      if (csvText) {
        const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvText);
        const link = document.createElement('a');
        link.setAttribute('href', csvContent);
        link.setAttribute('download', data.data?.fileRecord?.file_name || 'Bank_Transfer.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      refetch();
    }
  });

  // Reconcile Batch Mutation
  const reconcileMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/payments/batches/${batchId}/reconcile`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-batch-details', batchId] });
      refetch();
    }
  });

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-blue-400" /> Loading payment batch details...
      </div>
    );
  }

  if (!batchData || !batchData.batch) {
    return (
      <div className="p-8 text-center text-slate-400">
        Payment batch not found.
      </div>
    );
  }

  const { batch, items = [] } = batchData;

  const filteredItems = items.filter((item) => {
    const name = (item.employee_name || '').toLowerCase();
    const bank = (item.bank_name || '').toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || bank.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-100 font-mono">
              Batch #{batch.batch_number}
            </h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
              batch.status === 'RECONCILED' || batch.status === 'COMPLETED'
                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                : batch.status === 'SUBMITTED'
                ? 'bg-blue-950 text-blue-400 border-blue-800'
                : 'bg-amber-950 text-amber-400 border-amber-800'
            }`}>
              {batch.status}
            </span>
          </div>
          <p className="text-sm text-slate-400 flex items-center gap-4">
            <span>Bank: <strong>{batch.company_bank_accounts?.bank_name || 'Default Debit Account'}</strong></span>
            <span>•</span>
            <span>Net Amount: <strong className="text-emerald-400 font-mono">₹{Number(batch.total_net_amount || 0).toLocaleString()}</strong></span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          {batch.status === 'DRAFT' && (
            <button
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-2"
            >
              {approveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Approve Payment Batch
            </button>
          )}

          {(batch.status === 'READY' || batch.status === 'SUBMITTED') && (
            <button
              onClick={() => generateFileMutation.mutate()}
              disabled={generateFileMutation.isPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-2"
            >
              {generateFileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Generate & Download Bank File
            </button>
          )}

          {batch.status === 'SUBMITTED' && (
            <button
              onClick={() => reconcileMutation.mutate()}
              disabled={reconcileMutation.isPending}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-2"
            >
              {reconcileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Reconcile Bank Outcomes
            </button>
          )}
        </div>
      </div>

      {/* Notice Banner */}
      {downloadNotice && (
        <div className="p-4 bg-blue-950/40 border border-blue-800/60 rounded-xl text-xs text-blue-300 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 block font-semibold mb-1">Total Instructions</span>
          <span className="text-2xl font-bold text-slate-100">{batch.total_employees} staff</span>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 block font-semibold mb-1">Ready with Valid Bank</span>
          <span className="text-2xl font-bold text-emerald-400">{batch.valid_bank_count} staff</span>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 block font-semibold mb-1">Rejected / Missing Details</span>
          <span className="text-2xl font-bold text-red-400">{batch.invalid_bank_count} staff</span>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Employee Bank Instructions</h2>
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search employee..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Employee Name</th>
                <th className="p-3">Bank Name</th>
                <th className="p-3">Masked Account</th>
                <th className="p-3">IFSC Code</th>
                <th className="p-3">Net Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Failure Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-sans font-semibold text-slate-100">{item.employee_name}</td>
                  <td className="p-3 font-sans text-slate-400">{item.bank_name}</td>
                  <td className="p-3 text-slate-200">{item.masked_account_number}</td>
                  <td className="p-3 text-slate-300">{item.ifsc_code}</td>
                  <td className="p-3 text-emerald-400 font-bold">₹{Number(item.amount || 0).toLocaleString()}</td>
                  <td className="p-3 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      item.status === 'READY' || item.status === 'SUCCESS' || item.status === 'RECONCILED'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : 'bg-red-950 text-red-400 border-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3 font-sans text-red-400 text-[11px]">{item.failure_reason || 'None'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
