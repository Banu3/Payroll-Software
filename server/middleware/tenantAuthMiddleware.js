import { supabase } from '../config/supabase.js';

/**
 * Enterprise Multi-Tenant & RBAC Middleware
 * Enforces strict tenant isolation and role/permission authorization on every API endpoint.
 * 
 * Rules:
 * 1. User must be authenticated (req.user exists via authMiddleware).
 * 2. company_id MUST be derived from authenticated user session, NEVER trusted from client req.body or req.query.
 * 3. Required permission (if specified) must be present in user's granted permissions or role.
 */
export const requireTenantAuth = (requiredPermission = null) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          code: 'UNAUTHORIZED',
          message: 'Authentication token is missing or invalid',
          requestId: req.requestId,
        });
      }

      // Fetch active employee / tenant context for the user
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('id, company_id, role, permissions, status')
        .eq('user_id', user.id)
        .eq('status', 'ACTIVE')
        .maybeSingle();

      // Super Admin bypass check (if super admin table exists / metadata flag)
      const isSuperAdmin = user.user_metadata?.role === 'SUPER_ADMIN' || user.app_metadata?.role === 'SUPER_ADMIN';

      if (!isSuperAdmin && (!employee || !employee.company_id)) {
        return res.status(403).json({
          success: false,
          code: 'TENANT_ACCESS_DENIED',
          message: 'User does not belong to an active organization',
          requestId: req.requestId,
        });
      }

      const tenantContext = {
        userId: user.id,
        employeeId: employee?.id || null,
        companyId: isSuperAdmin ? (req.headers['x-company-id'] || employee?.company_id) : employee.company_id,
        role: isSuperAdmin ? 'SUPER_ADMIN' : (employee?.role || 'EMPLOYEE'),
        permissions: employee?.permissions || [],
      };

      // Role/Permission Check
      if (requiredPermission && !isSuperAdmin) {
        const hasRolePermission = tenantContext.role === 'SUPER_ADMIN' || tenantContext.role === 'HR_ADMIN';
        const hasExplicitPermission = Array.isArray(tenantContext.permissions) && tenantContext.permissions.includes(requiredPermission);

        if (!hasRolePermission && !hasExplicitPermission) {
          return res.status(403).json({
            success: false,
            code: 'FORBIDDEN',
            message: `Insufficient permissions: requires '${requiredPermission}'`,
            requestId: req.requestId,
          });
        }
      }

      req.tenantContext = tenantContext;
      next();
    } catch (error) {
      console.error('[TenantAuthMiddleware] Authorization error:', error);
      return res.status(500).json({
        success: false,
        code: 'INTERNAL_AUTH_ERROR',
        message: 'An error occurred while verifying access authorization',
        requestId: req.requestId,
      });
    }
  };
};
