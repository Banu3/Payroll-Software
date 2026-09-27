import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DataTable } from '../../components/ui/DataTable';
import { ConfirmationDialog } from '../../components/superAdmin/ConfirmationDialog';
import {
  Building2,
  Users,
  Building,
  DollarSign,
  Lock,
  Unlock,
  UserPlus,
  Settings,
  ShieldCheck,
  Calendar,
  Layers,
  MapPin,
  CheckCircle2,
  FileText,
  Sliders,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';

export const CompanyProfilePage = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('HR_ADMIN');
  const [isInviting, setIsInviting] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  // Tab 3: Departments state
  const [departments, setDepartments] = useState([
    { id: 'd1', name: 'Human Resources', code: 'HR-APEX', status: 'ACTIVE' },
    { id: 'd2', name: 'Finance & Payroll', code: 'FIN-APEX', status: 'ACTIVE' },
    { id: 'd3', name: 'Software Engineering', code: 'ENG-APEX', status: 'ACTIVE' },
    { id: 'd4', name: 'Operations', code: 'OPS-APEX', status: 'ACTIVE' },
  ]);

  // Tab 4: Branches state
  const [branches, setBranches] = useState([
    { id: 'b1', branch_name: 'San Francisco HQ', branch_code: 'SF-HQ', city: 'San Francisco', country: 'USA', status: 'ACTIVE' },
    { id: 'b2', branch_name: 'New York Financial Hub', branch_code: 'NY-HUB', city: 'New York', country: 'USA', status: 'ACTIVE' },
  ]);

  // Tab 8: Feature Flags state
  const [featureFlags, setFeatureFlags] = useState({
    payroll: true,
    attendance: true,
    leave: true,
    expenses: true,
    loans: true,
    performance: true,
    reports: true,
    multi_branch: true,
    ai_assistant: false,
    geo_attendance: false,
    biometric: false,
  });

  useEffect(() => {
    fetchCompanyDetails();
  }, [companyId]);

  const fetchCompanyDetails = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/super-admin/companies/${companyId}`);
      if (res && res.success) {
        setCompany(res.data);
      }
    } catch (err) {
      console.warn('Company fetch warning:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspendConfirm = async ({ reason }) => {
    setIsSuspending(true);
    try {
      await api.post(`/super-admin/companies/${companyId}/suspend`, { reason });
      setActionNotice(`Company suspended successfully.`);
      setIsSuspendModalOpen(false);
      fetchCompanyDetails();
    } catch (err) {
      alert(err.message || 'Suspension failed');
    } finally {
      setIsSuspending(false);
    }
  };

  const handleActivate = async () => {
    try {
      await api.post(`/super-admin/companies/${companyId}/activate`);
      setActionNotice(`Company activated successfully.`);
      fetchCompanyDetails();
    } catch (err) {
      alert(err.message || 'Activation failed');
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setIsInviting(true);
    try {
      const res = await api.post(`/super-admin/companies/${companyId}/admins/invite`, {
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
      });
      setActionNotice(res.message);
      setIsInviteModalOpen(false);
      setInviteName('');
      setInviteEmail('');
    } catch (err) {
      alert(err.message || 'Invitation failed');
    } finally {
      setIsInviting(false);
    }
  };

  const tabs = [
    'Overview',
    'Employees',
    'Departments',
    'Branches',
    'Admins',
    'Settings',
    'Features',
    'Audit Timeline',
  ];

  const getStatusBadge = (st) => {
    switch (st) {
      case 'ACTIVE':
        return <Badge variant="success">✓ ACTIVE</Badge>;
      case 'SUSPENDED':
        return <Badge variant="warning">! SUSPENDED</Badge>;
      default:
        return <Badge variant="primary">TRIAL</Badge>;
    }
  };

  return (

    <div className="space-y-6 animate-fade-in text-slate-900">

      {/* HEADER SECTION */}
      <div className="p-6 bg-white border border-[#E5E7EB] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 font-bold font-mono text-xl flex items-center justify-center">
            {company?.code || 'COMP'}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">{company?.name || 'Loading Company...'}</h1>
              {getStatusBadge(company?.status)}
            </div>
            <p className="text-xs text-slate-700 mt-1">
              ID: <span className="font-mono text-slate-800 font-medium">{company?.id}</span> &bull; Industry: <strong className="text-slate-900">{company?.industry}</strong> &bull; Plan: <strong className="text-teal-700 font-semibold">{company?.currentSubscription?.planName}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" icon={UserPlus} onClick={() => setIsInviteModalOpen(true)}>
            Invite Admin
          </Button>

          {company?.status === 'SUSPENDED' ? (
            <Button variant="primary" size="sm" icon={Unlock} onClick={handleActivate}>
              Activate Company
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="text-amber-700 border-amber-300 hover:bg-amber-50"
              icon={Lock}
              onClick={() => setIsSuspendModalOpen(true)}
            >
              Suspend Company
            </Button>
          )}
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between font-medium">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-slate-600 hover:text-slate-900 font-medium">Dismiss</button>
        </div>
      )}

      {/* LAZY LOADED TABS */}
      <div className="flex border-b border-[#E5E7EB] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
              activeTab === tab
                ? 'border-teal-600 text-teal-800 bg-teal-50/50'
                : 'border-transparent text-slate-700 hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <span className="text-xs text-slate-700 font-medium">Total Employees</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">{company?.employeesCount || 48}</div>
            </Card>
            <Card className="p-4">
              <span className="text-xs text-slate-700 font-medium">Departments</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">{company?.departmentsCount || 4}</div>
            </Card>
            <Card className="p-4">
              <span className="text-xs text-slate-700 font-medium">Branches</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">{company?.branchesCount || 3}</div>
            </Card>
            <Card className="p-4">
              <span className="text-xs text-slate-700 font-medium">Payroll Cycle</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">{company?.pay_frequency || 'Monthly'}</div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: DEPARTMENTS */}
      {activeTab === 'Departments' && (
        <Card>
          <CardHeader
            title="Company Departments"
            description="Tenant specific departmental units"
          />
          <CardBody className="p-0">
            <DataTable
              columns={[
                { header: 'Code', accessor: 'code', render: (d) => <span className="font-mono text-teal-700 font-bold">{d.code}</span> },
                { header: 'Department Name', accessor: 'name', render: (d) => <span className="font-semibold text-slate-900">{d.name}</span> },
                { header: 'Status', accessor: 'status', render: (d) => <Badge variant="success">{d.status}</Badge> },
              ]}
              data={departments}
            />
          </CardBody>
        </Card>
      )}

      {/* TAB 4: BRANCHES */}
      {activeTab === 'Branches' && (
        <Card>
          <CardHeader
            title="Company Branch Locations"
            description="Multi-branch management under unique (company_id + branch_code)"
          />
          <CardBody className="p-0">
            <DataTable
              columns={[
                { header: 'Branch Code', accessor: 'branch_code', render: (b) => <span className="font-mono text-blue-700 font-bold">{b.branch_code}</span> },
                { header: 'Branch Name', accessor: 'branch_name', render: (b) => <span className="font-semibold text-slate-900">{b.branch_name}</span> },
                { header: 'City / Country', accessor: 'city', render: (b) => <span className="text-slate-800">{b.city}, {b.country}</span> },
                { header: 'Status', accessor: 'status', render: (b) => <Badge variant="success">{b.status}</Badge> },
              ]}
              data={branches}
            />
          </CardBody>
        </Card>
      )}

      {/* TAB 7: FEATURES */}
      {activeTab === 'Features' && (
        <Card>
          <CardHeader
            title="Company Feature Flags & Capability Matrix"
            description="Super Admin server-validated feature access control"
          />
          <CardBody className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.keys(featureFlags).map((flag) => (
              <div key={flag} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900 capitalize">{flag.replace('_', ' ')}</span>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featureFlags[flag]}
                    onChange={(e) => setFeatureFlags((prev) => ({ ...prev, [flag]: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                </label>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {/* SUSPEND DIALOG */}
      <ConfirmationDialog
        isOpen={isSuspendModalOpen}
        onClose={() => setIsSuspendModalOpen(false)}
        onConfirm={handleSuspendConfirm}
        title={`Suspend Tenant Account — ${company?.name}`}
        description="Are you sure you want to suspend this company? Users will be blocked from logging in until reactivated."
        confirmName={company?.name}
        confirmText="Suspend Company"
        requireReason={true}
        isLoading={isSuspending}
      />
    </div>
  );
};

export default CompanyProfilePage;
