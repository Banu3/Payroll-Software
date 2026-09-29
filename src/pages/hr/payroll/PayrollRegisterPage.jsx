import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  Calendar,
  Building,
  Layers,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import api from '../../../lib/axios';

export default function PayrollRegisterPage() {
  const [selectedPeriod, setSelectedPeriod] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Fetch Payroll Register data
  const { data: registerData, isLoading } = useQuery({
    queryKey: ['payroll-register', selectedPeriod.year, selectedPeriod.month],
    queryFn: async () => {
      const res = await api.get(`/payroll-processing/register?year=${selectedPeriod.year}&month=${selectedPeriod.month}`);
      return res.data?.data || res.data || [];
    }
  });

  // Fetch Departments
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await api.get('/hr/departments');
      return res.data?.data || res.data || [];
    }
  });

  const filteredRegister = (registerData || []).filter((item) => {
    const name = `${item.employee?.first_name || ''} ${item.employee?.last_name || ''}`.toLowerCase();
    const code = (item.employee?.employee_code || '').toLowerCase();
    const deptMatches = !departmentFilter || item.employee?.department_id === departmentFilter;
    const searchMatches = name.includes(searchTerm.toLowerCase()) || code.includes(searchTerm.toLowerCase());
    return deptMatches && searchMatches;
  });

  // CSV Export function
  const handleExportCSV = () => {
    if (!filteredRegister.length) return;

    const headers = [
      'Employee Code',
      'Employee Name',
      'Department',
      'Calendar Days',
      'Paid Days',
      'LOP Days',
      'Basic Salary',
      'HRA',
      'Allowances',
      'Overtime',
      'Gross Earnings',
      'PF Employee',
      'ESI Employee',
      'PT',
      'TDS',
      'Total Deductions',
      'Net Salary',
      'Status'
    ];

    const rows = filteredRegister.map((row) => [
      row.employee?.employee_code || '',
      `"${row.employee?.first_name || ''} ${row.employee?.last_name || ''}"`,
      `"${row.employee?.department?.name || ''}"`,
      row.calendar_days || 0,
      row.paid_days || 0,
      row.lop_days || 0,
      row.basic_amount || 0,
      row.hra_amount || 0,
      row.allowances_amount || 0,
      row.overtime_amount || 0,
      row.gross_earnings || 0,
      row.pf_employee || 0,
      row.esi_employee || 0,
      row.pt_amount || 0,
      row.tds_amount || 0,
      row.total_deductions || 0,
      row.net_salary || 0,
      row.status || 'FINALIZED'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Payroll_Register_${selectedPeriod.month}_${selectedPeriod.year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-400" /> Enterprise Payroll Register
          </h1>
          <p className="text-sm text-slate-400">
            Comprehensive audit-ready payroll ledger with component break-ups and statutory reporting.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={!filteredRegister.length}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-2 self-start md:self-auto"
        >
          <Download className="w-4 h-4" /> Export CSV Register
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Month Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={selectedPeriod.month}
              onChange={(e) => setSelectedPeriod({ ...selectedPeriod, month: parseInt(e.target.value) })}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              value={selectedPeriod.year}
              onChange={(e) => setSelectedPeriod({ ...selectedPeriod, year: parseInt(e.target.value) })}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-400" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Departments</option>
              {departments?.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-teal-700 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employee..."
            className="w-full bg-white border border-[#64748B] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#0F172A] placeholder-[#334155] font-semibold focus:outline-none focus:border-teal-600"
          />
        </div>
      </div>

      {/* Register Table */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-blue-400" /> Loading payroll register...
        </div>
      ) : filteredRegister.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 text-sm">
          No finalized payroll register entries found for {new Date(2000, selectedPeriod.month - 1, 1).toLocaleString('default', { month: 'long' })} {selectedPeriod.year}.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3">Employee</th>
                <th className="p-3">Department</th>
                <th className="p-3">Days</th>
                <th className="p-3">Basic</th>
                <th className="p-3">HRA</th>
                <th className="p-3">Allowances</th>
                <th className="p-3">Overtime</th>
                <th className="p-3">Gross</th>
                <th className="p-3">PF</th>
                <th className="p-3">ESI</th>
                <th className="p-3">PT</th>
                <th className="p-3">TDS</th>
                <th className="p-3">Total Deductions</th>
                <th className="p-3">Net Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredRegister.map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 font-sans font-semibold text-slate-100">
                    {row.employee?.first_name} {row.employee?.last_name}
                    <span className="block text-[10px] text-slate-500 font-mono">{row.employee?.employee_code}</span>
                  </td>
                  <td className="p-3 font-sans text-slate-400">{row.employee?.department?.name || 'N/A'}</td>
                  <td className="p-3 text-slate-300">
                    {row.paid_days} / <span className="text-red-400">{row.lop_days} LOP</span>
                  </td>
                  <td className="p-3 text-slate-300">₹{Number(row.basic_amount || 0).toLocaleString()}</td>
                  <td className="p-3 text-slate-300">₹{Number(row.hra_amount || 0).toLocaleString()}</td>
                  <td className="p-3 text-slate-300">₹{Number(row.allowances_amount || 0).toLocaleString()}</td>
                  <td className="p-3 text-amber-400">₹{Number(row.overtime_amount || 0).toLocaleString()}</td>
                  <td className="p-3 text-emerald-400 font-bold">₹{Number(row.gross_earnings || 0).toLocaleString()}</td>
                  <td className="p-3 text-slate-400">₹{Number(row.pf_employee || 0).toLocaleString()}</td>
                  <td className="p-3 text-slate-400">₹{Number(row.esi_employee || 0).toLocaleString()}</td>
                  <td className="p-3 text-slate-400">₹{Number(row.pt_amount || 0).toLocaleString()}</td>
                  <td className="p-3 text-slate-400">₹{Number(row.tds_amount || 0).toLocaleString()}</td>
                  <td className="p-3 text-red-400">₹{Number(row.total_deductions || 0).toLocaleString()}</td>
                  <td className="p-3 text-blue-400 font-bold text-sm">₹{Number(row.net_salary || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
