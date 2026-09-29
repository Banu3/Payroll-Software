import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Settings,
  ShieldCheck,
  Bell,
  HelpCircle,
  LogOut,
  Building2,
  ChevronDown,
  CheckCircle2,
  Lock,
  Building
} from 'lucide-react';
import clsx from 'clsx';

export const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, role, company, logout, hasRole } = useAuth();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const isAdmin = hasRole('SUPER_ADMIN') || hasRole('HR_ADMIN');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    await logout();
    navigate('/login');
  };

  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'HR Administrator';
  const userEmail = user?.email || 'hradmin@company.com';
  const displayRole = role ? role.replace('_', ' ') : 'HR ADMIN';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* HEADER TRIGGER BUTTON - Clean Light Style */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#F0F6F3] border border-[#BCCBC3] transition-all focus:outline-none cursor-pointer group h-10"
      >
        {/* Avatar Badge */}
        <div className="relative flex items-center justify-center">
          <div className="w-7 h-7 rounded-full bg-[#E5F4EE] border border-[#CFE6DC] text-[#167C63] font-bold flex items-center justify-center text-xs tracking-tight shadow-xs">
            {fullName.charAt(0)}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#167C63] ring-2 ring-white" />
        </div>

        {/* User & Company Name */}
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-semibold text-[#12201A] leading-tight group-hover:text-[#167C63] transition-colors">
            {fullName}
          </span>
          <span className="text-[10px] text-[#5A6A61] font-medium leading-tight truncate max-w-[130px]">
            {company?.name || 'Acme Enterprise'}
          </span>
        </div>

        <ChevronDown
          className={clsx(
            "w-3.5 h-3.5 text-[#5A6A61] group-hover:text-[#12201A] transition-transform duration-200",
            isOpen && "rotate-180 text-[#167C63]"
          )}
        />
      </button>

      {/* DROPDOWN MENU CARD - Light Theme Professional Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-[#CBD8D1] rounded-[16px] shadow-[0_12px_32px_rgba(20,50,35,0.14)] z-50 overflow-hidden animate-fade-in text-[#12201A]">

          {/* USER INFO HEADER */}
          <div className="p-4 bg-[#F3F7F5] border-b border-[#CBD8D1]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E5F4EE] border border-[#CFE6DC] text-[#167C63] font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                {fullName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#12201A] truncate">{fullName}</p>
                <p className="text-[11px] text-[#5A6A61] truncate font-mono mt-0.5">{userEmail}</p>

                <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#E5F4EE] text-[#167C63] border border-[#CFE6DC]">
                    {displayRole}
                  </span>
                  <span className="text-[10px] font-medium text-[#167C63] bg-[#E5F4EE] px-1.5 py-0.5 rounded border border-[#CFE6DC] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#167C63]" /> Active
                  </span>
                </div>
              </div>
            </div>

            {/* TENANT COMPANY */}
            <div className="mt-3 pt-2.5 border-t border-[#E1E9E4] flex items-center justify-between text-xs text-[#33413A]">
              <div className="flex items-center gap-1.5 truncate">
                <Building className="w-3.5 h-3.5 text-[#167C63] shrink-0" />
                <span className="truncate font-medium text-[#12201A]">{company?.name || 'Acme Enterprise Pvt Ltd'}</span>
              </div>
              <span className="text-[10px] font-mono text-[#33413A] bg-[#F3F7F5] px-1.5 py-0.5 rounded border border-[#CBD8D1] font-semibold shrink-0">
                {company?.code || 'ACME'}
              </span>
            </div>
          </div>

          {/* MENU OPTIONS */}
          <div className="p-2 space-y-1 text-xs">
            <Link
              to="/settings/security"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-[9px] hover:bg-[#F0F6F3] text-[#526158] hover:text-[#17221C] font-medium transition-colors group"
            >
              <User className="w-4 h-4 text-[#65736B] group-hover:text-[#167C63] transition-colors" />
              <span>My Profile & Account</span>
            </Link>

            <Link
              to="/settings/security"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-[9px] hover:bg-[#F0F6F3] text-[#526158] hover:text-[#17221C] font-medium transition-colors group"
            >
              <ShieldCheck className="w-4 h-4 text-[#65736B] group-hover:text-[#167C63] transition-colors" />
              <span>Security & Sessions</span>
            </Link>

            {isAdmin && (
              <Link
                to="/company/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-[9px] hover:bg-[#F0F6F3] text-[#526158] hover:text-[#17221C] font-medium transition-colors group"
              >
                <Building2 className="w-4 h-4 text-[#65736B] group-hover:text-[#167C63] transition-colors" />
                <span>Company Settings</span>
              </Link>
            )}

            <Link
              to={role === 'SUPER_ADMIN' ? '/super-admin/notifications' : '/notifications'}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-[9px] hover:bg-[#F0F6F3] text-[#526158] hover:text-[#17221C] font-medium transition-colors group"
            >
              <Bell className="w-4 h-4 text-[#65736B] group-hover:text-[#167C63] transition-colors" />
              <span>Notifications</span>
            </Link>

            <Link
              to={role === 'SUPER_ADMIN' ? '/super-admin/support' : '/support'}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-[9px] hover:bg-[#F0F6F3] text-[#526158] hover:text-[#17221C] font-medium transition-colors group"
            >
              <HelpCircle className="w-4 h-4 text-[#65736B] group-hover:text-[#167C63] transition-colors" />
              <span>Help & Support</span>
            </Link>

            {/* SIGN OUT */}
            <div className="pt-2 border-t border-[#DCE5E0] mt-1">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-between px-3 py-2 rounded-[9px] hover:bg-[#FFF1F1] text-[#C24141] font-semibold transition-colors group text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <LogOut className="w-4 h-4 text-[#C24141] group-hover:translate-x-0.5 transition-transform" />
                  <span>Sign Out</span>
                </div>
                <span className="text-[10px] text-[#C24141] font-mono font-bold">LOGOUT</span>
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
