import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  DollarSign,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Download,
  Eye,
  FileCheck,
  Filter
} from 'lucide-react';
import { api } from '../../services/api';
import { formatCurrency } from '../../services/financialCalculationService';

const MOCK_TENANT_PAYROLLS = [
  { id: 'pr_101', company: 'Apex Global Enterprises', companyId: 'c1', month: 'September 2026', grossSalary: 345000, netSalary: 285000, taxStatutory: 60000, employeesCount: 320, status: 'COMPLETED', runDate: '2026-09-25' },
  { id: 'pr_102', company: 'Acme Software Solutions', companyId: 'c2', month: 'September 2026', grossSalary: 280000, netSalary: 232000, taxStatutory: 48000, employeesCount: 240, status: 'COMPLETED', runDate: '2026-09-26' },
  { id: 'pr_103', company: 'Vanguard Financial', companyId: 'c3', month: 'September 2026', grossSalary: 420000, netSalary: 346000, taxStatutory: 74000, employeesCount: 410, status: 'PROCESSING', runDate: '2026-09-27' },
  { id: 'pr_104', company: 'TechFlow Labs', companyId: 'c4', month: 'September 2026', grossSalary: 125000, netSalary: 102000, taxStatutory: 23000, employeesCount: 110, status: 'PENDING_APPROVAL', runDate: '2026-09-27' },
  { id: 'pr_105', company: 'Nexus Global', companyId: 'c5', month: 'September 2026', grossSalary: 75000, netSalary: 62000, taxStatutory: 13000, employeesCount: 80, status: 'DRAFT', runDate: '-' },
];

export const GlobalPayrollOverviewPage = () => {
  const navigate = useNavigate();
  const [payrolls, setPayrolls] = useState(MOCK_TENANT_PAYROLLS);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchGlobalPayrolls();
  }, [statusFilter]);

  const fetchGlobalPayrolls = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/super-admin/payroll?status=${statusFilter}`);
      if (res && res.success && res.data) {
        setPayrolls(res.data);
      }
    } catch {
      setPayrolls(MOCK_TENANT_PAYROLLS);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPayrolls = payrolls.filter(
    (p) => statusFilter === 'ALL' || p.status === statusFilter
  );

  return (
    <div className="space-y-6 animate-fade-in text-slate-900">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Global Payroll Overview</h1>
            <Badge variant="purple">PLATFORM CONSOLE</Badge>
          </div>
          <p className="text-xs text-slate-700 mt-1">Multi-tenant monthly disbursements, gross volume, and statutory tax compliance status.</p>
        </div>

        <Button variant="outline" size="sm" icon={Download}>
          Export Global Payroll Summary
        </Button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(1245000)}</div>
            <div className="text-xs text-slate-700 font-medium">Monthly Processed Volume</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">10 / 12</div>
            <div className="text-xs text-emerald-800 font-medium">Completed Runs (83%)</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">2 Pending</div>
            <div className="text-xs text-blue-800 font-medium">Requires Admin Signoff</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shrink-0">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(218000)}</div>
            <div className="text-xs text-slate-700 font-medium">Statutory Tax Withholdings</div>
          </div>
        </Card>
      </div>

      {/* FILTER BAR */}
      <Card className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
            <Filter className="w-3.5 h-3.5 text-teal-600" />
            <span>Filter Run Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
            >
              <option value="ALL">All Run Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PROCESSING">Processing</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>

          <span className="text-xs text-slate-700 font-mono">Current Pay Period: <strong className="text-slate-900">Sept 2026</strong></span>
        </div>
      </Card>

      {/* PAYROLL TABLE */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-[#E5E7EB] text-slate-700 font-semibold">
              <tr>
                <th className="p-4">Tenant Company</th>
                <th className="p-4">Pay Period</th>
                <th className="p-4">Headcount</th>
                <th className="p-4">Gross Payroll</th>
                <th className="p-4">Tax & Statutory</th>
                <th className="p-4">Net Disbursement</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredPayrolls.map((pr) => (
                <tr key={pr.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 font-semibold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>{pr.company}</span>
                  </td>
                  <td className="p-4 text-slate-700 font-mono">{pr.month}</td>
                  <td className="p-4 text-slate-800 font-medium">{pr.employeesCount} Employees</td>
                  <td className="p-4 font-bold text-slate-900">{formatCurrency(pr.grossSalary)}</td>
                  <td className="p-4 text-slate-700 font-mono">{formatCurrency(pr.taxStatutory)}</td>
                  <td className="p-4 font-bold text-emerald-800">{formatCurrency(pr.netSalary)}</td>
                  <td className="p-4">
                    {pr.status === 'COMPLETED' && <Badge variant="success">Completed</Badge>}
                    {pr.status === 'PROCESSING' && <Badge variant="info">Processing</Badge>}
                    {pr.status === 'PENDING_APPROVAL' && <Badge variant="warning">Pending Sign-off</Badge>}
                    {pr.status === 'DRAFT' && <Badge variant="default">Draft</Badge>}
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm" icon={Eye} onClick={() => navigate(`/super-admin/companies/${pr.companyId}`)}>
                      Audit Run
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default GlobalPayrollOverviewPage;
