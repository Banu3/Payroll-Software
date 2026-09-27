import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
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
        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>Direct Reports</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">6 Team Members</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-mono font-semibold">3 Present Today</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>Pending Leave Requests</span>
            <Calendar className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {leaveRequests.filter((r) => r.status === 'PENDING').length} Requests
          </div>
          <div className="text-[11px] text-amber-700 mt-1 font-mono font-semibold">Requires Manager Review</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>Team Attendance Rate</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">98.4%</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-mono font-semibold">Current Month</div>
        </Card>
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
              { header: 'Employee', accessor: 'employee', render: (r) => <span className="font-semibold text-slate-900">{r.employee}</span> },
              { header: 'Leave Category', accessor: 'type', render: (r) => <span className="text-slate-800 font-medium">{r.type}</span> },
              { header: 'Dates Requested', accessor: 'dates', render: (r) => <span className="text-slate-700">{r.dates}</span> },
              { header: 'Total Days', accessor: 'days', render: (r) => <span className="text-slate-800 font-semibold">{r.days}</span> },
              { header: 'Status', accessor: 'status', render: (r) => <Badge variant={r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'danger' : 'warning'}>{r.status}</Badge> },
              {
                header: 'Action',
                accessor: 'actions',
                render: (r) => (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(r.id)}
                      style={{ color: '#0F172A', backgroundColor: r.status === 'APPROVED' ? '#0F766E' : '#E6F4F1', borderColor: '#0F766E' }}
                      className={`h-8 px-3 rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                        r.status === 'APPROVED'
                          ? 'bg-[#0F766E] text-white border-[#0F766E]'
                          : 'bg-[#E6F4F1] border-[#0F766E] hover:bg-[#D1ECE7] text-[#0F172A]'
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 shrink-0 ${r.status === 'APPROVED' ? 'text-white' : 'text-[#0F766E]'}`} />
                      <span style={{ color: r.status === 'APPROVED' ? '#FFFFFF' : '#0F172A', fontWeight: 700 }}>
                        {r.status === 'APPROVED' ? 'Approved' : 'Approve'}
                      </span>
                    </button>

                    <button
                      onClick={() => handleReject(r.id)}
                      style={{ color: '#0F172A', backgroundColor: r.status === 'REJECTED' ? '#E11D48' : '#FFF1F2', borderColor: '#F43F5E' }}
                      className={`h-8 px-3 rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                        r.status === 'REJECTED'
                          ? 'bg-rose-600 text-white border-rose-700'
                          : 'bg-rose-50 border-rose-300 hover:bg-rose-100 text-[#0F172A]'
                      }`}
                    >
                      <X className={`w-3.5 h-3.5 shrink-0 ${r.status === 'REJECTED' ? 'text-white' : 'text-rose-600'}`} />
                      <span style={{ color: r.status === 'REJECTED' ? '#FFFFFF' : '#0F172A', fontWeight: 700 }}>
                        {r.status === 'REJECTED' ? 'Rejected' : 'Reject'}
                      </span>
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
