import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  SlidersHorizontal,
  Play,
  Save,
  Download,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  Loader2
} from 'lucide-react';
import api from '../../lib/axios';
import { formatCurrency } from '../../services/financialCalculationService';

const DATA_SOURCES = [
  { id: 'EMPLOYEES', name: 'Employees Directory', fields: ['first_name', 'last_name', 'employee_code', 'email', 'status', 'joining_date'] },
  { id: 'PAYROLL', name: 'Payroll Run Calculations', fields: ['basic_salary', 'gross_earnings', 'total_deductions', 'net_salary', 'paid_days', 'lop_days'] },
  { id: 'ATTENDANCE', name: 'Attendance Records', fields: ['date', 'status', 'check_in', 'check_out', 'work_duration_minutes', 'overtime_minutes'] },
  { id: 'LEAVE', name: 'Leave Requests', fields: ['leave_type_id', 'start_date', 'end_date', 'total_days', 'status', 'reason'] },
  { id: 'PAYMENTS', name: 'Payment Transactions', fields: ['employee_name', 'bank_name', 'masked_account_number', 'amount', 'status'] }
];

export default function ReportBuilderPage() {
  const queryClient = useQueryClient();

  const [reportName, setReportName] = useState('Custom Workforce & Payroll Report');
  const [dataSource, setDataSource] = useState('PAYROLL');
  const [selectedFields, setSelectedFields] = useState([]);
  const [previewData, setPreviewData] = useState(null);

  // Execute Safe Query Mutation
  const executeMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/reports/builder/execute', {
        dataSource,
        selectedFields,
        filters: []
      });
      return res.data?.data || res.data || [];
    },
    onSuccess: (data) => {
      setPreviewData(data);
    }
  });

  // Save Report Config Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/reports/reports-save', {
        name: reportName,
        dataSource,
        selectedFields: selectedFields.length > 0 ? selectedFields : DATA_SOURCES.find((d) => d.id === dataSource)?.fields || [],
        visibility: 'COMPANY'
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-reports'] });
      alert('Custom report saved successfully.');
    }
  });

  // Export CSV Mutation
  const exportMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/reports/export', {
        reportName,
        dataSource
      });
      return res.data?.data || res.data;
    },
    onSuccess: (data) => {
      const csvContent = data.csvContent;
      if (csvContent) {
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', data.fileName || 'Report_Export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  });

  const activeSourceObj = DATA_SOURCES.find((d) => d.id === dataSource);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-blue-400" /> Custom Report Builder
          </h1>
          <p className="text-sm text-slate-400">
            Build, preview, save, and export safe parameterized reports without raw SQL risks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-2"
          >
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-emerald-400" />} Save Report
          </button>
          <button
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2"
          >
            {exportMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Export CSV
          </button>
        </div>
      </div>

      {/* Builder Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: Select Data Source & Name */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">1. Report Name & Data Source</h2>
          <div>
            <label className="block text-slate-400 text-xs mb-1">Report Title</label>
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-xs mb-1">Data Source</label>
            <select
              value={dataSource}
              onChange={(e) => {
                setDataSource(e.target.value);
                setSelectedFields([]);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-100 focus:outline-none font-semibold"
            >
              {DATA_SOURCES.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 2: Select Fields */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 md:col-span-2">
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">2. Choose Output Fields</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {activeSourceObj?.fields.map((f) => {
              const isChecked = selectedFields.includes(f);
              return (
                <label key={f} className={`p-2.5 rounded-lg border cursor-pointer text-xs transition ${
                  isChecked ? 'bg-blue-600/15 border-blue-500 text-blue-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={isChecked}
                    onChange={() => {
                      if (isChecked) setSelectedFields(selectedFields.filter((item) => item !== f));
                      else setSelectedFields([...selectedFields, f]);
                    }}
                  />
                  <span className="font-mono">{f}</span>
                </label>
              );
            })}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => executeMutation.mutate()}
              disabled={executeMutation.isPending}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-2"
            >
              {executeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />} Execute Query Preview
            </button>
          </div>
        </div>
      </div>

      {/* Query Preview Table */}
      {previewData && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Query Preview Results ({previewData.length} records)</h2>
          {previewData.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">No records matched report parameters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                  <tr>
                    {Object.keys(previewData[0]).slice(0, 8).map((col) => (
                      <th key={col} className="p-3">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {previewData.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition">
                      {Object.values(row).slice(0, 8).map((val, cIdx) => (
                        <td key={cIdx} className="p-3">
                          {typeof val === 'number' ? formatCurrency(val) : String(val ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
