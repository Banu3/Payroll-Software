import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings,
  Save,
  CheckCircle2,
  Shield,
  FileText,
  Mail,
  Lock,
  Loader2
} from 'lucide-react';
import api from '../../../lib/axios';

export default function PayslipSettingsPage() {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    auto_generate: false,
    auto_email: false,
    email_attachment: true,
    employee_download_enabled: true,
    employee_print_enabled: true,
    retention_years: 7,
    number_format: 'PS-{YYYY}-{MM}-{6DIGITS}',
    watermark_enabled: false,
    watermark_text: 'CONFIDENTIAL'
  });

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['payslip-settings'],
    queryFn: async () => {
      const res = await api.get('/payslips/settings');
      return res.data?.data || res.data;
    }
  });

  useEffect(() => {
    if (settingsData) {
      setFormData({
        auto_generate: !!settingsData.auto_generate,
        auto_email: !!settingsData.auto_email,
        email_attachment: settingsData.email_attachment !== false,
        employee_download_enabled: settingsData.employee_download_enabled !== false,
        employee_print_enabled: settingsData.employee_print_enabled !== false,
        retention_years: settingsData.retention_years || 7,
        number_format: settingsData.number_format || 'PS-{YYYY}-{MM}-{6DIGITS}',
        watermark_enabled: !!settingsData.watermark_enabled,
        watermark_text: settingsData.watermark_text || 'CONFIDENTIAL'
      });
    }
  }, [settingsData]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put('/payslips/settings', formData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payslip-settings'] });
      alert('Payslip settings updated successfully.');
    }
  });

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-blue-400" /> Loading settings...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-400" /> Enterprise Payslip Configuration
        </h1>
        <p className="text-sm text-slate-400">
          Configure security controls, auto-generation behavior, retention policies, and document numbering.
        </p>
      </div>

      {/* Settings Options */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
            <Mail className="w-4 h-4 text-blue-400" /> Automated Delivery & Attachments
          </h2>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={formData.auto_generate}
                onChange={(e) => setFormData({ ...formData, auto_generate: e.target.checked })}
              />
              <div>
                <span className="font-semibold text-slate-200 block">Auto-generate payslips upon finalization</span>
                <span className="text-slate-400 text-[11px]">Automatically trigger PDF document generation as soon as HR approves finalization.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={formData.auto_email}
                onChange={(e) => setFormData({ ...formData, auto_email: e.target.checked })}
              />
              <div>
                <span className="font-semibold text-slate-200 block">Auto-email payslips to employees</span>
                <span className="text-slate-400 text-[11px]">Send instant notification email when payslip is generated.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={formData.email_attachment}
                onChange={(e) => setFormData({ ...formData, email_attachment: e.target.checked })}
              />
              <div>
                <span className="font-semibold text-slate-200 block">Attach PDF document to email</span>
                <span className="text-slate-400 text-[11px]">Include the encrypted PDF directly as an email attachment.</span>
              </div>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
            <Shield className="w-4 h-4 text-emerald-400" /> Employee Self-Service Permissions
          </h2>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={formData.employee_download_enabled}
                onChange={(e) => setFormData({ ...formData, employee_download_enabled: e.target.checked })}
              />
              <span className="font-semibold text-slate-200">Allow Employees to Download PDF</span>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={formData.employee_print_enabled}
                onChange={(e) => setFormData({ ...formData, employee_print_enabled: e.target.checked })}
              />
              <span className="font-semibold text-slate-200">Allow Employees to Print Payslip</span>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
            <FileText className="w-4 h-4 text-purple-400" /> Numbering & Retention Policy
          </h2>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Payslip Number Format</label>
              <input
                type="text"
                value={formData.number_format}
                onChange={(e) => setFormData({ ...formData, number_format: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Document Retention (Years)</label>
              <select
                value={formData.retention_years}
                onChange={(e) => setFormData({ ...formData, retention_years: parseInt(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
              >
                <option value={3}>3 Years</option>
                <option value={5}>5 Years</option>
                <option value={7}>7 Years (Statutory Standard)</option>
                <option value={10}>10 Years</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-2"
          >
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
