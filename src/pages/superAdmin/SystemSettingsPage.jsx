import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Settings,
  ShieldCheck,
  Mail,
  Lock,
  Database,
  Server,
  Bell,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export const SystemSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('GENERAL');
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    platformName: 'Enterprise Payroll HQ',
    systemEmail: 'admin@payrollhq.internal',
    multiTenancyMode: 'ENABLED',
    allowTenantRegistration: true,
    requireEmailVerification: true,
    twoFactorEnforcement: 'OPTIONAL',
    maxFailedLogins: 5,
    sessionTimeoutMinutes: 60,
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: 587,
    smtpEncryption: 'TLS',
    maintenanceMode: false,
    autoBackupDaily: true,
  });

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, val) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setSavedSuccess(false);
    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-900">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h1>
            <Badge variant="purple">PLATFORM CONFIG</Badge>
          </div>
          <p className="text-xs text-slate-700 mt-1">Configure global platform security, authentication policies, SMTP mail servers, and multi-tenant parameters.</p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={isSaving ? RefreshCw : Save}
          isLoading={isSaving}
          onClick={handleSave}
        >
          {savedSuccess ? 'Settings Saved!' : 'Save System Settings'}
        </Button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>System configuration updated successfully across all tenant nodes.</span>
        </div>
      )}

      {/* TABS */}
      <div className="flex flex-wrap gap-2 border-b border-[#E5E7EB] pb-3">
        {[
          { id: 'GENERAL', label: 'General System', icon: Settings },
          { id: 'SECURITY', label: 'Security & Authentication', icon: Lock },
          { id: 'SMTP', label: 'Mail / SMTP Server', icon: Mail },
          { id: 'MAINTENANCE', label: 'Backup & Maintenance', icon: Server },
        ].map((tab) => {
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-[#E5E7EB] hover:bg-slate-50'
              }`}
            >
              <IconComp className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'GENERAL' && (
        <Card>
          <CardHeader title="General Platform Parameters" description="Global platform identity and tenant onboarding controls" />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">Platform Name</label>
                <input
                  type="text"
                  value={settings.platformName}
                  onChange={(e) => handleChange('platformName', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">System Admin Email</label>
                <input
                  type="email"
                  value={settings.systemEmail}
                  onChange={(e) => handleChange('systemEmail', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-900">Allow Self-Service Tenant Registration</div>
                <div className="text-[11px] text-slate-600">Permit new companies to register trial accounts via public portal.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.allowTenantRegistration}
                onChange={() => handleToggle('allowTenantRegistration')}
                className="w-4 h-4 text-teal-600 rounded cursor-pointer accent-teal-600"
              />
            </div>
          </CardBody>
        </Card>
      )}

      {activeTab === 'SECURITY' && (
        <Card>
          <CardHeader title="Authentication & Security Protocols" description="Session management, login attempt thresholds, and 2FA policies" />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">Two-Factor Authentication (2FA)</label>
                <select
                  value={settings.twoFactorEnforcement}
                  onChange={(e) => handleChange('twoFactorEnforcement', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-xs font-medium text-slate-900 focus:outline-none"
                >
                  <option value="OPTIONAL">Optional for all users</option>
                  <option value="SUPER_ADMIN_ONLY">Enforced for Super Admins only</option>
                  <option value="ENFORCED_ALL">Mandatory for all Tenant Admins & Employees</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">Session Inactivity Timeout (Minutes)</label>
                <input
                  type="number"
                  value={settings.sessionTimeoutMinutes}
                  onChange={(e) => handleChange('sessionTimeoutMinutes', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-teal-600"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-900">Enforce Mandatory Email Verification</div>
                <div className="text-[11px] text-slate-600">New employee invitations must verify email before accessing dashboard.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.requireEmailVerification}
                onChange={() => handleToggle('requireEmailVerification')}
                className="w-4 h-4 text-teal-600 rounded cursor-pointer accent-teal-600"
              />
            </div>
          </CardBody>
        </Card>
      )}

      {activeTab === 'SMTP' && (
        <Card>
          <CardHeader title="SMTP Mail Delivery Server" description="Configure outbound system email notifications and payslip mailer" />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-800 mb-1">SMTP Host</label>
                <input
                  type="text"
                  value={settings.smtpHost}
                  onChange={(e) => handleChange('smtpHost', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-teal-600 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">Port</label>
                <input
                  type="number"
                  value={settings.smtpPort}
                  onChange={(e) => handleChange('smtpPort', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-teal-600 font-mono"
                />
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {activeTab === 'MAINTENANCE' && (
        <Card>
          <CardHeader title="System Maintenance & Automated Backups" description="Database snapshot schedules and system-wide maintenance mode" />
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div>
                <div className="text-xs font-bold text-amber-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  System Maintenance Mode
                </div>
                <div className="text-[11px] text-amber-800 mt-1">Temporarily block non-admin login access for scheduled system updates.</div>
              </div>
              <Button
                variant={settings.maintenanceMode ? 'danger' : 'outline'}
                size="sm"
                onClick={() => handleToggle('maintenanceMode')}
              >
                {settings.maintenanceMode ? 'Maintenance ACTIVE' : 'Enable Maintenance'}
              </Button>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-900">Automated Daily Database Backups</div>
                <div className="text-[11px] text-slate-600">Nightly encrypted snapshots saved to S3 secure storage at 00:00 UTC.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoBackupDaily}
                onChange={() => handleToggle('autoBackupDaily')}
                className="w-4 h-4 text-teal-600 rounded cursor-pointer accent-teal-600"
              />
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default SystemSettingsPage;
