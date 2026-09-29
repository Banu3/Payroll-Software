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
    <aside className="w-64 bg-white border-r border-[#DCE5E0] flex flex-col shrink-0 h-full text-[#17221C] select-none z-30">
      {/* Super Admin Brand Header */}
      <div className="p-4 border-b border-[#DCE5E0] flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-[10px] bg-[#167C63] flex items-center justify-center font-bold text-white shadow-xs text-xs tracking-wider">
          SA
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-[#17221C] tracking-tight">Super Admin Portal</span>
          <span className="text-[10px] text-[#167C63] font-mono font-semibold uppercase tracking-wider">MULTI-TENANT HQ</span>
        </div>
      </div>

      {/* Navigation */}
      <nav ref={navRef} onScroll={handleScroll} className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#65736B]">
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
                  "flex items-center gap-3 px-3 py-2 rounded-[9px] text-xs transition-colors relative font-medium",
                  isActive
                    ? "bg-[#E5F4EE] text-[#167C63] border-l-2 border-[#167C63]"
                    : "text-[#526158] hover:text-[#17221C] hover:bg-[#F0F6F3]"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={clsx("w-4 h-4 shrink-0", isActive ? "text-[#167C63]" : "text-[#65736B]")} />
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#DCE5E0] bg-[#F7F9F7] text-[11px] text-[#65736B] flex items-center justify-between shrink-0">
        <span>System Admin Mode</span>
        <span className="inline-flex items-center gap-1.5 text-[#167C63] font-mono font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#167C63]" /> ROOT
        </span>
      </div>
    </aside>
  );
};

export default SuperAdminSidebar;
