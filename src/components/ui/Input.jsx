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
        <label htmlFor={inputId} className="block text-xs font-bold text-[#12201A]">
          {label} {isRequired && <span className="text-[#C24141]">*</span>}
        </label>
      )}
      <div className="relative rounded-[10px]">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5A6A61]">
            <Icon className="w-4 h-4 text-[#167C63]" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={clsx(
            "w-full h-11 rounded-[10px] bg-white border border-[#BCCBC3] text-[#12201A] text-sm placeholder-[#5A6A61] font-medium transition-all focus:outline-none focus:border-[#167C63] focus:ring-3 focus:ring-[#167C63]/15 disabled:opacity-50 disabled:bg-[#F3F7F5]",
            Icon ? "pl-9 pr-3.5" : "px-3.5",
            error && "border-[#C24141] focus:border-[#C24141] focus:ring-[#C24141]/15",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-[#C24141] font-semibold">{error}</p>}
      {helperText && !error && <p className="text-xs text-[#5A6A61]">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
