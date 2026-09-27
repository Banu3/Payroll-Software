import React from 'react';
import { useAuth } from '../../context/AuthContext';

export const PermissionGate = ({
  permission,
  permissions,
  role,
  roles,
  children,
  fallback = null,
}) => {
  const { hasPermission, hasRole } = useAuth();

  let isAllowed = true;

  if (permission && !hasPermission(permission)) {
    isAllowed = false;
  }

  if (permissions && !permissions.some((p) => hasPermission(p))) {
    isAllowed = false;
  }

  if (role && !hasRole(role)) {
    isAllowed = false;
  }

  if (roles && !roles.some((r) => hasRole(r))) {
    isAllowed = false;
  }

  return isAllowed ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGate;
