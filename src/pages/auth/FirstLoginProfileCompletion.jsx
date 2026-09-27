import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import {
  User,
  Phone,
  CreditCard,
  ShieldAlert,
  FileText,
  Lock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save,
  Shield
} from 'lucide-react';
import { api } from '../../services/api';

export const FirstLoginProfileCompletion = () => {
  const { user, refreshSession, hasPermission } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      dob: '1995-06-15',
      gender: 'Female',
      maritalStatus: 'Single',
      nationality: 'American',
    },
    contactInfo: {
      personalEmail: user?.email || '',
      phone: '+1 (555) 234-5678',
      currentAddress: '742 Evergreen Terrace, Suite 100, San Francisco, CA',
      permanentAddress: '742 Evergreen Terrace, Suite 100, San Francisco, CA',
    },
    bankInfo: {
      accountHolderName: `${user?.firstName || 'David'} ${user?.lastName || 'Miller'}`,
      bankName: 'JPMorgan Chase & Co.',
      accountNumber: '**** **** 4892',
      ifscCode: 'CHASUS33',
      taxId: 'XX-XXX-9012',
    },
    emergencyContact: {
      contactName: 'Robert Miller',
      relationship: 'Father',
      phone: '+1 (555) 987-6543',
    },
    documents: [
      { name: 'Passport_Scan.pdf', status: 'Uploaded', type: 'ID Proof' },
      { name: 'W4_Form_2026.pdf', status: 'Pending Verification', type: 'Tax Form' }
    ],
    securitySetup: {
      enable2FA: false,
    }
  });

  const canEditSalary = hasPermission('employee.view_salary');

  const steps = [
    { number: 1, title: 'Personal Information', icon: User },
    { number: 2, title: 'Contact Information', icon: Phone },
    { number: 3, title: 'Bank Details', icon: CreditCard },
    { number: 4, title: 'Emergency Contact', icon: ShieldAlert },
    { number: 5, title: 'Documents', icon: FileText },
    { number: 6, title: 'Security Setup', icon: Lock },
  ];

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleNextStep = () => {
    setError(null);
    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSaveAndExit = async () => {
    try {
      await api.post('/users/complete-profile', formData);
    } catch (err) {
      console.warn('Draft save warning:', err);
    } finally {
      await refreshSession();
      navigate('/employee/dashboard', { replace: true });
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      try {
        await api.post('/users/complete-profile', formData);
      } catch (apiErr) {
        console.warn('[FirstLoginProfileCompletion] Backend API offline, utilizing client session update:', apiErr);
      }
      
      // Update local demo user metadata if in demo mode
      const savedUserStr = localStorage.getItem('demo_user_data');
      if (savedUserStr) {
        const u = JSON.parse(savedUserStr);
        u.isFirstLogin = false;
        u.profileCompleted = true;
        localStorage.setItem('demo_user_data', JSON.stringify(u));
      }

      await refreshSession();
      navigate('/employee/dashboard', { replace: true });
    } catch (err) {
      console.error('Final Submit Error:', err);
      navigate('/employee/dashboard', { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center py-10 px-4 font-sans text-slate-100">
      <div className="max-w-3xl w-full space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
              EP
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100">Complete Your Employee Profile</h1>
              <p className="text-xs text-slate-400">First-time Onboarding Security Wizard</p>
            </div>
          </div>
          <Button variant="outline" size="sm" icon={Save} onClick={handleSaveAndExit}>
            Save & Exit
          </Button>
        </div>

        {/* Step Wizard Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Step {currentStep} of 6 — {steps[currentStep - 1].title}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {Math.round((currentStep / 6) * 100)}% Completed
            </span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
            <div
              className="bg-blue-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-6 gap-1.5 text-center">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = step.number === currentStep;
              const isDone = step.number < currentStep;

              return (
                <div
                  key={step.number}
                  onClick={() => step.number < currentStep && setCurrentStep(step.number)}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : isDone
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4 mx-auto mb-1" />
                  <span className="hidden sm:block text-[10px] font-medium truncate">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Card Body */}
        <Card className="bg-slate-900 border-slate-800 shadow-xl">
          <CardHeader
            title={steps[currentStep - 1].title}
            description="Please ensure your corporate details match official legal documents."
          />

          <CardBody className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {error}
              </div>
            )}

            {/* STEP 1: Personal Info */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={formData.personalInfo.firstName}
                  onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                  isRequired
                />
                <Input
                  label="Last Name"
                  value={formData.personalInfo.lastName}
                  onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                  isRequired
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  value={formData.personalInfo.dob}
                  onChange={(e) => handleInputChange('personalInfo', 'dob', e.target.value)}
                  isRequired
                />
                <Select
                  label="Gender"
                  value={formData.personalInfo.gender}
                  onChange={(e) => handleInputChange('personalInfo', 'gender', e.target.value)}
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Non-Binary', label: 'Non-Binary' },
                    { value: 'Prefer not to say', label: 'Prefer not to say' },
                  ]}
                />
                <Select
                  label="Marital Status"
                  value={formData.personalInfo.maritalStatus}
                  onChange={(e) => handleInputChange('personalInfo', 'maritalStatus', e.target.value)}
                  options={[
                    { value: 'Single', label: 'Single' },
                    { value: 'Married', label: 'Married' },
                    { value: 'Divorced', label: 'Divorced' },
                    { value: 'Widowed', label: 'Widowed' },
                  ]}
                />
                <Input
                  label="Nationality"
                  value={formData.personalInfo.nationality}
                  onChange={(e) => handleInputChange('personalInfo', 'nationality', e.target.value)}
                  isRequired
                />
              </div>
            )}

            {/* STEP 2: Contact Info */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Personal Email Address"
                    type="email"
                    value={formData.contactInfo.personalEmail}
                    onChange={(e) => handleInputChange('contactInfo', 'personalEmail', e.target.value)}
                  />
                  <Input
                    label="Mobile Phone Number"
                    type="tel"
                    value={formData.contactInfo.phone}
                    onChange={(e) => handleInputChange('contactInfo', 'phone', e.target.value)}
                    isRequired
                  />
                </div>
                <Input
                  label="Current Residential Address"
                  value={formData.contactInfo.currentAddress}
                  onChange={(e) => handleInputChange('contactInfo', 'currentAddress', e.target.value)}
                  isRequired
                />
                <Input
                  label="Permanent Address"
                  value={formData.contactInfo.permanentAddress}
                  onChange={(e) => handleInputChange('contactInfo', 'permanentAddress', e.target.value)}
                />
              </div>
            )}

            {/* STEP 3: Bank Details */}
            {currentStep === 3 && (
              <div className="space-y-4">
                {!canEditSalary && (
                  <div className="p-3 rounded-lg bg-blue-100/90 border border-blue-500 text-blue-950 font-bold text-xs flex items-center gap-2 shadow-2xs">
                    <Shield className="w-4 h-4 text-blue-800 shrink-0 font-bold" />
                    <span className="text-blue-950 font-bold">Payroll Sensitive Notice: Bank details will require HR Admin verification after submission.</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Account Holder Name"
                    value={formData.bankInfo.accountHolderName}
                    onChange={(e) => handleInputChange('bankInfo', 'accountHolderName', e.target.value)}
                    isRequired
                  />
                  <Input
                    label="Financial Bank Institution"
                    value={formData.bankInfo.bankName}
                    onChange={(e) => handleInputChange('bankInfo', 'bankName', e.target.value)}
                    isRequired
                  />
                  <Input
                    label="Account Number"
                    value={formData.bankInfo.accountNumber}
                    onChange={(e) => handleInputChange('bankInfo', 'accountNumber', e.target.value)}
                    isRequired
                  />
                  <Input
                    label="IFSC / SWIFT / Routing Code"
                    value={formData.bankInfo.ifscCode}
                    onChange={(e) => handleInputChange('bankInfo', 'ifscCode', e.target.value)}
                    isRequired
                  />
                </div>
                <Input
                  label="Tax Identification Number (PAN / SSN)"
                  value={formData.bankInfo.taxId}
                  onChange={(e) => handleInputChange('bankInfo', 'taxId', e.target.value)}
                  isRequired
                />
              </div>
            )}

            {/* STEP 4: Emergency Contact */}
            {currentStep === 4 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Contact Full Name"
                  value={formData.emergencyContact.contactName}
                  onChange={(e) => handleInputChange('emergencyContact', 'contactName', e.target.value)}
                  isRequired
                />
                <Input
                  label="Relationship to Employee"
                  value={formData.emergencyContact.relationship}
                  onChange={(e) => handleInputChange('emergencyContact', 'relationship', e.target.value)}
                  isRequired
                />
                <Input
                  label="Emergency Phone Number"
                  type="tel"
                  value={formData.emergencyContact.phone}
                  onChange={(e) => handleInputChange('emergencyContact', 'phone', e.target.value)}
                  isRequired
                />
              </div>
            )}

            {/* STEP 5: Documents */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <p className="text-xs text-slate-300">
                  Please confirm your required verification documents attached to your file.
                </p>
                <div className="space-y-2">
                  {formData.documents.map((doc, i) => (
                    <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <div>
                          <p className="font-semibold text-slate-200">{doc.name}</p>
                          <p className="text-[10px] text-slate-500">{doc.type}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6: Security Setup */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" /> Multi-Factor Authentication Preference
                  </h4>
                  <label className="flex items-center gap-3 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.securitySetup.enable2FA}
                      onChange={(e) => handleInputChange('securitySetup', 'enable2FA', e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600"
                    />
                    <span>Enable Two-Factor Authentication (2FA) for future logins</span>
                  </label>
                </div>
              </div>
            )}
          </CardBody>

          <CardFooter className="flex justify-between items-center">
            <Button
              variant="outline"
              size="md"
              onClick={handlePrevStep}
              isDisabled={currentStep === 1 || isSubmitting}
              icon={ArrowLeft}
            >
              Previous
            </Button>

            {currentStep < 6 ? (
              <Button
                variant="primary"
                size="md"
                onClick={handleNextStep}
                icon={ArrowRight}
              >
                Save & Continue
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={handleFinalSubmit}
                isLoading={isSubmitting}
                icon={CheckCircle2}
              >
                Complete Onboarding
              </Button>
            )}
          </CardFooter>
        </Card>

      </div>
    </div>
  );
};

export default FirstLoginProfileCompletion;
