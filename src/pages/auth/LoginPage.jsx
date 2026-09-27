import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_DASHBOARDS } from '../../config/permissions';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';
import {
  ShieldCheck,
  Lock,
  Mail,
  AlertCircle,
  Building2,
  CheckCircle2,
  ArrowRight,
  Globe,
  KeyRound
} from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(null);
  const [emailVerificationWarning, setEmailVerificationWarning] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  // Auto-redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated && role) {
      const targetDashboard = ROLE_DASHBOARDS[role] || '/employee/dashboard';
      navigate(targetDashboard, { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setEmailVerificationWarning(null);

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login({ email, password, rememberMe });
      if (result && result.redirect) {
        navigate(result.redirect, { replace: true });
      }
    } catch (err) {
      console.error('Login Error:', err);
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        setEmailVerificationWarning('Your email address has not been verified yet. Please check your inbox for the verification email.');
      } else {
        setError(err.message || 'Authentication failed. Please verify your corporate credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const [activeDemoRole, setActiveDemoRole] = useState(null);

  const DEMO_ACCOUNTS = [
    { role: 'Super Admin', email: 'superadmin@company.com', key: 'super_admin' },
    { role: 'HR Admin', email: 'hradmin@company.com', key: 'hr_admin' },
    { role: 'Manager', email: 'manager@company.com', key: 'manager' },
    { role: 'Employee', email: 'employee@company.com', key: 'employee' },
    { role: 'First Login', email: 'newemployee@company.com', key: 'first_login' },
  ];

  // Quick Demo Account Selector — populates input fields only & waits for user to click "Sign In"
  const selectDemoAccount = (demoEmail, roleKey) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setActiveDemoRole(roleKey);
    setError(null);
    setEmailVerificationWarning(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F6F3] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl w-full mx-auto bg-white border border-[#E5E7EB] rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">

        {/* LEFT SIDE — BRANDING & ABSTRACT WORKFORCE VISUAL */}
        <div className="hidden lg:flex lg:col-span-5 bg-[#111827] p-10 flex-col justify-between border-r border-[#1F2937] relative text-white">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F766E] flex items-center justify-center font-bold text-white shadow-xs text-base">
                EP
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-white tracking-tight">Enterprise Payroll</span>
                <span className="text-[11px] text-[#9CA3AF] font-mono">V2.4 PLATFORM</span>
              </div>
            </div>

            <div className="pt-8 space-y-3">
              <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
                Workforce Management & Global Payroll Security.
              </h2>
              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                Streamlined compliance, automated disbursements, and zero-trust tenant isolation for modern enterprise operations.
              </p>
            </div>

            {/* Abstract visual metric card */}
            <div className="p-4 rounded-xl bg-[#1F2937] border border-[#374151] space-y-3">
              <div className="flex items-center justify-between text-xs text-[#CBD5E1]">
                <span className="font-medium flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-[#2DD4BF]" /> Active Tenant Security
                </span>
                <span className="text-[#2DD4BF] font-mono text-[11px] font-semibold">100% ENCRYPTED</span>
              </div>
              <div className="w-full bg-[#111827] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#0F766E] h-full w-full" />
              </div>
              <div className="flex justify-between text-[10px] text-[#9CA3AF] font-mono">
                <span>AES-256 GCM</span>
                <span>JWT ACCESS CONTROL</span>
              </div>
            </div>
          </div>

          {/* Security & Trust Indicators */}
          <div className="relative z-10 pt-6 border-t border-[#1F2937] space-y-2">
            <div className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Security & Trust Assurance</div>
            <div className="flex items-center justify-between text-xs text-[#CBD5E1]">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#15803D]" /> SOC2 Type II Certified</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#2DD4BF]" /> ISO 27001</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE — ENTERPRISE LOGIN CARD */}
        <div className="col-span-1 lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between bg-white text-[#111827]">
          <div>
            {/* Header branding on mobile */}
            <div className="flex lg:hidden items-center gap-2.5 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center font-bold text-white text-xs">
                EP
              </div>
              <span className="text-sm font-bold text-[#111827]">Enterprise Payroll</span>
            </div>

            <div className="space-y-1 mb-8">
              <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Sign in to your account</h1>
              <p className="text-xs text-[#374151]">Enter your corporate credentials to access your payroll portal.</p>
            </div>

            {/* Error Alert Banner */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-[#FEE2E2] border border-[#FCA5A5] flex items-start gap-3 text-[#B91C1C] text-xs animate-fade-in">
                <AlertCircle className="w-4 h-4 text-[#B91C1C] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">{error}</div>
              </div>
            )}

            {/* Email Verification Warning */}
            {emailVerificationWarning && (
              <div className="mb-6 p-4 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] flex items-start gap-3 text-[#B45309] text-xs animate-fade-in">
                <AlertCircle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">{emailVerificationWarning}</div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <Input
                label="Corporate Email Address"
                type="email"
                icon={Mail}
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isRequired
                autoComplete="email"
              />

              <PasswordInput
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isRequired
                autoComplete="current-password"
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#374151] select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#D1D5DB] text-[#0F766E] focus:ring-[#0F766E]"
                  />
                  <span>Remember this session</span>
                </label>
                <Link to="/forgot-password" className="text-[#0F766E] hover:text-[#115E59] font-medium hover:underline transition-colors">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={isLoading}
                icon={ArrowRight}
              >
                Sign In to Enterprise Portal
              </Button>
            </form>

            {/* QUICK DEMO ACCOUNT SELECTOR */}
            <div className="mt-8 p-4 rounded-xl bg-[#F5F6F3] border border-[#E5E7EB] space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#111827]">
                <span className="flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5 text-[#0F766E]" /> Demo Role Accounts</span>
                <span className="text-[10px] text-[#6B7280] font-mono">Password: Password123!</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[11px]">
                {DEMO_ACCOUNTS.map((account) => {
                  const isSelected = activeDemoRole === account.key || email === account.email;
                  return (
                    <button
                      key={account.key}
                      type="button"
                      onClick={() => selectDemoAccount(account.email, account.key)}
                      className={`px-2 py-1.5 rounded border text-center font-medium transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#0F766E] border-[#0F766E] text-white font-semibold ring-2 ring-[#0F766E]/30'
                          : 'bg-white border-[#E5E7EB] text-[#111827] hover:bg-[#E6F4F1] hover:border-[#CCECF0] hover:text-[#0F766E]'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-white shrink-0" />}
                      <span>{account.role}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="mt-8 text-center text-[11px] text-[#6B7280]">
            Protected by Enterprise Security Policies & Privacy Standards. &copy; 2026 Enterprise Inc.
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
