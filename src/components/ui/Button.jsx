import React from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

export const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  icon: Icon,
  className,
  type = 'button',
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F766E] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

  const variants = {
    primary: "bg-[#0F766E] hover:bg-[#115E59] text-white shadow-xs border border-[#0F766E]",
    secondary: "bg-white hover:bg-[#F5F6F3] text-[#111827] border border-[#E5E7EB] shadow-xs",
    outline: "bg-transparent hover:bg-[#F5F6F3] text-[#111827] border border-[#E5E7EB]",
    ghost: "bg-transparent hover:bg-[#E5E7EB] text-[#374151] hover:text-[#111827]",
    danger: "bg-[#B91C1C] hover:bg-[#991B1B] text-white shadow-xs border border-[#B91C1C]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5",
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled || isLoading}
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      <span>{children}</span>
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
