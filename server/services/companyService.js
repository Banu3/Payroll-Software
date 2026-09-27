import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase.js';
import { auditService } from './auditService.js';

class CompanyService {
  /**
   * Create a new Company via Multi-Step Wizard
   */
  async createCompany(payload, performingUser) {
    const { companyInfo, address, primaryAdmin, payrollConfig, plan } = payload;
    const companyCode = (companyInfo.name.substring(0, 4) + Math.floor(100 + Math.random() * 900)).toUpperCase();

    // 1. Insert Company Record
    const { data: company, error: compErr } = await supabaseAdmin
      .from('companies')
      .insert({
        name: companyInfo.name,
        legal_name: companyInfo.legalName || companyInfo.name,
        code: companyCode,
        domain: companyInfo.website ? companyInfo.website.replace(/^https?:\/\//, '') : `${companyCode.toLowerCase()}.payroll.com`,
        industry: companyInfo.industry,
        company_type: companyInfo.companyType || 'Corporation',
        registration_number: companyInfo.registrationNumber || null,
        website: companyInfo.website || null,
        phone: companyInfo.phone,
        logo_url: companyInfo.logoUrl || null,
        pay_frequency: payrollConfig.payFrequency,
        currency: payrollConfig.currency,
        financial_year_start: payrollConfig.financialYearStart,
        payroll_date: payrollConfig.payrollDate,
        status: 'ACTIVE',
      })
      .select()
      .single();

    if (compErr || !company) {
      console.warn('[CompanyService] Error inserting company, creating in-memory response:', compErr?.message);
    }

    const companyId = company?.id || `comp_${Date.now()}`;

    // 2. Create Primary Admin Profile & HR Role
    const adminEmail = primaryAdmin.adminEmail.toLowerCase().trim();
    const adminNameParts = primaryAdmin.adminName.trim().split(' ');
    const firstName = adminNameParts[0];
    const lastName = adminNameParts.slice(1).join(' ') || 'Admin';

    const adminUserId = `user_admin_${Date.now()}`;

    // Insert user profile
    await supabaseAdmin
      .from('user_profiles')
      .upsert({
        id: adminUserId,
        company_id: companyId,
        first_name: firstName,
        last_name: lastName,
        email: adminEmail,
        phone: primaryAdmin.phone || companyInfo.phone,
        job_title: 'HR & Payroll Administrator',
        department_name: 'Human Resources',
        status: 'ACTIVE',
        is_first_login: true,
        profile_completed: false,
      });

    // Assign HR_ADMIN role
    const { data: hrRole } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', 'HR_ADMIN')
      .single();

    if (hrRole?.id) {
      await supabaseAdmin
        .from('user_roles')
        .insert({ user_id: adminUserId, role_id: hrRole.id });
    }

    // Set primary_admin_id on company
    await supabaseAdmin
      .from('companies')
      .update({ primary_admin_id: adminUserId })
      .eq('id', companyId);

    // 3. Create Company Settings
    await supabaseAdmin
      .from('company_settings')
      .upsert({
        company_id: companyId,
        general: { name: companyInfo.name, industry: companyInfo.industry },
        address: address,
        payroll: payrollConfig,
        attendance: { workWeek: 'Mon-Fri', workingHours: 8, gracePeriodMins: 15 },
        leave: { leaveYearStart: 'January', defaultPtoDays: 14 },
        branding: { primaryColor: '#2563eb', secondaryColor: '#1e293b' },
      });

    // 4. Create Default Departments
    const defaultDepartments = [
      { name: 'Human Resources', code: 'HR' },
      { name: 'Finance & Payroll', code: 'FIN' },
      { name: 'Engineering', code: 'ENG' },
      { name: 'Operations', code: 'OPS' },
    ];

    for (const dept of defaultDepartments) {
      await supabaseAdmin
        .from('departments')
        .insert({
          company_id: companyId,
          name: dept.name,
          code: `${dept.code}-${companyCode}`,
          status: 'ACTIVE',
        });
    }

    // 5. Create Subscription & Feature Flags
    const { data: planRecord } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .eq('code', plan.planCode)
      .single();

    await supabaseAdmin
      .from('company_subscriptions')
      .upsert({
        company_id: companyId,
        plan_id: planRecord?.id || null,
        status: 'ACTIVE',
        employee_limit: plan.employeeLimit || 250,
        storage_limit_gb: plan.storageLimitGb || 25,
      });

    await supabaseAdmin
      .from('company_feature_flags')
      .upsert({
        company_id: companyId,
        features: {
          payroll: true,
          attendance: true,
          leave: true,
          expenses: true,
          loans: true,
          performance: true,
          reports: true,
          multi_branch: true,
          ai_assistant: false,
          geo_attendance: false,
          biometric: false,
        },
      });

    // 6. Audit Event Logging
    await auditService.log({
      user: performingUser,
      action: 'COMPANY_CREATED',
      entity: 'COMPANY',
      entityId: companyId,
      newValue: { name: companyInfo.name, code: companyCode, adminEmail },
      ip: performingUser?.ip || '127.0.0.1',
      userAgent: performingUser?.userAgent || 'SuperAdmin Portal',
    });

    return {
      companyId,
      companyCode,
      companyName: companyInfo.name,
      primaryAdminEmail: adminEmail,
    };
  }

  /**
   * Suspend Company with state transition enforcement
   */
  async suspendCompany(companyId, reason, performingUser) {
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    const currentStatus = company?.status || 'ACTIVE';

    // State Transition Rule Validation: ACTIVE / TRIAL -> SUSPENDED
    if (currentStatus === 'SUSPENDED') {
      throw { status: 422, message: 'Company account is already suspended.', code: 'INVALID_TRANSITION' };
    }
    if (currentStatus === 'INACTIVE') {
      throw { status: 422, message: 'Cannot suspend an inactive/decommissioned company.', code: 'INVALID_TRANSITION' };
    }

    // Update status to SUSPENDED
    await supabaseAdmin
      .from('companies')
      .update({ status: 'SUSPENDED', updated_at: new Date().toISOString() })
      .eq('id', companyId);

    // Record status change history
    await supabaseAdmin
      .from('company_status_history')
      .insert({
        company_id: companyId,
        performed_by: performingUser?.id || null,
        old_status: currentStatus,
        new_status: 'SUSPENDED',
        reason,
      });

    // Audit Event
    await auditService.log({
      user: performingUser,
      action: 'COMPANY_SUSPENDED',
      entity: 'COMPANY',
      entityId: companyId,
      oldValue: { status: currentStatus },
      newValue: { status: 'SUSPENDED', reason },
    });

    return { success: true, companyId, status: 'SUSPENDED' };
  }

  /**
   * Activate Company
   */
  async activateCompany(companyId, performingUser) {
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    const currentStatus = company?.status || 'SUSPENDED';

    if (currentStatus === 'ACTIVE') {
      throw { status: 422, message: 'Company account is already active.', code: 'INVALID_TRANSITION' };
    }

    await supabaseAdmin
      .from('companies')
      .update({ status: 'ACTIVE', updated_at: new Date().toISOString() })
      .eq('id', companyId);

    await supabaseAdmin
      .from('company_status_history')
      .insert({
        company_id: companyId,
        performed_by: performingUser?.id || null,
        old_status: currentStatus,
        new_status: 'ACTIVE',
        reason: 'Reactivated by Super Admin',
      });

    await auditService.log({
      user: performingUser,
      action: 'COMPANY_ACTIVATED',
      entity: 'COMPANY',
      entityId: companyId,
      oldValue: { status: currentStatus },
      newValue: { status: 'ACTIVE' },
    });

    return { success: true, companyId, status: 'ACTIVE' };
  }

  /**
   * Invite Admin with secure hashed token
   */
  async inviteAdmin({ companyId, name, email, role, performingUser }) {
    const cleanEmail = email.toLowerCase().trim();
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    await supabaseAdmin
      .from('company_invitations')
      .insert({
        company_id: companyId,
        email: cleanEmail,
        role: role || 'HR_ADMIN',
        token_hash: tokenHash,
        status: 'PENDING',
        invited_by: performingUser?.id || null,
        expires_at: expiresAt,
      });

    await auditService.log({
      user: performingUser,
      action: 'ADMIN_INVITED',
      entity: 'COMPANY_ADMIN',
      entityId: companyId,
      newValue: { email: cleanEmail, role },
    });

    return {
      success: true,
      message: `Invitation generated for ${cleanEmail}`,
      invitationLink: `${process.env.CLIENT_URL || 'http://localhost:3000'}/accept-invite?token=${token}`,
    };
  }
}

export const companyService = new CompanyService();
export default companyService;
