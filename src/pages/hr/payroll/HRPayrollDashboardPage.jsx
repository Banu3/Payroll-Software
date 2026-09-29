import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { StatCard } from '../../../components/ui/StatCard';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  DollarSign,
  TrendingUp,
  Play,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  Plus
} from 'lucide-react';
import { api } from '../../../services/api';
import { formatCurrency } from '../../../services/financialCalculationService';

const MOCK_PAYROLL_RUNS = [
  { id: 'run_101', run_number: 'PR-2026-09', period: { month_year: 'September 2026' }, processed_employees: 48, total_employees: 48, total_gross: 436500, total_deductions: 88300, total_net_pay: 348200, status: 'FINALIZED', run_date: '2026-09-25' },
  { id: 'run_102', run_number: 'PR-2026-08', period: { month_year: 'August 2026' }, processed_employees: 45, total_employees: 45, total_gross: 418250, total_deductions: 83650, total_net_pay: 334600, status: 'FINALIZED', run_date: '2026-08-26' },
  { id: 'run_103', run_number: 'PR-2026-07', period: { month_year: 'July 2026' }, processed_employees: 42, total_employees: 42, total_gross: 395000, total_deductions: 79000, total_net_pay: 316000, status: 'FINALIZED', run_date: '2026-07-27' },
  { id: 'run_104', run_number: 'PR-2026-10-DRAFT', period: { month_year: 'October 2026 (Draft)' }, processed_employees: 48, total_employees: 48, total_gross: 436500, total_deductions: 88300, total_net_pay: 348200, status: 'REVIEW', run_date: '2026-09-27' },
];

