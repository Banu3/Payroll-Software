import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  ShieldCheck,
  Activity,
  Lock,
  Search,
  Filter,
  Download,
  Building2,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';

const MOCK_SYSTEM_ACTIVITIES = [
  { id: 'act_101', action: 'TENANT_ONBOARDED', user: 'Super Admin (Root)', company: 'Apex Global Enterprises', entity: 'Company #c1', status: 'SUCCESS', ipAddress: '192.168.1.45', timestamp: '2026-09-27 15:45:10' },
  { id: 'act_102', action: 'PAYROLL_DISBURSED', user: 'Sarah Jenkins (HR Lead)', company: 'Acme Software Solutions', entity: 'Payroll #PR-2026-09', status: 'SUCCESS', ipAddress: '10.0.4.12', timestamp: '2026-09-27 14:30:22' },
  { id: 'act_103', action: 'ROLE_PERMISSION_CHANGED', user: 'Super Admin (Root)', company: 'Vanguard Financial', entity: 'Role: HR_ADMIN', status: 'SUCCESS', ipAddress: '192.168.1.45', timestamp: '2026-09-27 12:15:05' },
  { id: 'act_104', action: 'USER_LOGIN_FAILED', user: 'unknown.attempt@domain.com', company: 'TechFlow Labs', entity: 'Auth Endpoint', status: 'FAILED', ipAddress: '185.220.101.4', timestamp: '2026-09-27 11:02:18' },
  { id: 'act_105', action: 'SUBSCRIPTION_UPGRADED', user: 'Alex Morgan (CEO)', company: 'Apex Global Enterprises', entity: 'Plan: Enterprise Unlimited', status: 'SUCCESS', ipAddress: '172.16.0.88', timestamp: '2026-09-26 18:20:00' },
  { id: 'act_106', action: 'TAX_RATE_UPDATED', user: 'Super Admin (Root)', company: 'Platform System', entity: 'Statutory Tax Rules 2026', status: 'SUCCESS', ipAddress: '192.168.1.45', timestamp: '2026-09-26 16:10:44' },
];

