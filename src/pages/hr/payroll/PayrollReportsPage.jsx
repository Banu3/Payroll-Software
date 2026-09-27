import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Download,
  Calendar,
  Building,
  ShieldCheck,
  DollarSign,
  PieChart,
  BarChart3,
  Loader2
} from 'lucide-react';
import api from '../../../lib/axios';

const REPORT_TYPES = [
  { id: 'REGISTER', name: 'Master Payroll Register', desc: 'Complete breakdown of all earnings, statutory deductions, and net pay' },
  { id: 'PF', name: 'Provident Fund (PF) ECR Report', desc: 'Employee and employer PF contribution schedule for EPFO filing' },
  { id: 'ESI', name: 'ESI Statutory Return', desc: 'Employee State Insurance monthly wage and contribution declaration' },
  { id: 'PT', name: 'Professional Tax (PT) Report', desc: 'State-wise PT deduction breakdown based on salary slabs' },
  { id: 'TDS', name: 'Income Tax (TDS) Report', desc: 'Monthly TDS deductions and projected tax liabilities for Form 24Q' },
  { id: 'DEPT', name: 'Department Payroll Cost', desc: 'Departmental salary expenses, overtime, and employer CTC contributions' }
];

export default function PayrollReportsPage() {
  const [selectedReport, setSelectedReport] = useState('REGISTER');
  const [period, setPeriod] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });

  // Fetch Report Data
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['payroll-report', selectedReport, period.year, period.month],
    queryFn: async () => {
      const res = await api.get(`/payroll-processing/reports?type=${selectedReport}&year=${period.year}&month=${period.month}`);
      return res.data?.data || res.data || [];
    }
  });

  // CSV Export Generator
  const handleExportCSV = () => {
    if (!reportData || !reportData.length) return;

    const firstItem = reportData[0];
    const keys = Object.keys(firstItem);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [keys.join(','), ...reportData.map((row) => keys.map((k) => `"${row[k] ?? ''}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedReport}_Report_${period.month}_${period.year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-400" /> Enterprise Statutory & Payroll Reports
          </h1>
          <p className="text-sm text-slate-400">
            Export EPFO ECR, ESI Returns, Professional Tax Slabs, and Form 24Q TDS summaries.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={!reportData || !reportData.length}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Export CSV Report
        </button>
      </div>

      {/* Report Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {REPORT_TYPES.map((rep) => (
          <div
            key={rep.id}
            onClick={() => setSelectedReport(rep.id)}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              selectedReport === rep.id
                ? 'bg-blue-600/15 border-blue-500 text-blue-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <h3 className="font-bold text-xs text-slate-200 mb-1">{rep.name}</h3>
            <p className="text-[11px] opacity-75">{rep.desc}</p>
          </div>
        ))}
      </div>

      {/* Period Filter */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
        <span className="text-xs font-semibold text-slate-400">Select Payroll Period:</span>
        <select
          value={period.month}
          onChange={(e) => setPeriod({ ...period, month: parseInt(e.target.value) })}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>
              {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'Long' })}
            </option>
          ))}
        </select>
        <select
          value={period.year}
          onChange={(e) => setPeriod({ ...period, year: parseInt(e.target.value) })}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
        >
          {[2024, 2025, 2026, 2027].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Report Preview */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-400" /> Generating report data...
        </div>
      ) : !reportData || reportData.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-sm">
          No records generated for {selectedReport} in {new Date(2000, period.month - 1, 1).toLocaleString('default', { month: 'long' })} {period.year}.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                {Object.keys(reportData[0]).map((col) => (
                  <th key={col} className="p-3 capitalize">{col.replace(/_/g, ' ')}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {reportData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition">
                  {Object.values(row).map((val, cIdx) => (
                    <td key={cIdx} className="p-3">
                      {typeof val === 'number' ? `₹${val.toLocaleString()}` : String(val ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
