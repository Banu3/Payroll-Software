import React from 'react';
import clsx from 'clsx';

export const Card = ({ children, className, ...props }) => (
  <div
    className={clsx(
      "bg-white border border-[#64748B] rounded-xl shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all overflow-hidden",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ children, className, title, description, action }) => (
  <div className={clsx("px-5 py-4 border-b border-[#94A3B8] bg-white flex items-center justify-between gap-4", className)}>
    {title ? (
      <div>
        <h3 className="text-base font-bold text-[#0F172A] tracking-tight">{title}</h3>
        {description && <p className="text-xs text-[#334155] font-medium mt-0.5">{description}</p>}
      </div>
    ) : (
      children
    )}
    {action && <div>{action}</div>}
  </div>
);

export const CardBody = ({ children, className }) => (
  <div className={clsx("p-5 space-y-4 text-[#0F172A]", className)}>{children}</div>
);

export const CardFooter = ({ children, className }) => (
  <div className={clsx("px-5 py-3.5 border-t border-[#94A3B8] bg-[#F8FAFC] rounded-b-xl flex items-center justify-between text-[#1E293B]", className)}>
    {children}
  </div>
);

export default Card;
