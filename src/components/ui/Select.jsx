import React from 'react';
import clsx from 'clsx';

export const Select = React.forwardRef(({
  label,
  options = [],
  error,
  className,
  containerClassName,
  id,
  isRequired = false,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={clsx("space-y-1.5", containerClassName)}>
      {label && (
        <label htmlFor={selectId} className="block text-xs font-bold text-[#12201A]">
          {label} {isRequired && <span className="text-[#C24141]">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={clsx(
          "w-full h-11 rounded-[10px] bg-white border border-[#BCCBC3] px-3.5 text-[#12201A] text-xs md:text-sm font-semibold focus:outline-none focus:border-[#167C63] focus:ring-3 focus:ring-[#167C63]/15 transition-all disabled:opacity-50 cursor-pointer",
          error && "border-[#C24141] focus:border-[#C24141] focus:ring-[#C24141]/15",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-white text-[#12201A] py-1 font-medium">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-[#C24141] font-semibold">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
