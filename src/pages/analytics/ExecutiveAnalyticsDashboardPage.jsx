import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Calendar,
  CreditCard,
  ShieldCheck,
  Building,
  Filter,
  Download,
  Loader2
} from 'lucide-react';
import api from '../../lib/axios';

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
      <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-blue-400" /> Loading executive analytics...
      </div>
    );
  }

  const { workforce = {}, payroll = {}, payments = {}, departments = [] } = overview || {};

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-400" /> Executive Analytics & Management Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Real-time workforce intelligence, payroll variance, statutory compliance, and departmental cost analysis.
          </p>
        </div>

        {/* Global Date Filter */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-xl">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
          >
            <option value="THIS_MONTH">This Month</option>
            <option value="LAST_MONTH">Last Month</option>
            <option value="THIS_QUARTER">This Quarter</option>
            <option value="THIS_FY">This Financial Year</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Workforce */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Active Workforce</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100">{workforce.activeEmployees || 0}</div>
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>Notice: {workforce.noticeEmployees || 0}</span>
            <span className="text-amber-400">Attrition: {Number(workforce.attritionRate || 0).toFixed(1)}%</span>
          </div>
        </div>

        {/* Current Gross Payroll */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Latest Gross Payroll</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">₹{Number(payroll.latestGross || 0).toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 font-mono">
            Net Pay: ₹{Number(payroll.latestNet || 0).toLocaleString()}
          </div>
        </div>

        {/* Employer Cost (CTC) */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Employer Cost</span>
            <Building className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400 font-mono">₹{Number(payroll.latestEmployerCost || 0).toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 font-mono">
            Avg Salary: ₹{Math.round(payroll.averageSalary || 0).toLocaleString()}
          </div>
        </div>

        {/* Total Bank Payments */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Reconciled Payments</span>
            <CreditCard className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">₹{Number(payments.totalPaid || 0).toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 font-mono">
            Pending: ₹{Number(payments.pendingDisbursement || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Grid: Department Cost & Recent Payroll Trend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department Headcount Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-400" /> Department Headcount Distribution
          </h2>
          <div className="space-y-3">
            {departments.map((dept, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span className="font-semibold">{dept.name}</span>
                  <span className="font-mono text-slate-400">{dept.count} employees</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.round(((dept.count || 0) / (workforce.activeEmployees || 1)) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payroll History Trend */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Monthly Payroll Trend (Finalized Runs)
          </h2>
          <div className="space-y-2">
            {(payroll.trend || []).map((run) => (
              <div key={run.id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg text-xs flex items-center justify-between font-mono">
                <div>
                  <span className="font-bold text-slate-200 block font-sans">Run #{run.run_number}</span>
                  <span className="text-[10px] text-slate-500">Staff: {run.total_employees}</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-bold block">₹{Number(run.total_gross || 0).toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400">Net: ₹{Number(run.total_net_pay || run.total_net || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
