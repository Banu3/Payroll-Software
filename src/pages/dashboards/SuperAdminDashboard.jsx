import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
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
        badge={<Badge variant="info">SUPER ADMIN ACCESS</Badge>}
        action={
          <Button variant="primary" size="sm" icon={Plus}>
            Provision New Tenant
          </Button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tenant Companies"
          value="12"
          subtitle="+2 new this month"
          icon={Building2}
          trend="+16%"
          trendType="up"
        />
        <StatCard
          title="Total Provisioned Users"
          value="1,480"
          subtitle="Across all tenants"
          icon={Users}
        />
        <StatCard
          title="System Roles & Perms"
          value="4 / 28"
          subtitle="Central RBAC Active"
          icon={Key}
        />
        <StatCard
          title="Tenant Isolation"
          value="100%"
          subtitle="RLS Enforced"
          icon={Lock}
          trend="Secure"
          trendType="up"
        />
      </div>

      {/* Tenants Table */}
      <Card>
        <CardHeader
          title="Active System Tenants"
          description="Global enterprise companies managed under multi-tenant architecture"
        />
        <CardBody className="p-0">
          <DataTable
            columns={[
              { header: 'Tenant Code', accessor: 'code', render: (t) => <span className="font-mono text-[#167C63] font-bold">{t.code}</span> },
              { header: 'Company Name', accessor: 'name', render: (t) => <span className="font-medium text-[#17221C]">{t.name}</span> },
              { header: 'Active Users', accessor: 'users', render: (t) => <span className="tabular-nums text-[#526158]">{t.users}</span> },
              { header: 'Status', accessor: 'status', render: (t) => <Badge variant={t.status === 'ACTIVE' ? 'success' : 'warning'}>{t.status}</Badge> },
              { header: 'Created Date', accessor: 'created', render: (t) => <span className="font-mono text-[#65736B]">{t.created}</span> },
            ]}
            data={tenants}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;
