import React from 'react';
import clsx from 'clsx';

export const Select = React.forwardRef(({
  label,
  options = [],
  error,
  className,
  id,
  isRequired = false,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-bold text-[#1E293B]">
          {label} {isRequired && <span className="text-[#B91C1C]">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={clsx(
          "w-full h-11 rounded-lg bg-white border border-[#64748B] px-3 py-2 text-[#0F172A] text-sm font-medium focus:outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/15 transition-all disabled:opacity-50",
          error && "border-[#B91C1C] focus:border-[#B91C1C] focus:ring-[#B91C1C]/10",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-white text-[#0F172A] py-1 font-medium">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-[#B91C1C] font-semibold">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
