import React from 'react';
import clsx from 'clsx';

export const Badge = ({ children, variant = 'default', className }) => {
  const variants = {
    default: 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]',
    secondary: 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]',
    primary: 'bg-[#E6F4F1] text-[#0F766E] border-[#CCECF0]',
    success: 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]',
    warning: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]',
    danger: 'bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]',
    info: 'bg-[#E0F2FE] text-[#075985] border-[#BAE6FD]',
    purple: 'bg-[#F3E8FF] text-[#6B21A8] border-[#E9D5FF]',
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
