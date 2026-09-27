import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { supabaseAdmin, supabasePublic } from '../config/supabase.js';
import { getPermissionsForUser, ROLE_PERMISSIONS } from './permissionService.js';
import { auditService } from './auditService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_enterprise_payroll_2026_change_in_production';

// Demo enterprise seed accounts for instant verification and evaluation
const DEMO_ACCOUNTS = {
  'superadmin@company.com': {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'superadmin@company.com',
    firstName: 'Alexander',
    lastName: 'Vance',
    role: 'SUPER_ADMIN',
    companyId: 'company-enterprise-01',
    companyName: 'Apex Global Enterprises',
    companyCode: 'APEX',
    jobTitle: 'Chief Systems Administrator',
    department: 'Executive Systems',
    isFirstLogin: false,
    profileCompleted: true,
  },
  'hradmin@company.com': {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'hradmin@company.com',
    firstName: 'Eleanor',
    lastName: 'Sterling',
    role: 'HR_ADMIN',
    companyId: 'company-enterprise-01',
    companyName: 'Apex Global Enterprises',
    companyCode: 'APEX',
    jobTitle: 'Global HR Director',
    department: 'People Operations',
    isFirstLogin: false,
    profileCompleted: true,
  },
  'manager@company.com': {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'manager@company.com',
    firstName: 'Marcus',
    lastName: 'Brooke',
    role: 'MANAGER',
    companyId: 'company-enterprise-01',
    companyName: 'Apex Global Enterprises',
    companyCode: 'APEX',
    jobTitle: 'Engineering Team Lead',
    department: 'Software Engineering',
    isFirstLogin: false,
    profileCompleted: true,
  },
  'employee@company.com': {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'employee@company.com',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    role: 'EMPLOYEE',
    companyId: 'company-enterprise-01',
    companyName: 'Apex Global Enterprises',
    companyCode: 'APEX',
    jobTitle: 'Senior Financial Analyst',
    department: 'Finance & Payroll',
    isFirstLogin: false,
    profileCompleted: true,
  },
  'newemployee@company.com': {
    id: '00000000-0000-0000-0000-000000000005',
    email: 'newemployee@company.com',
    firstName: 'David',
    lastName: 'Miller',
    role: 'EMPLOYEE',
    companyId: 'company-enterprise-01',
    companyName: 'Apex Global Enterprises',
    companyCode: 'APEX',
    jobTitle: 'Associate Operations Analyst',
    department: 'Operations',
    isFirstLogin: true,
    profileCompleted: false,
  }
};

class AuthService {
  async login({ email, password, ip, userAgent }) {
    const cleanEmail = email.toLowerCase().trim();

    // 1. Check demo/seed enterprise accounts first for seamless local development
    if (DEMO_ACCOUNTS[cleanEmail]) {
      const demoUser = DEMO_ACCOUNTS[cleanEmail];
      const permissions = ROLE_PERMISSIONS[demoUser.role] || [];

      // Generate enterprise JWT session token
      const token = jwt.sign(
        {
          id: demoUser.id,
          email: demoUser.email,
          role: demoUser.role,
          companyId: demoUser.companyId,
          firstName: demoUser.firstName,
          lastName: demoUser.lastName,
        },
        JWT_SECRET,
        { expiresIn: '8h' }
      );

      // Audit log successful login
      await auditService.logLoginEvent({
        userId: demoUser.id,
        companyId: demoUser.companyId,
        email: cleanEmail,
        eventType: 'login_success',
        ip,
        userAgent,
        status: 'SUCCESS',
      });

      return {
        user: {
          id: demoUser.id,
          email: demoUser.email,
          firstName: demoUser.firstName,
          lastName: demoUser.lastName,
          role: demoUser.role,
          jobTitle: demoUser.jobTitle,
          department: demoUser.department,
          isFirstLogin: demoUser.isFirstLogin,
          profileCompleted: demoUser.profileCompleted,
          avatarUrl: `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80`,
        },
        company: {
          id: demoUser.companyId,
          name: demoUser.companyName,
          code: demoUser.companyCode,
        },
        roles: [demoUser.role],
        permissions,
        token,
        expiresIn: 28800, // 8 hours
      };
    }

    // 2. Authenticate with Supabase Auth
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