export const HRPayrollDashboardPage = () => {
  const navigate = useNavigate();

  const [kpiData, setKpiData] = useState({
    totalRuns: 4,
    draftRuns: 1,
    pendingApproval: 1,
    finalizedRuns: 3,
    totalGross: 436500,
    totalDeductions: 88300,
    totalEmployerCost: 485000,
    totalNetPay: 348200,
    totalPf: 28800,
    totalEsi: 2160,
  });

  const [runs, setRuns] = useState(MOCK_PAYROLL_RUNS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDashboardKPIs();
    fetchRuns();
  }, []);

  const fetchDashboardKPIs = async () => {
    try {
      const res = await api.get('/payroll-processing/dashboard');
      if (res && res.success && res.data) {
        setKpiData(res.data);
      }
    } catch {
      // Use client fallback
    }
  };

  const fetchRuns = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/payroll-processing/runs');
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setRuns(res.data);
      } else {
        setRuns(MOCK_PAYROLL_RUNS);
      }
    } catch {
      setRuns(MOCK_PAYROLL_RUNS);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#17221C]">
      <PageHeader
        title="Enterprise Payroll Processing Engine"
        description="Process actual employee payroll runs, run pre-payroll validations, approve calculations, and issue payslips."
        badge={<Badge variant="primary">HR CONSOLE</Badge>}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/hr/payroll/runs">
              <Button variant="outline" size="sm" icon={Layers}>
                Runs Queue
              </Button>
            </Link>
            <Link to="/hr/payroll/register">
              <Button variant="outline" size="sm" icon={FileSpreadsheet}>
                Register
              </Button>
            </Link>
            <Link to="/hr/payroll/reports">
              <Button variant="outline" size="sm" icon={TrendingUp}>
                Reports
              </Button>
            </Link>
            <Link to="/hr/payroll/runs/new">
              <Button variant="primary" size="sm" icon={Play}>
                Create Payroll Run
              </Button>
            </Link>
          </div>
        }
      />

      {/* SUMMARY STRIP CARD */}
      <div className="bg-white border border-[#DCE5E0] rounded-[14px] p-5 shadow-[0_4px_16px_rgba(20,50,35,0.05)] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#65736B] block">Pay Period</span>
          <span className="text-sm font-bold text-[#17221C] mt-1 block">September 2026</span>
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#65736B] block">Employees</span>
          <span className="text-sm font-bold text-[#17221C] mt-1 block tabular-nums">48 Processed</span>
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#65736B] block">Total Gross</span>
          <span className="text-sm font-bold text-[#17221C] mt-1 block tabular-nums">{formatCurrency(kpiData.totalGross)}</span>
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#65736B] block">Deductions</span>
          <span className="text-sm font-bold text-[#C24141] mt-1 block tabular-nums">{formatCurrency(kpiData.totalDeductions)}</span>
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#65736B] block">Net Pay</span>
          <span className="text-sm font-extrabold text-[#167C63] mt-1 block tabular-nums">{formatCurrency(kpiData.totalNetPay)}</span>
        </div>
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#65736B] block">Run Status</span>
          <div className="mt-1">
            <Badge variant="success">FINALIZED</Badge>
          </div>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Net Payroll"
          value={formatCurrency(kpiData.totalNetPay)}
          subtitle="Finalized across active runs"
          icon={DollarSign}
        />

        <StatCard
          title="Total Gross Payroll"
          value={formatCurrency(kpiData.totalGross)}
          subtitle="Before deductions"
          icon={TrendingUp}
        />

        <StatCard
          title="Total Employee Deductions"
          value={formatCurrency(kpiData.totalDeductions)}
          subtitle={`PF: ${formatCurrency(kpiData.totalPf)} • ESI: ${formatCurrency(kpiData.totalEsi)}`}
          icon={ShieldCheck}
        />

        <StatCard
          title="Total Employer Cost (CTC)"
          value={formatCurrency(kpiData.totalEmployerCost)}
          subtitle="Employer PF & ESI contributions"
          icon={Calendar}
        />
      </div>

      {/* Payroll Run Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Draft Runs"
          value={kpiData.draftRuns}
          subtitle="In preparation"
          icon={Clock}
        />

        <StatCard
          title="Pending Approvals"
          value={kpiData.pendingApproval}
          subtitle="Requires HR sign-off"
          icon={ShieldCheck}
        />

        <StatCard
          title="Finalized Runs"
          value={kpiData.finalizedRuns}
          subtitle="Disbursed & closed"
          icon={CheckCircle}
        />
      </div>

      {/* Payroll Runs History Table */}
      <Card>
        <CardHeader
          title="Recent Payroll Processing Runs"
          description="Monthly processing cycles, employee coverage, and financial totals"
          action={
            <Button size="sm" variant="primary" icon={Plus} onClick={() => navigate('/hr/payroll/runs/new')}>
              Create New Run
            </Button>
          }
        />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F9F7] border-b border-[#DCE5E0] text-[#65736B] font-semibold sticky top-0">
                <tr>
                  <th className="p-4">Run Number</th>
                  <th className="p-4">Payroll Period</th>
                  <th className="p-4">Employees</th>
                  <th className="p-4 text-right">Total Gross</th>
                  <th className="p-4 text-right">Total Deductions</th>
                  <th className="p-4 text-right">Total Net Pay</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EEEA]">
                {runs.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F4F8F5] transition-colors">
                    <td className="p-4 font-mono font-bold text-[#167C63]">{r.run_number}</td>
                    <td className="p-4 text-[#17221C] font-medium">{r.period?.month_year || '—'}</td>
                    <td className="p-4 text-[#526158] font-medium tabular-nums">{r.processed_employees} / {r.total_employees} staff</td>
                    <td className="p-4 text-[#17221C] font-bold text-right tabular-nums">{formatCurrency(r.total_gross)}</td>
                    <td className="p-4 text-[#C24141] font-medium text-right tabular-nums">{formatCurrency(r.total_deductions || 0)}</td>
                    <td className="p-4 font-extrabold text-[#167C63] text-right tabular-nums">{formatCurrency(r.total_net_pay)}</td>
                    <td className="p-4">
                      {r.status === 'FINALIZED' && <Badge variant="success">FINALIZED</Badge>}
                      {r.status === 'REVIEW' && <Badge variant="warning">IN REVIEW</Badge>}
                      {r.status !== 'FINALIZED' && r.status !== 'REVIEW' && <Badge variant="default">{r.status}</Badge>}
                    </td>
                    <td className="p-4 text-right">
                      <Button size="sm" variant="outline" icon={ArrowRight} onClick={() => navigate(`/hr/payroll/runs/${r.id}`)}>
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default HRPayrollDashboardPage;
