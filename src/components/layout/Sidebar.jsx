import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  Layers,
  Fingerprint,
  MessageSquare,
  Mail,
  HardDrive,
  Webhook,
  Key,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import clsx from 'clsx';

let globalSidebarScrollTop = 0;

export const Sidebar = () => {
  const { role, hasPermission, company } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);
  const activeLinkRef = useRef(null);

  const isIntegrationsRoute = location.pathname.startsWith('/integrations') || location.pathname.includes('/settings/biometric') || location.pathname.includes('/settings/whatsapp');
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(isIntegrationsRoute);

  useEffect(() => {
    if (isIntegrationsRoute) {
      setIsIntegrationsOpen(true);
    }
  }, [location.pathname]);

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

  const integrationSubItems = [
    { label: 'Biometric Attendance', to: '/integrations/biometric', icon: Fingerprint, show: hasPermission('integrations.view') || role === 'SUPER_ADMIN' || role === 'HR_ADMIN' },
    { label: 'WhatsApp Payslip', to: '/integrations/whatsapp', icon: MessageSquare, show: hasPermission('integrations.view') || role === 'SUPER_ADMIN' || role === 'HR_ADMIN' },
    { label: 'Email (SMTP)', to: '/integrations/email', icon: Mail, show: hasPermission('integrations.view') || role === 'SUPER_ADMIN' || role === 'HR_ADMIN' },
    { label: 'Cloud Storage', to: '/integrations/storage', icon: HardDrive, show: hasPermission('integrations.view') || role === 'SUPER_ADMIN' || role === 'HR_ADMIN' },
    { label: 'Accounting (ERP)', to: '/integrations/accounting', icon: DollarSign, show: hasPermission('integrations.view') || role === 'SUPER_ADMIN' || role === 'HR_ADMIN' },
    { label: 'External Connectors', to: '/integrations/connectors', icon: Layers, show: hasPermission('integrations.view') || role === 'SUPER_ADMIN' || role === 'HR_ADMIN' },
    { label: 'Webhooks', to: '/integrations/webhooks', icon: Webhook, show: hasPermission('webhooks.manage') || role === 'SUPER_ADMIN' || role === 'HR_ADMIN' },
    { label: 'API Keys', to: '/integrations/api-keys', icon: Key, show: hasPermission('api_keys.manage') || role === 'SUPER_ADMIN' || role === 'HR_ADMIN' },
  ];

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
      title: 'INTEGRATIONS & AUTOMATION',
      items: [
        { label: 'HR Automation', to: '/automation', icon: Clock, show: hasPermission('automation.view') || role === 'SUPER_ADMIN' || role === 'HR_ADMIN' },
        { label: 'HR AI Assistant', to: '/ai-assistant', icon: LayoutDashboard, show: true },
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
    <aside className="w-64 bg-white border-r border-[#CBD8D1] flex flex-col shrink-0 h-full text-[#12201A] select-none z-30 shadow-[1px_0_10px_rgba(20,50,35,0.08)]">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#CBD8D1] bg-white flex items-center gap-3 shrink-0 h-16">
        <div className="w-9 h-9 rounded-lg bg-[#167C63] flex items-center justify-center font-extrabold text-white shadow-xs text-xs tracking-wider">
          EP
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-[#12201A] tracking-tight">Enterprise Payroll</span>
          <span className="text-[10px] text-[#6B7A72] font-mono uppercase tracking-wider font-semibold">{company?.code || 'ACME'} TENANT</span>
        </div>
      </div>

      {/* Navigation links */}
      <nav ref={navRef} onScroll={handleScroll} className="flex-1 p-3 space-y-4 overflow-y-auto [&::-webkit-scrollbar-thumb]:bg-[#C5D3CB]">
        {navSections.map((sec, idx) => {
          const validItems = sec.items.filter(item => item.show);
          const isIntegrationsSection = sec.title === 'INTEGRATIONS & AUTOMATION';

          return (
            <div key={idx} className="space-y-1">
              <div className="px-3 pt-5 pb-1 text-[11px] font-bold uppercase tracking-[0.06em] text-[#6B7A72]">
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
                        "flex items-center gap-3 px-3 h-[44px] rounded-[10px] text-sm transition-all relative select-none font-medium",
                        isActive
                          ? "bg-[#E5F4EE] border border-[#CFE6DC] text-[#167C63] font-semibold border-l-[3px] border-l-[#167C63] pl-2.5"
                          : "text-[#33413A] hover:text-[#12201A] hover:bg-[#F0F6F3]"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className={clsx("w-5 h-5 shrink-0", isActive ? "text-[#167C63]" : "text-[#5A6A61]")} />
                        <span className="truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}

              {/* COLLAPSIBLE INTEGRATIONS HUB DROPDOWN */}
              {isIntegrationsSection && (hasPermission('integrations.view') || role === 'SUPER_ADMIN' || role === 'HR_ADMIN') && (
                <div className="pt-1">
                  <div
                    onClick={() => {
                      setIsIntegrationsOpen(!isIntegrationsOpen);
                      if (!isIntegrationsRoute) {
                        navigate('/integrations');
                      }
                    }}
                    className={clsx(
                      "flex items-center justify-between px-3 h-[44px] rounded-[10px] text-sm font-medium cursor-pointer transition-all select-none",
                      isIntegrationsRoute
                        ? "bg-[#E5F4EE] border border-[#CFE6DC] text-[#167C63] font-semibold border-l-[3px] border-l-[#167C63] pl-2.5"
                        : "text-[#33413A] hover:text-[#12201A] hover:bg-[#F0F6F3]"
                    )}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Layers className={clsx("w-5 h-5 shrink-0", isIntegrationsRoute ? "text-[#167C63]" : "text-[#5A6A61]")} />
                      <span className="truncate">Integrations Hub</span>
                    </div>
                    {isIntegrationsOpen ? (
                      <ChevronDown className="w-4 h-4 text-[#5A6A61] shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#5A6A61] shrink-0" />
                    )}
                  </div>

                  {/* DROPDOWN CHILD SUB-ITEMS */}
                  {isIntegrationsOpen && (
                    <div className="pl-3 mt-1 space-y-1 border-l border-[#E1E9E4] ml-4">
                      {integrationSubItems.filter(sub => sub.show).map((sub) => {
                        const isSubActive = location.pathname === sub.to || location.pathname.startsWith(sub.to);
                        const Icon = sub.icon;
                        return (
                          <NavLink
                            key={sub.to}
                            to={sub.to}
                            className={clsx(
                              "flex items-center gap-2 px-2.5 py-2 rounded-[8px] text-xs font-medium transition-all select-none",
                              isSubActive
                                ? "bg-[#E5F4EE] border border-[#CFE6DC] text-[#167C63] font-semibold"
                                : "text-[#5A6A61] hover:text-[#12201A] hover:bg-[#F0F6F3]"
                            )}
                          >
                            <Icon className={clsx("w-4 h-4 shrink-0", isSubActive ? "text-[#167C63]" : "text-[#5A6A61]")} />
                            <span className="truncate">{sub.label}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="p-3 border-t border-[#E1E9E4] bg-white text-[11px] text-[#5A6A61] flex items-center justify-between shrink-0 font-medium">
        <span>v2.4.0 Pro</span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#E5F4EE] border border-[#CFE6DC] text-[#167C63] font-semibold text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#167C63]" /> SOC2 Certified
        </span>
      </div>
    </aside>
  );
};

export default Sidebar;
