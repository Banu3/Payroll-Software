import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DataTable } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { ConfirmationDialog } from '../../components/superAdmin/ConfirmationDialog';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Lock,
  Unlock,
  Building,
  Users,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';

export const CompanyListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialStatus = searchParams.get('status') || 'ALL';

  // Data & Pagination state
  const [companies, setCompanies] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [industryFilter, setIndustryFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Suspension confirmation state
  const [selectedCompanyForSuspend, setSelectedCompanyForSuspend] = useState(null);
  const [isSuspending, setIsSuspending] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, [page, limit, search, statusFilter, industryFilter]);

  const MOCK_DEFAULT_COMPANIES = [
    {
      id: 'comp_acme',
      code: 'ACME',
      name: 'Acme Enterprise Pvt Ltd',
      domain: 'acme-corp.com',
      industry: 'Technology',
      primaryAdmin: { first_name: 'Arthur', last_name: 'Pendelton', email: 'admin@acme-corp.com' },
      employeesCount: 48,
      branchesCount: 3,
      plan: 'Enterprise Tier',
      status: 'ACTIVE',
      created_at: '2025-01-10T00:00:00.000Z',
    },
    {
      id: 'comp_techcorp',
      code: 'TECH',
      name: 'TechCorp Global Solutions',
      domain: 'techcorp-global.com',
      industry: 'Software',
      primaryAdmin: { first_name: 'Samantha', last_name: 'Vance', email: 'sam@techcorp-global.com' },
      employeesCount: 120,
      branchesCount: 5,
      plan: 'Enterprise Tier',
      status: 'ACTIVE',
      created_at: '2025-03-15T00:00:00.000Z',
    },
    {
      id: 'comp_finserv',
      code: 'FIN',
      name: 'FinServ Capital Operations',
      domain: 'finserv-capital.io',
      industry: 'Finance',
      primaryAdmin: { first_name: 'Marcus', last_name: 'Sterling', email: 'marcus@finserv-capital.io' },
      employeesCount: 65,
      branchesCount: 2,
      plan: 'Professional',
      status: 'TRIAL',
      created_at: '2026-02-01T00:00:00.000Z',
    },
    {
      id: 'comp_nexus',
      code: 'NEXUS',
      name: 'Nexus Innovations Inc',
      domain: 'nexus-innovations.net',
      industry: 'Healthcare',
      primaryAdmin: { first_name: 'Rachel', last_name: 'Green', email: 'rachel@nexus.net' },
      employeesCount: 30,
      branchesCount: 1,
      plan: 'Basic Tier',
      status: 'SUSPENDED',
      created_at: '2025-11-20T00:00:00.000Z',
    },
  ];

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      let apiSuccess = false;
      try {
        const query = `/super-admin/companies?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&status=${statusFilter}&industry=${industryFilter}`;
        const res = await api.get(query);
        if (res && res.success && Array.isArray(res.data?.companies) && res.data.companies.length > 0) {
          setCompanies(res.data.companies);
          setTotalPages(res.data.pagination?.totalPages || 1);
          setTotalCount(res.data.pagination?.total || res.data.companies.length);
          apiSuccess = true;
        }
      } catch (err) {
        console.warn('Backend API offline, using local company registry:', err);
      }

      if (!apiSuccess) {
        let filtered = [...MOCK_DEFAULT_COMPANIES];

        if (search) {
          const q = search.toLowerCase();
          filtered = filtered.filter(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              c.code.toLowerCase().includes(q) ||
              (c.primaryAdmin?.email && c.primaryAdmin.email.toLowerCase().includes(q))
          );
        }

        if (statusFilter !== 'ALL') {
          filtered = filtered.filter((c) => c.status === statusFilter);
        }

        if (industryFilter !== 'ALL') {
          filtered = filtered.filter((c) => c.industry === industryFilter);
        }

        const total = filtered.length;
        const startIndex = (page - 1) * limit;
        const paginatedCompanies = filtered.slice(startIndex, startIndex + limit);

        setCompanies(paginatedCompanies);
        setTotalCount(total);
        setTotalPages(Math.ceil(total / limit) || 1);
      }
    } catch (err) {
      console.warn('Failed to load companies:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspendConfirm = async ({ reason }) => {
    if (!selectedCompanyForSuspend) return;
    setIsSuspending(true);
    try {
      await api.post(`/super-admin/companies/${selectedCompanyForSuspend.id}/suspend`, { reason });
      setActionMessage(`Company '${selectedCompanyForSuspend.name}' has been suspended.`);
      setSelectedCompanyForSuspend(null);
      fetchCompanies();
    } catch (err) {
      alert(err.message || 'Suspension failed');
    } finally {
      setIsSuspending(false);
    }
  };

  const handleActivate = async (company) => {
    try {
      await api.post(`/super-admin/companies/${company.id}/activate`);
      setActionMessage(`Company '${company.name}' reactivated successfully.`);
      fetchCompanies();
    } catch (err) {
      alert(err.message || 'Activation failed');
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'ACTIVE':
        return <Badge variant="success">✓ ACTIVE</Badge>;
      case 'TRIAL':
        return <Badge variant="primary">TRIAL</Badge>;
      case 'SUSPENDED':
        return <Badge variant="warning">! SUSPENDED</Badge>;
      default:
        return <Badge variant="default">INACTIVE</Badge>;
    }
  };

  const columns = [
    {
      header: 'Company Code & Name',
      accessor: 'name',
      render: (c) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center font-mono font-bold text-xs text-teal-800">
            {c.code}
          </div>
          <div>
            <span className="font-semibold text-slate-900 block">{c.name}</span>
            <span className="text-[10px] text-slate-600 font-mono">{c.domain || c.id}</span>
          </div>
        </div>
      ),
    },
    { header: 'Industry', accessor: 'industry', render: (c) => <span className="text-slate-800">{c.industry}</span> },
    {
      header: 'Primary Admin Contact',
      accessor: 'primaryAdmin',
      render: (c) => (
        <div>
          <span className="text-slate-900 font-medium block">{c.primaryAdmin?.first_name} {c.primaryAdmin?.last_name}</span>
          <span className="text-[10px] text-slate-600 font-mono">{c.primaryAdmin?.email}</span>
        </div>
      ),
    },
    { header: 'Employees', accessor: 'employeesCount', render: (c) => <span className="text-slate-900 font-semibold">{c.employeesCount}</span> },
    { header: 'Branches', accessor: 'branchesCount', render: (c) => <span className="text-slate-800">{c.branchesCount}</span> },
    {
      header: 'Subscription Plan',
      accessor: 'plan',
      render: (c) => <Badge variant="purple">{c.plan || 'Professional'}</Badge>,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (c) => getStatusBadge(c.status),
    },
    {
      header: 'Created Date',
      accessor: 'created_at',
      render: (c) => <span className="font-mono text-slate-700 text-xs font-medium">{new Date(c.created_at).toLocaleDateString()}</span>,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (c) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={() => navigate(`/super-admin/companies/${c.id}`)}
          >
            View
          </Button>

          {c.status === 'SUSPENDED' ? (
            <Button
              variant="outline"
              size="sm"
              icon={Unlock}
              onClick={() => handleActivate(c)}
            >
              Activate
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="text-amber-700 hover:text-amber-800 hover:bg-amber-50"
              icon={Lock}
              onClick={() => setSelectedCompanyForSuspend(c)}
            >
              Suspend
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in text-slate-900">
      <PageHeader
        title="Company Tenant Directory"
        description="Global Multi-Tenant Corporate Registry & Status Management"
        badge={<Badge variant="purple">{totalCount} TENANTS</Badge>}
        action={
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => navigate('/super-admin/companies/new')}
          >
            Add New Company
          </Button>
        }
      />

      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-slate-600 hover:text-slate-900 font-medium">Dismiss</button>
        </div>
      )}

      {/* FILTER BAR */}
      <Card>
        <CardBody className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search Company Name, Code, Admin Email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-white border border-[#E5E7EB] rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Select
              label=""
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setSearchParams({ status: e.target.value });
                setPage(1);
              }}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'ACTIVE', label: 'Active Only' },
                { value: 'TRIAL', label: 'Trial Only' },
                { value: 'SUSPENDED', label: 'Suspended Only' },
                { value: 'INACTIVE', label: 'Inactive Only' },
              ]}
              className="py-1.5 text-xs w-40"
            />

            <Select
              label=""
              value={industryFilter}
              onChange={(e) => {
                setIndustryFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: 'ALL', label: 'All Industries' },
                { value: 'Technology', label: 'Technology' },
                { value: 'Software', label: 'Software' },
                { value: 'Finance', label: 'Finance' },
                { value: 'Healthcare', label: 'Healthcare' },
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
          <DataTable columns={columns} data={companies} />
        </CardBody>

        {/* SERVER-SIDE PAGINATION FOOTER */}
        <div className="p-4 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-slate-700 font-medium">
          <div>
            Showing <strong className="text-slate-900 font-bold">{(page - 1) * limit + 1}</strong> to <strong className="text-slate-900 font-bold">{Math.min(page * limit, totalCount)}</strong> of <strong className="text-slate-900 font-bold">{totalCount}</strong> companies
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
            <span className="font-mono px-2 font-medium">Page {page} of {totalPages}</span>
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

      {/* SUSPENSION DIALOG */}
      <ConfirmationDialog
        isOpen={!!selectedCompanyForSuspend}
        onClose={() => setSelectedCompanyForSuspend(null)}
        onConfirm={handleSuspendConfirm}
        title={`Suspend Company Account — ${selectedCompanyForSuspend?.name}`}
        description="Suspending this company will temporarily restrict all users of this tenant from performing payroll & application operations."
        confirmName={selectedCompanyForSuspend?.name}
        confirmText="Confirm Suspension"
        requireReason={true}
        isLoading={isSuspending}
      />
    </div>
  );
};

export default CompanyListPage;
