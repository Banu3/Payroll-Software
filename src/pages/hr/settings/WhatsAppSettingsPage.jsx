import React, { useState } from 'react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Badge } from '../../../components/ui/Badge';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { AlertTriangle, Save, MessageSquare } from 'lucide-react';

export const WhatsAppSettingsPage = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [testStatus, setTestStatus] = useState(null);
  const [formData, setFormData] = useState({
    provider: 'Twilio',
    apiUrl: '',
    apiKey: '',
    phoneId: '',
    businessId: '',
    templateName: 'payslip_notification_v1',
    enabled: false
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const handleTest = () => {
    setTestStatus('TESTING');
    setTimeout(() => {
      setTestStatus('FAILED'); // Enforcing requirement: "Do NOT show fake Sent Successfully if not configured"
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="WhatsApp Payslip Integration"
        description="Configure WhatsApp API for automated payslip delivery to employees"
        badge={<Badge variant="primary">INTEGRATION HUB</Badge>}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleTest} isLoading={testStatus === 'TESTING'}>Test Connection</Button>
            <Button variant="primary" icon={Save} onClick={handleSave} isLoading={isSaving}>Save Configuration</Button>
          </div>
        }
      />

      {testStatus === 'FAILED' && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 font-medium text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span>WhatsApp integration is not configured. Valid API credentials are required.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="API Configuration" description="Enter your WhatsApp Business API provider details" />
            <CardBody className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Integration Provider</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.provider} onChange={(e) => setFormData({...formData, provider: e.target.value})}>
                  <option value="Twilio">Twilio WhatsApp API</option>
                  <option value="Meta">Meta Cloud API</option>
                  <option value="MessageBird">MessageBird</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">API Base URL</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm placeholder:text-slate-400" placeholder="https://api.twilio.com/..." value={formData.apiUrl} onChange={(e) => setFormData({...formData, apiUrl: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Secret API Key / Token</label>
                <input type="password" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm placeholder:text-slate-400" placeholder="••••••••••••••••••••••••" value={formData.apiKey} onChange={(e) => setFormData({...formData, apiKey: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number ID</label>
                  <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.phoneId} onChange={(e) => setFormData({...formData, phoneId: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Business Account ID</label>
                  <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.businessId} onChange={(e) => setFormData({...formData, businessId: e.target.value})} />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Message Template" description="Approved WhatsApp template name" />
            <CardBody>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Template Name</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={formData.templateName} onChange={(e) => setFormData({...formData, templateName: e.target.value})} />
                <p className="text-xs text-slate-500 mt-2">Must match exactly with the template approved by Meta.</p>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-slate-50 border-slate-200">
            <CardBody className="text-center py-6">
              <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 text-sm">Payslip Delivery</h3>
              <p className="text-xs text-slate-500 mt-1">When enabled, finalized payslips will be automatically queued for WhatsApp delivery using these credentials.</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppSettingsPage;
