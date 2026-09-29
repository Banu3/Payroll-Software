import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { StatCard } from '../../../components/ui/StatCard';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import {
  DollarSign,
  TrendingUp,
  Users,
  Building,
  Layers,
  Settings,
  Calculator,
  FileSpreadsheet,
  Plus,
  ShieldCheck,
  Check,
  Clock
} from 'lucide-react';
import { api } from '../../../services/api';
import { formatCurrency } from '../../../services/financialCalculationService';

export const HRCompensationDashboardPage = () => {
  const navigate = useNavigate();

  const [kpiData, setKpiData] = useState({
    totalEmployees: 48,
    employeesWithStructure: 46,
    employeesWithoutStructure: 2,
    totalAnnualCtc: 5838000,
    totalMonthlyCtc: 486500,
    totalMonthlyGross: 436500,
    totalEmployeeDeductions: 88300,
    totalEmployerContributions: 50000,
    pendingRevisions: 3,
  });

  const [revisions, setRevisions] = useState([
    { id: 'rev-1', employee: { first_name: 'Eleanor', last_name: 'Sterling', employee_id: 'EMP-1001' }, revision_type: 'Annual Appraisal', current_ctc: 1200000, proposed_ctc: 1400000, percentage_increase: 16.6, effective_date: '2026-10-01', status: 'PENDING' },
    { id: 'rev-2', employee: { first_name: 'Marcus', last_name: 'Brooke', employee_id: 'EMP-1002' }, revision_type: 'Promotion Adjustment', current_ctc: 1500000, proposed_ctc: 1800000, percentage_increase: 20.0, effective_date: '2026-10-01', status: 'APPROVED' },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDashboardKPIs();
    fetchRevisions();
  }, []);

  const fetchDashboardKPIs = async () => {
    try {
      const res = await api.get('/compensation/dashboard');
      if (res && res.success && res.data) {
        setKpiData(res.data);
      }
    } catch (err) {
      console.warn('Using client fallback for compensation KPIs:', err);
    }
  };

  const fetchRevisions = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/compensation/revisions');
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setRevisions(res.data);
      }
    } catch (err) {
      console.warn('Using fallback revisions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#17221C]">
      <PageHeader
        title="Compensation & Salary Structure Management"
        description="Manage company CTC structures, earnings, deductions, statutory PF/ESI, and salary revisions"
        badge={<Badge variant="primary">COMPENSATION HUB</Badge>}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" icon={Layers} onClick={() => navigate('/hr/compensation/structures')}>
              Structures
            </Button>
            <Button variant="outline" size="sm" icon={Settings} onClick={() => navigate('/hr/compensation/components')}>
              Components
            </Button>
            <Button variant="outline" size="sm" icon={Users} onClick={() => navigate('/hr/compensation/employees')}>
              Employee CTC
            </Button>
            <Button variant="outline" size="sm" icon={TrendingUp} onClick={() => navigate('/hr/compensation/revisions')}>
              Revisions ({kpiData.pendingRevisions})
            </Button>
            <Button variant="outline" size="sm" icon={ShieldCheck} onClick={() => navigate('/hr/compensation/statutory')}>
              Statutory Config
            </Button>
            <Button variant="primary" size="sm" icon={Calculator} onClick={() => navigate('/hr/compensation/calculator')}>
              Salary Calculator
            </Button>
          </div>
        }
      />

      {/* SALARY SUMMARY CARDS (Gross, Earnings, Deductions, Net) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Annual Payroll CTC"
          value={formatCurrency(kpiData.totalAnnualCtc)}
          subtitle={`Monthly CTC: ${formatCurrency(kpiData.totalMonthlyCtc)}`}
          icon={DollarSign}
        />

        <StatCard
          title="Total Monthly Gross"
          value={formatCurrency(kpiData.totalMonthlyGross)}
          subtitle="Before employee deductions"
          icon={TrendingUp}
        />

        <StatCard
          title="Total Employee Deductions"
          value={formatCurrency(kpiData.totalEmployeeDeductions)}
          subtitle="PF, ESI, PT, TDS"
          icon={ShieldCheck}
        />

        <StatCard
          title="Employer Contributions"
          value={formatCurrency(kpiData.totalEmployerContributions)}
          subtitle="Employer PF & ESI"
          icon={Building}
        />
      </div>

      {/* Structure Assignment Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Assigned Salary Structure"
          value={`${kpiData.employeesWithStructure} / ${kpiData.totalEmployees}`}
          subtitle="96% Covered"
          icon={Check}
        />

        <StatCard
          title="Unassigned Employees"
          value={kpiData.employeesWithoutStructure}
          subtitle="Action Required"
          icon={Clock}
        />

        <StatCard
          title="Pending Salary Revisions"
          value={kpiData.pendingRevisions}
          subtitle="Awaiting HR Review"
          icon={TrendingUp}
        />
      </div>

      {/* Recent Salary Revisions Table */}
      <Card>
        <CardHeader
          title="Recent Salary Revisions & Increment Workflow"
          description="Employee CTC changes, promotions, and approval statuses"
        />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F9F7] border-b border-[#DCE5E0] text-[#65736B] font-semibold sticky top-0">
                <tr>
                  <th className="p-4">Employee</th>
                  <th className="p-4">Revision Type</th>
                  <th className="p-4 text-right">Current CTC</th>
                  <th className="p-4 text-right">Proposed CTC</th>
                  <th className="p-4 text-right">Increase %</th>
                  <th className="p-4">Effective Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EEEA]">
                {revisions.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F4F8F5] transition-colors">
                    <td className="p-4 font-semibold text-[#17221C]">
                      {r.employee?.first_name} {r.employee?.last_name} <span className="font-mono text-[11px] text-[#65736B]">({r.employee?.employee_id})</span>
                    </td>
                    <td className="p-4 text-[#526158] font-medium">{r.revision_type}</td>
                    <td className="p-4 text-[#526158] text-right tabular-nums font-mono">{formatCurrency(r.current_ctc)}</td>
                    <td className="p-4 font-bold text-[#167C63] text-right tabular-nums font-mono">
                      {formatCurrency(r.proposed_ctc)}
                    </td>
                    <td className="p-4 text-[#167C63] font-bold text-right tabular-nums">+{r.percentage_increase}%</td>
                    <td className="p-4 font-mono text-[#65736B]">{r.effective_date}</td>
                    <td className="p-4">
                      <Badge variant={r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'danger' : 'warning'}>
                        {r.status}
                      </Badge>
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

export default HRCompensationDashboardPage;
