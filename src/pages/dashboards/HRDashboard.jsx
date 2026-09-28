import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
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
  AlertTriangle
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
        <div className="p-4 rounded-xl bg-blue-100/90 border border-blue-500 text-blue-950 font-bold text-xs flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-blue-800 shrink-0 font-bold" />
          <span className="text-blue-950 font-bold">{statusMessage}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-700 font-medium">
            <span>Company Active Employees</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{payrollData?.totalEmployees || 48}</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-mono font-semibold">1 Onboarding Pending</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-700 font-medium">
            <span>Gross Monthly Payroll</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {formatCurrency(payrollData?.grossPayrollAmount || 875000)}
          </div>
          <div className="text-[11px] text-slate-700 mt-1 font-mono font-medium">Cycle: {payrollData?.currentCycle || 'Sept 2026'}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-700 font-medium">
            <span>Tax & Benefit Deductions</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {formatCurrency((payrollData?.taxDeductions || 34300) + (payrollData?.benefitDeductions || 12450))}
          </div>
          <div className="text-[11px] text-amber-700 mt-1 font-mono font-semibold">Automated Withholding</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-700 font-medium">
            <span>Net Disbursement</span>
            <CalendarCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {formatCurrency(payrollData?.netDisbursementAmount || 828250)}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-mono font-semibold">Due: {payrollData?.paymentDueDate || '2026-09-30'}</div>
        </Card>
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
              { header: 'Employee Code', accessor: 'code', render: (e) => <span className="font-mono text-slate-800 font-semibold">{e.code}</span> },
              { header: 'Full Name', accessor: 'name', render: (e) => <span className="font-medium text-slate-900">{e.name}</span> },
              { header: 'Job Title', accessor: 'title', render: (e) => <span className="text-slate-800">{e.title}</span> },
              { header: 'Department', accessor: 'department', render: (e) => <span className="text-slate-800">{e.department}</span> },
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
