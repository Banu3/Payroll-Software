import React, { useRef, useLayoutEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  DollarSign,
  CreditCard,
  BarChart3,
  Activity,
  ShieldCheck,
  Bell,
  Settings,
  HelpCircle
} from 'lucide-react';
import clsx from 'clsx';

let globalSuperAdminScrollTop = 0;

export const SuperAdminSidebar = () => {
  const location = useLocation();
  const navRef = useRef(null);
  const activeLinkRef = useRef(null);

  useLayoutEffect(() => {
    const savedPos = globalSuperAdminScrollTop || Number(sessionStorage.getItem('superadmin_sidebar_scroll_pos') || 0);
    if (navRef.current) {
      navRef.current.scrollTop = savedPos;
    }

    const timer = setTimeout(() => {
      if (activeLinkRef.current) {
        activeLinkRef.current.scrollIntoView({ block: 'nearest', behavior: 'instant' });
      }
    }, 20);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleScroll = (e) => {
    globalSuperAdminScrollTop = e.target.scrollTop;
    sessionStorage.setItem('superadmin_sidebar_scroll_pos', e.target.scrollTop.toString());
  };

  const navItems = [
    { label: 'Dashboard', to: '/super-admin/dashboard', icon: LayoutDashboard },
    { label: 'Companies', to: '/super-admin/companies', icon: Building2 },
    { label: 'Global Employees', to: '/super-admin/employees', icon: Users },
    { label: 'Payroll Overview', to: '/super-admin/payroll', icon: DollarSign },
    { label: 'Subscriptions', to: '/super-admin/subscriptions', icon: CreditCard },
    { label: 'Reports & Analytics', to: '/super-admin/reports', icon: BarChart3 },
    { label: 'System Activity', to: '/super-admin/activity', icon: Activity },
    { label: 'Audit Logs', to: '/super-admin/audit-logs', icon: ShieldCheck },
    { label: 'Notifications', to: '/super-admin/notifications', icon: Bell },
    { label: 'System Settings', to: '/super-admin/settings', icon: Settings },
    { label: 'Support & Tickets', to: '/super-admin/support', icon: HelpCircle },
  ];

  return (
    <aside className="w-64 bg-[#111827] border-r border-[#1F2937] flex flex-col shrink-0 h-full text-[#CBD5E1] select-none z-30">
      {/* Super Admin Brand Header */}
      <div className="p-4 border-b border-[#1F2937] flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-[#0F766E] flex items-center justify-center font-bold text-white shadow-xs text-xs tracking-wider">
          SA
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-white tracking-tight">Super Admin Portal</span>
          <span className="text-[10px] text-[#2DD4BF] font-mono font-semibold uppercase tracking-wider">MULTI-TENANT HQ</span>
        </div>
      </div>

      {/* Navigation */}
      <nav ref={navRef} onScroll={handleScroll} className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
          Super Admin Console
        </div>

        {navItems.map((item) => {
          const isItemActive = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
          return (
            <NavLink
              key={item.to}
              to={item.to}
              ref={isItemActive ? activeLinkRef : null}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-xs transition-colors relative",
                  isActive
                    ? "bg-[#1F2937] text-white font-medium border-l-2 border-[#0F766E]"
                    : "text-[#CBD5E1] hover:text-white hover:bg-[#1F2937]"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={clsx("w-4 h-4 shrink-0", isActive ? "text-[#2DD4BF]" : "text-[#94A3B8]")} />
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#1F2937] bg-[#0B0F19] text-[11px] text-[#64748B] flex items-center justify-between shrink-0">
        <span>System Admin Mode</span>
        <span className="inline-flex items-center gap-1.5 text-[#15803D] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" /> ROOT
        </span>
      </div>
    </aside>
  );
};

export default SuperAdminSidebar;
