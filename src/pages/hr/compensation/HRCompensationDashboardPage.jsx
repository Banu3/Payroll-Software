import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
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
    totalEmployees: 0,
    employeesWithStructure: 0,
    employeesWithoutStructure: 0,
    totalAnnualCtc: 0,
    totalMonthlyCtc: 0,
    totalMonthlyGross: 0,
    totalEmployeeDeductions: 0,
    totalEmployerContributions: 0,
    pendingRevisions: 0,
  });

  const [revisions, setRevisions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardKPIs();
    fetchRevisions();
  }, []);

  const fetchDashboardKPIs = async () => {
    try {
      const res = await api.get('/compensation/dashboard');
      if (res && res.success) {
        setKpiData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch compensation dashboard:', err);
    }
  };

  const fetchRevisions = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/compensation/revisions');
      if (res && res.success) {
        setRevisions(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch salary revisions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Compensation & Salary Structure Management"
        subtitle="Manage company CTC structures, earnings, deductions, statutory PF/ESI, and salary revisions"
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button variant="outline" size="sm" onClick={() => navigate('/hr/compensation/structures')}>
              <Layers size={14} style={{ marginRight: '0.375rem' }} />
              Structures
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/hr/compensation/components')}>
              <Settings size={14} style={{ marginRight: '0.375rem' }} />
              Components
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/hr/compensation/employees')}>
              <Users size={14} style={{ marginRight: '0.375rem' }} />
              Employee CTC
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/hr/compensation/revisions')}>
              <TrendingUp size={14} style={{ marginRight: '0.375rem' }} />
              Revisions ({kpiData.pendingRevisions})
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/hr/compensation/statutory')}>
              <ShieldCheck size={14} style={{ marginRight: '0.375rem' }} />
              Statutory Config
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/hr/compensation/calculator')}>
              <Calculator size={14} style={{ marginRight: '0.375rem' }} />
              Salary Calculator
            </Button>
          </div>
        }
      />

      {/* KPI Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <Card style={{ borderLeft: '4px solid var(--color-primary-600)' }}>
          <CardBody style={{ padding: '1rem' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 500 }}>Total Annual Payroll CTC</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--color-primary-600)' }}>
              {formatCurrency(kpiData.totalAnnualCtc)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Monthly CTC: {formatCurrency(kpiData.totalMonthlyCtc)}
            </div>
          </CardBody>
        </Card>

        <Card style={{ borderLeft: '4px solid var(--color-emerald-500)' }}>
          <CardBody style={{ padding: '1rem' }}>
            <div style={{ color: 'var(--color-emerald-700)', fontSize: '0.8125rem', fontWeight: 500 }}>Total Monthly Gross</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--color-emerald-600)' }}>
              {formatCurrency(kpiData.totalMonthlyGross)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Before deductions
            </div>
          </CardBody>
        </Card>

        <Card style={{ borderLeft: '4px solid var(--color-purple-500)' }}>
          <CardBody style={{ padding: '1rem' }}>
            <div style={{ color: 'var(--color-purple-700)', fontSize: '0.8125rem', fontWeight: 500 }}>Total Employee Deductions</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--color-purple-600)' }}>
              {formatCurrency(kpiData.totalEmployeeDeductions)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              PF, ESI, PT
            </div>
          </CardBody>
        </Card>

        <Card style={{ borderLeft: '4px solid var(--color-indigo-500)' }}>
          <CardBody style={{ padding: '1rem' }}>
            <div style={{ color: 'var(--color-indigo-700)', fontSize: '0.8125rem', fontWeight: 500 }}>Employer Contributions</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--color-indigo-600)' }}>
              {formatCurrency(kpiData.totalEmployerContributions)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Employer PF & ESI
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Structure Assignment Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        <Card>
          <CardBody style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Assigned Salary Structure</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-emerald-600)', marginTop: '0.25rem' }}>
                {kpiData.employeesWithStructure} / {kpiData.totalEmployees}
              </div>
            </div>
            <Badge variant="success">96% Covered</Badge>
          </CardBody>
        </Card>

        <Card>
          <CardBody style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Unassigned Employees</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: kpiData.employeesWithoutStructure > 0 ? 'var(--color-amber-600)' : 'inherit', marginTop: '0.25rem' }}>
                {kpiData.employeesWithoutStructure}
              </div>
            </div>
            {kpiData.employeesWithoutStructure > 0 && <Badge variant="warning">Action Required</Badge>}
          </CardBody>
        </Card>

        <Card>
          <CardBody style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Pending Salary Revisions</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-purple-600)', marginTop: '0.25rem' }}>
                {kpiData.pendingRevisions}
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate('/hr/compensation/revisions')}>
              Review
            </Button>
          </CardBody>
        </Card>
      </div>

      {/* Recent Salary Revisions Table */}
      <Card>
        <CardHeader>
          <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Recent Salary Revisions & Increment Workflow</h3>
        </CardHeader>
        <CardBody style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Employee</th>
                <th style={{ padding: '0.75rem 1rem' }}>Revision Type</th>
                <th style={{ padding: '0.75rem 1rem' }}>Current CTC</th>
                <th style={{ padding: '0.75rem 1rem' }}>Proposed CTC</th>
                <th style={{ padding: '0.75rem 1rem' }}>Increase %</th>
                <th style={{ padding: '0.75rem 1rem' }}>Effective Date</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {revisions.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                    {r.employee?.first_name} {r.employee?.last_name} ({r.employee?.employee_id})
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>{r.revision_type}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{formatCurrency(r.current_ctc)}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--color-emerald-600)' }}>
                    {formatCurrency(r.proposed_ctc)}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>+{r.percentage_increase}%</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{r.effective_date}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <Badge variant={r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'danger' : 'warning'}>
                      {r.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {revisions.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No salary revision requests recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
};

export default HRCompensationDashboardPage;
