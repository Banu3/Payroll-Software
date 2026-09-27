import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileDropdown } from './ProfileDropdown';
import { Shield, Search, Bell, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header = () => {
  const { company, role } = useAuth();
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const popoverRef = useRef(null);

  const notifications = [
    {
      id: 1,
      title: 'Payroll Disbursement Completed',
      desc: 'September 2026 payroll run executed successfully for 620 employees.',
      time: '10m ago',
      unread: true,
    },
    {
      id: 2,
      title: 'New Tenant Account Registered',
      desc: 'Vanguard Global Financial activated 30-day enterprise workspace trial.',
      time: '1h ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Statutory Return ECR File Ready',
      desc: 'Monthly Provident Fund ECR file generated for compliance filing.',
      time: '3h ago',
      unread: false,
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    setHasUnread(false);
  };

  const handleViewAll = () => {
    setIsNotificationsOpen(false);
    const target = role === 'SUPER_ADMIN' ? '/super-admin/notifications' : '/notifications';
    navigate(target);
  };

  return (
    <header className="h-16 border-b border-[#E5E7EB] bg-white px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search employees, payroll, reports..."
            onFocus={() => window.dispatchEvent(new CustomEvent('app:open-global-search'))}
            className="w-full bg-[#F5F6F3] border border-[#E5E7EB] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#111827] placeholder-[#6B7280] focus:outline-none focus:border-[#0F766E] transition-all cursor-pointer"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Tenant isolated badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5F6F3] border border-[#E5E7EB] text-[11px] text-[#374151]">
          <Shield className="w-3.5 h-3.5 text-[#0F766E]" />
          <span>Tenant Isolated: <strong className="text-[#111827] font-mono font-bold">{company?.code || 'MAIN'}</strong></span>
        </div>

        {/* TOP NOTIFICATION BELL WITH WORKING POPOVER */}
        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 rounded-lg text-[#374151] hover:text-[#111827] hover:bg-[#F5F6F3] transition-colors"
            title="Notifications & Alerts"
          >
            <Bell className="w-4 h-4" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0F766E] animate-pulse" />
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E5E7EB] rounded-xl shadow-xl z-50 p-3 space-y-2 text-xs animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
                <span className="font-bold text-[#111827]">System Notifications</span>
                {hasUnread && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-[#0F766E] hover:underline font-semibold flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Mark read
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-lg border transition-colors ${
                      n.unread && hasUnread
                        ? 'bg-[#E6F4F1] border-[#CCECF0] text-[#0F766E]'
                        : 'bg-[#F5F6F3] border-[#E5E7EB] text-[#374151]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-[#111827]">
                      <span className="truncate">{n.title}</span>
                      <span className="text-[10px] text-[#6B7280] font-mono shrink-0 ml-1">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-[#4B5563] mt-0.5 leading-relaxed">{n.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[#E5E7EB] text-center">
                <button
                  onClick={handleViewAll}
                  className="w-full py-1.5 rounded-lg text-xs font-semibold text-[#0F766E] hover:bg-[#E6F4F1] transition-colors flex items-center justify-center gap-1"
                >
                  <span>View All Notifications</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-[#E5E7EB]" />

        {/* User Profile Menu */}
        <ProfileDropdown />
      </div>
    </header>
  );
};

export default Header;
