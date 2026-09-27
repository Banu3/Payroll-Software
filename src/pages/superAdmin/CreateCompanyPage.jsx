import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import {
  Building2,
  MapPin,
  UserCheck,
  DollarSign,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldAlert
} from 'lucide-react';
import { api } from '../../services/api';

export const CreateCompanyPage = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    companyInfo: {
      name: 'Vanguard Global Corp',
      legalName: 'Vanguard Global Corporation Inc.',
      registrationNumber: 'REG-88291-US',
      industry: 'Finance',
      companyType: 'Corporation',
      website: 'https://vanguardglobal.com',
      email: 'contact@vanguardglobal.com',
      phone: '+1 (555) 392-8811',
      logoUrl: '',
    },
    address: {
      address: '100 Financial Plaza, Floor 18',
      city: 'New York',
      state: 'NY',
      country: 'United States',
      postalCode: '10005',
    },
    primaryAdmin: {
      adminName: 'Victor Vance',
      adminEmail: 'victor.vance@vanguardglobal.com',
      phone: '+1 (555) 392-8812',
    },
    payrollConfig: {
      payFrequency: 'Monthly',
      currency: 'USD',
      financialYearStart: 'January',
      payrollDate: 30,
    },
    plan: {
      planCode: 'PROFESSIONAL',
      employeeLimit: 250,
      storageLimitGb: 25,
    },
  });

  const steps = [
    { number: 1, title: 'Company Information', icon: Building2 },
    { number: 2, title: 'Address & Location', icon: MapPin },
    { number: 3, title: 'Primary HR Admin', icon: UserCheck },
    { number: 4, title: 'Payroll Config', icon: DollarSign },
    { number: 5, title: 'Subscription Plan', icon: CreditCard },
    { number: 6, title: 'Review & Provision', icon: CheckCircle2 },
  ];

  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleNext = () => {
    setError(null);
    if (currentStep < 6) setCurrentStep((p) => p + 1);
  };

  const handlePrev = () => {
    setError(null);
    if (currentStep > 1) setCurrentStep((p) => p - 1);
  };

  const handleSubmitCompany = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.post('/super-admin/companies', formData);
      if (res && res.success && res.data?.companyId) {
        navigate(`/super-admin/companies/${res.data.companyId}`);
      } else {
        navigate('/super-admin/companies');
      }
    } catch (err) {
      setError(err.message || 'Company provisioning failed. Please check form parameters.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in text-slate-900">
      <PageHeader
        title="Provision New Tenant Company"
        description="Multi-Step Enterprise Onboarding Wizard"
        badge={<Badge variant="purple font-mono">NEW TENANT</Badge>}
      />

      {/* Step Progress Bar */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-3 text-xs">
          <span className="font-semibold uppercase tracking-wider text-teal-700">
            Step {currentStep} of 6 — {steps[currentStep - 1].title}
          </span>
          <span className="font-mono text-slate-700 font-medium">{Math.round((currentStep / 6) * 100)}% Completed</span>
        </div>

        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4 border border-slate-200">
          <div
            className="bg-teal-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>

        <div className="grid grid-cols-6 gap-1 text-center">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = step.number === currentStep;
            const isDone = step.number < currentStep;

            return (
              <div
                key={step.number}
                onClick={() => step.number < currentStep && setCurrentStep(step.number)}
                className={`p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                  isActive
                    ? 'bg-teal-50 border-teal-500 text-teal-900 font-semibold'
                    : isDone
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <Icon className="w-4 h-4 mx-auto mb-1" />
                <span className="hidden sm:block text-[10px] truncate font-medium">{step.title}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Wizard Card Body */}
      <Card>
        <CardHeader
          title={steps[currentStep - 1].title}
          description="Enter tenant details. Information is stored securely with server-side isolation."
        />

        <CardBody className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* STEP 1: COMPANY INFO */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Company Name"
                value={formData.companyInfo.name}
                onChange={(e) => handleNestedChange('companyInfo', 'name', e.target.value)}
                isRequired
              />
              <Input
                label="Legal Corporate Name"
                value={formData.companyInfo.legalName}
                onChange={(e) => handleNestedChange('companyInfo', 'legalName', e.target.value)}
              />
              <Input
                label="Company Registration / Tax ID"
                value={formData.companyInfo.registrationNumber}
                onChange={(e) => handleNestedChange('companyInfo', 'registrationNumber', e.target.value)}
              />
              <Select
                label="Industry"
                value={formData.companyInfo.industry}
                onChange={(e) => handleNestedChange('companyInfo', 'industry', e.target.value)}
                options={[
                  { value: 'Technology', label: 'Technology' },
                  { value: 'Software', label: 'Software' },
                  { value: 'Finance', label: 'Finance & Banking' },
                  { value: 'Healthcare', label: 'Healthcare' },
                  { value: 'Manufacturing', label: 'Manufacturing' },
                  { value: 'Retail', label: 'Retail & E-commerce' },
                ]}
                isRequired
              />
              <Select
                label="Company Type"
                value={formData.companyInfo.companyType}
                onChange={(e) => handleNestedChange('companyInfo', 'companyType', e.target.value)}
                options={[
                  { value: 'Corporation', label: 'Corporation (Inc)' },
                  { value: 'LLC', label: 'Limited Liability Company (LLC)' },
                  { value: 'Partnership', label: 'Partnership' },
                  { value: 'Sole Proprietorship', label: 'Sole Proprietorship' },
                ]}
              />
              <Input
                label="Official Website URL"
                value={formData.companyInfo.website}
                onChange={(e) => handleNestedChange('companyInfo', 'website', e.target.value)}
              />
              <Input
                label="Corporate Email Address"
                type="email"
                value={formData.companyInfo.email}
                onChange={(e) => handleNestedChange('companyInfo', 'email', e.target.value)}
                isRequired
              />
              <Input
                label="Phone Number"
                value={formData.companyInfo.phone}
                onChange={(e) => handleNestedChange('companyInfo', 'phone', e.target.value)}
                isRequired
              />
            </div>
          )}

          {/* STEP 2: ADDRESS */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <Input
                label="Street Address"
                value={formData.address.address}
                onChange={(e) => handleNestedChange('address', 'address', e.target.value)}
                isRequired
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="City"
                  value={formData.address.city}
                  onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
                  isRequired
                />
                <Input
                  label="State / Province"
                  value={formData.address.state}
                  onChange={(e) => handleNestedChange('address', 'state', e.target.value)}
                  isRequired
                />
                <Input
                  label="Country"
                  value={formData.address.country}
                  onChange={(e) => handleNestedChange('address', 'country', e.target.value)}
                  isRequired
                />
                <Input
                  label="Postal Code"
                  value={formData.address.postalCode}
                  onChange={(e) => handleNestedChange('address', 'postalCode', e.target.value)}
                  isRequired
                />
              </div>
            </div>
          )}

          {/* STEP 3: PRIMARY ADMIN */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-300 text-xs">
                This administrator will receive full HR Admin authority to configure employees, attendance, and payroll for this tenant.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Admin Full Name"
                  value={formData.primaryAdmin.adminName}
                  onChange={(e) => handleNestedChange('primaryAdmin', 'adminName', e.target.value)}
                  isRequired
                />
                <Input
                  label="Admin Corporate Email"
                  type="email"
                  value={formData.primaryAdmin.adminEmail}
                  onChange={(e) => handleNestedChange('primaryAdmin', 'adminEmail', e.target.value)}
                  isRequired
                />
                <Input
                  label="Admin Contact Phone"
                  value={formData.primaryAdmin.phone}
                  onChange={(e) => handleNestedChange('primaryAdmin', 'phone', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 4: PAYROLL CONFIG */}
          {currentStep === 4 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Pay Frequency"
                value={formData.payrollConfig.payFrequency}
                onChange={(e) => handleNestedChange('payrollConfig', 'payFrequency', e.target.value)}
                options={[
                  { value: 'Monthly', label: 'Monthly' },
                  { value: 'Bi-weekly', label: 'Bi-weekly' },
                  { value: 'Weekly', label: 'Weekly' },
                ]}
              />
              <Select
                label="Default Currency"
                value={formData.payrollConfig.currency}
                onChange={(e) => handleNestedChange('payrollConfig', 'currency', e.target.value)}
                options={[
                  { value: 'USD', label: 'USD ($)' },
                  { value: 'EUR', label: 'EUR (€)' },
                  { value: 'GBP', label: 'GBP (£)' },
                  { value: 'CAD', label: 'CAD ($)' },
                ]}
              />
              <Select
                label="Financial Year Start"
                value={formData.payrollConfig.financialYearStart}
                onChange={(e) => handleNestedChange('payrollConfig', 'financialYearStart', e.target.value)}
                options={[
                  { value: 'January', label: 'January - December' },
                  { value: 'April', label: 'April - March' },
                  { value: 'July', label: 'July - June' },
                ]}
              />
              <Input
                label="Payroll Processing Day of Month"
                type="number"
                min="1"
                max="31"
                value={formData.payrollConfig.payrollDate}
                onChange={(e) => handleNestedChange('payrollConfig', 'payrollDate', Number(e.target.value))}
                isRequired
              />
            </div>
          )}

          {/* STEP 5: SUBSCRIPTION PLAN */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { code: 'STARTER', name: 'Starter', price: '$49/mo', limit: 25, desc: 'Basic payroll & leave' },
                  { code: 'PROFESSIONAL', name: 'Professional', price: '$149/mo', limit: 250, desc: 'Multi-branch & analytics' },
                  { code: 'BUSINESS', name: 'Business', price: '$299/mo', limit: 1000, desc: 'Advanced loans & approvals' },
                  { code: 'ENTERPRISE', name: 'Enterprise Unlimited', price: '$599/mo', limit: 10000, desc: 'Custom scale & SLA' },
                ].map((p) => {
                  const isSelected = formData.plan.planCode === p.code;
                  return (
                    <div
                      key={p.code}
                      onClick={() => handleNestedChange('plan', 'planCode', p.code)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                        <span className="font-mono text-xs text-teal-700 font-bold">{p.price}</span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1">{p.desc}</p>
                      <div className="mt-3 text-[11px] font-mono text-slate-800 font-medium">
                        Employee Limit: <strong>{p.limit} Users</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: REVIEW & SUBMIT */}
          {currentStep === 6 && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="font-semibold text-teal-800 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" /> Tenant Provisioning Summary
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-800 font-medium">
                  <div>Company: <strong className="text-slate-900">{formData.companyInfo.name}</strong></div>
                  <div>Industry: <strong className="text-slate-900">{formData.companyInfo.industry}</strong></div>
                  <div>Primary Admin: <strong className="text-slate-900">{formData.primaryAdmin.adminName}</strong></div>
                  <div>Admin Email: <strong className="text-slate-900">{formData.primaryAdmin.adminEmail}</strong></div>
                  <div>Pay Frequency: <strong className="text-slate-900">{formData.payrollConfig.payFrequency}</strong></div>
                  <div>Plan Selected: <strong className="text-slate-900">{formData.plan.planCode}</strong></div>
                </div>
              </div>
            </div>
          )}
        </CardBody>

        <CardFooter className="flex justify-between items-center">
          <Button
            variant="outline"
            size="md"
            onClick={handlePrev}
            isDisabled={currentStep === 1 || isSubmitting}
            icon={ArrowLeft}
          >
            Previous
          </Button>

          {currentStep < 6 ? (
            <Button variant="primary" size="md" onClick={handleNext} icon={ArrowRight}>
              Save & Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmitCompany}
              isLoading={isSubmitting}
              icon={CheckCircle2}
            >
              Provision Company Now
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateCompanyPage;
