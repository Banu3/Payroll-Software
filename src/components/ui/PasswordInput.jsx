import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Check, X } from 'lucide-react';
import clsx from 'clsx';

export const PasswordInput = React.forwardRef(({
  label = 'Password',
  error,
  showStrengthMeter = false,
  value = '',
  onChange,
  className,
  id,
  isRequired = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || 'password-input';

  // Password Strength Calculation
  const pwd = value || '';
  const checks = [
    { label: 'At least 8 characters', valid: pwd.length >= 8 },
    { label: 'At least one uppercase letter', valid: /[A-Z]/.test(pwd) },
    { label: 'At least one lowercase letter', valid: /[a-z]/.test(pwd) },
    { label: 'At least one number', valid: /[0-9]/.test(pwd) },
    { label: 'At least one special character', valid: /[^A-Za-z0-9]/.test(pwd) },
  ];

  const passedChecks = checks.filter((c) => c.valid).length;
  const strengthPercentage = (passedChecks / checks.length) * 100;

  const getStrengthColor = () => {
    if (passedChecks <= 1) return 'bg-rose-500';
    if (passedChecks <= 3) return 'bg-amber-500';
    if (passedChecks === 4) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const getStrengthLabel = () => {
    if (pwd.length === 0) return '';
    if (passedChecks <= 1) return 'Very Weak';
    if (passedChecks <= 3) return 'Moderate';
    if (passedChecks === 4) return 'Strong';
    return 'Very Strong';
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <div className="flex justify-between items-center">
          <label htmlFor={inputId} className="block text-xs font-bold text-slate-900 tracking-tight">
            {label} {isRequired && <span className="text-rose-600 font-bold">*</span>}
          </label>
          {showStrengthMeter && pwd && (
            <span className="text-[11px] font-semibold text-slate-600">
              Strength: <span className="text-slate-900 font-bold">{getStrengthLabel()}</span>
            </span>
          )}
        </div>
      )}


      <div className="relative rounded-lg shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Lock className="w-4 h-4" />
        </div>

        <input
          ref={ref}
          id={inputId}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className={clsx(
            "w-full rounded-lg bg-slate-900 border pl-9 pr-10 py-2 text-slate-100 text-sm placeholder-slate-500 transition-all focus:outline-none focus:ring-2",
            error
              ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20"
              : "border-slate-700/80 hover:border-slate-600 focus:border-blue-500 focus:ring-blue-500/20",
            className
          )}
          {...props}
        />

        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

      {showStrengthMeter && pwd.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={clsx("h-full transition-all duration-300", getStrengthColor())}
              style={{ width: `${strengthPercentage}%` }}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
            {checks.map((c, i) => (
              <div key={i} className="flex items-center gap-1.5 text-slate-400">
                {c.valid ? (
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                ) : (
                  <X className="w-3 h-3 text-slate-600 shrink-0" />
                )}
                <span className={c.valid ? 'text-slate-300' : 'text-slate-500'}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';
export default PasswordInput;
