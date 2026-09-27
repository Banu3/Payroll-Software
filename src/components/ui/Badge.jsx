import React from 'react';
import clsx from 'clsx';

export const Badge = ({ children, variant = 'default', className }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-900 border-slate-400 font-bold',
    secondary: 'bg-slate-100 text-slate-800 border-slate-300 font-semibold',
    primary: 'bg-teal-100 text-teal-900 border-teal-400 font-bold',
    success: 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold',
    warning: 'bg-amber-100 text-amber-950 border-amber-400 font-bold',
    danger: 'bg-rose-100 text-rose-950 border-rose-400 font-bold',
    info: 'bg-blue-100 text-blue-900 border-blue-400 font-bold',
    purple: 'bg-purple-100 text-purple-900 border-purple-400 font-bold',
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold border tracking-wider uppercase shadow-2xs",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
