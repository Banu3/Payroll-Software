import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { Download, FileText, CalendarDays, DollarSign, Clock, ShieldCheck } from 'lucide-react';

export const EmployeeDashboard = () => {
  const { user, company } = useAuth();

  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Employee';

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`Welcome back, ${fullName}`}
        description={`Employee Self-Service Portal — ${company?.name || 'Enterprise'}`}
        badge={<Badge variant="default">EMPLOYEE PORTAL</Badge>}
        action={
          <Button variant="primary" size="sm" icon={Download}>
            Download Latest Payslip
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-700 font-medium">
            <span>Current Net Pay</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">$4,850.00</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-mono font-semibold">Disbursed Aug 31, 2026</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-700 font-medium">
            <span>Remaining Leave Balance</span>
            <CalendarDays className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">14 Days</div>
          <div className="text-[11px] text-slate-700 mt-1 font-mono font-medium">Paid Time Off (PTO)</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between text-xs text-slate-700 font-medium">
            <span>Hours Logged This Cycle</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">152.0 hrs</div>
          <div className="text-[11px] text-emerald-700 mt-1 font-mono font-semibold">100% On-Time Attendance</div>
        </Card>
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
              { period: 'August 2026', amount: '$4,850.00', date: '2026-08-31', status: 'PAID' },
              { period: 'July 2026', amount: '$4,850.00', date: '2026-07-31', status: 'PAID' },
              { period: 'June 2026', amount: '$4,850.00', date: '2026-06-30', status: 'PAID' },
            ].map((ps, i) => (
              <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <div>
                    <span className="font-semibold text-slate-900">{ps.period}</span>
                    <span className="block text-[10px] text-slate-700 font-mono">Paid on {ps.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">{ps.amount}</span>
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
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">Assigned Role:</span>
                <Badge variant="default">EMPLOYEE</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">Tenant Isolation:</span>
                <span className="text-emerald-700 font-mono font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> SECURE (RLS Active)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">Two-Factor Authentication:</span>
                <span className="text-slate-800 font-semibold">Disabled (Recommended)</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
