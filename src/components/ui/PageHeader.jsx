import React from 'react';

export const PageHeader = ({ title, description, badge, action }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E5E7EB]">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">{title}</h1>
          {badge}
        </div>
        {description && <p className="text-xs text-[#374151] mt-1 leading-relaxed">{description}</p>}
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
};

export default PageHeader;
