import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase.js';
import { getPermissionsForUser } from '../services/permissionService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_enterprise_payroll_2026_change_in_production';

export const authenticateToken = async (req, res, next) => {
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  req.requestId = requestId;

  try {
    let token = null;

    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required',
        code: 'UNAUTHORIZED',
        requestId,
      });
    }

    // Try custom JWT verification first
    let decodedUser = null;
    try {
      decodedUser = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      // If custom JWT verification fails, try Supabase auth verification
      const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && supabaseUser) {
        decodedUser = { id: supabaseUser.id, email: supabaseUser.email };
      }
    }

    if (!decodedUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session token',
        code: 'SESSION_EXPIRED',
        requestId,
      });
    }

    // Fetch user profile from DB (or fallback for mock/demo seed accounts)
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('*, companies(id, name, code)')
      .eq('id', decodedUser.id)
      .single();

    // Fetch user roles & permissions
    const { roles, permissions } = await getPermissionsForUser(decodedUser.id, profile?.company_id);

    // Attach user object to request
    req.user = {
      id: decodedUser.id,
      email: decodedUser.email || profile?.email,
      firstName: profile?.first_name || decodedUser.firstName || 'User',
      lastName: profile?.last_name || decodedUser.lastName || '',
      companyId: profile?.company_id || decodedUser.companyId || 'company-default-uuid',
      company: profile?.companies || { name: 'Acme Enterprise Inc', code: 'ACME' },
      roles: roles && roles.length ? roles : [decodedUser.role || 'EMPLOYEE'],
      permissions: permissions || [],
      profileCompleted: profile?.profile_completed ?? true,
      isFirstLogin: profile?.is_first_login ?? false,
    };

    next();
  } catch (error) {
    console.error('[AuthMiddleware Error]:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_FAILED',
      requestId,
    });
  }
};
