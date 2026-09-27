import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Layers,
  Plus,
  CheckCircle2,
  Settings,
  Eye,
  Building,
  Loader2
} from 'lucide-react';
import api from '../../../lib/axios';

export default function PayslipTemplatesPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: 'Corporate Standard v2',
    status: 'ACTIVE',
    show_company_logo: true,
    show_employer_contributions: true,
    show_attendance_summary: true,
    show_tax_details: true,
    show_bank_details: true,
    mask_bank_account: true,
    mask_pan: true,
    header_text: 'CONFIDENTIAL PAYSLIP STATEMENT',
    footer_text: 'This is a computer-generated document and does not require a physical signature.',
    primary_color: '#2563eb'
  });

  const { data: templates, isLoading } = useQuery({
    queryKey: ['payslip-templates'],
    queryFn: async () => {
      const res = await api.get('/payslips/templates');
      return res.data?.data || res.data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/payslips/templates', formData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payslip-templates'] });
      setShowModal(false);
    }
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-400" /> Payslip Document Templates
          </h1>
          <p className="text-sm text-slate-400">
            Customize branding, color scheme, masked identity fields, and corporate footer disclosures.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Template
        </button>
      </div>

      {/* Templates List */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-400" /> Loading templates...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates?.map((tpl) => (
            <div key={tpl.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tpl.primary_color }} />
                  {tpl.name}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {tpl.status}
                </span>
              </div>

              <div className="text-xs text-slate-400 space-y-1 font-mono">
                <div>Show Company Logo: <strong>{tpl.show_company_logo ? 'Yes' : 'No'}</strong></div>
                <div>Mask Bank Account: <strong>{tpl.mask_bank_account ? 'Yes (XXXX 1234)' : 'No'}</strong></div>
                <div>Mask PAN Number: <strong>{tpl.mask_pan ? 'Yes (XXXXX1234X)' : 'No'}</strong></div>
                <div>Employer Contributions: <strong>{tpl.show_employer_contributions ? 'Visible' : 'Hidden'}</strong></div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-400 italic">
                "{tpl.footer_text}"
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-4">
            <h2 className="text-lg font-bold text-slate-100">Create Payslip Template</h2>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Template Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Header Statement</label>
                <input
                  type="text"
                  value={formData.header_text}
                  onChange={(e) => setFormData({ ...formData, header_text: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Footer Disclosure Statement</label>
                <textarea
                  rows={2}
                  value={formData.footer_text}
                  onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.mask_bank_account}
                    onChange={(e) => setFormData({ ...formData, mask_bank_account: e.target.checked })}
                  />
                  <span>Mask Bank Account</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.mask_pan}
                    onChange={(e) => setFormData({ ...formData, mask_pan: e.target.checked })}
                  />
                  <span>Mask PAN Number</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