const MOCK_AUDIT_LOGS = [
  { id: 'LOG-9901', category: 'COMPLIANCE_SIGN_OFF', action: 'Approved Global Tax Table Release 2.0', performedBy: 'Super Admin (Root)', company: 'Platform HQ', severity: 'HIGH', ip: '192.168.1.45', hash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', timestamp: '2026-09-27 16:00:00' },
  { id: 'LOG-9902', category: 'PAYROLL_FINALIZATION', action: 'Finalized September Payroll Run for Apex Global', performedBy: 'Sarah Jenkins (Payroll Lead)', company: 'Apex Global Enterprises', severity: 'CRITICAL', ip: '10.0.4.12', hash: 'sha256:8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4', timestamp: '2026-09-27 14:15:30' },
  { id: 'LOG-9903', category: 'SECURITY_AUTH', action: 'Enforced 2FA Requirement for HR Admins', performedBy: 'Super Admin (Root)', company: 'Platform HQ', severity: 'HIGH', ip: '192.168.1.45', hash: 'sha256:6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b', timestamp: '2026-09-27 11:30:12' },
  { id: 'LOG-9904', category: 'TENANT_CONFIGURATION', action: 'Modified Bank Disbursement API Credentials', performedBy: 'Marcus Vance (CFO)', company: 'Vanguard Financial', severity: 'HIGH', ip: '172.16.2.9', hash: 'sha256:d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35', timestamp: '2026-09-26 19:40:05' },
  { id: 'LOG-9905', category: 'DATA_RETENTION', action: 'Executed Archival Policy on 2025 Financial Year', performedBy: 'Automated Job (System Cron)', company: 'Acme Software Solutions', severity: 'MEDIUM', ip: '127.0.0.1', hash: 'sha256:4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce', timestamp: '2026-09-26 00:00:01' },
];

export const AuditLogsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('AUDIT'); // 'AUDIT' or 'ACTIVITY'
  const [activities] = useState(MOCK_SYSTEM_ACTIVITIES);
  const [auditLogs] = useState(MOCK_AUDIT_LOGS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredActivities = activities.filter((act) => {
    const matchesSearch =
      act.action.toLowerCase().includes(search.toLowerCase()) ||
      act.user.toLowerCase().includes(search.toLowerCase()) ||
      act.company.toLowerCase().includes(search.toLowerCase()) ||
      act.entity.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || act.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(search.toLowerCase()) ||
      log.company.toLowerCase().includes(search.toLowerCase()) ||
      log.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || log.severity === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in text-slate-900">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {activeTab === 'AUDIT' ? 'Immutable Audit Logs' : 'System Activity Feed'}
            </h1>
            <Badge variant="purple">
              {activeTab === 'AUDIT' ? 'CRYPTOGRAPHIC TRAIL' : 'REAL-TIME MONITORING'}
            </Badge>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            {activeTab === 'AUDIT'
              ? 'Legally binding, tamper-evident audit ledger for tenant compliance and enterprise governance.'
              : 'Live platform events, security triggers, and multi-tenant operational activity.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Download}>
            {activeTab === 'AUDIT' ? 'Export Cryptographic Audit Package' : 'Export Activity Log'}
          </Button>
        </div>
      </div>

      {/* TOP VIEW MODE TABS */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-[#E5E7EB] w-fit">
        <button
          onClick={() => {
            setActiveTab('ACTIVITY');
            navigate('/super-admin/activity');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'ACTIVITY'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>System Activity Feed</span>
        </button>

        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'AUDIT'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Immutable Audit Logs</span>
        </button>
      </div>

      {/* METRICS */}
      {activeTab === 'AUDIT' ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{auditLogs.length} Audit Entries</div>
              <div className="text-xs text-slate-700 font-medium">Verified Cryptographic Ledger</div>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-900">100% Integrity</div>
              <div className="text-xs text-emerald-800 font-semibold">Zero Hash Tamper Alerts</div>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shrink-0">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">SOC 2 Type II</div>
              <div className="text-xs text-slate-700 font-medium">Compliance Standard Verified</div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{activities.length} Events</div>
              <div className="text-xs text-slate-700 font-medium">Logged Past 24 Hours</div>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-900">{activities.filter((a) => a.status === 'SUCCESS').length} Successful</div>
              <div className="text-xs text-emerald-800 font-semibold">99.8% Operation Health</div>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-rose-900">{activities.filter((a) => a.status === 'FAILED').length} Warning / Error</div>
              <div className="text-xs text-rose-800 font-semibold">Security Alert Logged</div>
            </div>
          </Card>
        </div>
      )}

      {/* SEARCH AND FILTER BAR */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-teal-700" />
            <input
              type="text"
              placeholder={activeTab === 'AUDIT' ? "Search by Log ID, action, user, company..." : "Search by action, user, tenant..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#64748B] rounded-lg text-xs text-slate-900 placeholder-[#334155] font-semibold focus:outline-none focus:border-teal-600"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
            <Filter className="w-3.5 h-3.5 text-teal-600" />
            <span>{activeTab === 'AUDIT' ? 'Severity:' : 'Status:'}</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
            >
              {activeTab === 'AUDIT' ? (
                <>
                  <option value="ALL">All Severities</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                </>
              ) : (
                <>
                  <option value="ALL">All Event Statuses</option>
                  <option value="SUCCESS">Success</option>
                  <option value="FAILED">Failed / Warning</option>
                </>
              )}
            </select>
          </div>
        </div>
      </Card>

      {/* CONTENT TABLE */}
      {activeTab === 'AUDIT' ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-[#E5E7EB] text-slate-700 font-semibold">
                <tr>
                  <th className="p-4">Audit Record ID</th>
                  <th className="p-4">Action & Details</th>
                  <th className="p-4">Executed By</th>
                  <th className="p-4">Tenant Scope</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Cryptographic Hash</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-mono font-bold text-teal-700">{log.id}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{log.action}</div>
                      <div className="text-[11px] text-slate-600 font-mono">{log.category}</div>
                    </td>
                    <td className="p-4 font-medium text-slate-900">{log.performedBy}</td>
                    <td className="p-4 text-slate-800 font-medium">{log.company}</td>
                    <td className="p-4">
                      {log.severity === 'CRITICAL' && <Badge variant="danger">CRITICAL</Badge>}
                      {log.severity === 'HIGH' && <Badge variant="warning">HIGH</Badge>}
                      {log.severity === 'MEDIUM' && <Badge variant="info">MEDIUM</Badge>}
                    </td>
                    <td className="p-4 font-mono text-[10px] text-slate-600 truncate max-w-[160px]" title={log.hash}>
                      {log.hash}
                    </td>
                    <td className="p-4 font-mono text-slate-700">{log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-[#E5E7EB] text-slate-700 font-semibold">
                <tr>
                  <th className="p-4">Action Event</th>
                  <th className="p-4">Performed By</th>
                  <th className="p-4">Tenant Company</th>
                  <th className="p-4">Target Entity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-mono font-bold text-teal-700">{act.action}</td>
                    <td className="p-4 font-semibold text-slate-900">{act.user}</td>
                    <td className="p-4 text-slate-800 font-medium flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{act.company}</span>
                    </td>
                    <td className="p-4 text-slate-800">{act.entity}</td>
                    <td className="p-4">
                      {act.status === 'SUCCESS' ? (
                        <Badge variant="success">SUCCESS</Badge>
                      ) : (
                        <Badge variant="danger">FAILED</Badge>
                      )}
                    </td>
                    <td className="p-4 font-mono text-slate-700">{act.ipAddress}</td>
                    <td className="p-4 font-mono text-slate-700">{act.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AuditLogsPage;
