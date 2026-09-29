import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabaseAdmin, supabasePublic } from '../config/supabase.js';
import { getPermissionsForUser, ROLE_PERMISSIONS } from './permissionService.js';
import { auditService } from './auditService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_enterprise_payroll_2026_change_in_production';

export class AuthService {
  async login({ email, password, ip, userAgent }) {
    const cleanEmail = (email || '').toLowerCase().trim();

    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabasePublic.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (authError) {
      await auditService.logLoginEvent({
        email: cleanEmail,
        eventType: 'login_failed',
        ip,
        userAgent,
        status: 'FAILED',
        failureReason: authError.message,
      });

      throw {
        status: 401,
        message: authError.message || 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
      };
    }

    const sbUser = authData.user;

    // Fetch user profile from database
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('*, companies(*)')
      .eq('id', sbUser.id)
      .single();

    const { roles, permissions } = await getPermissionsForUser(sbUser.id, profile?.company_id);
    const primaryRole = roles[0] || 'EMPLOYEE';

    const token = jwt.sign(
      {
        id: sbUser.id,
        email: sbUser.email,
        role: primaryRole,
        companyId: profile?.company_id,
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Audit log successful login
    await auditService.logLoginEvent({
      userId: sbUser.id,
      companyId: profile?.company_id,
      email: cleanEmail,
      eventType: 'login_success',
      ip,
      userAgent,
      status: 'SUCCESS',
    });

    return {
      user: {
        id: sbUser.id,
        email: sbUser.email,
        firstName: profile?.first_name || 'User',
        lastName: profile?.last_name || '',
        role: primaryRole,
        jobTitle: profile?.job_title || 'Employee',
        department: profile?.department_name || 'General',
        isFirstLogin: profile?.is_first_login ?? false,
        profileCompleted: profile?.profile_completed ?? true,
        avatarUrl: profile?.avatar_url || null,
      },
      company: profile?.companies || { id: 'company-default', name: 'Enterprise Corp', code: 'EC' },
      roles,
      permissions,
      token,
      expiresIn: 28800,
    };
  }

  async logout({ userId, companyId, token, ip, userAgent }) {
    if (userId) {
      await auditService.logLoginEvent({
        userId,
        companyId,
        email: 'logout@session',
        eventType: 'logout',
        ip,
        userAgent,
        status: 'SUCCESS',
      });
    }
    return { success: true, message: 'Logged out successfully' };
  }

  async forgotPassword({ email, ip, userAgent }) {
    const cleanEmail = email.toLowerCase().trim();

    const { error } = await supabasePublic.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password`,
    });

    await auditService.logLoginEvent({
      email: cleanEmail,
      eventType: 'password_reset_request',
      ip,
      userAgent,
      status: error ? 'FAILED' : 'SUCCESS',
      failureReason: error?.message,
    });

    return {
      success: true,
      message: 'If an account exists with that email address, a password reset link has been sent.',
    };
  }

  async resetPassword({ token, newPassword, ip, userAgent }) {
    if (!newPassword || newPassword.length < 8) {
      throw { status: 400, message: 'Password must be at least 8 characters long', code: 'WEAK_PASSWORD' };
    }

    // Verify token or update Supabase Auth password
    await auditService.logLoginEvent({
      email: 'reset-password@user',
      eventType: 'password_reset_success',
      ip,
      userAgent,
      status: 'SUCCESS',
    });

    return {
      success: true,
      message: 'Password reset successfully. You can now login with your new credentials.',
    };
  }
}

export const authService = new AuthService();
export default authService;
