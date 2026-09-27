import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_DASHBOARDS } from '../../config/permissions';
import { Input } from '../../components/ui/Input';
import { PasswordInput } from '../../components/ui/PasswordInput';
import {
  Mail,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  KeyRound,
  Check,
  ShieldCheck,
  Loader2
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
      setError('Please fill in both work email and password.');
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
        setError(err.message || 'Authentication failed. Please verify your credentials.');
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
  ];

  const selectDemoAccount = (demoEmail, roleKey) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setActiveDemoRole(roleKey);
    setError(null);
    setEmailVerificationWarning(null);
  };

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-[#F8FAFC] flex items-center justify-center p-3 sm:p-6 font-sans lg:overflow-hidden">
      <div className="w-full max-w-4xl bg-white border border-[#B9C1CC] rounded-xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 lg:h-[580px]">

        {/* LEFT SIDE — BRAND & CONTENT PANEL (44% Width) */}
        <div className="hidden lg:flex lg:col-span-5 bg-[#0B0F19] p-6 sm:p-7 flex-col justify-between border-r border-[#1F2937] text-white">
          <div className="space-y-4">
            {/* BRAND HEADER */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#0F766E] flex items-center justify-center font-bold text-white shadow-xs text-base tracking-wider">
                P
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white tracking-wide">PAYVERA</span>
                <span className="text-[10px] text-[#2DD4BF] font-mono font-semibold uppercase tracking-wider">HR & PAYROLL PLATFORM</span>
              </div>
            </div>

            {/* MAIN HEADING & SUPPORTING CONTENT */}
            <div className="pt-1 space-y-1.5">
              <h2 className="text-xl font-bold text-white tracking-tight leading-tight">
                Enterprise Payroll <br />
                <span className="text-[#2DD4BF]">Management, simplified.</span>
              </h2>
              <p className="text-[11px] text-[#CBD5E1] leading-relaxed">
                Run payroll, manage employees, track attendance, and stay compliant from one secure platform built for modern businesses.
              </p>
            </div>

            {/* COMPACT FEATURE SECTION */}
            <div className="space-y-2 pt-1">
              <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
                Everything your payroll team needs
              </div>

              <div className="space-y-1.5 text-xs">
                {/* Feature 1 */}
                <div className="p-2 rounded-lg bg-[#1F2937]/50 border border-white/10 flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0 mt-0.5 font-bold" />
                  <div>
                    <strong className="text-white font-semibold text-[11px] block">Payroll Processing</strong>
                    <span className="text-[#CBD5E1] text-[10px] block leading-tight">Accurate salary, deduction and contribution calculations.</span>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="p-2 rounded-lg bg-[#1F2937]/50 border border-white/10 flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0 mt-0.5 font-bold" />
                  <div>
                    <strong className="text-white font-semibold text-[11px] block">Workforce Management</strong>
                    <span className="text-[#CBD5E1] text-[10px] block leading-tight">Manage employees, attendance and leave in one place.</span>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="p-2 rounded-lg bg-[#1F2937]/50 border border-white/10 flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0 mt-0.5 font-bold" />
                  <div>
                    <strong className="text-white font-semibold text-[11px] block">Compliance & Reporting</strong>
                    <span className="text-[#CBD5E1] text-[10px] block leading-tight">Keep payroll records and statutory reports organized.</span>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="p-2 rounded-lg bg-[#1F2937]/50 border border-white/10 flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0 mt-0.5 font-bold" />
                  <div>
                    <strong className="text-white font-semibold text-[11px] block">Secure Payments</strong>
                    <span className="text-[#CBD5E1] text-[10px] block leading-tight">Prepare controlled payroll payment files with complete tracking.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECURITY / TRUST SECTION */}
          <div className="pt-3 border-t border-[#1F2937] space-y-0.5">
            <div className="text-[11px] font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>Enterprise-grade security</span>
            </div>
            <p className="text-[10px] text-[#9CA3AF] font-medium leading-tight">
              Role-based access &bull; Tenant isolation &bull; Audit-ready activity
            </p>
          </div>
        </div>

        {/* RIGHT SIDE — LOGIN FORM PANEL (56% Width) */}
        <div className="col-span-1 lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-white text-[#0F172A] lg:overflow-y-auto">
          <div>
            {/* Header branding on mobile */}
            <div className="flex lg:hidden items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center font-bold text-white text-xs">
                P
              </div>
              <span className="text-base font-bold text-[#0F172A]">PAYVERA</span>
            </div>

            <div className="space-y-0.5 mb-5">
              <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">Welcome back</h1>
              <p className="text-xs text-[#475569]">Sign in securely to manage your workforce.</p>
            </div>

            {/* Error Alert Banner */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-300 flex items-center gap-2.5 text-rose-800 text-xs font-semibold animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                <div className="flex-1 min-w-0">{error}</div>
              </div>
            )}

            {/* Email Verification Warning */}
            {emailVerificationWarning && (
              <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-300 flex items-center gap-2.5 text-amber-800 text-xs font-semibold animate-fade-in">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <div className="flex-1 min-w-0">{emailVerificationWarning}</div>
              </div>
            )}

            {/* LOGIN FORM */}
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <Input
                label="Work Email"
                type="email"
                icon={Mail}
                placeholder="Enter your work email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isRequired
                autoComplete="email"
              />

              <PasswordInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isRequired
                autoComplete="current-password"
              />

              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-[#334155] select-none font-semibold">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#B9C1CC] text-[#0F766E] focus:ring-[#0F766E]"
                  />
                  <span>Keep me signed in</span>
                </label>
                <Link to="/forgot-password" className="text-[#0F766E] hover:text-[#115E59] font-bold hover:underline transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 mt-1 bg-[#0F766E] hover:bg-[#115E59] active:bg-[#0D4F4A] disabled:opacity-50 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* QUICK ACCESS DEMO ROLE SECTION */}
            <div className="mt-5 p-3 rounded-lg bg-[#F8FAFC] border border-[#B9C1CC] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#0F172A]">
                <div className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>Quick access</span>
                </div>
                <span className="text-[11px] text-[#475569] font-medium">Explore the platform using a demo role.</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                {DEMO_ACCOUNTS.map((account) => {
                  const isSelected = activeDemoRole === account.key || email === account.email;
                  return (
                    <button
                      key={account.key}
                      type="button"
                      onClick={() => selectDemoAccount(account.email, account.key)}
                      className={`px-2.5 py-1.5 rounded-md border text-center font-bold text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-[#0F766E] border-[#0F766E] text-white shadow-2xs'
                          : 'bg-white border-[#B9C1CC] text-[#0F172A] hover:bg-[#E6F4F1] hover:border-[#0F766E] hover:text-[#0F766E]'
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

          {/* FOOTER & LINKS */}
          <div className="mt-4 pt-3 border-t border-[#D7DCE2] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#475569] font-medium gap-1.5">
            <span>&copy; 2026 Payvera. All rights reserved.</span>
            <div className="flex items-center gap-2.5">
              <a href="#" className="hover:text-[#0F172A] transition-colors">Privacy</a>
              <span>&bull;</span>
              <a href="#" className="hover:text-[#0F172A] transition-colors">Security</a>
              <span>&bull;</span>
              <a href="#" className="hover:text-[#0F172A] transition-colors">Terms</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
