import React from 'react';

export const PageHeader = ({ title, description, subtitle, badge, action }) => {
  const descText = description || subtitle;
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-5 mb-6 border-b border-[#CBD8D1]">
      <div className="space-y-1 max-w-full">
        <div className="flex items-center flex-wrap gap-3">
          <h1 className="text-2xl md:text-[30px] font-extrabold text-[#12201A] tracking-tight leading-tight">{title}</h1>
          {badge}
        </div>
        {descText && (
          <p className="text-xs md:text-sm text-[#5A6A61] font-medium leading-relaxed max-w-[640px]">
            {descText}
          </p>
        )}
      </div>
      {action && (
        <div className="w-full xl:w-auto overflow-x-auto pb-1 xl:pb-0 scrollbar-none">
          <div className="flex items-center flex-wrap xl:flex-nowrap gap-2 md:gap-3 shrink-0 min-w-max xl:min-w-0">
            {action}
          </div>
        </div>
      )}
    </div>
  );
};

export default PageHeader;
