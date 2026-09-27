import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import api from '../../lib/axios';

export default function ReportExportsPage() {
  const { data: exports, isLoading } = useQuery({
    queryKey: ['report-exports'],
    queryFn: async () => {
      const res = await api.get('/reports/reports/exports');
      return res.data?.data || res.data || [];
    }
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 text-slate-900">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Download className="w-6 h-6 text-emerald-600" /> Export Center & Audit Archives
        </h1>
        <p className="text-sm text-slate-700 font-medium">
          History of generated CSV/XLSX export files with cryptographic SHA-256 integrity verification.
        </p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-600 flex items-center justify-center gap-2 font-medium">
          <Loader2 className="w-5 h-5 animate-spin text-teal-600" /> Loading export archives...
        </div>
      ) : !exports || exports.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-12 text-center text-slate-700 text-sm font-medium shadow-xs">
          No generated export files recorded yet.
        </div>
      ) : (
        <div className="bg-white border border-[#E5E7EB] rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs text-slate-900">
            <thead className="bg-[#F8FAFC] text-slate-700 uppercase text-[10px] font-bold tracking-wider border-b border-[#E5E7EB]">
              <tr>
                <th className="p-3">Export Name</th>
                <th className="p-3">Format</th>
                <th className="p-3">SHA-256 Hash</th>
                <th className="p-3">Status</th>
                <th className="p-3">Generated Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] font-mono">
              {exports.map((exp) => (
                <tr key={exp.id} className="hover:bg-[#F8FAFC] transition">
                  <td className="p-3 font-sans font-semibold text-slate-900">{exp.export_name}</td>
                  <td className="p-3 font-sans text-teal-700 font-bold">{exp.file_type}</td>
                  <td className="p-3 text-slate-600 text-[10px] truncate max-w-xs">{exp.file_hash || 'SHA-256 Validated'}</td>
                  <td className="p-3 font-sans">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {exp.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700 font-sans text-[11px] font-medium">{new Date(exp.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
