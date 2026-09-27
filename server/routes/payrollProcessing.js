import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission, enforceTenantIsolation } from '../middleware/authorize.js';
import { supabaseAdmin } from '../config/supabase.js';
import { auditService } from '../services/auditService.js';
import { validatePrePayrollRun } from '../services/payrollValidationService.js';
import { calculateSingleEmployeePayroll } from '../services/payrollCalculationEngineService.js';
import { createPayrollRunSchema, payrollApprovalSchema } from '../validators/payrollSchemas.js';

const router = express.Router();

router.use(authenticateToken);
router.use(enforceTenantIsolation);

/**
 * GET /api/payroll/dashboard
 * Real database values for Enterprise Payroll Dashboard
 */
router.get('/dashboard', async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;

    const { count: totalRuns } = await supabaseAdmin.from('payroll_runs').select('*', { count: 'exact', head: true }).eq('company_id', companyId);
    const { count: draftRuns } = await supabaseAdmin.from('payroll_runs').select('*', { count: 'exact', head: true }).eq('company_id', companyId).eq('status', 'DRAFT');
    const { count: pendingApproval } = await supabaseAdmin.from('payroll_runs').select('*', { count: 'exact', head: true }).eq('company_id', companyId).eq('status', 'APPROVAL_PENDING');
    const { count: finalizedRuns } = await supabaseAdmin.from('payroll_runs').select('*', { count: 'exact', head: true }).eq('company_id', companyId).eq('status', 'FINALIZED');

    const { data: runs } = await supabaseAdmin
      .from('payroll_runs')
      .select('total_gross, total_deductions, total_employer_cost, total_net_pay, total_employees, total_pf, total_esi, total_pt, total_tds')
      .eq('company_id', companyId)
      .eq('status', 'FINALIZED');

    const finalizedList = runs || [];
    const totalGross = finalizedList.reduce((acc, r) => acc + parseFloat(r.total_gross || 0), 0);
    const totalDeductions = finalizedList.reduce((acc, r) => acc + parseFloat(r.total_deductions || 0), 0);
    const totalEmployerCost = finalizedList.reduce((acc, r) => acc + parseFloat(r.total_employer_cost || 0), 0);
    const totalNetPay = finalizedList.reduce((acc, r) => acc + parseFloat(r.total_net_pay || 0), 0);
    const totalPf = finalizedList.reduce((acc, r) => acc + parseFloat(r.total_pf || 0), 0);
    const totalEsi = finalizedList.reduce((acc, r) => acc + parseFloat(r.total_esi || 0), 0);

    return res.status(200).json({
      success: true,
      data: {
        totalRuns: totalRuns || 0,
        draftRuns: draftRuns || 0,
        pendingApproval: pendingApproval || 0,
        finalizedRuns: finalizedRuns || 0,
        totalGross,
        totalDeductions,
        totalEmployerCost,
        totalNetPay,
        totalPf,
        totalEsi,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/payroll/runs
 * Fetch all payroll runs
 */
router.get('/runs', async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const { data, error } = await supabaseAdmin
      .from('payroll_runs')
      .select('*, period:payroll_periods(month_year, start_date, end_date, pay_date)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ success: true, data: data || [] });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/payroll/runs
 * Create new payroll run with pre-validation
 */
router.post('/runs', requirePermission('payroll.create'), async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const validated = createPayrollRunSchema.parse(req.body);

    // 1. Get or create payroll period
    const startDate = `${validated.monthYear}-01`;
    const endDate = `${validated.monthYear}-30`;

    let { data: period } = await supabaseAdmin
      .from('payroll_periods')
      .select('*')
      .eq('company_id', companyId)
      .eq('month_year', validated.monthYear)
      .single();

    if (!period) {
      const { data: newPeriod, error: periodErr } = await supabaseAdmin
        .from('payroll_periods')
        .insert({
          company_id: companyId,
          month_year: validated.monthYear,
          start_date: startDate,
          end_date: endDate,
          pay_date: validated.payDate,
          created_by: req.user.id,
        })
        .select()
        .single();
      if (periodErr) throw periodErr;
      period = newPeriod;
    }

    // 2. Pre-payroll validation check
    const validation = await validatePrePayrollRun(companyId, validated.monthYear, validated.branchId, validated.departmentId);

    if (!validation.isReady) {
      return res.status(400).json({
        success: false,
        message: 'Pre-payroll validation failed. Resolve blocking errors before creating payroll run.',
        validation,
      });
    }

    const runNumber = `PR-${validated.monthYear}-${Date.now().toString().slice(-4)}`;

    const { data: run, error: runErr } = await supabaseAdmin
      .from('payroll_runs')
      .insert({
        company_id: companyId,
        payroll_period_id: period.id,
        run_number: runNumber,
        branch_id: validated.branchId || null,
        department_id: validated.departmentId || null,
        status: 'DRAFT',
        created_by: req.user.id,
      })
      .select()
      .single();

    if (runErr) throw runErr;

    await auditService.log({
      user: req.user,
      action: 'PAYROLL_RUN_CREATE',
      entity: 'payroll_runs',
      entityId: run.id,
      newValue: run,
    });

    return res.status(201).json({
      success: true,
      message: 'Payroll run created successfully in DRAFT status',
      data: run,
      validation,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/payroll/runs/:id/process
 * Execute payroll calculation engine for all eligible employees in batch
 */
router.post('/runs/:id/process', requirePermission('payroll.process'), async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const { id } = req.params;

    const { data: run } = await supabaseAdmin
      .from('payroll_runs')
      .select('*, period:payroll_periods(*)')
      .eq('id', id)
      .eq('company_id', companyId)
      .single();

    if (!run || run.status === 'FINALIZED' || run.status === 'LOCKED') {
      return res.status(400).json({ success: false, message: 'Invalid or locked payroll run' });
    }

    // Update status to PROCESSING
    await supabaseAdmin.from('payroll_runs').update({ status: 'PROCESSING' }).eq('id', id);

    // Fetch target active employees
    let query = supabaseAdmin.from('employees').select('id').eq('company_id', companyId).eq('employment_status', 'ACTIVE');
    if (run.branch_id) query = query.eq('branch_id', run.branch_id);
    if (run.department_id) query = query.eq('department_id', run.department_id);

    const { data: emps } = await query;
    const employees = emps || [];

    let totalGross = 0;
    let totalDeductions = 0;
    let totalEmployerCost = 0;
    let totalNetPay = 0;
    let processedCount = 0;

    for (const emp of employees) {
      try {
        const calcRes = await calculateSingleEmployeePayroll({
          companyId,
          employeeId: emp.id,
          startDate: run.period.start_date,
          endDate: run.period.end_date,
          monthYear: run.period.month_year,
        });

        // Insert or update payroll_run_employees
        const { data: runEmp, error: reErr } = await supabaseAdmin
          .from('payroll_run_employees')
          .upsert({
            company_id: companyId,
            payroll_run_id: run.id,
            employee_id: emp.id,
            calendar_days: calcRes.calendarDays,
            working_days: calcRes.workingDays,
            paid_days: calcRes.paidDays,
            lop_days: calcRes.lopDays,
            overtime_hours: calcRes.overtimeHours,
            basic_salary: calcRes.basicSalary,
            gross_earnings: calcRes.grossEarnings,
            total_deductions: calcRes.totalDeductions,
            employer_contributions: calcRes.employerContributions,
            net_salary: calcRes.netSalary,
            status: 'CALCULATED',
            calculation_snapshot: calcRes.calculationSnapshot,
          }, { onConflict: 'payroll_run_id,employee_id' })
          .select()
          .single();

        if (!reErr && runEmp) {
          // Delete existing line items & insert new
          await supabaseAdmin.from('payroll_line_items').delete().eq('payroll_run_employee_id', runEmp.id);
          const lineItems = calcRes.lineItems.map((item) => ({
            ...item,
            company_id: companyId,
            payroll_run_employee_id: runEmp.id,
          }));
          await supabaseAdmin.from('payroll_line_items').insert(lineItems);
        }

        totalGross += calcRes.grossEarnings;
        totalDeductions += calcRes.totalDeductions;
        totalEmployerCost += calcRes.employerContributions;
        totalNetPay += calcRes.netSalary;
        processedCount += 1;
      } catch (err) {
        console.error(`Calculation failed for employee ${emp.id}:`, err);
      }
    }

    // Update payroll_runs totals & status to REVIEW
    const { data: updatedRun } = await supabaseAdmin
      .from('payroll_runs')
      .update({
        total_employees: employees.length,
        processed_employees: processedCount,
        total_gross: Math.round(totalGross * 100) / 100,
        total_deductions: Math.round(totalDeductions * 100) / 100,
        total_employer_cost: Math.round(totalEmployerCost * 100) / 100,
        total_net_pay: Math.round(totalNetPay * 100) / 100,
        status: 'REVIEW',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    await auditService.log({
      user: req.user,
      action: 'PAYROLL_RUN_PROCESS',
      entity: 'payroll_runs',
      entityId: id,
      newValue: updatedRun,
    });

    return res.status(200).json({
      success: true,
      message: `Processed payroll for ${processedCount} employee(s)`,
      data: updatedRun,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/payroll/runs/:id/finalize
 * Lock payroll run permanently and record audit snapshot
 */
router.post('/runs/:id/finalize', requirePermission('payroll.finalize'), async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const { id } = req.params;

    const { data: run } = await supabaseAdmin
      .from('payroll_runs')
      .select('*')
      .eq('id', id)
      .eq('company_id', companyId)
      .single();

    if (!run || run.status === 'FINALIZED') {
      return res.status(400).json({ success: false, message: 'Run already finalized or invalid' });
    }

    const { data: finalized } = await supabaseAdmin
      .from('payroll_runs')
      .update({
        status: 'FINALIZED',
        approved_by: req.user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    // Mark period finalized
    await supabaseAdmin
      .from('payroll_periods')
      .update({
        status: 'FINALIZED',
        finalized_by: req.user.id,
        finalized_at: new Date().toISOString(),
      })
      .eq('id', run.payroll_period_id);

    await auditService.log({
      user: req.user,
      action: 'PAYROLL_RUN_FINALIZE',
      entity: 'payroll_runs',
      entityId: id,
      newValue: finalized,
    });

    return res.status(200).json({ success: true, message: 'Payroll run permanently finalized and locked', data: finalized });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/payroll/me
 * Employee self-service payslip history
 */
router.get('/me', async (req, res, next) => {
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

    const { data: payslips, error } = await supabaseAdmin
      .from('payroll_run_employees')
      .select('*, run:payroll_runs!inner(id, run_number, status, period:payroll_periods(month_year, pay_date))')
      .eq('company_id', companyId)
      .eq('employee_id', employee.id)
      .eq('run.status', 'FINALIZED')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ success: true, data: payslips || [] });
  } catch (error) {
    next(error);
  }
});

export default router;
