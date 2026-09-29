import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Building,
  CreditCard,
  Filter,
  Loader2
} from 'lucide-react';
import api from '../../lib/axios';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';

export default function ExecutiveAnalyticsDashboardPage() {
  const [dateRange, setDateRange] = useState('THIS_MONTH');

  // Fetch Executive Overview metrics
  const { data: overview, isLoading } = useQuery({
    queryKey: ['executive-overview', dateRange],
    queryFn: async () => {
      const res = await api.get('/analytics/overview');
      return res.data?.data || res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="p-12 text-center text-[#5A6A61] flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[#167C63]" /> Loading executive analytics...
      </div>
    );
  }

  const { workforce = {}, payroll = {}, payments = {}, departments = [] } = overview || {};

  return (
    <div className="space-y-6 animate-fade-in text-[#12201A]">
      {/* Header */}
      <PageHeader
        title="Executive Analytics & Management Dashboard"
        description="Real-time workforce intelligence, payroll variance, statutory compliance, and departmental cost analysis."
        badge={<Badge variant="primary">EXECUTIVE ANALYTICS</Badge>}
        action={
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#BCCBC3] rounded-[10px] shadow-2xs">
            <Filter className="w-4 h-4 text-[#167C63]" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent text-xs text-[#12201A] font-semibold focus:outline-none cursor-pointer border-none p-0"
            >
              <option value="THIS_MONTH">This Month</option>
              <option value="LAST_MONTH">Last Month</option>
              <option value="THIS_QUARTER">This Quarter</option>
              <option value="THIS_FY">This Financial Year</option>
            </select>
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        <StatCard
          title="Total Active Workforce"
          value={workforce.activeEmployees || 0}
          subtitle={`Notice: ${workforce.noticeEmployees || 0} | Attrition: ${Number(workforce.attritionRate || 0).toFixed(1)}%`}
          icon={Users}
          status="default"
          accent={true}
        />

        <StatCard
          title="Latest Gross Payroll"
          value={`₹${Number(payroll.latestGross || 0).toLocaleString()}`}
          subtitle={`Net Pay: ₹${Number(payroll.latestNet || 0).toLocaleString()}`}
          icon={DollarSign}
          status="success"
          accent={true}
        />

        <StatCard
          title="Total Employer Cost"
          value={`₹${Number(payroll.latestEmployerCost || 0).toLocaleString()}`}
          subtitle={`Avg Salary: ₹${Math.round(payroll.averageSalary || 0).toLocaleString()}`}
          icon={Building}
          status="default"
          accent={true}
        />

        <StatCard
          title="Reconciled Payments"
          value={`₹${Number(payments.totalPaid || 0).toLocaleString()}`}
          subtitle={`Pending: ₹${Number(payments.pendingDisbursement || 0).toLocaleString()}`}
          icon={CreditCard}
          status="success"
          accent={true}
        />
      </div>

      {/* Grid: Department Cost & Recent Payroll Trend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department Headcount Breakdown */}
        <Card>
          <CardHeader title="Department Headcount Distribution" description="Staff allocation across functional teams" />
          <CardBody className="space-y-4 text-xs">
            {departments.length === 0 ? (
              <p className="text-[#5A6A61] italic text-center py-4">No department headcount records found.</p>
            ) : (
              departments.map((dept, idx) => {
                const pct = Math.min(100, Math.round(((dept.count || 0) / (workforce.activeEmployees || 1)) * 100));
                return (
                  <div key={idx} className="space-y-1.5 pb-2 border-b border-[#E1E9E4] last:border-0 last:pb-0">
                    <div className="flex justify-between items-center h-6">
                      <span className="font-semibold text-[#12201A]">{dept.name}</span>
                      <span className="font-mono text-[#5A6A61] font-medium">{dept.count} employees ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-[#E8EFEB] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#167C63] rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardBody>
        </Card>

        {/* Payroll History Trend */}
        <Card>
          <CardHeader title="Monthly Payroll Trend (Finalized Runs)" description="Historical disbursement summary" />
          <CardBody className="space-y-3">
            {(payroll.trend || []).length === 0 ? (
              <p className="text-[#5A6A61] italic text-center py-4">No finalized payroll runs recorded yet.</p>
            ) : (
              (payroll.trend || []).map((run) => (
                <div key={run.id} className="p-3 bg-[#F3F7F5] border border-[#CBD8D1] rounded-[10px] text-xs flex items-center justify-between font-mono">
                  <div>
                    <span className="font-bold text-[#12201A] block font-sans">Run #{run.run_number}</span>
                    <span className="text-[10px] text-[#5A6A61]">Staff: {run.total_employees}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#167C63] font-bold block">₹{Number(run.total_gross || 0).toLocaleString()}</span>
                    <span className="text-[10px] text-[#5A6A61]">Net: ₹{Number(run.total_net_pay || run.total_net || 0).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
