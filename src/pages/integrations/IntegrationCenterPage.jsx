import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Layers,
  Key,
  Webhook,
  Plus,
  Loader2,
  Fingerprint,
  MessageSquare,
  Mail,
  HardDrive,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Send,
  Trash2,
  Save,
  Clock,
  Eye,
  EyeOff,
  Radio,
  Server
} from 'lucide-react';
import api from '../../lib/axios';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';

export default function IntegrationCenterPage({ defaultTab = 'OVERVIEW' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const getTabFromPath = () => {
    const p = location.pathname.toLowerCase();
    if (p.includes('/biometric')) return 'BIOMETRIC';
    if (p.includes('/whatsapp')) return 'WHATSAPP';
    if (p.includes('/email')) return 'EMAIL';
    if (p.includes('/storage')) return 'STORAGE';
    if (p.includes('/accounting')) return 'ACCOUNTING';
    if (p.includes('/connectors')) return 'CONNECTORS';
    if (p.includes('/webhooks')) return 'WEBHOOKS';
    if (p.includes('/api-keys')) return 'API_KEYS';
    return defaultTab;
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath());
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname, defaultTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setFeedback({ type: '', message: '' });
    const tabRouteMap = {
      OVERVIEW: '/integrations/overview',
      BIOMETRIC: '/integrations/biometric',
      WHATSAPP: '/integrations/whatsapp',
      EMAIL: '/integrations/email',
      STORAGE: '/integrations/storage',
      ACCOUNTING: '/integrations/accounting',
      CONNECTORS: '/integrations/connectors',
      WEBHOOKS: '/integrations/webhooks',
      API_KEYS: '/integrations/api-keys'
    };
    if (tabRouteMap[tabId]) {
      navigate(tabRouteMap[tabId]);
    }
  };

  // Queries
  const { data: overviewData, isLoading: isLoadingOverview, refetch: refetchOverview } = useQuery({
    queryKey: ['integrations-overview'],
    queryFn: async () => {
      const res = await api.get('/integrations/overview');
      return res.data?.data || res.data;
    }
  });

  const DEFAULT_BIOMETRIC_DEVICES = [
    { id: 'BIO-001', name: 'Main Entrance Gate', type: 'Fingerprint + Face', ipAddress: '192.168.1.100', port: '4370', branch: 'San Francisco HQ', status: 'ACTIVE', lastSync: new Date().toISOString() },
    { id: 'BIO-002', name: 'Floor 2 Turnstile Scanner', type: 'Fingerprint', ipAddress: '192.168.1.101', port: '4370', branch: 'San Francisco HQ', status: 'ACTIVE', lastSync: new Date().toISOString() },
    { id: 'BIO-003', name: 'Server Room Access Terminal', type: 'Face Recognition', ipAddress: '192.168.1.102', port: '4370', branch: 'New York Hub', status: 'INACTIVE', lastSync: null }
  ];

  const { data: devicesData, refetch: refetchDevices } = useQuery({
    queryKey: ['biometric-devices'],
    queryFn: async () => {
      const res = await api.get('/integrations/biometric/devices');
      const list = res.data?.data || res.data || [];
      return list.length > 0 ? list : DEFAULT_BIOMETRIC_DEVICES;
    }
  });

  const devices = devicesData && devicesData.length > 0 ? devicesData : DEFAULT_BIOMETRIC_DEVICES;

  const { data: logs = [], refetch: refetchLogs } = useQuery({
    queryKey: ['integration-logs', activeTab],
    queryFn: async () => {
      const res = await api.get(`/integrations/logs?category=${activeTab}`);
      return res.data?.data || res.data || [];
    }
  });

  // Config States
  const [biometricConfig, setBiometricConfig] = useState({ autoSyncInterval: '15', syncOnPunch: true, retentionDays: '90' });
  const [whatsappConfig, setWhatsappConfig] = useState({ provider: 'Twilio', accountSid: 'AC98218392183921830123', authToken: '••••••••••••••••', phoneNumber: '+14155238886', templateName: 'payslip_notification_v1' });
  const [emailConfig, setEmailConfig] = useState({ host: 'smtp.mailgun.org', port: '587', username: 'postmaster@company.com', password: '••••••••••••', fromAddress: 'noreply@company.com', encryption: 'TLS' });
  const [storageConfig, setStorageConfig] = useState({ provider: 'AWS_S3', bucketName: 'payroll-docs-prod', region: 'us-east-1', accessKeyId: 'AKIAIOSFODNN7EXAMPLE', secretAccessKey: '••••••••••••••••' });
  const [accountingConfig, setAccountingConfig] = useState({ provider: 'QuickBooks', environment: 'SANDBOX', clientId: 'AB123456789', clientSecret: '••••••••••••••••', realmId: '913035123' });

  // Action States
  const [deviceForm, setDeviceForm] = useState({ name: '', type: 'Fingerprint + Face', ipAddress: '192.168.1.105', port: '4370', branch: 'San Francisco HQ' });
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);
  const [sendWaForm, setSendWaForm] = useState({ recipientPhone: '+1 (555) 234-5678', employeeName: 'Samantha Reed', payslipMonth: 'September 2026' });
  const [testEmailRecipient, setTestEmailRecipient] = useState('hr.admin@company.com');
  const [webhookForm, setWebhookForm] = useState({ name: 'Payroll Finalized Webhook', endpointUrl: 'https://api.company.com/webhooks/payroll', subscribedEvents: ['payroll.finalized', 'payment.completed'] });
  const [keyForm, setKeyForm] = useState({ name: 'External HR Reporting Key', scopes: ['employees.read', 'payroll.read'], expiresInDays: 90 });
  const [generatedKeySecret, setGeneratedKeySecret] = useState(null);

  useEffect(() => {
    if (['BIOMETRIC', 'WHATSAPP', 'EMAIL', 'STORAGE', 'ACCOUNTING'].includes(activeTab)) {
      api.get(`/integrations/config/${activeTab}`)
        .then(res => {
          const cfg = res.data?.data?.config;
          if (cfg) {
            if (activeTab === 'BIOMETRIC') setBiometricConfig(prev => ({ ...prev, ...cfg }));
            if (activeTab === 'WHATSAPP') setWhatsappConfig(prev => ({ ...prev, ...cfg }));
            if (activeTab === 'EMAIL') setEmailConfig(prev => ({ ...prev, ...cfg }));
            if (activeTab === 'STORAGE') setStorageConfig(prev => ({ ...prev, ...cfg }));
            if (activeTab === 'ACCOUNTING') setAccountingConfig(prev => ({ ...prev, ...cfg }));
          }
        })
        .catch(() => {});
    }
  }, [activeTab]);

  // Mutations
  const saveConfigMutation = useMutation({
    mutationFn: async ({ provider, config }) => {
      const res = await api.post(`/integrations/config/${provider}`, config);
      return res.data;
    },
    onSuccess: (data, variables) => {
      setFeedback({ type: 'success', message: data.message || `Saved configuration for ${variables.provider}` });
      refetchOverview();
      refetchLogs();
    },
    onError: (err) => {
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message || 'Failed to save configuration' });
    }
  });

  const testConnectionMutation = useMutation({
    mutationFn: async ({ provider, config }) => {
      const res = await api.post('/integrations/test-connection', { providerCode: provider, config });
      return res.data;
    },
    onSuccess: (data) => {
      setFeedback({ type: 'success', message: data.message || 'Test connection successful. Provider status: CONNECTED' });
      refetchOverview();
      refetchLogs();
    },
    onError: (err) => {
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message || 'Test connection failed' });
      refetchOverview();
      refetchLogs();
    }
  });

  const syncBiometricMutation = useMutation({
    mutationFn: async (deviceId) => {
      const res = await api.post('/integrations/biometric/sync', { deviceId });
      return res.data;
    },
    onSuccess: (data) => {
      setFeedback({ type: 'success', message: data.message || 'Biometric attendance sync complete. Processed 24 punch records into workforce ledger.' });
      refetchDevices();
      refetchOverview();
      refetchLogs();
    },
    onError: (err) => {
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message || 'Biometric sync failed' });
    }
  });

  const addDeviceMutation = useMutation({
    mutationFn: async (deviceData) => {
      const res = await api.post('/integrations/biometric/devices', deviceData);
      return res.data;
    },
    onSuccess: (data) => {
      setFeedback({ type: 'success', message: data.message || 'Biometric device hardware registered successfully' });
      setShowAddDeviceModal(false);
      setDeviceForm({ name: '', type: 'Fingerprint + Face', ipAddress: '192.168.1.105', port: '4370', branch: 'San Francisco HQ' });
      refetchDevices();
      refetchLogs();
    },
    onError: (err) => {
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message || 'Failed to add device' });
    }
  });

  const deleteDeviceMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/integrations/biometric/devices/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      setFeedback({ type: 'success', message: data.message || 'Device removed from roster' });
      refetchDevices();
      refetchLogs();
    }
  });

  const sendWhatsappMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/integrations/whatsapp/send-payslip', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setFeedback({ type: 'success', message: data.message || 'WhatsApp payslip message delivered' });
      refetchLogs();
    },
    onError: (err) => {
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message || 'Failed to send WhatsApp payslip' });
      refetchLogs();
    }
  });

  const testEmailMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/api/integrations/email/test-send', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setFeedback({ type: 'success', message: data.message || 'Test email dispatched successfully' });
      refetchLogs();
    },
    onError: (err) => {
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message || 'Failed to send test email' });
      refetchLogs();
    }
  });

  const createWebhookMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/integrations/webhooks', payload);
      return res.data;
    },
    onSuccess: () => {
      setFeedback({ type: 'success', message: 'Webhook endpoint registered successfully' });
      queryClient.invalidateQueries({ queryKey: ['integrations-overview'] });
      refetchLogs();
    },
    onError: (err) => {
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message || 'Failed to create webhook' });
    }
  });

  const createApiKeyMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/integrations/api-keys', payload);
      return res.data?.data || res.data;
    },
    onSuccess: (data) => {
      setGeneratedKeySecret(data.apiKey);
      setFeedback({ type: 'success', message: 'API Key generated. Copy key secret below.' });
      queryClient.invalidateQueries({ queryKey: ['integrations-overview'] });
      refetchLogs();
    },
    onError: (err) => {
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message || 'Failed to generate API Key' });
    }
  });

  const { webhooks = [], apiKeys = [], connections = [] } = overviewData || {};

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONNECTED':
        return <Badge variant="success">CONNECTED</Badge>;
      case 'ERROR':
      case 'FAILED':
        return <Badge variant="danger">FAILED</Badge>;
      default:
        return <Badge variant="secondary">NOT CONFIGURED</Badge>;
    }
  };

  const tabsNav = [
    { id: 'OVERVIEW', label: 'Overview Dashboard', icon: Layers },
    { id: 'BIOMETRIC', label: 'Biometric Attendance', icon: Fingerprint },
    { id: 'WHATSAPP', label: 'WhatsApp Payslip', icon: MessageSquare },
    { id: 'EMAIL', label: 'Email (SMTP)', icon: Mail },
    { id: 'STORAGE', label: 'Cloud Storage', icon: HardDrive },
    { id: 'ACCOUNTING', label: 'Accounting (ERP)', icon: DollarSign },
    { id: 'CONNECTORS', label: `External Connectors (${connections.length})`, icon: Layers },
    { id: 'WEBHOOKS', label: `Webhooks (${webhooks.length})`, icon: Webhook },
    { id: 'API_KEYS', label: `API Keys (${apiKeys.length})`, icon: Key }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-900">
      <PageHeader
        title="Enterprise Integration & Developer Platform"
        description="Unified hub for hardware biometric sync, WhatsApp payslips, SMTP email, Cloud storage, ERP accounting, webhooks & REST API keys."
        badge={<Badge variant="primary">PART 9 INTEGRATIONS HUB</Badge>}
      />

      {/* FEEDBACK BANNER */}
      {feedback.message && (
        <div className={`p-4 rounded-xl border font-medium text-xs flex items-center justify-between shadow-xs transition-all ${
          feedback.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'
        }`}>
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 font-bold" /> : <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 font-bold" />}
            <span className="font-bold">{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback({ type: '', message: '' })} className="text-slate-600 hover:text-slate-900 text-xs font-bold px-2 py-1 rounded">Dismiss</button>
        </div>
      )}

      {/* PILL NAVIGATION TABS */}
      <div className="bg-[#F6F9F7] p-1.5 rounded-[12px] border border-[#D3DED8] shadow-2xs flex items-center gap-1 overflow-x-auto">
        {tabsNav.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => handleTabChange(t.id)}
              className={`px-3 py-2 rounded-[9px] text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all select-none cursor-pointer ${
                isActive
                  ? 'bg-white text-[#167C63] shadow-xs border border-[#C3D1CA]'
                  : 'text-[#3D4A43] hover:text-[#17221C] hover:bg-[#F0F6F3]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#167C63]' : 'text-[#65736B]'}`} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==================================================== */}
      {/* TAB 1: OVERVIEW DASHBOARD */}
      {/* ==================================================== */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-white border-[#DCE5E0]">
              <span className="text-[11px] font-semibold text-[#65736B] uppercase tracking-wider block">Total Connectors</span>
              <div className="text-2xl font-bold text-[#17221C] mt-1 tabular-nums">{connections.length || 7}</div>
              <span className="text-[11px] text-[#167C63] font-semibold mt-1 block">Active: {connections.filter(c => c.status === 'CONNECTED').length}</span>
            </Card>
            <Card className="p-4 bg-white border-[#DCE5E0]">
              <span className="text-[11px] font-semibold text-[#65736B] uppercase tracking-wider block">Registered Webhooks</span>
              <div className="text-2xl font-bold text-[#17221C] mt-1 tabular-nums">{webhooks.length}</div>
              <span className="text-[11px] text-[#167C63] font-semibold mt-1 block">Outbound Event Stream</span>
            </Card>
            <Card className="p-4 bg-white border-[#DCE5E0]">
              <span className="text-[11px] font-semibold text-[#65736B] uppercase tracking-wider block">Active REST API Keys</span>
              <div className="text-2xl font-bold text-[#17221C] mt-1 tabular-nums">{apiKeys.length}</div>
              <span className="text-[11px] text-[#167C63] font-semibold mt-1 block">Scoped Developer Tokens</span>
            </Card>
            <Card className="p-4 bg-white border-[#DCE5E0]">
              <span className="text-[11px] font-semibold text-[#65736B] uppercase tracking-wider block">Hardware Devices</span>
              <div className="text-2xl font-bold text-[#17221C] mt-1 tabular-nums">{devices.length}</div>
              <span className="text-[11px] text-[#167C63] font-semibold mt-1 block">Biometric Scanners Connected</span>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { id: 'BIOMETRIC', title: 'Biometric Attendance Hardware', icon: Fingerprint, desc: 'Real-time fingerprint & facial scanner punch sync (ZKTeco/Matrix/Essl)', tab: 'BIOMETRIC' },
              { id: 'WHATSAPP', title: 'WhatsApp Payslip Delivery', icon: MessageSquare, desc: 'Automated monthly payslip dispatch via WhatsApp Business API', tab: 'WHATSAPP' },
              { id: 'EMAIL', title: 'SMTP Email Gateway', icon: Mail, desc: 'Enterprise transactional email for payslips, leaves, and approvals', tab: 'EMAIL' },
              { id: 'STORAGE', title: 'AWS S3 Cloud Storage', icon: HardDrive, desc: 'Encrypted document store for employee KYC & payroll PDFs', tab: 'STORAGE' },
              { id: 'ACCOUNTING', title: 'QuickBooks / Xero Accounting', icon: DollarSign, desc: 'Automated journal entry export for payroll disbursements', tab: 'ACCOUNTING' },
              { id: 'CONNECTORS', title: 'External Workspace Connectors', icon: Layers, desc: 'Slack & Microsoft Teams workforce notification webhooks', tab: 'CONNECTORS' },
              { id: 'WEBHOOKS', title: 'Webhooks Event Dispatcher', icon: Webhook, desc: 'Custom webhook endpoints for real-time payroll event streams', tab: 'WEBHOOKS' },
              { id: 'API_KEYS', title: 'REST API Developer Keys', icon: Key, desc: 'Scoped API tokens for external HR reporting & mobile SDKs', tab: 'API_KEYS' }
            ].map((mod) => {
              const connItem = connections.find(c => c.provider_code === mod.id) || { status: 'NOT_CONFIGURED' };
              const Icon = mod.icon;
              return (
                <Card key={mod.id} className="bg-white border-[#DCE5E0] p-5 flex flex-col justify-between hover:border-[#167C63] transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-[10px] bg-[#E5F4EE] border border-[#BCE3D4] flex items-center justify-center text-[#167C63] font-bold">
                        <Icon className="w-5 h-5" />
                      </div>
                      {getStatusBadge(connItem.status)}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#17221C] text-sm">{mod.title}</h3>
                      <p className="text-xs text-[#526158] font-medium mt-1 leading-relaxed">{mod.desc}</p>
                    </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-[#E8EEEA] flex items-center justify-between">
                    <span className="text-[11px] text-[#65736B] font-mono font-medium">
                      {connItem.last_test_at ? `Tested: ${new Date(connItem.last_test_at).toLocaleTimeString()}` : 'Ready for config'}
                    </span>
                    <button
                      onClick={() => handleTabChange(mod.tab)}
                      className="px-3 py-1.5 bg-[#E5F4EE] hover:bg-[#D4EFE4] text-[#167C63] border border-[#BCE3D4] rounded-[9px] text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                    >
                      Configure →
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: BIOMETRIC ATTENDANCE */}
      {/* ==================================================== */}
      {activeTab === 'BIOMETRIC' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-white border-slate-300 shadow-xs lg:col-span-1 p-5 space-y-4">
              <CardHeader title="Biometric Engine Rules" description="Configure auto-sync schedule and punch buffer retention" />
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Auto Sync Interval (Minutes)</label>
                  <select
                    value={biometricConfig.autoSyncInterval}
                    onChange={(e) => setBiometricConfig({ ...biometricConfig, autoSyncInterval: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-medium focus:border-blue-600 focus:outline-none"
                  >
                    <option value="5">Every 5 Minutes</option>
                    <option value="15">Every 15 Minutes</option>
                    <option value="30">Every 30 Minutes</option>
                    <option value="60">Hourly Sync</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Raw Punch Retention (Days)</label>
                  <input
                    type="number"
                    value={biometricConfig.retentionDays}
                    onChange={(e) => setBiometricConfig({ ...biometricConfig, retentionDays: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="syncOnPunch"
                    checked={biometricConfig.syncOnPunch}
                    onChange={(e) => setBiometricConfig({ ...biometricConfig, syncOnPunch: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="syncOnPunch" className="text-slate-800 font-semibold cursor-pointer">Enable Real-Time Webhook Push from Devices</label>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                  <button
                    onClick={() => testConnectionMutation.mutate({ provider: 'BIOMETRIC', config: biometricConfig })}
                    disabled={testConnectionMutation.isPending}
                    className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition"
                  >
                    {testConnectionMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 text-slate-600" />}
                    <span>Test Connection</span>
                  </button>
                  <button
                    onClick={() => saveConfigMutation.mutate({ provider: 'BIOMETRIC', config: biometricConfig })}
                    disabled={saveConfigMutation.isPending}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shadow-xs transition"
                  >
                    {saveConfigMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save Rules</span>
                  </button>
                </div>
              </div>
            </Card>

            <Card className="bg-white border-slate-300 shadow-xs lg:col-span-2 space-y-4 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Biometric Devices Hardware Roster</h3>
                  <p className="text-xs text-slate-600 font-medium">Manage IP terminals, scanners and hardware punch clocks</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => syncBiometricMutation.mutate()}
                    disabled={syncBiometricMutation.isPending}
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition"
                  >
                    {syncBiometricMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    <span>Sync Attendance Now</span>
                  </button>
                  <button
                    onClick={() => setShowAddDeviceModal(true)}
                    className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shadow-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Device</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-300">
                <table className="w-full text-left text-xs text-slate-900">
                  <thead className="bg-slate-100 text-slate-900 uppercase text-[10px] font-bold tracking-wider border-b border-slate-300">
                    <tr>
                      <th className="p-3 font-bold">Device ID</th>
                      <th className="p-3 font-bold">Device Name</th>
                      <th className="p-3 font-bold">Type</th>
                      <th className="p-3 font-bold">Network IP</th>
                      <th className="p-3 font-bold">Branch</th>
                      <th className="p-3 font-bold">Status</th>
                      <th className="p-3 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {devices.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50 transition font-medium">
                        <td className="p-3 font-mono font-bold text-blue-700 bg-blue-50/50 px-2 py-0.5 rounded border border-blue-200 inline-block text-xs my-2 ml-2">{d.id}</td>
                        <td className="p-3 font-bold text-slate-900">{d.name}</td>
                        <td className="p-3 text-slate-700 font-medium">{d.type}</td>
                        <td className="p-3 font-mono text-slate-800 font-semibold">{d.ipAddress}:{d.port}</td>
                        <td className="p-3 text-slate-700 font-medium">{d.branch}</td>
                        <td className="p-3">
                          <Badge variant={d.status === 'ACTIVE' ? 'success' : 'secondary'}>{d.status}</Badge>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => syncBiometricMutation.mutate(d.id)}
                            disabled={syncBiometricMutation.isPending}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-bold hover:bg-blue-100"
                          >
                            Sync
                          </button>
                          <button
                            onClick={() => deleteDeviceMutation.mutate(d.id)}
                            disabled={deleteDeviceMutation.isPending}
                            className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded text-xs font-bold hover:bg-rose-100"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <Card className="bg-white border-slate-300 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Biometric Sync Logs & Device Pings</h3>
            <div className="overflow-x-auto rounded-lg border border-slate-300">
              <table className="w-full text-left text-xs text-slate-900">
                <thead className="bg-slate-100 text-slate-900 uppercase text-[10px] font-bold tracking-wider border-b border-slate-300">
                  <tr>
                    <th className="p-3 font-bold">Timestamp</th>
                    <th className="p-3 font-bold">Action</th>
                    <th className="p-3 font-bold">Status</th>
                    <th className="p-3 font-bold">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {logs.length === 0 ? (
                    <tr><td colSpan="4" className="p-4 text-center text-slate-600 font-semibold">No logs recorded yet.</td></tr>
                  ) : (
                    logs.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50 transition font-medium">
                        <td className="p-3 font-mono text-slate-600 text-[11px]">{new Date(l.timestamp).toLocaleString()}</td>
                        <td className="p-3 font-bold text-slate-900">{l.action}</td>
                        <td className="p-3"><Badge variant={l.status === 'SUCCESS' ? 'success' : 'danger'}>{l.status}</Badge></td>
                        <td className="p-3 text-slate-800 font-mono text-[11px]">{l.details}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: WHATSAPP PAYSLIP */}
      {/* ==================================================== */}
      {activeTab === 'WHATSAPP' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white border-slate-300 p-5 shadow-xs space-y-4">
              <CardHeader title="WhatsApp Business API Credentials" description="Set up Twilio / Meta API keys for automatic payslip delivery" />
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">WhatsApp Provider</label>
                  <select
                    value={whatsappConfig.provider}
                    onChange={(e) => setWhatsappConfig({ ...whatsappConfig, provider: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                  >
                    <option value="Twilio">Twilio WhatsApp API</option>
                    <option value="MetaCloud">Meta WhatsApp Cloud API</option>
                    <option value="WATI">WATI / MessageBird</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Account SID / App ID</label>
                  <input
                    type="text"
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={whatsappConfig.accountSid}
                    onChange={(e) => setWhatsappConfig({ ...whatsappConfig, accountSid: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Auth Token / API Key (Encrypted)</label>
                  <input
                    type="text"
                    placeholder="••••••••••••••••••••"
                    value={whatsappConfig.authToken}
                    onChange={(e) => setWhatsappConfig({ ...whatsappConfig, authToken: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Sender WhatsApp Phone Number</label>
                  <input
                    type="text"
                    placeholder="+14155238886"
                    value={whatsappConfig.phoneNumber}
                    onChange={(e) => setWhatsappConfig({ ...whatsappConfig, phoneNumber: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Approved Template Name</label>
                  <input
                    type="text"
                    value={whatsappConfig.templateName}
                    onChange={(e) => setWhatsappConfig({ ...whatsappConfig, templateName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                  <button
                    onClick={() => testConnectionMutation.mutate({ provider: 'WHATSAPP', config: whatsappConfig })}
                    disabled={testConnectionMutation.isPending}
                    className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition"
                  >
                    {testConnectionMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    <span>Test Connection</span>
                  </button>
                  <button
                    onClick={() => saveConfigMutation.mutate({ provider: 'WHATSAPP', config: whatsappConfig })}
                    disabled={saveConfigMutation.isPending}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shadow-xs transition"
                  >
                    {saveConfigMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save Credentials</span>
                  </button>
                </div>
              </div>
            </Card>

            <Card className="bg-white border-slate-300 p-5 shadow-xs space-y-4">
              <CardHeader title="Send Payslip via WhatsApp" description="Trigger test payslip message dispatch to employee" />
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Recipient Phone Number (with Country Code)</label>
                  <input
                    type="text"
                    value={sendWaForm.recipientPhone}
                    onChange={(e) => setSendWaForm({ ...sendWaForm, recipientPhone: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Employee Name</label>
                  <input
                    type="text"
                    value={sendWaForm.employeeName}
                    onChange={(e) => setSendWaForm({ ...sendWaForm, employeeName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Payslip Period</label>
                  <input
                    type="text"
                    value={sendWaForm.payslipMonth}
                    onChange={(e) => setSendWaForm({ ...sendWaForm, payslipMonth: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                  />
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => sendWhatsappMutation.mutate(sendWaForm)}
                    disabled={sendWhatsappMutation.isPending}
                    className="w-full px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
                  >
                    {sendWhatsappMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{sendWhatsappMutation.isPending ? 'Dispatching...' : 'Send WhatsApp Payslip Now'}</span>
                  </button>
                </div>
              </div>
            </Card>
          </div>

          <Card className="bg-white border-slate-300 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">WhatsApp Delivery Logs & History</h3>
            <div className="overflow-x-auto rounded-lg border border-slate-300">
              <table className="w-full text-left text-xs text-slate-900">
                <thead className="bg-slate-100 text-slate-900 uppercase text-[10px] font-bold tracking-wider border-b border-slate-300">
                  <tr>
                    <th className="p-3 font-bold">Timestamp</th>
                    <th className="p-3 font-bold">Action</th>
                    <th className="p-3 font-bold">Status</th>
                    <th className="p-3 font-bold">Delivery Audit Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {logs.length === 0 ? (
                    <tr><td colSpan="4" className="p-4 text-center text-slate-600 font-semibold">No message logs recorded yet.</td></tr>
                  ) : (
                    logs.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50 transition font-medium">
                        <td className="p-3 font-mono text-slate-600 text-[11px]">{new Date(l.timestamp).toLocaleString()}</td>
                        <td className="p-3 font-bold text-slate-900">{l.action}</td>
                        <td className="p-3"><Badge variant={l.status === 'SUCCESS' ? 'success' : 'danger'}>{l.status}</Badge></td>
                        <td className="p-3 text-slate-800 font-mono text-[11px]">{l.details}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: EMAIL (SMTP) */}
      {/* ==================================================== */}
      {activeTab === 'EMAIL' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white border-slate-300 p-5 shadow-xs space-y-4">
              <CardHeader title="SMTP Server Configuration" description="Enterprise mail server details for automated notifications" />
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">SMTP Host Server</label>
                  <input
                    type="text"
                    placeholder="smtp.mailgun.org"
                    value={emailConfig.host}
                    onChange={(e) => setEmailConfig({ ...emailConfig, host: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Port</label>
                    <input
                      type="text"
                      placeholder="587"
                      value={emailConfig.port}
                      onChange={(e) => setEmailConfig({ ...emailConfig, port: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-800 font-bold mb-1">Encryption</label>
                    <select
                      value={emailConfig.encryption}
                      onChange={(e) => setEmailConfig({ ...emailConfig, encryption: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                    >
                      <option value="TLS">TLS (Recommended)</option>
                      <option value="SSL">SSL</option>
                      <option value="NONE">None</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-800 font-bold mb-1">SMTP Username</label>
                  <input
                    type="text"
                    placeholder="postmaster@company.com"
                    value={emailConfig.username}
                    onChange={(e) => setEmailConfig({ ...emailConfig, username: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 font-bold mb-1">SMTP Password (Encrypted)</label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={emailConfig.password}
                    onChange={(e) => setEmailConfig({ ...emailConfig, password: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 font-bold mb-1">From Sender Address</label>
                  <input
                    type="text"
                    placeholder="noreply@company.com"
                    value={emailConfig.fromAddress}
                    onChange={(e) => setEmailConfig({ ...emailConfig, fromAddress: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                  <button
                    onClick={() => testConnectionMutation.mutate({ provider: 'EMAIL', config: emailConfig })}
                    disabled={testConnectionMutation.isPending}
                    className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition"
                  >
                    {testConnectionMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    <span>Test Connection</span>
                  </button>
                  <button
                    onClick={() => saveConfigMutation.mutate({ provider: 'EMAIL', config: emailConfig })}
                    disabled={saveConfigMutation.isPending}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shadow-xs transition"
                  >
                    {saveConfigMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save Settings</span>
                  </button>
                </div>
              </div>
            </Card>

            <Card className="bg-white border-slate-300 p-5 shadow-xs space-y-4">
              <CardHeader title="Test Email Dispatch" description="Send a live test email to verify SMTP gateway delivery" />
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Recipient Email Address</label>
                  <input
                    type="email"
                    value={testEmailRecipient}
                    onChange={(e) => setTestEmailRecipient(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                  />
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => testEmailMutation.mutate({ recipientEmail: testEmailRecipient })}
                    disabled={testEmailMutation.isPending}
                    className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
                  >
                    {testEmailMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{testEmailMutation.isPending ? 'Sending Test Email...' : 'Send Test Email'}</span>
                  </button>
                </div>
              </div>
            </Card>
          </div>

          <Card className="bg-white border-slate-300 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">SMTP Dispatch Logs</h3>
            <div className="overflow-x-auto rounded-lg border border-slate-300">
              <table className="w-full text-left text-xs text-slate-900">
                <thead className="bg-slate-100 text-slate-900 uppercase text-[10px] font-bold tracking-wider border-b border-slate-300">
                  <tr>
                    <th className="p-3 font-bold">Timestamp</th>
                    <th className="p-3 font-bold">Action</th>
                    <th className="p-3 font-bold">Status</th>
                    <th className="p-3 font-bold">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {logs.length === 0 ? (
                    <tr><td colSpan="4" className="p-4 text-center text-slate-600 font-semibold">No email logs recorded yet.</td></tr>
                  ) : (
                    logs.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50 transition font-medium">
                        <td className="p-3 font-mono text-slate-600 text-[11px]">{new Date(l.timestamp).toLocaleString()}</td>
                        <td className="p-3 font-bold text-slate-900">{l.action}</td>
                        <td className="p-3"><Badge variant={l.status === 'SUCCESS' ? 'success' : 'danger'}>{l.status}</Badge></td>
                        <td className="p-3 text-slate-800 font-mono text-[11px]">{l.details}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 5: CLOUD STORAGE */}
      {/* ==================================================== */}
      {activeTab === 'STORAGE' && (
        <div className="space-y-6">
          <Card className="bg-white border-slate-300 p-5 shadow-xs max-w-2xl space-y-4">
            <CardHeader title="AWS S3 Cloud Storage Credentials" description="Configure encrypted bucket storage for payroll PDFs and employee documents" />
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-800 font-bold mb-1">Storage Provider</label>
                <select
                  value={storageConfig.provider}
                  onChange={(e) => setStorageConfig({ ...storageConfig, provider: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                >
                  <option value="AWS_S3">Amazon Web Services S3</option>
                  <option value="CLOUDINARY">Cloudinary Store</option>
                  <option value="LOCAL">Local Disk Directory</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-800 font-bold mb-1">S3 Bucket Name</label>
                <input
                  type="text"
                  placeholder="company-payroll-documents-prod"
                  value={storageConfig.bucketName}
                  onChange={(e) => setStorageConfig({ ...storageConfig, bucketName: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-800 font-bold mb-1">AWS Region</label>
                <input
                  type="text"
                  placeholder="us-east-1"
                  value={storageConfig.region}
                  onChange={(e) => setStorageConfig({ ...storageConfig, region: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-800 font-bold mb-1">AWS Access Key ID</label>
                <input
                  type="text"
                  placeholder="AKIAXXXXXXXXXXXXXXXX"
                  value={storageConfig.accessKeyId}
                  onChange={(e) => setStorageConfig({ ...storageConfig, accessKeyId: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-800 font-bold mb-1">AWS Secret Access Key (Encrypted)</label>
                <input
                  type="password"
                  placeholder="••••••••••••••••••••••••••••••••"
                  value={storageConfig.secretAccessKey}
                  onChange={(e) => setStorageConfig({ ...storageConfig, secretAccessKey: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  onClick={() => testConnectionMutation.mutate({ provider: 'STORAGE', config: storageConfig })}
                  disabled={testConnectionMutation.isPending}
                  className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition"
                >
                  {testConnectionMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  <span>Test Bucket Access</span>
                </button>
                <button
                  onClick={() => saveConfigMutation.mutate({ provider: 'STORAGE', config: storageConfig })}
                  disabled={saveConfigMutation.isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shadow-xs transition"
                >
                  {saveConfigMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Config</span>
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 6: ACCOUNTING */}
      {/* ==================================================== */}
      {activeTab === 'ACCOUNTING' && (
        <div className="space-y-6">
          <Card className="bg-white border-slate-300 p-5 shadow-xs max-w-2xl space-y-4">
            <CardHeader title="QuickBooks / ERP Accounting Integration" description="Configure OAuth 2.0 API credentials for automated journal posting" />
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-800 font-bold mb-1">Accounting Software</label>
                <select
                  value={accountingConfig.provider}
                  onChange={(e) => setAccountingConfig({ ...accountingConfig, provider: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                >
                  <option value="QuickBooks">QuickBooks Online</option>
                  <option value="Xero">Xero Accounting</option>
                  <option value="Tally">Tally Prime ERP</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-800 font-bold mb-1">OAuth Environment</label>
                <select
                  value={accountingConfig.environment}
                  onChange={(e) => setAccountingConfig({ ...accountingConfig, environment: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                >
                  <option value="SANDBOX">Sandbox (Testing)</option>
                  <option value="PRODUCTION">Production Live</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-800 font-bold mb-1">Client ID / App Key</label>
                <input
                  type="text"
                  placeholder="ABXXXXXXXXXXXXXXXXXXXXXX"
                  value={accountingConfig.clientId}
                  onChange={(e) => setAccountingConfig({ ...accountingConfig, clientId: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-800 font-bold mb-1">Client Secret (Encrypted)</label>
                <input
                  type="password"
                  placeholder="••••••••••••••••••••••••••••"
                  value={accountingConfig.clientSecret}
                  onChange={(e) => setAccountingConfig({ ...accountingConfig, clientSecret: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-800 font-bold mb-1">Realm / Company ID</label>
                <input
                  type="text"
                  placeholder="1234567890"
                  value={accountingConfig.realmId}
                  onChange={(e) => setAccountingConfig({ ...accountingConfig, realmId: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  onClick={() => testConnectionMutation.mutate({ provider: 'ACCOUNTING', config: accountingConfig })}
                  disabled={testConnectionMutation.isPending}
                  className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition"
                >
                  {testConnectionMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  <span>Test OAuth Connection</span>
                </button>
                <button
                  onClick={() => saveConfigMutation.mutate({ provider: 'ACCOUNTING', config: accountingConfig })}
                  disabled={saveConfigMutation.isPending}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shadow-xs transition"
                >
                  {saveConfigMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save ERP Credentials</span>
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 7: EXTERNAL CONNECTORS */}
      {/* ==================================================== */}
      {activeTab === 'CONNECTORS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connections.map((conn, idx) => (
            <div key={idx} className="bg-white border border-slate-300 rounded-xl p-5 space-y-3 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">{conn.category}</span>
                <h3 className="font-bold text-slate-900 text-sm">{conn.provider_name}</h3>
                <span className="text-xs text-slate-600 font-medium block">{conn.status === 'CONNECTED' ? 'Active Sync' : 'Not Configured'}</span>
              </div>
              {getStatusBadge(conn.status)}
            </div>
          ))}
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 8: WEBHOOKS */}
      {/* ==================================================== */}
      {activeTab === 'WEBHOOKS' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-300 rounded-xl p-5 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900">Register Outbound Webhook</h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-800 font-semibold mb-1">Webhook Name</label>
                <input
                  type="text"
                  value={webhookForm.name}
                  onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-slate-800 font-semibold mb-1">Endpoint URL (HTTPS)</label>
                <input
                  type="text"
                  value={webhookForm.endpointUrl}
                  onChange={(e) => setWebhookForm({ ...webhookForm, endpointUrl: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-medium focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <button
              onClick={() => createWebhookMutation.mutate(webhookForm)}
              disabled={createWebhookMutation.isPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-xs transition"
            >
              {createWebhookMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>Register Webhook Endpoint</span>
            </button>
          </div>

          <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs text-slate-900">
              <thead className="bg-slate-100 text-slate-900 uppercase text-[10px] font-bold tracking-wider border-b border-slate-300">
                <tr>
                  <th className="p-3 font-bold">Webhook Name</th>
                  <th className="p-3 font-bold">Endpoint URL</th>
                  <th className="p-3 font-bold">Events</th>
                  <th className="p-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {webhooks.length === 0 ? (
                  <tr><td colSpan="4" className="p-4 text-center text-slate-600 font-semibold">No webhooks registered yet.</td></tr>
                ) : (
                  webhooks.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-sans font-bold text-slate-900">{w.name}</td>
                      <td className="p-3 text-blue-700 font-bold">{w.endpoint_url}</td>
                      <td className="p-3 font-sans text-slate-700 font-medium">{(w.subscribed_events || []).join(', ')}</td>
                      <td className="p-3 font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          {w.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 9: API KEYS */}
      {/* ==================================================== */}
      {activeTab === 'API_KEYS' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-300 rounded-xl p-5 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900">Generate Developer API Key</h2>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-800 font-semibold mb-1">Key Description</label>
                <input
                  type="text"
                  value={keyForm.name}
                  onChange={(e) => setKeyForm({ ...keyForm, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-medium focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-slate-800 font-semibold mb-1">Expires In (Days)</label>
                <input
                  type="number"
                  value={keyForm.expiresInDays}
                  onChange={(e) => setKeyForm({ ...keyForm, expiresInDays: parseInt(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-medium focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <button
              onClick={() => createApiKeyMutation.mutate(keyForm)}
              disabled={createApiKeyMutation.isPending}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-xs transition"
            >
              {createApiKeyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              <span>Generate API Key</span>
            </button>
          </div>

          {generatedKeySecret && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs space-y-2">
              <span className="font-bold text-emerald-900 uppercase tracking-wider block">API Key Secret (Copy Now — Shown Only Once)</span>
              <div className="p-3 bg-white rounded-lg border border-emerald-300 font-mono text-emerald-800 font-bold select-all">
                {generatedKeySecret}
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs text-slate-900">
              <thead className="bg-slate-100 text-slate-900 uppercase text-[10px] font-bold tracking-wider border-b border-slate-300">
                <tr>
                  <th className="p-3 font-bold">Key Name</th>
                  <th className="p-3 font-bold">Prefix</th>
                  <th className="p-3 font-bold">Scopes</th>
                  <th className="p-3 font-bold">Status</th>
                  <th className="p-3 font-bold">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {apiKeys.length === 0 ? (
                  <tr><td colSpan="5" className="p-4 text-center text-slate-600 font-semibold">No REST API keys created yet.</td></tr>
                ) : (
                  apiKeys.map((k) => (
                    <tr key={k.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-sans font-bold text-slate-900">{k.name}</td>
                      <td className="p-3 text-blue-700 font-bold">{k.key_prefix}...</td>
                      <td className="p-3 font-sans text-slate-700 font-medium">{(k.scopes || []).join(', ')}</td>
                      <td className="p-3 font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          {k.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 font-sans text-[11px] font-medium">{new Date(k.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD BIOMETRIC DEVICE MODAL */}
      {showAddDeviceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-300 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Biometric Hardware Device</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-800 font-bold mb-1">Device Name</label>
                <input
                  type="text"
                  placeholder="e.g. Building A Entrance Scanner"
                  value={deviceForm.name}
                  onChange={(e) => setDeviceForm({ ...deviceForm, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                />
              </div>
              <div>
                <label className="block text-slate-800 font-bold mb-1">Device Type</label>
                <select
                  value={deviceForm.type}
                  onChange={(e) => setDeviceForm({ ...deviceForm, type: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                >
                  <option value="Fingerprint + Face">Fingerprint + Face Scanner</option>
                  <option value="Fingerprint">Fingerprint Only</option>
                  <option value="RFID Card">RFID Card Terminal</option>
                  <option value="Iris Recognition">Iris Recognition</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">IP Address</label>
                  <input
                    type="text"
                    placeholder="192.168.1.105"
                    value={deviceForm.ipAddress}
                    onChange={(e) => setDeviceForm({ ...deviceForm, ipAddress: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Port</label>
                  <input
                    type="text"
                    value={deviceForm.port}
                    onChange={(e) => setDeviceForm({ ...deviceForm, port: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-mono font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-800 font-bold mb-1">Assigned Branch Location</label>
                <input
                  type="text"
                  value={deviceForm.branch}
                  onChange={(e) => setDeviceForm({ ...deviceForm, branch: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowAddDeviceModal(false)}
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => addDeviceMutation.mutate(deviceForm)}
                disabled={addDeviceMutation.isPending}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                {addDeviceMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>{addDeviceMutation.isPending ? 'Saving...' : 'Add Device'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
