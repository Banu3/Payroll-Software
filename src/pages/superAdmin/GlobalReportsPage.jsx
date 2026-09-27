import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  BarChart3,
  FileSpreadsheet,
  Download,
  Building2,
  Users,
  DollarSign,
  ShieldCheck,
  Search,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

const MOCK_REPORTS = [
  { id: 'rep_1', title: 'Global Multi-Tenant Master Payroll Summary', category: 'FINANCIAL', period: 'Monthly (Sept 2026)', size: '2.4 MB', format: 'PDF / CSV', icon: DollarSign, description: 'Comprehensive breakdown of gross salary, tax withholdings, statutory contributions, and net disbursements across all 12 tenants.' },
  { id: 'rep_2', title: 'Tenant Headcount & Workforce Distribution Report', category: 'HR_ANALYTICS', period: 'Q3 2026', size: '1.8 MB', format: 'XLSX / PDF', icon: Users, description: 'Detailed demographic, department, role, and employment status metrics across all registered enterprise tenants.' },
  { id: 'rep_3', title: 'Statutory Tax Compliance Audit Report', category: 'COMPLIANCE', period: 'Year-to-Date (2026)', size: '4.1 MB', format: 'PDF', icon: ShieldCheck, description: 'Audited statutory tax remittances, EPF/ETF, Social Security, and regulatory filing logs per tenant entity.' },
  { id: 'rep_4', title: 'Platform Subscription & SaaS Revenue Report', category: 'BILLING', period: 'Monthly (Sept 2026)', size: '940 KB', format: 'CSV', icon: Building2, description: 'Active plan subscriptions, trial account conversions, MRR (Monthly Recurring Revenue), and billing invoices.' },
  { id: 'rep_5', title: 'Super Admin Security & System Audit Trail', category: 'SECURITY', period: 'Last 30 Days', size: '5.6 MB', format: 'LOG / CSV', icon: ShieldCheck, description: 'Complete system access, privileged admin actions, tenant configuration changes, and role permission audits.' },
];

export const GlobalReportsPage = () => {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [downloadingId, setDownloadingId] = useState(null);

  const categories = [
    { id: 'ALL', label: 'All Platform Reports' },
    { id: 'FINANCIAL', label: 'Financial & Payroll' },
    { id: 'HR_ANALYTICS', label: 'Workforce Analytics' },
    { id: 'COMPLIANCE', label: 'Statutory Compliance' },
    { id: 'BILLING', label: 'SaaS & Billing' },
    { id: 'SECURITY', label: 'Security & Audit' },
  ];

  const filteredReports = MOCK_REPORTS.filter(
    (r) => activeCategory === 'ALL' || r.category === activeCategory
  );

  const handleDownload = (id) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadingId(null);
      alert('Report export successfully generated and downloaded!');
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-900">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Analytics Center</h1>
            <Badge variant="purple">SUPER ADMIN ENGINE</Badge>
          </div>
          <p className="text-xs text-slate-700 mt-1">Generate, audit, and export multi-tenant business intelligence and statutory reports.</p>
        </div>

        <Button variant="primary" size="sm" icon={FileSpreadsheet}>
          Create Custom Query Report
        </Button>
      </div>

      {/* CATEGORY TABS */}
      <div className="flex flex-wrap gap-2 border-b border-[#E5E7EB] pb-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === cat.id
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-[#E5E7EB] hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* REPORTS LIST GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReports.map((report) => {
          const IconComponent = report.icon;
          return (
            <Card key={report.id} className="p-5 flex flex-col justify-between hover:border-teal-500 transition-all">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <Badge variant="primary">{report.period}</Badge>
                </div>

                <h3 className="text-base font-bold text-slate-900">{report.title}</h3>
                <p className="text-xs text-slate-700 mt-2 leading-relaxed">{report.description}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-slate-700">
                <span className="font-mono">Format: <strong>{report.format}</strong> ({report.size})</span>
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={downloadingId === report.id}
                  icon={Download}
                  onClick={() => handleDownload(report.id)}
                >
                  Download Report
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default GlobalReportsPage;
