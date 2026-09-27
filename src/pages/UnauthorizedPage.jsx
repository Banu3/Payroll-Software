import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShieldAlert, ArrowLeft, LayoutDashboard, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLE_DASHBOARDS } from '../config/permissions';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, user } = useAuth();

  const requiredPermissions = location.state?.requiredPermissions;
  const requiredRoles = location.state?.requiredRoles;

  const userDashboard = ROLE_DASHBOARDS[role] || '/employee/dashboard';

  return (
    <div className="min-h-screen bg-[#F5F6F3] flex flex-col justify-center items-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-white border border-[#E5E7EB] rounded-2xl shadow-xs p-8 space-y-6 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono font-bold">
            ERROR 403 — ACCESS DENIED
          </span>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Permission Required</h1>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            Your current account role (<strong className="text-slate-900">{role || 'GUEST'}</strong>) does not have authorization to access this protected enterprise route.
          </p>
        </div>

        {(requiredPermissions || requiredRoles) && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-mono text-left space-y-1">
            <div className="text-slate-700 font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-600" /> Security Evaluation Matrix:
            </div>
            {requiredPermissions && (
              <div className="text-slate-800 font-medium">Required Permission: <span className="text-rose-700 font-bold">{requiredPermissions.join(', ')}</span></div>
            )}
            {requiredRoles && (
              <div className="text-slate-800 font-medium">Required Role: <span className="text-rose-700 font-bold">{requiredRoles.join(', ')}</span></div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="outline"
            size="md"
            className="flex-1"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            icon={LayoutDashboard}
            onClick={() => navigate(userDashboard)}
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
