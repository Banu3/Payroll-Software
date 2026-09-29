import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { Download, FileText, CalendarDays, DollarSign, Clock, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../services/financialCalculationService';

export const EmployeeDashboard = () => {
  const { user, company } = useAuth();

  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Employee';

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`Welcome back, ${fullName}`}
        description={`Employee Self-Service Portal — ${company?.name || 'Enterprise'}`}
        badge={<Badge variant="primary">EMPLOYEE PORTAL</Badge>}
        action={
          <Button variant="primary" size="sm" icon={Download}>
            Download Latest Payslip
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Current Net Pay"
          value={formatCurrency(48500)}
          subtitle="Disbursed Aug 31, 2026"
          icon={DollarSign}
        />
        <StatCard
          title="Remaining Leave Balance"
          value="14 Days"
          subtitle="Paid Time Off (PTO)"
          icon={CalendarDays}
        />
        <StatCard
          title="Hours Logged This Cycle"
          value="152.0 hrs"
          subtitle="100% On-Time Attendance"
          icon={Clock}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payslips */}
        <Card>
          <CardHeader
            title="My Recent Payslips"
            description="Verified payroll records and tax statements"
          />
          <CardBody className="space-y-3">
            {[
              { period: 'August 2026', amount: formatCurrency(48500), date: '2026-08-31', status: 'PAID' },
              { period: 'July 2026', amount: formatCurrency(48500), date: '2026-07-31', status: 'PAID' },
              { period: 'June 2026', amount: formatCurrency(48500), date: '2026-06-30', status: 'PAID' },
            ].map((ps, i) => (
              <div key={i} className="p-3 bg-[#F7F9F7] border border-[#DCE5E0] rounded-[10px] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-[#167C63]" />
                  <div>
                    <span className="font-semibold text-[#17221C]">{ps.period}</span>
                    <span className="block text-[10px] text-[#65736B] font-mono">Paid on {ps.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#17221C] tabular-nums">{ps.amount}</span>
                  <Button variant="outline" size="sm" icon={Download}>
                    PDF
                  </Button>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Security & Access Info */}
        <Card>
          <CardHeader
            title="Account Security & Access Summary"
            description="Tenant isolation and identity verification parameters"
          />
          <CardBody className="space-y-3 text-xs">
            <div className="p-3 bg-[#F7F9F7] border border-[#DCE5E0] rounded-[10px] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[#526158] font-medium">Assigned Role:</span>
                <Badge variant="primary">EMPLOYEE</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#526158] font-medium">Tenant Isolation:</span>
                <span className="text-[#167C63] font-mono font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#167C63]" /> SECURE (RLS Active)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#526158] font-medium">Two-Factor Authentication:</span>
                <span className="text-[#17221C] font-semibold">Disabled (Recommended)</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
