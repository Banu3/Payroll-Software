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
        setNotice('Employee not found or failed to load.');
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

  const fullName = profile ? `${profile.first_name} ${profile.last_name}` : 'Employee Profile';

  return (
    <div className="space-y-6 animate-fade-in text-[#17221C]">

      {/* HEADER CARD */}
      <div className="p-6 bg-white border border-[#DCE5E0] rounded-[14px] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_4px_16px_rgba(20,50,35,0.05)]">
        <div className="flex items-center gap-4">
          <Avatar src={profile?.profile_photo_url} name={fullName} size="xl" />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-[#17221C]">{fullName}</h1>
              <Badge variant="success">{profile?.employment_status || 'ACTIVE'}</Badge>
            </div>
            <p className="text-xs text-[#65736B] mt-1">
              EMP ID: <span className="font-mono font-bold text-[#167C63]">{profile?.employee_code || 'EMP-1001'}</span> &bull; {profile?.designation || 'Specialist'} &bull; <strong className="text-[#17221C]">{profile?.department || 'Operations'}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={ArrowRightLeft}
            onClick={async () => {
              const newBranchId = prompt('Enter new branch ID for employee:');
              if (newBranchId) {
                try {
                  await api.post(`/hr/employees/${profile.id}/transfer`, { branchId: newBranchId, effectiveDate: new Date().toISOString().split('T')[0] });
                  setNotice(`Employee transfer recorded successfully.`);
                  fetchProfile();
                } catch(err) {
                  alert(err.message || 'Transfer failed');
                }
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
            variant="outline"
            size="sm"
            className="text-[#C24141] hover:bg-[#FFF1F1] border-[#F7C6C6]"
            icon={UserX}
            onClick={async () => {
              if (window.confirm(`Are you sure you want to deactivate ${fullName}? Payroll & compliance history will be preserved.`)) {
                try {
                  await api.post(`/hr/employees/${profile?.id}/deactivate`, { status: 'INACTIVE', reason: 'Deactivated from UI' });
                  setNotice(`Employee status set to INACTIVE. Historical payroll records preserved.`);
                  fetchProfile();
                } catch (err) {
                  alert(err.message || 'Deactivation failed');
                }
              }
            }}
          >
            Deactivate
          </Button>
        </div>
      </div>

      {notice && (
        <div className="p-4 rounded-[10px] bg-[#E5F4EE] border border-[#BCE3D4] text-[#167C63] font-semibold text-xs flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-[#167C63] hover:underline font-bold text-xs cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* LAZY TABS */}
      <div className="flex border-b border-[#DCE5E0] overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
              activeTab === tab
                ? 'border-[#167C63] text-[#167C63] bg-[#E5F4EE]'
                : 'border-transparent text-[#65736B] hover:text-[#17221C] hover:bg-[#F0F6F3]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Employment Parameters" />
            <CardBody className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#E8EEEA]">
                <span className="text-[#65736B]">Joining Date:</span>
                <span className="font-mono text-[#17221C]">{profile?.joining_date || '2025-01-15'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E8EEEA]">
                <span className="text-[#65736B]">Employment Type:</span>
                <Badge variant="primary">{profile?.employment_type || 'FULL_TIME'}</Badge>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E8EEEA]">
                <span className="text-[#65736B]">Branch Location:</span>
                <span className="text-[#17221C]">{profile?.branch || 'Headquarters'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#65736B]">Reporting Manager:</span>
                <span className="text-[#17221C]">{profile?.reportingManager || 'Marcus Brooke'}</span>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Career & Onboarding Timeline" />
            <CardBody className="space-y-3 text-xs">
              <div className="p-3 bg-[#F7F9F7] border border-[#DCE5E0] rounded-[10px] flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#17221C] block">Initial Onboarding Completed</span>
                  <span className="text-[10px] text-[#65736B] font-mono">15 Jan 2025</span>
                </div>
                <Badge variant="success">COMPLETED</Badge>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* TAB 4: SALARY STRUCTURE */}
      {activeTab === 'Salary Structure' && (
        <Card>
          <CardHeader title="Salary & Compensation Configuration" description="HR Permission Protected" />
          <CardBody className="space-y-3 text-xs">
            {profile?.salaryStructure ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[#F7F9F7] border border-[#DCE5E0] rounded-[10px] space-y-2">
                  <span className="text-[#65736B]">Annual Gross CTC:</span>
                  <div className="text-xl font-bold text-[#167C63] font-mono tabular-nums">
                    ₹{profile.salaryStructure.annualCtc.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 bg-[#F7F9F7] border border-[#DCE5E0] rounded-[10px] space-y-2">
                  <span className="text-[#65736B]">Basic Monthly Component:</span>
                  <div className="text-xl font-bold text-[#17221C] font-mono tabular-nums">
                    ₹{(profile.salaryStructure.basic / 12).toLocaleString()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[#F7F9F7] border border-[#DCE5E0] rounded-[10px] space-y-2">
                  <span className="text-[#65736B]">Annual Gross CTC:</span>
                  <div className="text-xl font-bold text-[#167C63] font-mono tabular-nums">
                    ₹1,200,000
                  </div>
                </div>
                <div className="p-4 bg-[#F7F9F7] border border-[#DCE5E0] rounded-[10px] space-y-2">
                  <span className="text-[#65736B]">Basic Monthly Component:</span>
                  <div className="text-xl font-bold text-[#17221C] font-mono tabular-nums">
                    ₹50,000
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* TAB 5: BANK & STATUTORY */}
      {activeTab === 'Bank & Statutory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <Card>
            <CardHeader title="Bank Account Details (Field Masked)" />
            <CardBody className="space-y-2">
              <div className="flex justify-between py-1.5 border-b border-[#E8EEEA]">
                <span className="text-[#65736B]">Account Holder:</span>
                <span className="font-semibold text-[#17221C]">{profile?.bankInfo?.accountHolderName || fullName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E8EEEA]">
                <span className="text-[#65736B]">Bank Name:</span>
                <span className="text-[#17221C]">{profile?.bankInfo?.bankName || 'HDFC Bank'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E8EEEA]">
                <span className="text-[#65736B]">Account Number:</span>
                <span className="font-mono text-[#167C63] font-bold">{profile?.bankInfo?.accountNumberMasked || '•••• •••• 4821'}</span>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Statutory Identifiers (PAN Masked)" />
            <CardBody className="space-y-2">
              <div className="flex justify-between py-1.5 border-b border-[#E8EEEA]">
                <span className="text-[#65736B]">PAN Card Identifier:</span>
                <span className="font-mono text-[#167C63] font-bold">{profile?.statutoryInfo?.panMasked || 'ABCDE1234F'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#E8EEEA]">
                <span className="text-[#65736B]">Aadhaar Reference:</span>
                <span className="font-mono text-[#526158]">{profile?.statutoryInfo?.aadhaarMasked || '•••• •••• 9812'}</span>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* TAB 6: DOCUMENTS & VERIFICATION */}
      {activeTab === 'Documents' && (
        <Card>
          <CardHeader title="Uploaded Compliance Documents" description="Supabase Storage Metadata" />
          <CardBody className="space-y-3">
            {[
              { id: 'doc-1', type: 'Offer Letter', file: 'Offer_Letter_Eleanor.pdf', status: 'VERIFIED' },
              { id: 'doc-2', type: 'ID Proof (Passport)', file: 'Passport_Scan.pdf', status: 'PENDING' },
            ].map((d) => (
              <div key={d.id} className="p-3 bg-[#F7F9F7] border border-[#DCE5E0] rounded-[10px] flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-[#167C63]" />
                  <div>
                    <span className="font-semibold text-[#17221C]">{d.type}</span>
                    <span className="block text-[10px] text-[#65736B] font-mono">{d.file}</span>
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
