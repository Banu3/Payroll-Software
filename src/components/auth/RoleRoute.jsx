import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingState } from '../ui/LoadingState';
import { ROLE_DASHBOARDS } from '../../config/permissions';

export const RoleRoute = ({ allowedRoles = [], children }) => {
  const { isAuthenticated, hasRole, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState message="Checking security authorization..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isRoleAuthorized = allowedRoles.some((r) => hasRole(r));

  if (!isRoleAuthorized) {
    // Redirect gracefully to user's correct role dashboard
    const userDashboard = ROLE_DASHBOARDS[role] || '/employee/dashboard';
    return <Navigate to={userDashboard} replace />;
  }

  return children;
};

export default RoleRoute;
