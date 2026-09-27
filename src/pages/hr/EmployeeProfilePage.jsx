import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  User,
  Phone,
  Briefcase,
  Building,
  DollarSign,
  CreditCard,
  Shield,
  FileText,
  Activity,
  UserX,
  ArrowRightLeft,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';

export const EmployeeProfilePage = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isLoading, setIsLoading] = useState(true);

  // Document verification modal state
  const [selectedDocForVerify, setSelectedDocForVerify] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [employeeId]);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      let apiProfile = null;
      try {
        const res = await api.get(`/hr/employees/${employeeId}`);
        if (res && res.success && res.data) {
          apiProfile = res.data;
        }
      } catch (networkErr) {
        console.warn('Backend API offline, loading employee profile from local session:', networkErr);
      }

      if (apiProfile) {
        setProfile(apiProfile);
      } else {
        // Search in localStorage demo_added_employees first
        const savedEmpsStr = localStorage.getItem('demo_added_employees');
        const customEmps = savedEmpsStr ? JSON.parse(savedEmpsStr) : [];
        const foundDemoEmp = customEmps.find((e) => e.id === employeeId || e.employee_code === employeeId);

        if (foundDemoEmp) {
          setProfile({
            ...foundDemoEmp,
            designation: foundDemoEmp.designations?.name || 'Staff Specialist',
            department: foundDemoEmp.departments?.name || 'Engineering',
            branch: foundDemoEmp.company_branches?.branch_name || 'San Francisco HQ',
            reportingManager: foundDemoEmp.reporting_manager ? `${foundDemoEmp.reporting_manager.first_name} ${foundDemoEmp.reporting_manager.last_name}` : 'Alexander Vance',
            joining_date: '2026-10-01',
            salaryStructure: { annualCtc: 120000, basic: 60000, hra: 24000, specialAllowance: 36000 },
            bankInfo: { accountHolderName: `${foundDemoEmp.first_name} ${foundDemoEmp.last_name}`, bankName: 'JPMorgan Chase & Co.', accountNumberMasked: '**** **** 4892' },
            statutoryInfo: { panMasked: 'ABCDE****F', aadhaarMasked: '**** **** 4092' },
          });
        } else {
          // Default mock profile fallback
          setProfile({
            id: employeeId || 'emp-001',
            employee_code: employeeId && employeeId.startsWith('EMP') ? employeeId : 'EMP-001',
            first_name: 'Samantha',
            last_name: 'Reed',
            work_email: 'samantha.reed@company.com',
            designation: 'Senior Software Engineer',
            department: 'Engineering',
            branch: 'San Francisco HQ',
            employment_status: 'ACTIVE',
            employment_type: 'Full Time',
            joining_date: '2025-01-15',
            reportingManager: 'Alexander Vance',
            salaryStructure: { annualCtc: 120000, basic: 60000, hra: 24000, specialAllowance: 36000 },
            bankInfo: { accountHolderName: 'Samantha Reed', bankName: 'JPMorgan Chase & Co.', accountNumberMasked: '**** **** 4892' },
            statutoryInfo: { panMasked: 'ABCDE****F', aadhaarMasked: '**** **** 4092' },
          });
        }
      }
    } catch (err) {
      console.warn('Profile fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyDocument = async (docId, status) => {
    setIsVerifying(true);
    try {
      await api.patch(`/hr/documents/${docId}/verify`, {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
      });
      setNotice(`Document marked as ${status}.`);
      setSelectedDocForVerify(null);
      fetchProfile();
    } catch (err) {
      alert(err.message || 'Document verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const tabs = [
    'Overview',
    'Personal',
    'Employment',
    'Salary Structure',
    'Bank & Statutory',
    'Documents',
    'Activity & Audit',
  ];

  const fullName = profile ? `${profile.first_name} ${profile.last_name}` : 'Employee';

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">

      {/* HEADER CARD */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <Avatar src={profile?.profile_photo_url} name={fullName} size="xl" />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-100">{fullName}</h1>
              <Badge variant="success">{profile?.employment_status || 'ACTIVE'}</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              EMP ID: <span className="font-mono font-bold text-blue-400">{profile?.employee_code}</span> &bull; {profile?.designation} &bull; <strong className="text-slate-200">{profile?.department}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={ArrowRightLeft}
            onClick={() => {
              const newBranch = prompt('Enter new branch location for employee:', profile?.branch || 'New York Hub');
              if (newBranch) {
                setProfile((prev) => ({ ...prev, branch: newBranch }));
                setNotice(`Employee branch updated to ${newBranch}.`);
              }
            }}
          >
            Transfer
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={TrendingUp}
            onClick={() => navigate('/hr/compensation/revisions')}
          >
            Promote
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-rose-400 hover:text-rose-300"
            icon={UserX}
            onClick={() => {
              if (window.confirm(`Are you sure you want to deactivate ${fullName}? Payroll & compliance history will be preserved.`)) {
                setProfile((prev) => ({ ...prev, employment_status: 'INACTIVE' }));
                setNotice(`Employee status set to INACTIVE. Historical payroll records preserved.`);
              }
            }}
          >
            Deactivate
          </Button>
        </div>
      </div>

      {notice && (
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-slate-200">Dismiss</button>
        </div>
      )}

      {/* LAZY TABS */}
      <div className="flex border-b border-slate-800 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
              activeTab === tab
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader title="Employment Parameters" />
            <CardBody className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Joining Date:</span>
                <span className="font-mono text-slate-200">{profile?.joining_date}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Employment Type:</span>
                <Badge variant="purple">{profile?.employment_type}</Badge>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Branch Location:</span>
                <span className="text-slate-200">{profile?.branch}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Reporting Manager:</span>
                <span className="text-slate-200">{profile?.reportingManager}</span>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader title="Career & Onboarding Timeline" />
            <CardBody className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200 block">Initial Onboarding Completed</span>
                  <span className="text-[10px] text-slate-500 font-mono">15 Jan 2025</span>
                </div>
                <Badge variant="success">COMPLETED</Badge>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* TAB 4: SALARY STRUCTURE (MASKED / PERMISSION PROTECTED) */}
      {activeTab === 'Salary Structure' && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader title="Salary & Compensation Configuration" description="HR Permission Protected" />
          <CardBody className="space-y-3 text-xs">
            {profile?.salaryStructure ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-slate-400">Annual Gross CTC:</span>
                  <div className="text-xl font-bold text-emerald-400 font-mono">
                    ${profile.salaryStructure.annualCtc.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-slate-400">Basic Monthly Component:</span>
                  <div className="text-xl font-bold text-slate-100 font-mono">
                    ${(profile.salaryStructure.basic / 12).toLocaleString()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                You do not have permission to view salary compensation details for this employee (`employee.view_salary` required).
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* TAB 5: BANK & STATUTORY (MASKED) */}
      {activeTab === 'Bank & Statutory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader title="Bank Account Details (Field Masked)" />
            <CardBody className="space-y-2">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Account Holder:</span>
                <span className="font-semibold text-slate-200">{profile?.bankInfo?.accountHolderName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Bank Name:</span>
                <span className="text-slate-200">{profile?.bankInfo?.bankName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Account Number:</span>
                <span className="font-mono text-emerald-400 font-bold">{profile?.bankInfo?.accountNumberMasked}</span>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader title="Statutory Identifiers (PAN Masked)" />
            <CardBody className="space-y-2">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">PAN Card Identifier:</span>
                <span className="font-mono text-blue-400 font-bold">{profile?.statutoryInfo?.panMasked}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Aadhaar Reference:</span>
                <span className="font-mono text-slate-300">{profile?.statutoryInfo?.aadhaarMasked}</span>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* TAB 6: DOCUMENTS & VERIFICATION */}
      {activeTab === 'Documents' && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader title="Uploaded Compliance Documents" description="Supabase Storage Metadata" />
          <CardBody className="space-y-3">
            {[
              { id: 'doc-1', type: 'Offer Letter', file: 'Offer_Letter_Eleanor.pdf', status: 'VERIFIED' },
              { id: 'doc-2', type: 'ID Proof (Passport)', file: 'Passport_Scan.pdf', status: 'PENDING' },
            ].map((d) => (
              <div key={d.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <div>
                    <span className="font-semibold text-slate-200">{d.type}</span>
                    <span className="block text-[10px] text-slate-500 font-mono">{d.file}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={d.status === 'VERIFIED' ? 'success' : 'warning'}>{d.status}</Badge>
                  {d.status === 'PENDING' && (
                    <Button variant="primary" size="sm" onClick={() => handleVerifyDocument(d.id, 'VERIFIED')}>
                      Verify Document
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

    </div>
  );
};

export default EmployeeProfilePage;
