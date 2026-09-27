import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission, enforceTenantIsolation } from '../middleware/authorize.js';
import { supabaseAdmin } from '../config/supabase.js';
import { auditService } from '../services/auditService.js';
import { resolveEmployeeLeavePolicy } from '../services/leavePolicyResolver.js';
import { calculateLeaveDuration } from '../services/leaveDurationService.js';
import { getOrCreateLeaveBalance, recordLedgerTransaction } from '../services/leaveLedgerService.js';
import { validateLeaveRequest } from '../services/leaveValidationService.js';
import { processLeaveApprovalAction } from '../services/leaveApprovalWorkflowService.js';
import { getPayrollLeaveSummary } from '../services/leavePayrollService.js';
import {
  leaveTypeSchema,
  leavePolicySchema,
  leaveRequestSchema,
  leaveAdjustmentSchema,
  leaveEncashmentSchema,
  compOffSchema,
  blackoutPeriodSchema,
} from '../validators/leaveSchemas.js';

const router = express.Router();

router.use(authenticateToken);
router.use(enforceTenantIsolation);

/**
 * GET /api/leave/dashboard
 * HR Leave KPI widgets (Employees on leave today, pending requests, approved this month, low balance alert)
 */
router.get('/dashboard', async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = `${today.substring(0, 7)}-01`;

    // 1. Employees on leave today
    const { count: employeesOnLeaveToday } = await supabaseAdmin
      .from('leave_requests')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'APPROVED')
      .lte('start_date', today)
      .gte('end_date', today);

    // 2. Pending Leave Requests
    const { count: pendingRequests } = await supabaseAdmin
      .from('leave_requests')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'PENDING');

    // 3. Approved This Month
    const { count: approvedThisMonth } = await supabaseAdmin
      .from('leave_requests')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'APPROVED')
      .gte('start_date', firstDayOfMonth);

    // 4. Rejected This Month
    const { count: rejectedThisMonth } = await supabaseAdmin
      .from('leave_requests')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'REJECTED')
      .gte('created_at', firstDayOfMonth);

    // 5. Low balance count (< 2 days)
    const { count: lowBalanceCount } = await supabaseAdmin
      .from('leave_balances')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .lt('available', 2.0);

    return res.status(200).json({
      success: true,
      data: {
        employeesOnLeaveToday: employeesOnLeaveToday || 0,
        pendingRequests: pendingRequests || 0,
        approvedThisMonth: approvedThisMonth || 0,
        rejectedThisMonth: rejectedThisMonth || 0,
        lowBalanceCount: lowBalanceCount || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leave/analytics
 * Real backend aggregation for leave usage trends and distribution
 */
router.get('/analytics', async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;

    const { data: requests } = await supabaseAdmin
      .from('leave_requests')
      .select('duration, leave_type:leave_types(name, category), employee:employees(department:departments(name))')
      .eq('company_id', companyId)
      .eq('status', 'APPROVED');

    const typeDistribution = {};
    const deptDistribution = {};

    (requests || []).forEach((r) => {
      const typeName = r.leave_type?.name || 'Casual Leave';
      const deptName = r.employee?.department?.name || 'General';
      const dur = parseFloat(r.duration || 0);

      typeDistribution[typeName] = (typeDistribution[typeName] || 0) + dur;
      deptDistribution[deptName] = (deptDistribution[deptName] || 0) + dur;
    });

    return res.status(200).json({
      success: true,
      data: {
        typeDistribution: Object.entries(typeDistribution).map(([name, val]) => ({ name, value: val })),
        departmentDistribution: Object.entries(deptDistribution).map(([name, val]) => ({ name, value: val })),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leave/me/balances
 * Personal employee leave balances
 */
router.get('/me/balances', async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const userId = req.user.id;

    const { data: employee } = await supabaseAdmin
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .single();

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    const { data: balances, error } = await supabaseAdmin
      .from('leave_balances')
      .select('*, leave_type:leave_types(*)')
      .eq('company_id', companyId)
      .eq('employee_id', employee.id)
      .eq('year', new Date().getFullYear());

    if (error) throw error;

    return res.status(200).json({ success: true, data: balances || [] });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leave/me/requests
 * Personal employee leave request history
 */
router.get('/me/requests', async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const userId = req.user.id;

    const { data: employee } = await supabaseAdmin
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .single();

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    const { data: requests, error } = await supabaseAdmin
      .from('leave_requests')
      .select('*, leave_type:leave_types(name, code, category)')
      .eq('company_id', companyId)
      .eq('employee_id', employee.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ success: true, data: requests || [] });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/leave/requests
 * Submit new leave application with Centralized Validation Engine check
 */
router.post('/requests', async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const userId = req.user.id;
    const validated = leaveRequestSchema.parse(req.body);

    const { data: employee } = await supabaseAdmin
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .single();

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    // Calculate exact duration
    const durationRes = await calculateLeaveDuration({
      companyId,
      startDate: validated.startDate,
      endDate: validated.endDate,
      dayType: validated.dayType,
    });

    // Run Validation Engine
    const validation = await validateLeaveRequest({
      companyId,
      employeeId: employee.id,
      leaveTypeId: validated.leaveTypeId,
      startDate: validated.startDate,
      endDate: validated.endDate,
      requestedDays: durationRes.chargeableDays,
      isEmergency: validated.isEmergency,
      documentUrl: validated.documentUrl,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Leave request validation failed',
        errors: validation.errors,
      });
    }

    const { data: created, error } = await supabaseAdmin
      .from('leave_requests')
      .insert({
        company_id: companyId,
        employee_id: employee.id,
        leave_type_id: validated.leaveTypeId,
        start_date: validated.startDate,
        end_date: validated.endDate,
        duration: durationRes.chargeableDays,
        day_type: validated.dayType,
        reason: validated.reason,
        is_emergency: validated.isEmergency,
        document_url: validated.documentUrl || null,
        status: 'PENDING',
      })
      .select('*, leave_type:leave_types(name)')
      .single();

    if (error) throw error;

    await auditService.log({
      user: req.user,
      action: 'LEAVE_APPLY',
      entity: 'leave_requests',
      entityId: created.id,
      newValue: created,
    });

    return res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: created,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/leave/requests/:id/approve
 */
router.post('/requests/:id/approve', requirePermission('leave.approve_team'), async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const { id } = req.params;
    const { comments } = req.body;

    const result = await processLeaveApprovalAction({
      companyId,
      leaveRequestId: id,
      approverUser: req.user,
      action: 'APPROVE',
      comments,
    });

    return res.status(200).json({
      success: true,
      message: 'Leave request approved successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/leave/requests/:id/reject
 */
router.post('/requests/:id/reject', requirePermission('leave.approve_team'), async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const { id } = req.params;
    const { rejectionReason, comments } = req.body;

    const result = await processLeaveApprovalAction({
      companyId,
      leaveRequestId: id,
      approverUser: req.user,
      action: 'REJECT',
      comments,
      rejectionReason,
    });

    return res.status(200).json({
      success: true,
      message: 'Leave request rejected',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leave/requests (HR / Manager approval queue)
 */
router.get('/requests', async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const { status, employeeId, leaveTypeId } = req.query;

    let query = supabaseAdmin
      .from('leave_requests')
      .select('*, employee:employees(first_name, last_name, employee_id, department:departments(name)), leave_type:leave_types(name, code, category)')
      .eq('company_id', companyId);

    if (status) query = query.eq('status', status);
    if (employeeId) query = query.eq('employee_id', employeeId);
    if (leaveTypeId) query = query.eq('leave_type_id', leaveTypeId);

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    return res.status(200).json({ success: true, data: data || [] });
  } catch (error) {
    next(error);
  }
});

/**
 * LEAVE TYPES CRUD
 * GET /api/leave/types
 * POST /api/leave/types
 * PATCH /api/leave/types/:id
 */
router.get('/types', async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const { data, error } = await supabaseAdmin
      .from('leave_types')
      .select('*')
      .eq('company_id', companyId)
      .order('name', { ascending: true });

    if (error) throw error;
    return res.status(200).json({ success: true, data: data || [] });
  } catch (error) {
    next(error);
  }
});

router.post('/types', requirePermission('leave.manage_types'), async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const validated = leaveTypeSchema.parse(req.body);

    const { data, error } = await supabaseAdmin
      .from('leave_types')
      .insert({
        company_id: companyId,
        name: validated.name,
        code: validated.code,
        description: validated.description,
        category: validated.category,
        annual_allowance: validated.annualAllowance,
        accrual_frequency: validated.accrualFrequency,
        allow_carry_forward: validated.allowCarryForward,
        max_carry_forward: validated.maxCarryForward,
        allow_encashment: validated.allowEncashment,
        max_encashment: validated.maxEncashment,
        allow_half_day: validated.allowHalfDay,
        allow_negative_balance: validated.allowNegativeBalance,
        max_consecutive_days: validated.maxConsecutiveDays,
        min_notice_days: validated.minNoticeDays,
        document_required: validated.documentRequired,
        document_required_after_days: validated.documentRequiredAfterDays,
        gender_eligibility: validated.genderEligibility,
        probation_eligibility: validated.probationEligibility,
        is_active: validated.isActive,
      })
      .select()
      .single();

    if (error) throw error;

    await auditService.log({
      user: req.user,
      action: 'LEAVE_TYPE_CREATE',
      entity: 'leave_types',
      entityId: data.id,
      newValue: data,
    });

    return res.status(201).json({ success: true, message: 'Leave type created', data });
  } catch (error) {
    next(error);
  }
});

/**
 * MANUAL LEAVE ADJUSTMENT
 * POST /api/leave/adjustments
 */
router.post('/adjustments', requirePermission('leave.adjust_balance'), async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const validated = leaveAdjustmentSchema.parse(req.body);

    const { ledgerEntry, balanceAfter } = await recordLedgerTransaction({
      companyId,
      employeeId: validated.employeeId,
      leaveTypeId: validated.leaveTypeId,
      transactionType: 'MANUAL_ADJUSTMENT',
      days: validated.adjustmentDays,
      reason: validated.reason,
      createdBy: req.user.id,
    });

    await auditService.log({
      user: req.user,
      action: 'LEAVE_BALANCE_ADJUST',
      entity: 'leave_balances',
      entityId: validated.employeeId,
      newValue: { adjustment: validated.adjustmentDays, balanceAfter },
    });

    return res.status(200).json({
      success: true,
      message: `Balance adjusted by ${validated.adjustmentDays > 0 ? '+' : ''}${validated.adjustmentDays} days`,
      data: { ledgerEntry, newBalance: balanceAfter },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
