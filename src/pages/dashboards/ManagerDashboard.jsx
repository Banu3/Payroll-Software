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
  const [leaveRequests, setLeaveRequests] = useState([
    { id: 'lr-1', employee: 'Sarah Jenkins', type: 'Annual Leave', dates: 'Oct 05 - Oct 08, 2026', days: 4, status: 'PENDING' },
    { id: 'lr-2', employee: 'David Miller', type: 'Sick Leave', dates: 'Oct 12, 2026', days: 1, status: 'PENDING' },
  ]);

  const handleApprove = (id) => {
    setLeaveRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'APPROVED' } : r))
    );
  };

  const handleReject = (id) => {
    setLeaveRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'REJECTED' } : r))
    );
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
                render: (r) =>
                  r.status === 'PENDING' ? (
                    <div className="flex items-center gap-1.5">
                      <Button variant="primary" size="sm" icon={Check} onClick={() => handleApprove(r.id)}>
                        Approve
                      </Button>
                      <Button variant="outline" size="sm" icon={X} onClick={() => handleReject(r.id)}>
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">Action Taken</span>
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
