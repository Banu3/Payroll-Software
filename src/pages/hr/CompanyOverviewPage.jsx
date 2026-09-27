import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  Building,
  MapPin,
  Globe,
  Mail,
  Phone,
  CreditCard,
  ShieldCheck,
  Users,
  Edit,
  Save,
  CheckCircle2,
  Plus
} from 'lucide-react';

export const CompanyOverviewPage = () => {
  const { company } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [companyDetails, setCompanyDetails] = useState({
    name: company?.name || 'Acme Enterprise Pvt Ltd',
    code: company?.code || 'ACME',
    registrationNo: 'REG-2024-88921',
    taxId: 'TAX-US-992014',
    email: 'contact@acmeenterprise.com',
    phone: '+1 (555) 234-5678',
    website: 'https://acmeenterprise.com',
    address: '100 Technology Parkway, Suite 400, San Francisco, CA 94105',
    currency: 'USD ($)',
    payrollCycle: 'Monthly (Last Working Day)',
  });

  const branches = [
    { name: 'San Francisco Global HQ', code: 'SF-HQ', location: 'San Francisco, USA', headcount: 28, isPrimary: true },
    { name: 'New York Financial Hub', code: 'NY-HUB', location: 'New York, USA', headcount: 12, isPrimary: false },
    { name: 'London Regional Operations', code: 'LDN-OPS', location: 'London, UK', headcount: 8, isPrimary: false },
  ];

  const bankAccounts = [
    { bank: 'JPMorgan Chase Bank', accountName: 'Acme Enterprise Operating', accountNumber: '**** **** 4892', routing: '021000021', type: 'Primary Payroll Account' },
    { bank: 'Bank of America', accountName: 'Acme Enterprise Reserve', accountNumber: '**** **** 7714', routing: '061000052', type: 'Secondary Reserve' },
  ];

  const handleSave = () => {
    setIsEditing(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-900">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Company Overview & Tenant Profile</h1>
            <Badge variant="primary">{companyDetails.code} TENANT</Badge>
          </div>
          <p className="text-xs text-slate-700 mt-1">Manage corporate entity profile, branch locations, statutory tax IDs, and bank account setup.</p>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <Button variant="primary" size="sm" icon={Save} onClick={handleSave}>
              Save Profile Changes
            </Button>
          ) : (
            <Button variant="outline" size="sm" icon={Edit} onClick={() => setIsEditing(true)}>
              Edit Company Details
            </Button>
          )}
        </div>
      </div>

      {isSaved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Company profile details successfully saved.</span>
        </div>
      )}

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* MAIN PROFILE CARD */}
        <Card className="md:col-span-2">
          <CardHeader title="Corporate Identity & Registration" description="Official company registration details and primary contact" />
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Legal Name</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={companyDetails.name}
                  onChange={(e) => setCompanyDetails({ ...companyDetails, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-600 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tenant Code</label>
                <input
                  type="text"
                  disabled
                  value={companyDetails.code}
                  className="w-full px-3 py-2 bg-slate-100 border border-[#E5E7EB] rounded-lg text-xs font-mono font-bold text-teal-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Business Registration No.</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={companyDetails.registrationNo}
                  onChange={(e) => setCompanyDetails({ ...companyDetails, registrationNo: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tax Identification Number (TIN)</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={companyDetails.taxId}
                  onChange={(e) => setCompanyDetails({ ...companyDetails, taxId: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-teal-600 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email</label>
                <input
                  type="email"
                  disabled={!isEditing}
                  value={companyDetails.email}
                  onChange={(e) => setCompanyDetails({ ...companyDetails, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-teal-600 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Phone</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={companyDetails.phone}
                  onChange={(e) => setCompanyDetails({ ...companyDetails, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-teal-600 disabled:bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Headquarters Address</label>
              <textarea
                rows={2}
                disabled={!isEditing}
                value={companyDetails.address}
                onChange={(e) => setCompanyDetails({ ...companyDetails, address: e.target.value })}
                className="w-full p-3 bg-white border border-[#E5E7EB] rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-teal-600 disabled:bg-slate-50"
              />
            </div>
          </CardBody>
        </Card>

        {/* STATUTORY & PAYROLL SETTINGS */}
        <div className="space-y-6">
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Payroll Cycle Configuration</h3>
                <p className="text-[11px] text-slate-600">Disbursement & Base Currency</p>
              </div>
            </div>

            <div className="space-y-3 text-xs pt-2 border-t border-[#E5E7EB]">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Base Currency:</span>
                <span className="font-bold text-slate-900 font-mono">{companyDetails.currency}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Pay Frequency:</span>
                <span className="font-semibold text-teal-800">{companyDetails.payrollCycle}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Total Active Headcount:</span>
                <Badge variant="success">48 Employees</Badge>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Primary Bank Setup</h3>
                <p className="text-[11px] text-slate-600">Disbursement Account</p>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-2 border-t border-[#E5E7EB]">
              <div className="font-bold text-slate-900">JPMorgan Chase Bank</div>
              <div className="text-[11px] text-slate-600 font-mono">Account: **** **** 4892</div>
              <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Payroll Account
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* BRANCH LOCATIONS */}
      <Card>
        <CardHeader
          title="Company Branches & Locations"
          description="Registered operational offices and branch headcount"
          action={
            <Button variant="outline" size="sm" icon={Plus}>
              Add Branch
            </Button>
          }
        />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-[#E5E7EB] text-slate-700 font-semibold">
                <tr>
                  <th className="p-4">Branch Name</th>
                  <th className="p-4">Branch Code</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Headcount</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {branches.map((b) => (
                  <tr key={b.code} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                      <Building className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>{b.name}</span>
                    </td>
                    <td className="p-4 font-mono text-teal-800 font-bold">{b.code}</td>
                    <td className="p-4 text-slate-700 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {b.location}
                    </td>
                    <td className="p-4 font-semibold text-slate-900">{b.headcount} Staff</td>
                    <td className="p-4">
                      {b.isPrimary ? (
                        <Badge variant="primary">Primary HQ</Badge>
                      ) : (
                        <Badge variant="default">Branch Office</Badge>
                      )}
                    </td>
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

export default CompanyOverviewPage;
