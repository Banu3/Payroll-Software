import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { useAuth } from '../../context/AuthContext';
import { PermissionGate } from '../../components/ui/PermissionGate';
import {
  Users,
  DollarSign,
  CalendarCheck,
  TrendingUp,
  Play,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';
import { formatCurrency } from '../../services/financialCalculationService';

export const HRDashboard = () => {
  const { user, company, hasPermission } = useAuth();
  const [payrollData, setPayrollData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    fetchPayrollOverview();
  }, []);

  const fetchPayrollOverview = async () => {
    try {
      const res = await api.get('/payroll/overview');
      if (res && res.success) {
        setPayrollData(res.data);
      }
    } catch (err) {
      console.warn('Payroll overview warning:', err);
    }
  };

  const handleProcessPayroll = async () => {
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const res = await api.post('/payroll/process', { payPeriod: 'September 2026' });
      setStatusMessage(res.message);
      fetchPayrollOverview();
    } catch (err) {
      setStatusMessage(err.message || 'Processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalizePayroll = async () => {
    setIsFinalizing(true);
    setStatusMessage(null);
    try {
      const res = await api.post('/payroll/finalize', { payrollRunId: 'PR-2026-09' });
      setStatusMessage(res.message);
      fetchPayrollOverview();
    } catch (err) {
      setStatusMessage(err.message || 'Finalization failed');
    } finally {
      setIsFinalizing(false);
    }
  };

  const employees = [
    { code: 'EMP-1001', name: 'Eleanor Sterling', title: 'Global HR Director', department: 'People Operations', status: 'ACTIVE' },
    { code: 'EMP-1002', name: 'Marcus Brooke', title: 'Engineering Team Lead', department: 'Software Engineering', status: 'ACTIVE' },
    { code: 'EMP-1003', name: 'Sarah Jenkins', title: 'Senior Financial Analyst', department: 'Finance & Payroll', status: 'ACTIVE' },
    { code: 'EMP-1004', name: 'David Miller', title: 'Associate Operations Analyst', department: 'Operations', status: 'ONBOARDING' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`HR & Payroll Management Console — ${company?.name || 'Company'}`}
        description="Tenant Operations, Employee Onboarding & Payroll Calculations"
        badge={<Badge variant="primary">HR ADMIN ACCESS</Badge>}
        action={
          <div className="flex gap-2">
            <PermissionGate permission="payroll.process">
              <Button variant="outline" size="sm" icon={Play} isLoading={isProcessing} onClick={handleProcessPayroll}>
                Run Payroll Calculation
              </Button>
            </PermissionGate>
            <PermissionGate permission="payroll.finalize">
              <Button variant="primary" size="sm" icon={CheckCircle2} isLoading={isFinalizing} onClick={handleFinalizePayroll}>
                Finalize & Disburse
              </Button>
            </PermissionGate>
          </div>
        }
      />

      {statusMessage && (
        <div className="p-4 rounded-[10px] bg-[#E5F4EE] border border-[#BCE3D4] text-[#167C63] font-semibold text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#167C63] shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Employees"
          value={payrollData?.totalEmployees || 128}
          subtitle="Company Wide"
          icon={Users}
        />
        <StatCard
          title="Present Today"
          value={payrollData?.presentToday || 116}
          subtitle="Active Attendance"
          icon={CheckCircle2}
        />
        <StatCard
          title="On Leave"
          value={payrollData?.onLeave || 8}
          subtitle="Approved Leaves"
          icon={CalendarCheck}
        />
        <StatCard
          title="New Joiners"
          value={payrollData?.newJoiners || 4}
          subtitle="Onboarding"
          icon={UserPlus}
        />
        <StatCard
          title="Payroll Pending"
          value={payrollData?.payrollPending || 12}
          subtitle="Awaiting Approval"
          icon={Clock}
        />
      </div>

      {/* Employees Table */}
      <Card>
        <CardHeader
          title="Company Workforce Profiles"
          description="Tenant-isolated employee records managed by HR Department"
        />
        <CardBody className="p-0">
          <DataTable
            columns={[
              { header: 'Employee Code', accessor: 'code', render: (e) => <span className="font-mono text-[#17221C] font-semibold">{e.code}</span> },
              { header: 'Full Name', accessor: 'name', render: (e) => <span className="font-medium text-[#17221C]">{e.name}</span> },
              { header: 'Job Title', accessor: 'title', render: (e) => <span className="text-[#526158]">{e.title}</span> },
              { header: 'Department', accessor: 'department', render: (e) => <span className="text-[#526158]">{e.department}</span> },
              { header: 'Status', accessor: 'status', render: (e) => <Badge variant={e.status === 'ACTIVE' ? 'success' : 'warning'}>{e.status}</Badge> },
            ]}
            data={employees}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default HRDashboard;
