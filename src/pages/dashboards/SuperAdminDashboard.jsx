import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  Building2,
  Users,
  Key,
  Server,
  Activity,
  Plus,
  Lock
} from 'lucide-react';

export const SuperAdminDashboard = () => {
  const { user, company } = useAuth();

  const tenants = [
    { id: 'tn-1', name: 'Apex Global Enterprises', code: 'APEX', users: 48, status: 'ACTIVE', created: '2026-01-15' },
    { id: 'tn-2', name: 'Acme Software Solutions', code: 'ACME', users: 120, status: 'ACTIVE', created: '2026-03-20' },
    { id: 'tn-3', name: 'Vanguard Global Corp', code: 'VGND', users: 15, status: 'PROVISIONING', created: '2026-09-01' },
  ];

  const systemLogs = [
    { event: 'TENANT_PROVISIONED', target: 'VGND', time: '10 mins ago', status: 'SUCCESS' },
    { event: 'GLOBAL_RBAC_RELOAD', target: 'SYSTEM', time: '1 hour ago', status: 'SUCCESS' },
    { event: 'JWT_KEY_ROTATION', target: 'AUTH_SERVICE', time: '2 days ago', status: 'SUCCESS' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Super Admin Master Portal"
        description="Global Multi-Tenant Administration & Enterprise Infrastructure Control"
        badge={<Badge variant="purple">SUPER ADMIN ACCESS</Badge>}
        action={
          <Button variant="primary" size="sm" icon={Plus}>
            Provision New Tenant
          </Button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900 border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Tenant Companies</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">12</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono">+2 new this month</div>
        </Card>

        <Card className="p-4 bg-slate-900 border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Provisioned Users</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">1,480</div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">Across all tenants</div>
        </Card>

        <Card className="p-4 bg-slate-900 border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>System Roles & Perms</span>
            <Key className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">4 Roles / 28 Perms</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono">Central RBAC Active</div>
        </Card>

        <Card className="p-4 bg-slate-900 border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Tenant Isolation</span>
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">100% Enforced</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono">RLS Enabled</div>
        </Card>
      </div>

      {/* Tenants Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader
          title="Active System Tenants"
          description="Global enterprise companies managed under multi-tenant architecture"
        />
        <CardBody className="p-0">
          <DataTable
            columns={[
              { header: 'Tenant Code', accessor: 'code', render: (t) => <span className="font-mono text-blue-400 font-bold">{t.code}</span> },
              { header: 'Company Name', accessor: 'name', render: (t) => <span className="font-medium text-slate-100">{t.name}</span> },
              { header: 'Active Users', accessor: 'users' },
              { header: 'Status', accessor: 'status', render: (t) => <Badge variant={t.status === 'ACTIVE' ? 'success' : 'warning'}>{t.status}</Badge> },
              { header: 'Created Date', accessor: 'created' },
            ]}
            data={tenants}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;
