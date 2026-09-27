import React from 'react';
import clsx from 'clsx';

export const Card = ({ children, className, ...props }) => (
  <div
    className={clsx(
      "bg-white border border-[#E5E7EB] rounded-xl shadow-xs transition-all",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ children, className, title, description, action }) => (
  <div className={clsx("p-5 border-b border-[#E5E7EB] flex items-center justify-between gap-4", className)}>
    {title ? (
      <div>
        <h3 className="text-base font-semibold text-[#111827]">{title}</h3>
        {description && <p className="text-xs text-[#374151] mt-0.5">{description}</p>}
      </div>
    ) : (
      children
    )}
    {action && <div>{action}</div>}
  </div>
);

export const CardBody = ({ children, className }) => (
  <div className={clsx("p-5 space-y-4", className)}>{children}</div>
);

export const CardFooter = ({ children, className }) => (
  <div className={clsx("px-5 py-3.5 border-t border-[#E5E5EB] bg-[#F5F6F3] rounded-b-xl flex items-center justify-between", className)}>
    {children}
  </div>
);

export default Card;
