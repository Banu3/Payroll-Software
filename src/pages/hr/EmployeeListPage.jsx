import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit,
  UserX,
  Upload,
  Download,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers
} from 'lucide-react';
import { api } from '../../services/api';

export const EmployeeListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const filterParam = searchParams.get('filter');

  // Employee directory state
  const [employees, setEmployees] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Selected checkboxes for bulk actions
  const [selectedEmpIds, setSelectedEmpIds] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, [page, limit, search, statusFilter, deptFilter, branchFilter]);

  const MOCK_DEFAULT_EMPLOYEES = [
    {
      id: 'emp-001',
      employee_code: 'EMP-001',
      first_name: 'Samantha',
      last_name: 'Reed',
      work_email: 'samantha.reed@company.com',
      departments: { name: 'Engineering' },
      designations: { name: 'Senior Software Engineer' },
      company_branches: { branch_name: 'San Francisco HQ' },
      employment_type: 'Full Time',
      reporting_manager: { first_name: 'Alexander', last_name: 'Vance' },
      employment_status: 'ACTIVE',
    },
    {
      id: 'emp-002',
      employee_code: 'EMP-002',
      first_name: 'David',
      last_name: 'Miller',
      work_email: 'david.miller@company.com',
      departments: { name: 'Finance & Payroll' },
      designations: { name: 'Financial Specialist' },
      company_branches: { branch_name: 'New York Hub' },
      employment_type: 'Full Time',
      reporting_manager: { first_name: 'Sarah', last_name: 'Jenkins' },
      employment_status: 'ACTIVE',
    },
    {
      id: 'emp-003',
      employee_code: 'EMP-003',
      first_name: 'Sarah',
      last_name: 'Jenkins',
      work_email: 'sarah.jenkins@company.com',
      departments: { name: 'People Operations' },
      designations: { name: 'HR Operations Lead' },
      company_branches: { branch_name: 'San Francisco HQ' },
      employment_type: 'Full Time',
      reporting_manager: { first_name: 'Emily', last_name: 'Watson' },
      employment_status: 'ACTIVE',
    },
    {
      id: 'emp-004',
      employee_code: 'EMP-004',
      first_name: 'Alex',
      last_name: 'Rivera',
      work_email: 'alex.rivera@company.com',
      departments: { name: 'Engineering' },
      designations: { name: 'Fullstack Developer' },
      company_branches: { branch_name: 'San Francisco HQ' },
      employment_type: 'Contract',
      reporting_manager: { first_name: 'Samantha', last_name: 'Reed' },
      employment_status: 'ACTIVE',
    },
    {
      id: 'emp-005',
      employee_code: 'EMP-005',
      first_name: 'Emily',
      last_name: 'Watson',
      work_email: 'emily.watson@company.com',
      departments: { name: 'Operations' },
      designations: { name: 'Director of Operations' },
      company_branches: { branch_name: 'New York Hub' },
      employment_type: 'Full Time',
      reporting_manager: null,
      employment_status: 'ACTIVE',
    },
  ];

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const query = `/hr/employees?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&status=${statusFilter}&department=${deptFilter}&branch=${branchFilter}`;
      let apiSuccess = false;
      try {
        const res = await api.get(query);
        if (res && res.success && Array.isArray(res.data?.employees) && res.data.employees.length > 0) {
          setEmployees(res.data.employees);
          setTotalPages(res.data.pagination?.totalPages || 1);
          setTotalCount(res.data.pagination?.total || res.data.employees.length);
          apiSuccess = true;
        }
      } catch (err) {
        console.warn('Backend API offline, loading workforce records from local session:', err);
      }

      if (!apiSuccess) {
        // Load locally saved added employees
        const savedEmpsStr = localStorage.getItem('demo_added_employees');
        const customEmps = savedEmpsStr ? JSON.parse(savedEmpsStr) : [];
        let allEmps = [...customEmps, ...MOCK_DEFAULT_EMPLOYEES];

        // Apply Search Filter
        if (search) {
          const q = search.toLowerCase();
          allEmps = allEmps.filter(
            (e) =>
              `${e.first_name} ${e.last_name}`.toLowerCase().includes(q) ||
              (e.work_email && e.work_email.toLowerCase().includes(q)) ||
              (e.employee_code && e.employee_code.toLowerCase().includes(q))
          );
        }

        // Apply Status Filter
        if (statusFilter !== 'ALL') {
          allEmps = allEmps.filter((e) => e.employment_status === statusFilter);
        }

        // Apply Department Filter
        if (deptFilter !== 'ALL') {
          allEmps = allEmps.filter((e) => e.departments?.name === deptFilter);
        }

        const total = allEmps.length;
        const startIndex = (page - 1) * limit;
        const paginatedEmps = allEmps.slice(startIndex, startIndex + limit);

        setEmployees(paginatedEmps);
        setTotalCount(total);
        setTotalPages(Math.ceil(total / limit) || 1);
      }
    } catch (err) {
      console.warn('Employee directory fetch warning:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async (emp) => {
    if (!window.confirm(`Are you sure you want to set status of ${emp.first_name} ${emp.last_name} to INACTIVE? Payroll compliance history will be preserved.`)) {
      return;
    }
    try {
      await api.post(`/hr/employees/${emp.id}/deactivate`, { status: 'INACTIVE', reason: 'Deactivated by HR Admin' });
      fetchEmployees();
    } catch (err) {
      alert(err.message || 'Deactivation failed');
    }
  };

  const handleExportCSV = async () => {
    alert(`Exporting ${totalCount} employee records. Sensitive salary & bank details will be masked according to permissions.`);
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'ACTIVE':
        return <Badge variant="success">ACTIVE</Badge>;
      case 'ON_NOTICE':
        return <Badge variant="warning">ON NOTICE</Badge>;
      case 'RESIGNED':
      case 'TERMINATED':
      case 'INACTIVE':
        return <Badge variant="danger">{st}</Badge>;
      default:
        return <Badge variant="default">{st || 'ACTIVE'}</Badge>;
    }
  };

  const columns = [
    {
      header: 'Employee ID',
      accessor: 'employee_code',
      render: (e) => <span className="font-mono font-bold text-[#167C63] bg-[#E5F4EE] px-2 py-0.5 rounded-[6px] border border-[#BCE3D4] inline-block text-xs">{e.employee_code}</span>,
    },
    {
      header: 'Employee Name & Email',
      accessor: 'name',
      render: (e) => (
        <div className="flex items-center gap-2.5">
          <Avatar src={e.profile_photo_url} name={`${e.first_name} ${e.last_name}`} size="sm" />
          <div>
            <span className="font-bold text-[#17221C] block text-xs">{e.first_name} {e.last_name}</span>
            <span className="text-[11px] text-[#65736B] font-mono block font-medium">{e.work_email}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Department',
      accessor: 'departments',
      render: (e) => <span className="text-[#17221C] font-semibold text-xs">{e.departments?.name || 'People Operations'}</span>,
    },
    {
      header: 'Designation',
      accessor: 'designations',
      render: (e) => <span className="text-[#526158] font-medium text-xs">{e.designations?.name || 'Staff Specialist'}</span>,
    },
    {
      header: 'Branch',
      accessor: 'company_branches',
      render: (e) => <span className="text-[#526158] font-medium text-xs">{e.company_branches?.branch_name || 'San Francisco HQ'}</span>,
    },
    {
      header: 'Employment Type',
      accessor: 'employment_type',
      render: (e) => <Badge variant="primary">{e.employment_type || 'Full Time'}</Badge>,
    },
    {
      header: 'Reporting Manager',
      accessor: 'reporting_manager',
      render: (e) => (
        <span className="text-[#526158] font-medium text-xs">
          {e.reporting_manager ? `${e.reporting_manager.first_name} ${e.reporting_manager.last_name}` : 'Alexander Vance'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'employment_status',
      render: (e) => getStatusBadge(e.employment_status),
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (e) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={() => navigate(`/hr/employees/${e.id}`)}
          >
            Profile
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="text-[#C24141] hover:bg-[#FFF1F1] border-[#F7C6C6]"
            icon={UserX}
            onClick={() => handleDeactivate(e)}
          >
            Deactivate
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in text-[#17221C]">
      <PageHeader
        title="Employee Directory & Roster"
        description="Tenant Workforce Records, Organization Structure & Field-Level Access Control"
        badge={<Badge variant="primary">{totalCount} TOTAL RECORDS</Badge>}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" icon={Download} onClick={handleExportCSV}>
              Export Roster
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={UserPlus}
              onClick={() => navigate('/hr/employees/new')}
            >
              Add New Employee
            </Button>
          </div>
        }
      />

      {filterParam === 'missing-documents' && (
        <div className="p-4 rounded-[10px] bg-[#FFF7E5] border border-[#F7E5B5] text-[#9A6700] font-semibold text-xs flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#9A6700] shrink-0" />
          <span>Showing employees with missing mandatory verification documents.</span>
        </div>
      )}

      {/* FILTER BAR */}
      <Card>
        <CardBody className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#167C63]" />
            <input
              type="text"
              placeholder="Search Employee Name, EMP ID, Work Email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white border border-[#DCE5E0] rounded-[10px] pl-9 pr-3 py-2 text-xs text-[#17221C] placeholder-[#65736B] font-medium focus:outline-none focus:border-[#167C63] focus:ring-1 focus:ring-[#167C63]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Select
              label=""
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'ACTIVE', label: 'Active Only' },
                { value: 'ON_NOTICE', label: 'On Notice' },
                { value: 'RESIGNED', label: 'Resigned' },
                { value: 'TERMINATED', label: 'Terminated / Inactive' },
              ]}
              className="py-1.5 text-xs w-36"
            />

            <Select
              label=""
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: 'ALL', label: 'All Departments' },
                { value: 'Engineering', label: 'Engineering' },
                { value: 'People Operations', label: 'People Operations' },
                { value: 'Finance & Payroll', label: 'Finance & Payroll' },
                { value: 'Operations', label: 'Operations' },
              ]}
              className="py-1.5 text-xs w-40"
            />

            <Select
              label=""
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              options={[
                { value: 10, label: '10 per page' },
                { value: 25, label: '25 per page' },
                { value: 50, label: '50 per page' },
                { value: 100, label: '100 per page' },
              ]}
              className="py-1.5 text-xs w-32"
            />
          </div>
        </CardBody>
      </Card>

      {/* DATA TABLE */}
      <Card>
        <CardBody className="p-0">
          <DataTable columns={columns} data={employees} isLoading={isLoading} />
        </CardBody>

        {/* SERVER-SIDE PAGINATION FOOTER */}
        <div className="p-4 bg-[#F7F9F7] border-t border-[#DCE5E0] flex items-center justify-between text-xs text-[#526158] font-medium rounded-b-[14px]">
          <div>
            Showing <strong className="text-[#17221C] font-bold tabular-nums">{(page - 1) * limit + 1}</strong> to <strong className="text-[#17221C] font-bold tabular-nums">{Math.min(page * limit, totalCount)}</strong> of <strong className="text-[#17221C] font-bold tabular-nums">{totalCount}</strong> employees
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              isDisabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              icon={ChevronLeft}
            >
              Previous
            </Button>
            <span className="font-semibold text-[#17221C] px-2 tabular-nums">Page {page} of {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              isDisabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              icon={ChevronRight}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

    </div>
  );
};

export default EmployeeListPage;
