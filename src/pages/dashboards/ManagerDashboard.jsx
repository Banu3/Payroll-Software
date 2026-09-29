import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { useAuth } from '../../context/AuthContext';
import { Users, Clock, Calendar, Check, X, Shield } from 'lucide-react';

export const ManagerDashboard = () => {
  const { user } = useAuth();
  const STORAGE_KEY = 'payroll_manager_dashboard_leave';

  const [leaveRequests, setLeaveRequests] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse manager dashboard leave requests:', e);
    }
    return [
      { id: 'lr-1', employee: 'Sarah Jenkins', type: 'Annual Leave', dates: 'Oct 05 - Oct 08, 2026', days: 4, status: 'PENDING' },
      { id: 'lr-2', employee: 'David Miller', type: 'Sick Leave', dates: 'Oct 12, 2026', days: 1, status: 'PENDING' },
    ];
  });

  const handleApprove = (id) => {
    setLeaveRequests((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, status: 'APPROVED' } : r));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleReject = (id) => {
    setLeaveRequests((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, status: 'REJECTED' } : r));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const teamMembers = [
    { name: 'Sarah Jenkins', title: 'Senior Financial Analyst', status: 'PRESENT', hoursThisWeek: '38.5 hrs' },
    { name: 'David Miller', title: 'Associate Operations Analyst', status: 'PRESENT', hoursThisWeek: '40.0 hrs' },
    { name: 'Alex Rivera', title: 'Backend Software Engineer', status: 'REMOTE', hoursThisWeek: '39.0 hrs' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Engineering Team Leadership Portal"
        description="Direct Reports Supervision, Leave Approvals & Performance Metrics"
        badge={<Badge variant="warning">MANAGER ACCESS</Badge>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Direct Reports"
          value="6 Members"
          subtitle="3 Present Today"
          icon={Users}
        />
        <StatCard
          title="Pending Leave Requests"
          value={`${leaveRequests.filter((r) => r.status === 'PENDING').length} Requests`}
          subtitle="Requires Manager Review"
          icon={Calendar}
        />
        <StatCard
          title="Team Attendance Rate"
          value="98.4%"
          subtitle="Current Month"
          icon={Clock}
          trend="+1.2%"
          trendType="up"
        />
      </div>

      {/* Leave Approvals Table */}
      <Card>
        <CardHeader
          title="Team Leave Approval Requests"
          description="Managerial approval authority for team members"
        />
        <CardBody className="p-0">
          <DataTable
            columns={[
              { header: 'Employee', accessor: 'employee', render: (r) => <span className="font-semibold text-[#17221C]">{r.employee}</span> },
              { header: 'Leave Category', accessor: 'type', render: (r) => <span className="text-[#526158] font-medium">{r.type}</span> },
              { header: 'Dates Requested', accessor: 'dates', render: (r) => <span className="text-[#65736B]">{r.dates}</span> },
              { header: 'Total Days', accessor: 'days', render: (r) => <span className="text-[#17221C] font-semibold tabular-nums">{r.days}</span> },
              { header: 'Status', accessor: 'status', render: (r) => <Badge variant={r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'danger' : 'warning'}>{r.status}</Badge> },
              {
                header: 'Action',
                accessor: 'actions',
                render: (r) => (
                  <div className="flex items-center gap-2">
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
            ]}
            data={leaveRequests}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default ManagerDashboard;
