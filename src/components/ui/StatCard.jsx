import React from 'react';
import clsx from 'clsx';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = 'neutral', // 'up' | 'down' | 'neutral'
  status = 'default', // 'default' | 'success' | 'warning' | 'danger'
  accent = true,
  className,
  valueClassName
}) => {
  const iconContainerStyles = {
    default: "bg-[#E5F4EE] text-[#167C63] border-[#CFE6DC]",
    success: "bg-[#E5F4EE] text-[#167C63] border-[#CFE6DC]",
    warning: "bg-[#FFF7E5] text-[#9A6700] border-[#FFE9B3]",
    danger: "bg-[#FFF1F1] text-[#C24141] border-[#F8C4C4]",
    neutral: "bg-[#F3F7F5] text-[#5A6A61] border-[#CBD8D1]",
  };

  const accentColorStyles = {
    default: "border-l-[#167C63]",
    success: "border-l-[#167C63]",
    warning: "border-l-[#9A6700]",
    danger: "border-l-[#C24141]",
    neutral: "border-l-[#5A6A61]",
  };

  const currentStatus = status !== 'default' ? status : (trendType === 'down' ? 'danger' : trendType === 'up' ? 'success' : 'default');

  return (
    <div
      className={clsx(
        "bg-white border border-[#CBD8D1] rounded-[14px] p-5.5",
        "shadow-[0_1px_3px_rgba(20,50,35,0.08),0_4px_12px_rgba(20,50,35,0.05)]",
        "hover:-translate-y-1 hover:border-[#167C63] hover:shadow-[0_10px_28px_rgba(22,124,99,0.16),0_2px_6px_rgba(20,50,35,0.08)] cursor-pointer",
        "transition-all duration-200 ease-out flex flex-col justify-between gap-3 relative overflow-hidden",
        accent && clsx("border-l-[3px]", accentColorStyles[currentStatus]),
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-medium text-[#5A6A61] tracking-tight truncate">{title}</span>
        {Icon && (
          <div className={clsx("w-10 h-10 rounded-lg border flex items-center justify-center shrink-0", iconContainerStyles[currentStatus])}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div>
        <div className={clsx("text-3xl font-extrabold text-[#12201A] tracking-tight tabular-nums", valueClassName)}>
          {value !== undefined && value !== null ? value : '0'}
        </div>
        {subtitle && (
          <div className="text-[13px] font-medium text-[#5A6A61] mt-1 flex items-center gap-1.5">
            {trend && (
              <span
                className={clsx(
                  "font-bold text-[11px] px-1.5 py-0.5 rounded",
                  trendType === 'up' && "bg-[#E5F4EE] text-[#167C63]",
                  trendType === 'down' && "bg-[#FFF1F1] text-[#C24141]",
                  trendType === 'neutral' && "bg-[#F3F7F5] border border-[#CBD8D1] text-[#33413A]"
                )}
              >
                {trend}
              </span>
            )}
            <span className="truncate">{subtitle}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
