import React from 'react';
import clsx from 'clsx';

export const Input = React.forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  className,
  id,
  type = 'text',
  isRequired = false,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#374151]">
          {label} {isRequired && <span className="text-[#B91C1C]">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-xs">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B7280]">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={clsx(
            "w-full h-11 rounded-lg bg-white border text-[#111827] text-sm placeholder-[#9CA3AF] transition-all focus:outline-none focus:ring-2 disabled:opacity-50 disabled:bg-[#F5F6F3]",
            Icon ? "pl-9 pr-3 py-2" : "px-3 py-2",
            error
              ? "border-[#B91C1C] focus:border-[#B91C1C] focus:ring-[#B91C1C]/20"
              : "border-[#D1D5DB] hover:border-[#9CA3AF] focus:border-[#0F766E] focus:ring-[#0F766E]/20",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-[#B91C1C] font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-[#6B7280]">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
