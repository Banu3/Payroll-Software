import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import {
  ShieldCheck,
  FileSpreadsheet,
  Download,
  Calendar,
  Building,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileCheck
} from 'lucide-react';

const MOCK_STATUTORY_REPORTS = [
  { id: 'rep-pf-1', report_type: 'EPFO PF ECR Return', month_year: 'September 2026', version: 1, total_employees_covered: 48, total_amount: 28800, status: 'GENERATED', created_at: '2026-09-27' },
  { id: 'rep-esi-1', report_type: 'ESIC Monthly Return', month_year: 'September 2026', version: 1, total_employees_covered: 48, total_amount: 2160, status: 'GENERATED', created_at: '2026-09-27' },
  { id: 'rep-pt-1', report_type: 'State Professional Tax (PT)', month_year: 'September 2026', version: 1, total_employees_covered: 48, total_amount: 1000, status: 'FILED', created_at: '2026-09-26' },
  { id: 'rep-tds-1', report_type: 'Form 24Q Quarterly TDS', month_year: 'Q2 2026', version: 1, total_employees_covered: 48, total_amount: 23240, status: 'FILED', created_at: '2026-09-25' },
];

export const HRStatutoryDashboardPage = () => {
  const [period, setPeriod] = useState({
    year: 2026,
    month: 9,
  });

  const [reports, setReports] = useState(MOCK_STATUTORY_REPORTS);
  const [isGeneratingPF, setIsGeneratingPF] = useState(false);
  const [isGeneratingESI, setIsGeneratingESI] = useState(false);

  const handleGeneratePF = () => {
    setIsGeneratingPF(true);
    setTimeout(() => {
      setIsGeneratingPF(false);
      const newRep = {
        id: `rep-pf-${Date.now()}`,
        report_type: 'EPFO PF ECR Return',
        month_year: `September ${period.year}`,
        version: 2,
        total_employees_covered: 48,
        total_amount: 28800,
        status: 'GENERATED',
        created_at: new Date().toISOString().split('T')[0],
      };
      setReports((prev) => [newRep, ...prev]);
      alert('EPFO PF ECR text schedule generated successfully!');
    }, 800);
  };

  const handleGenerateESI = () => {
    setIsGeneratingESI(true);
    setTimeout(() => {
      setIsGeneratingESI(false);
      const newRep = {
        id: `rep-esi-${Date.now()}`,
        report_type: 'ESIC Monthly Return',
        month_year: `September ${period.year}`,
        version: 2,
        total_employees_covered: 48,
        total_amount: 2160,
        status: 'GENERATED',
        created_at: new Date().toISOString().split('T')[0],
      };
      setReports((prev) => [newRep, ...prev]);
      alert('ESIC Monthly statutory return generated successfully!');
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-900">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Statutory Compliance & Tax Hub</h1>
            <Badge variant="purple">COMPLIANCE ENGINE</Badge>
          </div>
          <p className="text-xs text-slate-700 mt-1">
            Generate EPFO ECR text schedules, ESIC monthly returns, State PT reports, and Form 24Q TDS declarations.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2 bg-white border border-[#E5E7EB] rounded-lg p-1.5 text-xs">
          <Calendar className="w-4 h-4 text-teal-600" />
          <select
            value={period.month}
            onChange={(e) => setPeriod({ ...period, month: parseInt(e.target.value) })}
            className="bg-transparent text-slate-900 font-semibold focus:outline-none"
          >
            {[
              { m: 1, name: 'January' },
              { m: 2, name: 'February' },
              { m: 3, name: 'March' },
              { m: 4, name: 'April' },
              { m: 5, name: 'May' },
              { m: 6, name: 'June' },
              { m: 7, name: 'July' },
              { m: 8, name: 'August' },
              { m: 9, name: 'September' },
              { m: 10, name: 'October' },
              { m: 11, name: 'November' },
              { m: 12, name: 'December' },
            ].map((item) => (
              <option key={item.m} value={item.m}>{item.name}</option>
            ))}
          </select>
          <select
            value={period.year}
            onChange={(e) => setPeriod({ ...period, year: parseInt(e.target.value) })}
            className="bg-transparent text-slate-900 font-semibold focus:outline-none"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* STATUTORY GENERATION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PF ECR Generator */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h2 className="text-base font-bold text-slate-900">EPFO Provident Fund (PF) ECR Schedule</h2>
              <Badge variant="primary">EPFO</Badge>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Generates employee & employer 12% PF contribution returns with UAN validation and ECR text formatting.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-[#E5E7EB]">
            <Button
              variant="primary"
              size="md"
              icon={Play}
              className="w-full"
              isLoading={isGeneratingPF}
              onClick={handleGeneratePF}
            >
              Generate PF ECR Return (Sept {period.year})
            </Button>
          </div>
        </Card>

        {/* ESI Return Generator */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h2 className="text-base font-bold text-slate-900">ESIC Monthly Wage & Contribution Return</h2>
              <Badge variant="purple">ESIC</Badge>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Generates 0.75% employee and 3.25% employer ESI statutory returns with IP Portal registration file.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-[#E5E7EB]">
            <Button
              variant="primary"
              size="md"
              icon={Play}
              className="w-full"
              isLoading={isGeneratingESI}
              onClick={handleGenerateESI}
            >
              Generate ESIC Return (Sept {period.year})
            </Button>
          </div>
        </Card>
      </div>

      {/* STATUTORY REPORTS HISTORY TABLE */}
      <Card className="overflow-hidden">
        <CardHeader
          title="Historical Statutory Report Runs"
          description="Filing history for Provident Fund, ESI, Professional Tax, and Form 24Q TDS"
          action={
            <Button variant="outline" size="sm" icon={Download}>
              Export All Returns
            </Button>
          }
        />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-[#E5E7EB] text-slate-700 font-semibold">
                <tr>
                  <th className="p-4">Report Type</th>
                  <th className="p-4">Period</th>
                  <th className="p-4">Version</th>
                  <th className="p-4">Employees Covered</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Generated Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {reports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>{rep.report_type}</span>
                    </td>
                    <td className="p-4 text-slate-800 font-medium">{rep.month_year}</td>
                    <td className="p-4 font-mono font-bold text-teal-800">v{rep.version}</td>
                    <td className="p-4 text-slate-800">{rep.total_employees_covered} Staff</td>
                    <td className="p-4 font-bold text-slate-900">${rep.total_amount.toLocaleString()}</td>
                    <td className="p-4">
                      {rep.status === 'FILED' ? (
                        <Badge variant="success">FILED</Badge>
                      ) : (
                        <Badge variant="primary">GENERATED</Badge>
                      )}
                    </td>
                    <td className="p-4 text-right text-slate-700 font-mono">{rep.created_at}</td>
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

export default HRStatutoryDashboardPage;
