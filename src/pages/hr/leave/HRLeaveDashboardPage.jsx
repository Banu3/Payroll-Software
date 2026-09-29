import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LeaveSubNav from '../../../components/layout/LeaveSubNav';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { StatCard } from '../../../components/ui/StatCard';
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
    employeesOnLeaveToday: 2,
    pendingRequests: 4,
    approvedThisMonth: 18,
    rejectedThisMonth: 1,
    lowBalanceCount: 3,
  });

  const [analytics, setAnalytics] = useState({
    typeDistribution: [
      { name: 'Casual Leave (CL)', value: 12 },
      { name: 'Earned Leave (EL)', value: 8 },
      { name: 'Sick Leave (SL)', value: 4 },
    ],
    departmentDistribution: [
      { name: 'Engineering', value: 14 },
      { name: 'People Operations', value: 6 },
      { name: 'Finance & Payroll', value: 4 },
    ],
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
      if (res && res.success && res.data) {
        setKpiData(res.data);
      }
    } catch (err) {
      console.warn('Using fallback leave dashboard KPIs:', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/leave/analytics');
      if (res && res.success && res.data) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.warn('Using fallback leave analytics:', err);
    }
  };

  const STORAGE_KEY = 'payroll_hr_leave_requests';

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      let query = '/leave/requests';
      if (statusFilter) query += `?status=${statusFilter}`;
      const res = await api.get(query);
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        const saved = localStorage.getItem(STORAGE_KEY);
        const savedList = saved ? JSON.parse(saved) : [];
        const merged = res.data.map(item => {
          const s = savedList.find(x => x.id === item.id);
          return s ? { ...item, status: s.status } : item;
        });
        setRequests(merged);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return;
      }
    } catch (err) {
      console.warn('Using local persistence for leave requests:', err);
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setRequests(JSON.parse(saved));
      } else {
        setRequests([
          { id: 'lve-1', employee: { first_name: 'Eleanor', last_name: 'Sterling', employee_id: 'EMP-1001' }, leave_type: { name: 'Casual Leave' }, start_date: '2026-10-05', end_date: '2026-10-08', duration: 4, reason: 'Personal work', status: 'PENDING' },
          { id: 'lve-2', employee: { first_name: 'David', last_name: 'Miller', employee_id: 'EMP-1002' }, leave_type: { name: 'Sick Leave' }, start_date: '2026-10-12', end_date: '2026-10-12', duration: 1, reason: 'Medical checkup', status: 'PENDING' },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/leave/requests/${id}/approve`, { comments: 'Approved by HR' });
    } catch (err) {
      console.warn('Failed to approve leave API, falling back to persistent update:', err);
    }
    setRequests(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, status: r.status === 'APPROVED' ? 'PENDING' : 'APPROVED' } : r);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleReject = async (id) => {
    try {
      await api.post(`/leave/requests/${id}/reject`, { rejectionReason: 'Rejected by HR Admin' });
    } catch (err) {
      console.warn('Failed to reject leave API, falling back to persistent update:', err);
    }
    setRequests(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, status: r.status === 'REJECTED' ? 'PENDING' : 'REJECTED' } : r);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const columns = [
    {
      header: 'Employee',
      accessor: 'employee',
      render: (r) => (
        <div>
          <span className="font-semibold text-[#17221C] block">
            {r.employee?.first_name} {r.employee?.last_name}
          </span>
          <span className="font-mono text-[11px] text-[#65736B]">{r.employee?.employee_id}</span>
        </div>
      ),
    },
    {
      header: 'Leave Category',
      accessor: 'leave_type',
      render: (r) => <span className="text-[#526158] font-medium">{r.leave_type?.name || 'Casual Leave'}</span>,
    },
    {
      header: 'Date Range',
      accessor: 'dates',
      render: (r) => <span className="font-mono text-[#17221C] text-xs">{r.start_date} to {r.end_date}</span>,
    },
    {
      header: 'Duration',
      accessor: 'duration',
      render: (r) => <span className="font-bold text-[#17221C] tabular-nums">{r.duration} day(s)</span>,
    },
    {
      header: 'Reason',
      accessor: 'reason',
      render: (r) => <span className="text-[#65736B] text-xs">{r.reason || '—'}</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => (
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
      accessor: 'actions',
      render: (r) => (
        <div className="flex items-center gap-2 min-w-[200px]">
          <button
            onClick={() => handleApprove(r.id)}
            className={`h-8 px-3 rounded-[9px] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
              r.status === 'APPROVED'
                ? 'bg-[#167C63] text-white border-[#167C63]'
                : 'bg-[#E5F4EE] border-[#BCE3D4] hover:bg-[#D4EFE4] text-[#167C63]'
            }`}
          >
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span>{r.status === 'APPROVED' ? 'Approved' : 'Approve'}</span>
          </button>

          <button
            onClick={() => handleReject(r.id)}
            className={`h-8 px-3 rounded-[9px] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border ${
              r.status === 'REJECTED'
                ? 'bg-[#C24141] text-white border-[#C24141]'
                : 'bg-[#FFF1F1] border-[#F7C6C6] hover:bg-[#FDE2E2] text-[#C24141]'
            }`}
          >
            <X className="w-3.5 h-3.5 shrink-0" />
            <span>{r.status === 'REJECTED' ? 'Rejected' : 'Reject'}</span>
          </button>
        </div>
      ),
    },
  ];

  const COLOR_DOTS = ['#167C63', '#3C9D8B', '#3674A5', '#B7791F', '#8A968F'];

  const typeTotal = analytics.typeDistribution.reduce((acc, curr) => acc + curr.value, 0) || 1;
  const deptTotal = analytics.departmentDistribution.reduce((acc, curr) => acc + curr.value, 0) || 1;

  return (
    <div className="space-y-6 animate-fade-in text-[#12201A]">
      <PageHeader
        title="Leave Management System"
        description="Manage employee leave requests, configure leave policies, and review balance ledgers"
        badge={<Badge variant="primary">LEAVE HUB</Badge>}
      />

      <LeaveSubNav />

      {/* KPI Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <StatCard
          title="On Leave Today"
          value={kpiData.employeesOnLeaveToday}
          subtitle="Approved PTO & Medical"
          icon={CalendarDays}
          status="default"
          accent={true}
        />

        <StatCard
          title="Pending Requests"
          value={kpiData.pendingRequests}
          subtitle="Requires Manager Review"
          icon={Clock}
          status="warning"
          accent={true}
        />

        <StatCard
          title="Approved This Month"
          value={kpiData.approvedThisMonth}
          subtitle="Processed Days"
          icon={CheckCircle}
          status="success"
          accent={true}
        />

        <StatCard
          title="Rejected This Month"
          value={kpiData.rejectedThisMonth}
          subtitle="Declined Applications"
          icon={XCircle}
          status="danger"
          accent={true}
        />
      </div>

      {/* Analytics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Leave Type Distribution" description="Category breakdown for current cycle" />
          <CardBody className="space-y-4 text-xs">
            {analytics.typeDistribution.map((t, i) => {
              const pct = Math.round((t.value / typeTotal) * 100);
              const dotColor = COLOR_DOTS[i % COLOR_DOTS.length];
              return (
                <div key={i} className="space-y-1.5 pb-2 border-b border-[#E1E9E4] last:border-0 last:pb-0">
                  <div className="flex justify-between items-center h-7">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                      <span className="text-[#33413A] font-medium">{t.name}</span>
                    </div>
                    <span className="font-semibold text-[#12201A] tabular-nums">{t.value} days ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[#E8EFEB] h-2 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, backgroundColor: dotColor }} />
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Department Leave Usage" description="Workforce PTO by organizational unit" />
          <CardBody className="space-y-4 text-xs">
            {analytics.departmentDistribution.map((d, i) => {
              const pct = Math.round((d.value / deptTotal) * 100);
              return (
                <div key={i} className="space-y-1.5 pb-2 border-b border-[#E1E9E4] last:border-0 last:pb-0">
                  <div className="flex justify-between items-center h-7">
                    <span className="text-[#33413A] font-medium">{d.name}</span>
                    <span className="font-semibold text-[#12201A] tabular-nums">{d.value} days ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[#E8EFEB] h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-[#5FB79E] rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>

      {/* Main Request Queue Table */}
      <Card>
        <CardHeader
          title="Leave Requests Queue"
          description="Managerial and HR approval controls"
          action={
            <div className="inline-flex items-center p-1 bg-[#EEF3F0] border border-[#CBD8D1] rounded-[10px] space-x-1">
              {[
                { label: 'All', value: '' },
                { label: 'Pending', value: 'PENDING' },
                { label: 'Approved', value: 'APPROVED' },
                { label: 'Rejected', value: 'REJECTED' }
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`px-3 py-1 rounded-[7px] text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === f.value
                      ? 'bg-white text-[#167C63] shadow-xs border border-[#CFE6DC]'
                      : 'text-[#33413A] hover:text-[#12201A] hover:bg-[#F0F6F3]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          }
        />
        <CardBody className="p-0">
          <DataTable
            columns={columns}
            data={requests.filter((r) => {
              if (!statusFilter) return true;
              return (r.status || '').toUpperCase() === statusFilter.toUpperCase();
            })}
            isLoading={isLoading}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default HRLeaveDashboardPage;
