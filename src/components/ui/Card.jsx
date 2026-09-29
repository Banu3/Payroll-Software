import React from 'react';
import clsx from 'clsx';

export const Card = ({ children, className, hoverable = true, ...props }) => (
  <div
    className={clsx(
      "bg-white border border-[#CBD8D1] rounded-[14px]",
      "shadow-[0_1px_3px_rgba(20,50,35,0.08),0_4px_12px_rgba(20,50,35,0.05)]",
      hoverable && "hover:-translate-y-1 hover:border-[#167C63] hover:shadow-[0_10px_28px_rgba(22,124,99,0.16),0_2px_6px_rgba(20,50,35,0.08)] cursor-pointer",
      "transition-all duration-200 ease-out overflow-hidden",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ children, className, title, description, action }) => (
  <div className={clsx("px-5 py-4 border-b border-[#E1E9E4] bg-white flex items-center justify-between gap-4", className)}>
    {title ? (
      <div>
        <h3 className="text-base font-semibold text-[#12201A] tracking-tight">{title}</h3>
        {description && <p className="text-[13px] text-[#5A6A61] font-normal mt-0.5">{description}</p>}
      </div>
    ) : (
      children
    )}
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const CardBody = ({ children, className }) => (
  <div className={clsx("p-5 space-y-4 text-[#12201A]", className)}>{children}</div>
);

export const CardFooter = ({ children, className }) => (
  <div className={clsx("px-5 py-3.5 border-t border-[#E1E9E4] bg-[#F3F7F5] rounded-b-[14px] flex items-center justify-between text-[#12201A]", className)}>
    {children}
  </div>
);

export default Card;
