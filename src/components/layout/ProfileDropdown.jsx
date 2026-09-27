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
      {/* HEADER TRIGGER BUTTON - Clean Professional Light Style */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all focus:outline-none cursor-pointer group"
      >
        {/* Avatar Badge */}
        <div className="relative flex items-center justify-center">
          <div className="w-7 h-7 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center text-xs tracking-tight shadow-2xs">
            {fullName.charAt(0)}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
        </div>

        {/* User & Company Name */}
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-semibold text-slate-800 leading-tight group-hover:text-teal-700 transition-colors">
            {fullName}
          </span>
          <span className="text-[10px] text-slate-500 font-medium leading-tight truncate max-w-[130px]">
            {company?.name || 'Acme Enterprise'}
          </span>
        </div>

        <ChevronDown
          className={clsx(
            "w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform duration-200",
            isOpen && "rotate-180 text-teal-700"
          )}
        />
      </button>

      {/* DROPDOWN MENU CARD - Light Theme Professional Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in text-slate-800">

          {/* USER INFO HEADER */}
          <div className="p-4 bg-slate-50/80 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                {fullName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{fullName}</p>
                <p className="text-[11px] text-slate-500 truncate font-mono mt-0.5">{userEmail}</p>

                <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200">
                    {displayRole}
                  </span>
                  <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                  </span>
                </div>
              </div>
            </div>

            {/* TENANT COMPANY */}
            <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-1.5 truncate">
                <Building className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="truncate font-medium text-slate-700">{company?.name || 'Acme Enterprise Pvt Ltd'}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-semibold shrink-0">
                {company?.code || 'ACME'}
              </span>
            </div>
          </div>

          {/* MENU OPTIONS */}
          <div className="p-2 space-y-1 text-xs">
            <Link
              to="/settings/security"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100/80 text-slate-700 hover:text-slate-900 font-medium transition-colors group"
            >
              <User className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
              <span>My Profile & Account</span>
            </Link>

            <Link
              to="/settings/security"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100/80 text-slate-700 hover:text-slate-900 font-medium transition-colors group"
            >
              <ShieldCheck className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
              <span>Security & Sessions</span>
            </Link>

            {isAdmin && (
              <Link
                to="/company/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100/80 text-slate-700 hover:text-slate-900 font-medium transition-colors group"
              >
                <Building2 className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
                <span>Company Settings</span>
              </Link>
            )}

            <Link
              to={role === 'SUPER_ADMIN' ? '/super-admin/notifications' : '/notifications'}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100/80 text-slate-700 hover:text-slate-900 font-medium transition-colors group"
            >
              <Bell className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
              <span>Notifications</span>
            </Link>

            <Link
              to={role === 'SUPER_ADMIN' ? '/super-admin/support' : '/support'}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100/80 text-slate-700 hover:text-slate-900 font-medium transition-colors group"
            >
              <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              <span>Help & Support</span>
            </Link>

            {/* SIGN OUT */}
            <div className="pt-2 border-t border-slate-100 mt-1">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 font-semibold transition-colors group text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <LogOut className="w-4 h-4 text-rose-500 group-hover:translate-x-0.5 transition-transform" />
                  <span>Sign Out</span>
                </div>
                <span className="text-[10px] text-rose-400 font-mono">LOGOUT</span>
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
