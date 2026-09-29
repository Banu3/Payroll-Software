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
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-[#17221C]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#DCE5E0]">
        <div>
          <h1 className="text-2xl font-bold text-[#17221C] flex items-center gap-2 tracking-tight">
            <FileSpreadsheet className="w-6 h-6 text-[#167C63]" /> Enterprise Reports Center & Saved Library
          </h1>
          <p className="text-xs text-[#526158] font-medium mt-1">
            Access pre-built compliance ledgers, saved custom reports, scheduled distributions, and export archives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/reports/builder')}
            className="px-4 py-2 bg-[#167C63] hover:bg-[#11664F] text-white text-xs font-semibold rounded-[9px] flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Open Report Builder
          </button>
          <button
            onClick={() => navigate('/reports/exports')}
            className="px-4 py-2 bg-white hover:bg-[#EEF3F0] text-[#17221C] text-xs font-semibold rounded-[9px] border border-[#DCE5E0] flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#167C63]" /> Export Center
          </button>
        </div>
      </div>

      {/* Saved Reports Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-[#65736B] flex items-center justify-center gap-2 font-medium text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-[#167C63]" /> Loading saved reports...
        </div>
      ) : !reports || reports.length === 0 ? (
        <div className="bg-white border border-[#DCE5E0] rounded-[14px] p-12 text-center text-[#526158] text-xs space-y-3 shadow-[0_4px_16px_rgba(20,50,35,0.05)]">
          <p className="font-medium text-[#17221C]">No custom saved reports in your library yet.</p>
          <button
            onClick={() => navigate('/reports/builder')}
            className="px-4 py-2 bg-[#167C63] hover:bg-[#11664F] text-white text-xs font-semibold rounded-[9px] cursor-pointer"
          >
            Build First Report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reports.map((rep) => (
            <div key={rep.id} className="bg-white border border-[#DCE5E0] rounded-[14px] p-5 space-y-3 flex flex-col justify-between shadow-[0_4px_16px_rgba(20,50,35,0.05)]">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-[#167C63] uppercase tracking-wider font-mono">{rep.data_source}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EEF3F0] text-[#526158] border border-[#DCE5E0]">
                    {rep.visibility}
                  </span>
                </div>
                <h3 className="font-bold text-[#17221C] text-sm">{rep.name}</h3>
                <p className="text-xs text-[#526158] line-clamp-2 mt-1">{rep.description || 'Custom company analysis report'}</p>
              </div>

              <div className="pt-3 border-t border-[#E8EEEA] flex items-center justify-between text-xs">
                <span className="text-[#65736B] font-mono text-[10px] font-medium">Updated: {new Date(rep.updated_at).toLocaleDateString()}</span>
                <button
                  onClick={() => navigate('/reports/builder')}
                  className="px-3 py-1 bg-[#E5F4EE] hover:bg-[#D4EFE4] text-[#167C63] text-[11px] font-semibold rounded-[6px] border border-[#BCE3D4] cursor-pointer"
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
