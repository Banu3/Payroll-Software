export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'UNAUTHORIZED',
        requestId: req.requestId,
      });
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Required role not granted',
        code: 'FORBIDDEN',
        requiredRoles: allowedRoles,
        requestId: req.requestId,
      });
    }

    next();
  };
};

export const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'UNAUTHORIZED',
        requestId: req.requestId,
      });
    }

    // Super Admin bypasses individual permission checks
    if (req.user.roles.includes('SUPER_ADMIN')) {
      return next();
    }

    const hasAllPermissions = requiredPermissions.every((permission) =>
      req.user.permissions.includes(permission)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({
        success: false,
        message: `Access denied: Missing required permission [${requiredPermissions.join(', ')}]`,
        code: 'PERMISSION_DENIED',
        requiredPermissions,
        requestId: req.requestId,
      });
    }

    next();
  };
};

// Tenant Isolation Middleware
export const enforceTenantIsolation = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      code: 'UNAUTHORIZED',
      requestId: req.requestId,
    });
  }

  // Super Admin can specify target company_id or access all
  if (req.user.roles.includes('SUPER_ADMIN')) {
    req.targetCompanyId = req.query.company_id || req.body.company_id || req.user.companyId;
    return next();
  }

  // Enforce company_id derived strictly from authenticated user's session profile
  req.targetCompanyId = req.user.companyId;
  req.body.company_id = req.user.companyId;
  req.query.company_id = req.user.companyId;

  next();
};
