import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileDropdown } from './ProfileDropdown';
import { Shield, Search, Bell, Check, ArrowRight, Maximize2, Minimize2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header = () => {
  const { company, role } = useAuth();
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().then(() => {
          setIsFullscreen(true);
        }).catch((err) => {
          console.warn('Fullscreen request error:', err);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch((err) => {
          console.warn('Exit fullscreen error:', err);
        });
      }
    }
  };

  const handleMarkAllRead = () => {
    setHasUnread(false);
  };

  const handleViewAll = () => {
    setIsNotificationsOpen(false);
    const target = role === 'SUPER_ADMIN' ? '/super-admin/notifications' : '/notifications';
    navigate(target);
  };

  return (
    <header className="h-16 border-b border-[#CBD8D1] bg-white px-6 flex items-center justify-between sticky top-0 z-40 shadow-[0_1px_4px_rgba(20,50,35,0.08)]">
      <div className="flex items-center gap-4">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('app:open-global-search'))}
          className="relative hidden md:flex items-center justify-between w-80 h-10 bg-white border border-[#BCCBC3] hover:border-[#167C63] rounded-[10px] px-3 text-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#5A6A61] group-hover:text-[#167C63] transition-colors" />
            <span className="font-medium text-[#33413A]">Search employees, payroll, reports...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded-md bg-[#F3F7F5] border border-[#BCCBC3] text-[10px] font-mono text-[#12201A] font-semibold group-hover:border-[#167C63]">
            Ctrl+K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {/* Fullscreen Mode Toggle Button */}
        <button
          onClick={toggleFullscreen}
          className="h-10 px-3 rounded-[9px] text-[#33413A] hover:text-[#12201A] hover:bg-[#F0F6F3] transition-all border border-[#BCCBC3] hover:border-[#167C63] cursor-pointer flex items-center gap-1.5 text-xs font-semibold bg-white"
          title={isFullscreen ? 'Exit Full Screen' : 'Toggle Full Screen'}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-4 h-4 text-[#167C63]" />
              <span className="hidden sm:inline-block text-xs font-bold text-[#12201A]">Exit Fullscreen</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4 text-[#167C63]" />
              <span className="hidden sm:inline-block text-xs font-bold text-[#12201A]">Full Screen</span>
            </>
          )}
        </button>

        {/* Tenant isolated badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 h-10 rounded-[10px] bg-white border border-[#BCCBC3] text-xs text-[#33413A] font-medium">
          <Shield className="w-4 h-4 text-[#167C63]" />
          <span>Tenant Isolated: <strong className="text-[#12201A] font-mono font-bold">{company?.code || 'MAIN'}</strong></span>
        </div>

        {/* TOP NOTIFICATION BELL WITH WORKING POPOVER */}
        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative w-10 h-10 flex items-center justify-center rounded-[10px] text-[#33413A] hover:text-[#12201A] hover:bg-[#F0F6F3] border border-[#BCCBC3] transition-colors cursor-pointer bg-white"
            title="Notifications & Alerts"
          >
            <Bell className="w-4 h-4 text-[#167C63]" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#C24141] ring-2 ring-white animate-pulse" />
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#CBD8D1] rounded-[16px] shadow-[0_12px_32px_rgba(20,50,35,0.14)] z-50 p-3.5 space-y-2.5 text-xs animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-[#E1E9E4]">
                <span className="font-bold text-[#12201A]">Notifications</span>
                {hasUnread && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-[#167C63] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-[10px] border transition-colors ${
                      n.unread && hasUnread
                        ? 'bg-[#E5F4EE] border-[#CFE6DC] text-[#167C63]'
                        : 'bg-[#F3F7F5] border-[#CBD8D1] text-[#33413A]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-[#12201A]">
                      <span className="truncate">{n.title}</span>
                      <span className="text-[10px] text-[#5A6A61] font-mono shrink-0 ml-1">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-[#33413A] mt-0.5 leading-relaxed">{n.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[#E1E9E4] text-center">
                <button
                  onClick={handleViewAll}
                  className="w-full py-1.5 rounded-[9px] text-xs font-semibold text-[#167C63] hover:bg-[#E5F4EE] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>View All Notifications</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-[#CBD8D1]" />

        {/* User Profile Menu */}
        <ProfileDropdown />
      </div>
    </header>
  );
};

export default Header;
