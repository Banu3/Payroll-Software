import React from 'react';
import clsx from 'clsx';

export const Badge = ({ children, variant = 'default', className }) => {
  const variants = {
    default: 'bg-[#F3F7F5] text-[#12201A] border-[#CBD8D1]',
    secondary: 'bg-[#F3F7F5] text-[#5A6A61] border-[#CBD8D1]',
    neutral: 'bg-[#EEF0EE] text-[#526158] border-[#CBD8D1]',
    primary: 'bg-[#E5F4EE] text-[#167C63] border-[#CFE6DC]',
    success: 'bg-[#E5F4EE] text-[#167C63] border-[#CFE6DC]',
    approved: 'bg-[#E5F4EE] text-[#167C63] border-[#CFE6DC]',
    warning: 'bg-[#FFF7E5] text-[#9A6700] border-[#FFE9B3]',
    pending: 'bg-[#FFF7E5] text-[#9A6700] border-[#FFE9B3]',
    danger: 'bg-[#FFF1F1] text-[#C24141] border-[#F8C4C4]',
    rejected: 'bg-[#FFF1F1] text-[#C24141] border-[#F8C4C4]',
    error: 'bg-[#FFF1F1] text-[#C24141] border-[#F8C4C4]',
    info: 'bg-[#EEF6FC] text-[#3674A5] border-[#D1E6F7]',
    processing: 'bg-[#EEF6FC] text-[#3674A5] border-[#D1E6F7]',
    purple: 'bg-[#EEF6FC] text-[#3674A5] border-[#D1E6F7]',
    locked: 'bg-[#EEF0EE] text-[#526158] border-[#CBD8D1]',
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center gap-1.5 px-3 h-6 rounded-full text-xs font-semibold border uppercase tracking-wider whitespace-nowrap select-none",
        variants[variant] || variants.default,
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
