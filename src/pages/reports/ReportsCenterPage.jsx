import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FileSpreadsheet,
  Plus,
  Clock,
  Download,
  SlidersHorizontal,
  Layers,
  Sparkles,
  Loader2
} from 'lucide-react';
import api from '../../lib/axios';

export default function ReportsCenterPage() {
  const navigate = useNavigate();

  // Fetch Saved Reports
  const { data: reports, isLoading } = useQuery({
    queryKey: ['saved-reports'],
    queryFn: async () => {
      const res = await api.get('/reports/reports-list');
      return res.data?.data || res.data || [];
    }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-teal-600" /> Enterprise Reports Center & Saved Library
          </h1>
          <p className="text-sm text-slate-700 font-medium">
            Access pre-built compliance ledgers, saved custom reports, scheduled distributions, and export archives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/reports/builder')}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Open Report Builder
          </button>
          <button
            onClick={() => navigate('/reports/exports')}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg border border-[#E5E7EB] flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" /> Export Center
          </button>
        </div>
      </div>

      {/* Saved Reports Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-600 flex items-center justify-center gap-2 font-medium">
          <Loader2 className="w-5 h-5 animate-spin text-teal-600" /> Loading saved reports...
        </div>
      ) : !reports || reports.length === 0 ? (
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-12 text-center text-slate-700 text-sm space-y-3 shadow-xs">
          <p className="font-medium">No custom saved reports in your library yet.</p>
          <button
            onClick={() => navigate('/reports/builder')}
            className="px-4 py-2 bg-teal-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            Build First Report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reports.map((rep) => (
            <div key={rep.id} className="bg-white border border-[#E5E7EB] rounded-xl p-5 space-y-3 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider font-mono">{rep.data_source}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                    {rep.visibility}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{rep.name}</h3>
                <p className="text-xs text-slate-700 line-clamp-2 mt-1">{rep.description || 'Custom company analysis report'}</p>
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                <span className="text-slate-600 font-mono text-[10px] font-medium">Updated: {new Date(rep.updated_at).toLocaleDateString()}</span>
                <button
                  onClick={() => navigate('/reports/builder')}
                  className="px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-semibold rounded border border-teal-200 cursor-pointer"
                >
                  Run Report
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
