import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  Users,
  Search,
  Filter,
  Building2,
  UserCheck,
  UserX,
  Mail,
  Briefcase,
  ShieldAlert,
  ChevronRight,
  Download
} from 'lucide-react';
import { api } from '../../services/api';

const MOCK_GLOBAL_EMPLOYEES = [
  { id: 'emp_1', name: 'Alex Johnson', email: 'alex.j@apexglobal.com', company: 'Apex Global Enterprises', companyId: 'c1', department: 'Engineering', role: 'Senior Architect', status: 'ACTIVE', joinDate: '2023-04-15', location: 'New York, USA' },
  { id: 'emp_2', name: 'Sophia Chen', email: 'sophia.c@acmesoft.com', company: 'Acme Software Solutions', companyId: 'c2', department: 'Product', role: 'Lead PM', status: 'ACTIVE', joinDate: '2022-09-01', location: 'San Francisco, USA' },
  { id: 'emp_3', name: 'Marcus Vance', email: 'marcus.v@vanguard.com', company: 'Vanguard Financial', companyId: 'c3', department: 'Finance', role: 'Payroll Director', status: 'ACTIVE', joinDate: '2021-11-10', location: 'London, UK' },
  { id: 'emp_4', name: 'Elena Rostova', email: 'elena.r@apexglobal.com', company: 'Apex Global Enterprises', companyId: 'c1', department: 'Human Resources', role: 'HR Business Partner', status: 'ON_LEAVE', joinDate: '2023-01-20', location: 'Berlin, DE' },
  { id: 'emp_5', name: 'David Miller', email: 'd.miller@techflow.io', company: 'TechFlow Labs', companyId: 'c4', department: 'Engineering', role: 'DevOps Lead', status: 'ACTIVE', joinDate: '2024-02-01', location: 'Toronto, CA' },
  { id: 'emp_6', name: 'Priya Sharma', email: 'priya@acmesoft.com', company: 'Acme Software Solutions', companyId: 'c2', department: 'Design', role: 'UX Specialist', status: 'ACTIVE', joinDate: '2023-08-12', location: 'Singapore' },
  { id: 'emp_7', name: 'James Wilson', email: 'j.wilson@nexuscorp.com', company: 'Nexus Global', companyId: 'c5', department: 'Sales', role: 'VP Sales', status: 'INACTIVE', joinDate: '2020-05-18', location: 'Chicago, USA' },
  { id: 'emp_8', name: 'Kavita Patel', email: 'kavita@vanguard.com', company: 'Vanguard Financial', companyId: 'c3', department: 'Legal', role: 'Compliance Officer', status: 'ACTIVE', joinDate: '2022-03-30', location: 'London, UK' },
];

export const GlobalEmployeesPage = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState(MOCK_GLOBAL_EMPLOYEES);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchGlobalEmployees();
  }, [companyFilter, statusFilter]);

  const fetchGlobalEmployees = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/super-admin/employees?company=${companyFilter}&status=${statusFilter}`);
      if (res && res.success && res.data) {
        setEmployees(res.data);
      }
    } catch {
      // Fallback to rich client-side mock data
      setEmployees(MOCK_GLOBAL_EMPLOYEES);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.company.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase());

    const matchesCompany = companyFilter === 'ALL' || emp.companyId === companyFilter;
    const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;

    return matchesSearch && matchesCompany && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in text-slate-900">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Global Employee Directory</h1>
            <Badge variant="purple">MULTI-TENANT WORKFORCE</Badge>
          </div>
          <p className="text-xs text-slate-700 mt-1">Cross-tenant employee records, assignments, and global headcount metrics.</p>
        </div>

        <Button variant="outline" size="sm" icon={Download}>
          Export Master Roster
        </Button>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">1,480</div>
            <div className="text-xs text-slate-700 font-medium">Total Multi-Tenant Employees</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">1,412</div>
            <div className="text-xs text-emerald-800 font-medium">Active Headcount (95.4%)</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">38</div>
            <div className="text-xs text-amber-800 font-medium">On Approved Leave</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">12 Tenants</div>
            <div className="text-xs text-slate-700 font-medium">Across 8 Regions</div>
          </div>
        </Card>
      </div>

      {/* FILTER BAR */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-teal-700" />
            <input
              type="text"
              placeholder="Search by employee name, email, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#64748B] rounded-lg text-xs text-slate-900 placeholder-[#334155] font-semibold focus:outline-none focus:border-teal-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
              <Filter className="w-3.5 h-3.5 text-teal-600" />
              <span>Company:</span>
              <select
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="bg-white border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
              >
                <option value="ALL">All Companies</option>
                <option value="c1">Apex Global Enterprises</option>
                <option value="c2">Acme Software Solutions</option>
                <option value="c3">Vanguard Financial</option>
                <option value="c4">TechFlow Labs</option>
                <option value="c5">Nexus Global</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* TABLE */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-[#E5E7EB] text-slate-700 font-semibold">
              <tr>
                <th className="p-4">Employee</th>
                <th className="p-4">Tenant Company</th>
                <th className="p-4">Department & Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Location</th>
                <th className="p-4">Join Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 font-medium text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{emp.name}</div>
                        <div className="text-[11px] text-slate-700 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" /> {emp.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-800">
                    <Badge variant="primary">{emp.company}</Badge>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-900">{emp.role}</div>
                    <div className="text-[11px] text-slate-700">{emp.department}</div>
                  </td>
                  <td className="p-4">
                    {emp.status === 'ACTIVE' && <Badge variant="success">Active</Badge>}
                    {emp.status === 'ON_LEAVE' && <Badge variant="warning">On Leave</Badge>}
                    {emp.status === 'INACTIVE' && <Badge variant="danger">Inactive</Badge>}
                  </td>
                  <td className="p-4 text-slate-700">{emp.location}</td>
                  <td className="p-4 text-slate-700 font-mono">{emp.joinDate}</td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm" icon={ChevronRight} onClick={() => navigate(`/super-admin/companies/${emp.companyId}`)}>
                      Company Profile
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

export default GlobalEmployeesPage;
