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
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-150 rounded-[9px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#167C63] disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap";

  const variants = {
    primary: "bg-[#167C63] hover:bg-[#11664F] active:bg-[#0E5240] text-white shadow-xs border border-[#167C63]",
    secondary: "bg-white hover:bg-[#F0F6F3] active:bg-[#E5F4EE] active:text-[#167C63] text-[#12201A] border border-[#BCCBC3] shadow-2xs",
    outline: "bg-white hover:bg-[#F0F6F3] active:bg-[#E5F4EE] active:text-[#167C63] text-[#12201A] border border-[#BCCBC3] shadow-2xs",
    ghost: "bg-transparent hover:bg-[#F0F6F3] active:bg-[#E5F4EE] text-[#33413A] hover:text-[#12201A]",
    danger: "bg-[#C24141] hover:bg-[#A93333] text-white shadow-xs border border-[#C24141]",
    "soft-red": "bg-[#FFF1F1] hover:bg-[#FDE2E2] text-[#C24141] border border-[#F8C4C4]",
    success: "bg-[#167C63] hover:bg-[#11664F] text-white shadow-xs border border-[#167C63]",
  };

  const sizes = {
    xs: "px-2.5 py-1 text-xs gap-1",
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-xs md:text-sm gap-2",
    lg: "px-5 py-2.5 text-sm md:text-base gap-2.5",
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
        <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
