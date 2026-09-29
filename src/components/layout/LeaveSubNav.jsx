import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, Sliders, CalendarDays, FileSpreadsheet } from 'lucide-react';
import clsx from 'clsx';

export default function LeaveSubNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const NAV_ITEMS = [
    { label: 'Overview', path: '/hr/leave', icon: LayoutDashboard },
    { label: 'Leave Types', path: '/hr/leave/types', icon: Settings },
    { label: 'Policies', path: '/hr/leave/policies', icon: Sliders },
    { label: 'Balances & Ledgers', path: '/hr/leave/balances', icon: CalendarDays },
    { label: 'Reports', path: '/hr/leave/reports', icon: FileSpreadsheet },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap pb-3 mb-6 border-b border-[#CBD8D1]">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path || (item.path === '/hr/leave' && location.pathname === '/hr/leave/');
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={clsx(
              "px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer border shadow-2xs",
              isActive
                ? "bg-[#167C63] text-white border-[#167C63] shadow-xs"
                : "bg-white text-[#33413A] border-[#CBD8D1] hover:border-[#167C63] hover:text-[#167C63] hover:bg-[#F3F7F5]"
            )}
          >
            <Icon className={clsx("w-3.5 h-3.5", isActive ? "text-white" : "text-[#5A6A61]")} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
