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
        <label htmlFor={selectId} className="block text-xs font-semibold text-[#374151]">
          {label} {isRequired && <span className="text-[#B91C1C]">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={clsx(
          "w-full h-11 rounded-lg bg-white border px-3 py-2 text-[#111827] text-sm focus:outline-none focus:ring-2 transition-all disabled:opacity-50",
          error
            ? "border-[#B91C1C] focus:border-[#B91C1C] focus:ring-[#B91C1C]/20"
            : "border-[#D1D5DB] hover:border-[#9CA3AF] focus:border-[#0F766E] focus:ring-[#0F766E]/20",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-white text-[#111827] py-1">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-[#B91C1C] font-medium">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
