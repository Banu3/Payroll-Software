import React, { useRef, useLayoutEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_DASHBOARDS } from '../../config/permissions';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  ShieldCheck,
  Building,
  FileSpreadsheet,
  Clock,
  CalendarDays,
  Settings,
  Shield,
  Layers
} from 'lucide-react';
import clsx from 'clsx';

let globalSidebarScrollTop = 0;

export const Sidebar = () => {
  const { role, hasPermission, company } = useAuth();
  const location = useLocation();
  const navRef = useRef(null);
  const activeLinkRef = useRef(null);

  useLayoutEffect(() => {
    const savedPos = globalSidebarScrollTop || Number(sessionStorage.getItem('sidebar_scroll_pos') || 0);
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
    globalSidebarScrollTop = e.target.scrollTop;
    sessionStorage.setItem('sidebar_scroll_pos', e.target.scrollTop.toString());
  };

  const getDashboardRoute = () => {
    return ROLE_DASHBOARDS[role] || '/employee/dashboard';
  };

  const navSections = [
    {
      title: 'WORKSPACE',
      items: [
        { label: 'Dashboard', to: getDashboardRoute(), icon: LayoutDashboard, show: true },
        { label: 'Company Overview', to: '/company/settings', icon: Building, show: hasPermission('company.manage') },
        { label: 'Employee Directory', to: '/hr/employees', icon: Users, show: hasPermission('employee.view_team') || hasPermission('employee.create') },
        { label: 'Attendance', to: role === 'SUPER_ADMIN' || role === 'HR_ADMIN' ? '/hr/attendance' : role === 'MANAGER' ? '/manager/attendance' : '/employee/attendance', icon: Clock, show: true },
        { label: 'Leave Management', to: role === 'SUPER_ADMIN' || role === 'HR_ADMIN' ? '/hr/leave' : role === 'MANAGER' ? '/manager/leave' : '/employee/leave', icon: CalendarDays, show: true },
        { label: 'Compensation & CTC', to: role === 'SUPER_ADMIN' || role === 'HR_ADMIN' ? '/hr/compensation' : '/employee/compensation', icon: DollarSign, show: true },
        { label: 'Payroll Processing', to: '/hr/payroll', icon: DollarSign, show: hasPermission('payroll.view') || role === 'SUPER_ADMIN' || role === 'HR_ADMIN' },
        { label: 'Payslips', to: role === 'SUPER_ADMIN' || role === 'HR_ADMIN' ? '/hr/payslips' : '/employee/payroll', icon: FileSpreadsheet, show: true },
        { label: 'Documents', to: role === 'SUPER_ADMIN' || role === 'HR_ADMIN' ? '/hr/payroll-documents' : '/employee/documents', icon: FileSpreadsheet, show: true },
      ]
    },
    {
      title: 'FINANCE',
      items: [
        { label: 'Bank Payments', to: role === 'SUPER_ADMIN' || role === 'HR_ADMIN' ? '/hr/payments' : '/employee/payments', icon: DollarSign, show: true },
        { label: 'Loans & Advances', to: role === 'SUPER_ADMIN' || role === 'HR_ADMIN' ? '/hr/loans-advances' : '/employee/loans-advances', icon: DollarSign, show: true },
        { label: 'Reimbursements', to: role === 'SUPER_ADMIN' || role === 'HR_ADMIN' ? '/hr/reimbursements' : '/employee/reimbursements', icon: FileSpreadsheet, show: true },
        { label: 'Statutory Compliance', to: '/hr/statutory', icon: ShieldCheck, show: hasPermission('statutory.view') || role === 'SUPER_ADMIN' || role === 'HR_ADMIN' },
      ]
    },
    {
      title: 'INSIGHTS',
      items: [
        { label: 'Executive Analytics', to: '/analytics', icon: LayoutDashboard, show: hasPermission('analytics.view') || role === 'SUPER_ADMIN' || role === 'HR_ADMIN' },
        { label: 'Reports Center', to: '/reports', icon: FileSpreadsheet, show: hasPermission('reports.view') || role === 'SUPER_ADMIN' || role === 'HR_ADMIN' },
      ]
    },
    {
      title: 'AUTOMATION',
      items: [
        { label: 'HR Automation', to: '/automation', icon: Clock, show: hasPermission('automation.view') || role === 'SUPER_ADMIN' || role === 'HR_ADMIN' },
        { label: 'HR AI Assistant', to: '/ai-assistant', icon: LayoutDashboard, show: true },
        { label: 'Integrations', to: '/integrations', icon: Layers, show: hasPermission('integrations.view') || role === 'SUPER_ADMIN' || role === 'HR_ADMIN' },
      ]
    },
    {
      title: 'SECURITY',
      items: [
        { label: 'Audit Logs', to: '/audit-logs', icon: ShieldCheck, show: hasPermission('audit.view') },
        { label: 'Security Settings', to: '/settings/security', icon: Shield, show: true },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#111827] border-r border-[#1F2937] flex flex-col shrink-0 h-full text-[#CBD5E1] select-none z-30">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#1F2937] flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#0F766E] flex items-center justify-center font-bold text-white shadow-xs text-xs tracking-wider">
          EP
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-white tracking-tight">Enterprise Payroll</span>
          <span className="text-[10px] text-[#94A3B8] font-mono uppercase tracking-wider">{company?.code || 'ACME'} TENANT</span>
        </div>
      </div>

      {/* Navigation links */}
      <nav ref={navRef} onScroll={handleScroll} className="flex-1 p-3 space-y-4 overflow-y-auto">
        {navSections.map((sec, idx) => {
          const validItems = sec.items.filter(item => item.show);
          if (validItems.length === 0) return null;
          return (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                {sec.title}
              </div>
              {validItems.map((item) => {
                const isCurrent = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    ref={isCurrent ? activeLinkRef : null}
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
            </div>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="p-3 border-t border-[#1F2937] bg-[#0B0F19] text-[11px] text-[#64748B] flex items-center justify-between shrink-0">
        <span>v2.4.0 Pro</span>
        <span className="inline-flex items-center gap-1.5 text-[#15803D]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" /> SOC2 Certified
        </span>
      </div>
    </aside>
  );
};

export default Sidebar;
