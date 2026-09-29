import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Layers,
  Plus,
  Loader2
} from 'lucide-react';
import api from '../../../lib/axios';
import PageHeader from '../../../components/ui/PageHeader';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';

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
    primary_color: '#167C63'
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
      <PageHeader
        title="Payslip Document Templates"
        subtitle="Customize branding, color scheme, masked identity fields, and corporate footer disclosures."
        icon={Layers}
        actions={
          <Button icon={Plus} onClick={() => setShowModal(true)}>
            Create Template
          </Button>
        }
      />

      {/* Templates List */}
      {isLoading ? (
        <div className="p-12 text-center text-muted flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-brand" /> Loading templates...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates?.map((tpl) => (
            <Card key={tpl.id} className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-heading text-sm flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tpl.primary_color || '#167C63' }} />
                  {tpl.name}
                </h3>
                <Badge variant={tpl.status === 'ACTIVE' ? 'success' : 'neutral'}>
                  {tpl.status}
                </Badge>
              </div>

              <div className="text-xs text-muted space-y-1 font-mono bg-subtle p-3 rounded-lg border border-default">
                <div>Show Company Logo: <strong>{tpl.show_company_logo ? 'Yes' : 'No'}</strong></div>
                <div>Mask Bank Account: <strong>{tpl.mask_bank_account ? 'Yes (XXXX 1234)' : 'No'}</strong></div>
                <div>Mask PAN Number: <strong>{tpl.mask_pan ? 'Yes (XXXXX1234X)' : 'No'}</strong></div>
                <div>Employer Contributions: <strong>{tpl.show_employer_contributions ? 'Visible' : 'Hidden'}</strong></div>
              </div>

              <div className="p-3 bg-subtle border border-default rounded-lg text-[11px] text-muted italic">
                "{tpl.footer_text}"
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Create Payslip Template"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-muted mb-1 font-medium">Template Name</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-muted mb-1 font-medium">Header Statement</label>
              <Input
                type="text"
                value={formData.header_text}
                onChange={(e) => setFormData({ ...formData, header_text: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-muted mb-1 font-medium">Footer Disclosure Statement</label>
              <textarea
                rows={2}
                value={formData.footer_text}
                onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
                className="w-full bg-card border border-strong rounded-lg p-2.5 text-heading text-xs focus:ring-1 focus:ring-brand focus:border-brand"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-heading font-medium">
                <input
                  type="checkbox"
                  className="rounded border-strong text-brand focus:ring-brand"
                  checked={formData.mask_bank_account}
                  onChange={(e) => setFormData({ ...formData, mask_bank_account: e.target.checked })}
                />
                <span>Mask Bank Account</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-heading font-medium">
                <input
                  type="checkbox"
                  className="rounded border-strong text-brand focus:ring-brand"
                  checked={formData.mask_pan}
                  onChange={(e) => setFormData({ ...formData, mask_pan: e.target.checked })}
                />
                <span>Mask PAN Number</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-default">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createMutation.mutate()}
                loading={createMutation.isPending}
              >
                Save Template
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

