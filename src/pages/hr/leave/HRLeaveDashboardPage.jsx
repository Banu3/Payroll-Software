import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { DataTable } from '../../../components/ui/DataTable';
import {
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Settings,
  Sliders,
  FileSpreadsheet,
  Check,
  X,
  Eye,
  TrendingUp
} from 'lucide-react';
import { api } from '../../../services/api';

export const HRLeaveDashboardPage = () => {
  const navigate = useNavigate();

  // Dashboard KPI state
  const [kpiData, setKpiData] = useState({
    employeesOnLeaveToday: 0,
    pendingRequests: 0,
    approvedThisMonth: 0,
    rejectedThisMonth: 0,
    lowBalanceCount: 0,
  });

  const [analytics, setAnalytics] = useState({
    typeDistribution: [],
    departmentDistribution: [],
  });

  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchAnalytics();
    fetchRequests();
  }, [statusFilter]);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/leave/dashboard');
      if (res && res.success) {
        setKpiData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch leave dashboard KPIs:', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/leave/analytics');
      if (res && res.success) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      let query = '/leave/requests';
      if (statusFilter) query += `?status=${statusFilter}`;
      const res = await api.get(query);
      if (res && res.success) {
        setRequests(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch leave requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/leave/requests/${id}/approve`, { comments: 'Approved by HR' });
      fetchRequests();
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to approve leave');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await api.post(`/leave/requests/${id}/reject`, { rejectionReason: reason });
      fetchRequests();
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to reject leave');
    }
  };

  const columns = [
    {
      header: 'Employee',
      accessor: (r) => (
        <div>
          <p style={{ fontWeight: 600, margin: 0 }}>
            {r.employee?.first_name} {r.employee?.last_name}
          </p>
          <small style={{ color: 'var(--text-muted)' }}>{r.employee?.employee_id}</small>
        </div>
      ),
    },
    {
      header: 'Leave Type',
      accessor: (r) => r.leave_type?.name || 'Casual Leave',
    },
    {
      header: 'Dates',
      accessor: (r) => `${r.start_date} to ${r.end_date}`,
    },
    {
      header: 'Duration',
      accessor: (r) => `${r.duration} day(s)`,
    },
    {
      header: 'Reason',
      accessor: (r) => r.reason || '—',
    },
    {
      header: 'Status',
      accessor: (r) => (
        <Badge
          variant={
            r.status === 'APPROVED'
              ? 'success'
              : r.status === 'REJECTED'
              ? 'danger'
              : 'warning'
          }
        >
          {r.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: (r) => (
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {r.status === 'PENDING' && (
            <>
              <Button
                size="sm"
                variant="primary"
                style={{ background: 'var(--color-emerald-600)', borderColor: 'var(--color-emerald-600)' }}
                onClick={() => handleApprove(r.id)}
              >
                <Check size={14} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                style={{ color: 'var(--color-rose-600)', borderColor: 'var(--color-rose-300)' }}
                onClick={() => handleReject(r.id)}
              >
                <X size={14} />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Leave Management System"
        subtitle="Manage employee leave requests, configure leave policies, and review balance ledgers"
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button variant="outline" size="sm" onClick={() => navigate('/hr/leave/types')}>
              <Settings size={14} style={{ marginRight: '0.375rem' }} />
              Leave Types
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/hr/leave/policies')}>
              <Sliders size={14} style={{ marginRight: '0.375rem' }} />
              Policies
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/hr/leave/balances')}>
              <CalendarDays size={14} style={{ marginRight: '0.375rem' }} />
              Balances & Ledgers
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/hr/leave/reports')}>
              <FileSpreadsheet size={14} style={{ marginRight: '0.375rem' }} />
              Reports
            </Button>
          </div>
        }
      />

      {/* KPI Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <Card
          onClick={() => setStatusFilter('APPROVED')}
          style={{ cursor: 'pointer', borderLeft: '4px solid var(--color-indigo-600)' }}
        >
          <CardBody style={{ padding: '1rem' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 500 }}>On Leave Today</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--color-indigo-600)' }}>
              {kpiData.employeesOnLeaveToday}
            </div>
          </CardBody>
        </Card>

        <Card
          onClick={() => setStatusFilter('PENDING')}
          style={{ cursor: 'pointer', borderLeft: '4px solid var(--color-amber-500)' }}
        >
          <CardBody style={{ padding: '1rem' }}>
            <div style={{ color: 'var(--color-amber-700)', fontSize: '0.8125rem', fontWeight: 500 }}>Pending Requests</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--color-amber-600)' }}>
              {kpiData.pendingRequests}
            </div>
          </CardBody>
        </Card>

        <Card
          onClick={() => setStatusFilter('APPROVED')}
          style={{ cursor: 'pointer', borderLeft: '4px solid var(--color-emerald-500)' }}
        >
          <CardBody style={{ padding: '1rem' }}>
            <div style={{ color: 'var(--color-emerald-700)', fontSize: '0.8125rem', fontWeight: 500 }}>Approved This Month</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--color-emerald-600)' }}>
              {kpiData.approvedThisMonth}
            </div>
          </CardBody>
        </Card>

        <Card
          onClick={() => setStatusFilter('REJECTED')}
          style={{ cursor: 'pointer', borderLeft: '4px solid var(--color-rose-500)' }}
        >
          <CardBody style={{ padding: '1rem' }}>
            <div style={{ color: 'var(--color-rose-700)', fontSize: '0.8125rem', fontWeight: 500 }}>Rejected This Month</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--color-rose-600)' }}>
              {kpiData.rejectedThisMonth}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Analytics Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        <Card>
          <CardHeader>
            <h4 style={{ margin: 0, fontSize: '1rem' }}>Leave Type Distribution</h4>
          </CardHeader>
          <CardBody>
            {analytics.typeDistribution.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {analytics.typeDistribution.map((t, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem' }}>{t.name}</span>
                    <span style={{ fontWeight: 700 }}>{t.value} days</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', margin: 0 }}>
                No leave requests processed this period.
              </p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h4 style={{ margin: 0, fontSize: '1rem' }}>Department Leave Usage</h4>
          </CardHeader>
          <CardBody>
            {analytics.departmentDistribution.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {analytics.departmentDistribution.map((d, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem' }}>{d.name}</span>
                    <span style={{ fontWeight: 700 }}>{d.value} days</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', margin: 0 }}>
                No department leave data recorded.
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Main Request Queue Table */}
      <Card>
        <CardHeader style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Leave Requests Queue</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant={statusFilter === '' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('')}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'PENDING' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('PENDING')}
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === 'APPROVED' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('APPROVED')}
            >
              Approved
            </Button>
          </div>
        </CardHeader>
        <CardBody style={{ padding: 0 }}>
          <DataTable columns={columns} data={requests} isLoading={isLoading} />
        </CardBody>
      </Card>
    </div>
  );
};

export default HRLeaveDashboardPage;
