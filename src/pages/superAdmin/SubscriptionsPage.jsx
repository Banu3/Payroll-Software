import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/ui/DataTable';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

export const SubscriptionsPage = () => {
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([
    { company: 'Apex Global Enterprises', plan: 'Enterprise Unlimited', employees: 48, limit: 10000, status: 'ACTIVE', renewal: '2027-01-15' },
    { company: 'Acme Software Solutions', plan: 'Professional', employees: 120, limit: 250, status: 'ACTIVE', renewal: '2027-03-20' },
    { company: 'Vanguard Global Financial', plan: 'Starter', employees: 15, limit: 25, status: 'TRIAL', renewal: '2026-10-01' },
    { company: 'BioTech Health Dynamics', plan: 'Business', employees: 85, limit: 1000, status: 'SUSPENDED', renewal: '2027-04-12' },
  ]);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const res = await api.get('/super-admin/subscriptions');
      if (res && res.success) {
        setPlans(res.data.plans);
      }
    } catch (err) {
      console.warn('Subscription fetch warning:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-900">
      <PageHeader
        title="Enterprise Subscription Management"
        description="Tenant subscription plans, employee thresholds, and license compliance"
        badge={<Badge variant="purple">SUBSCRIPTION ENGINE</Badge>}
      />

      <Card>
        <CardHeader title="Tenant Subscriptions Registry" />
        <CardBody className="p-0">
          <DataTable
            columns={[
              { header: 'Company', accessor: 'company', render: (s) => <span className="font-semibold text-slate-900">{s.company}</span> },
              { header: 'Plan Code', accessor: 'plan', render: (s) => <Badge variant="purple">{s.plan}</Badge> },
              { header: 'Employee Utilization', accessor: 'employees', render: (s) => <span className="text-slate-800 font-medium">{s.employees} / {s.limit} Users</span> },
              { header: 'Status', accessor: 'status', render: (s) => <Badge variant={s.status === 'ACTIVE' ? 'success' : 'warning'}>{s.status}</Badge> },
              { header: 'Renewal Date', accessor: 'renewal', render: (s) => <span className="text-slate-700 font-mono">{s.renewal}</span> },
            ]}
            data={subscriptions}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default SubscriptionsPage;
