import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings,
  Save,
  Shield,
  FileText,
  Mail,
  Loader2
} from 'lucide-react';
import api from '../../../lib/axios';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

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
      <div className="p-12 text-center text-muted flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-brand" /> Loading settings...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Enterprise Payslip Configuration"
        subtitle="Configure security controls, auto-generation behavior, retention policies, and document numbering."
        icon={Settings}
      />

      {/* Settings Options */}
      <Card className="space-y-6 p-6">
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-heading uppercase tracking-wider flex items-center gap-2 border-b border-default pb-2">
            <Mail className="w-4 h-4 text-brand" /> Automated Delivery & Attachments
          </h2>

          <div className="space-y-3 text-xs">
            <label className="flex items-start gap-3 p-3 bg-subtle border border-default rounded-lg cursor-pointer hover:bg-page transition">
              <input
                type="checkbox"
                className="mt-0.5 rounded border-strong text-brand focus:ring-brand"
                checked={formData.auto_generate}
                onChange={(e) => setFormData({ ...formData, auto_generate: e.target.checked })}
              />
              <div>
                <span className="font-semibold text-heading block">Auto-generate payslips upon finalization</span>
                <span className="text-muted text-[11px]">Automatically trigger PDF document generation as soon as HR approves finalization.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 bg-subtle border border-default rounded-lg cursor-pointer hover:bg-page transition">
              <input
                type="checkbox"
                className="mt-0.5 rounded border-strong text-brand focus:ring-brand"
                checked={formData.auto_email}
                onChange={(e) => setFormData({ ...formData, auto_email: e.target.checked })}
              />
              <div>
                <span className="font-semibold text-heading block">Auto-email payslips to employees</span>
                <span className="text-muted text-[11px]">Send instant notification email when payslip is generated.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 bg-subtle border border-default rounded-lg cursor-pointer hover:bg-page transition">
              <input
                type="checkbox"
                className="mt-0.5 rounded border-strong text-brand focus:ring-brand"
                checked={formData.email_attachment}
                onChange={(e) => setFormData({ ...formData, email_attachment: e.target.checked })}
              />
              <div>
                <span className="font-semibold text-heading block">Attach PDF document to email</span>
                <span className="text-muted text-[11px]">Include the encrypted PDF directly as an email attachment.</span>
              </div>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-bold text-heading uppercase tracking-wider flex items-center gap-2 border-b border-default pb-2">
            <Shield className="w-4 h-4 text-emerald-600" /> Employee Self-Service Permissions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <label className="flex items-center gap-3 p-3 bg-subtle border border-default rounded-lg cursor-pointer hover:bg-page transition">
              <input
                type="checkbox"
                className="rounded border-strong text-brand focus:ring-brand"
                checked={formData.employee_download_enabled}
                onChange={(e) => setFormData({ ...formData, employee_download_enabled: e.target.checked })}
              />
              <span className="font-semibold text-heading">Allow Employees to Download PDF</span>
            </label>

            <label className="flex items-center gap-3 p-3 bg-subtle border border-default rounded-lg cursor-pointer hover:bg-page transition">
              <input
                type="checkbox"
                className="rounded border-strong text-brand focus:ring-brand"
                checked={formData.employee_print_enabled}
                onChange={(e) => setFormData({ ...formData, employee_print_enabled: e.target.checked })}
              />
              <span className="font-semibold text-heading">Allow Employees to Print Payslip</span>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-bold text-heading uppercase tracking-wider flex items-center gap-2 border-b border-default pb-2">
            <FileText className="w-4 h-4 text-purple-600" /> Numbering & Retention Policy
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-muted mb-1 font-medium">Payslip Number Format</label>
              <Input
                type="text"
                value={formData.number_format}
                onChange={(e) => setFormData({ ...formData, number_format: e.target.value })}
                className="font-mono"
              />
            </div>
            <div>
              <label className="block text-muted mb-1 font-medium">Document Retention (Years)</label>
              <Select
                value={formData.retention_years}
                onChange={(e) => setFormData({ ...formData, retention_years: parseInt(e.target.value) })}
              >
                <option value={3}>3 Years</option>
                <option value={5}>5 Years</option>
                <option value={7}>7 Years (Statutory Standard)</option>
                <option value={10}>10 Years</option>
              </Select>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-default flex justify-end">
          <Button
            onClick={() => updateMutation.mutate()}
            loading={updateMutation.isPending}
            icon={Save}
          >
            Save Configuration
          </Button>
        </div>
      </Card>
    </div>
  );
}

