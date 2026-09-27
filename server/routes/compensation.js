import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission, enforceTenantIsolation } from '../middleware/authorize.js';
import { supabaseAdmin } from '../config/supabase.js';
import { auditService } from '../services/auditService.js';
import {
  calculateCompensationBreakdown,
  evaluateSafeFormula,
} from '../services/compensationCalculationService.js';
import { calculateProratedSalary } from '../services/salaryProrationService.js';
import { getPayrollCompensation } from '../services/compensationPayrollService.js';
import {
  salaryComponentSchema,
  salaryStructureSchema,
  assignCompensationSchema,
  salaryRevisionSchema,
  statutoryConfigSchema,
  taxDeclarationSchema,
  reimbursementSchema,
} from '../validators/compensationSchemas.js';

const router = express.Router();

router.use(authenticateToken);
router.use(enforceTenantIsolation);

/**
 * GET /api/compensation/dashboard
 * Real database data for Compensation Dashboard KPIs & Recharts analytics
 */
router.get('/dashboard', async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;

    const { count: totalEmployees } = await supabaseAdmin
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('employment_status', 'ACTIVE');

    const { data: activeComps } = await supabaseAdmin
      .from('employee_compensation')
      .select('annual_ctc, monthly_ctc, monthly_gross, total_deductions, employer_contributions, employee_id')
      .eq('company_id', companyId)
      .eq('status', 'ACTIVE');

    const comps = activeComps || [];
    const employeesWithStructure = comps.length;
    const employeesWithoutStructure = Math.max(0, (totalEmployees || 0) - employeesWithStructure);

    const totalAnnualCtc = comps.reduce((acc, c) => acc + parseFloat(c.annual_ctc || 0), 0);
    const totalMonthlyCtc = comps.reduce((acc, c) => acc + parseFloat(c.monthly_ctc || 0), 0);
    const totalMonthlyGross = comps.reduce((acc, c) => acc + parseFloat(c.monthly_gross || 0), 0);
    const totalEmployeeDeductions = comps.reduce((acc, c) => acc + parseFloat(c.total_deductions || 0), 0);
    const totalEmployerContributions = comps.reduce((acc, c) => acc + parseFloat(c.employer_contributions || 0), 0);

    const { count: pendingRevisions } = await supabaseAdmin
      .from('salary_revisions')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .eq('status', 'PENDING_APPROVAL');

    return res.status(200).json({
      success: true,
      data: {
        totalEmployees: totalEmployees || 0,
        employeesWithStructure,
        employeesWithoutStructure,
        totalAnnualCtc,
        totalMonthlyCtc,
        totalMonthlyGross,
        totalEmployeeDeductions,
        totalEmployerContributions,
        pendingRevisions: pendingRevisions || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/compensation/components
 * POST /api/compensation/components
 */
router.get('/components', async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const { data, error } = await supabaseAdmin
      .from('salary_components')
      .select('*')
      .eq('company_id', companyId)
      .order('type', { ascending: true });

    if (error) throw error;
    return res.status(200).json({ success: true, data: data || [] });
  } catch (error) {
    next(error);
  }
});

router.post('/components', requirePermission('compensation.manage_components'), async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const validated = salaryComponentSchema.parse(req.body);

    const { data, error } = await supabaseAdmin
      .from('salary_components')
      .insert({
        company_id: companyId,
        name: validated.name,
        code: validated.code,
        type: validated.type,
        category: validated.category,
        calculation_method: validated.calculationMethod,
        value: validated.value,
        percentage: validated.percentage,
        base_component_id: validated.baseComponentId || null,
        frequency: validated.frequency,
        is_taxable: validated.isTaxable,
        is_statutory: validated.isStatutory,
        is_active: validated.isActive,
        description: validated.description || null,
      })
      .select()
      .single();

    if (error) throw error;

    await auditService.log({
      user: req.user,
      action: 'SALARY_COMPONENT_CREATE',
      entity: 'salary_components',
      entityId: data.id,
      newValue: data,
    });

    return res.status(201).json({ success: true, message: 'Salary component created', data });
  } catch (error) {
    next(error);
  }
});

/**
 * SALARY STRUCTURES
 * GET /api/compensation/structures
 * POST /api/compensation/structures
 */
router.get('/structures', async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const { data, error } = await supabaseAdmin
      .from('salary_structures')
      .select('*, branch:branches(name), department:departments(name)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ success: true, data: data || [] });
  } catch (error) {
    next(error);
  }
});

router.post('/structures', requirePermission('compensation.manage_structures'), async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const validated = salaryStructureSchema.parse(req.body);

    const { data: structure, error: structErr } = await supabaseAdmin
      .from('salary_structures')
      .insert({
        company_id: companyId,
        name: validated.name,
        code: validated.code,
        description: validated.description || null,
        effective_from: validated.effectiveFrom,
        status: validated.status,
        branch_id: validated.branchId || null,
        department_id: validated.departmentId || null,
        designation_id: validated.designationId || null,
      })
      .select()
      .single();

    if (structErr) throw structErr;

    const structComponents = validated.components.map((c) => ({
      company_id: companyId,
      structure_id: structure.id,
      component_id: c.componentId,
      calculation_method: c.calculationMethod,
      value: c.value,
      percentage: c.percentage,
      formula: c.formula || null,
      sequence_order: c.sequenceOrder,
    }));

    await supabaseAdmin.from('salary_structure_components').insert(structComponents);

    await auditService.log({
      user: req.user,
      action: 'SALARY_STRUCTURE_CREATE',
      entity: 'salary_structures',
      entityId: structure.id,
      newValue: structure,
    });

    return res.status(201).json({ success: true, message: 'Salary structure created', data: structure });
  } catch (error) {
    next(error);
  }
});

/**
 * ASSIGN SALARY STRUCTURE TO EMPLOYEE
 * POST /api/compensation/employees/:employeeId/assign
 */
router.post('/employees/:employeeId/assign', requirePermission('compensation.assign'), async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const { employeeId } = req.params;
    const validated = assignCompensationSchema.parse({ ...req.body, employeeId });

    // Fetch Statutory Configs
    const { data: pfConfig } = await supabaseAdmin
      .from('pf_configurations')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .single();

    const { data: esiConfig } = await supabaseAdmin
      .from('esi_configurations')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .single();

    const breakdown = calculateCompensationBreakdown({
      annualCtc: validated.annualCtc,
      pfConfig: pfConfig ? { is_enabled: pfConfig.is_enabled, employee_pct: pfConfig.employee_contribution_pct, employer_pct: pfConfig.employer_contribution_pct, wage_ceiling: pfConfig.wage_ceiling } : undefined,
      esiConfig: esiConfig ? { is_enabled: esiConfig.is_enabled, employee_pct: esiConfig.employee_contribution_pct, employer_pct: esiConfig.employer_contribution_pct, threshold: esiConfig.eligibility_wage_threshold } : undefined,
    });

    // Supersede previous active compensation
    await supabaseAdmin
      .from('employee_compensation')
      .update({ status: 'SUPERSEDED', effective_to: validated.effectiveFrom })
      .eq('company_id', companyId)
      .eq('employee_id', employeeId)
      .eq('status', 'ACTIVE');

    // Create New Active Assignment
    const { data: newComp, error: compErr } = await supabaseAdmin
      .from('employee_compensation')
      .insert({
        company_id: companyId,
        employee_id: employeeId,
        structure_id: validated.structureId || null,
        annual_ctc: breakdown.annualCtc,
        monthly_ctc: breakdown.monthlyCtc,
        monthly_gross: breakdown.monthlyGross,
        basic_salary: breakdown.basicSalary,
        total_deductions: breakdown.totalDeductions,
        employer_contributions: breakdown.employerContributions,
        estimated_net_salary: breakdown.estimatedNetSalary,
        effective_from: validated.effectiveFrom,
        status: 'ACTIVE',
      })
      .select()
      .single();

    if (compErr) throw compErr;

    // Record immutable history
    await supabaseAdmin.from('compensation_history').insert({
      company_id: companyId,
      employee_id: employeeId,
      previous_ctc: 0,
      new_ctc: breakdown.annualCtc,
      previous_gross: 0,
      new_gross: breakdown.monthlyGross,
      effective_date: validated.effectiveFrom,
      revision_type: 'STRUCTURE_ASSIGNMENT',
      reason: 'Initial or updated salary structure assignment',
      approved_by: req.user.id,
    });

    await auditService.log({
      user: req.user,
      action: 'SALARY_ASSIGNMENT',
      entity: 'employee_compensation',
      entityId: newComp.id,
      newValue: newComp,
    });

    return res.status(200).json({ success: true, message: 'Salary assigned successfully', data: newComp });
  } catch (error) {
    next(error);
  }
});

/**
 * SALARY REVISIONS WORKFLOW
 * GET /api/compensation/revisions
 * POST /api/compensation/revisions
 * POST /api/compensation/revisions/:id/approve
 */
router.get('/revisions', async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const { data, error } = await supabaseAdmin
      .from('salary_revisions')
      .select('*, employee:employees(first_name, last_name, employee_id, department:departments(name))')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ success: true, data: data || [] });
  } catch (error) {
    next(error);
  }
});

router.post('/revisions', requirePermission('compensation.revise'), async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const validated = salaryRevisionSchema.parse(req.body);

    const { data: currentComp } = await supabaseAdmin
      .from('employee_compensation')
      .select('*')
      .eq('company_id', companyId)
      .eq('employee_id', validated.employeeId)
      .eq('status', 'ACTIVE')
      .single();

    const currentCtc = currentComp?.annual_ctc || 0;
    const currentGross = currentComp?.monthly_gross || 0;
    const pctIncrease = currentCtc > 0 ? Math.round(((validated.proposedCtc - currentCtc) / currentCtc) * 10000) / 100 : 0;

    const breakdown = calculateCompensationBreakdown({ annualCtc: validated.proposedCtc });

    const { data: revision, error } = await supabaseAdmin
      .from('salary_revisions')
      .insert({
        company_id: companyId,
        employee_id: validated.employeeId,
        current_compensation_id: currentComp?.id || null,
        current_ctc: currentCtc,
        proposed_ctc: validated.proposedCtc,
        current_gross: currentGross,
        proposed_gross: breakdown.monthlyGross,
        percentage_increase: pctIncrease,
        effective_date: validated.effectiveDate,
        revision_type: validated.revisionType,
        reason: validated.reason,
        comments: validated.comments || null,
        status: 'PENDING_APPROVAL',
        requested_by: req.user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, message: 'Salary revision submitted for approval', data: revision });
  } catch (error) {
    next(error);
  }
});

router.post('/revisions/:id/approve', requirePermission('compensation.approve'), async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const { id } = req.params;

    const { data: rev } = await supabaseAdmin
      .from('salary_revisions')
      .select('*')
      .eq('id', id)
      .eq('company_id', companyId)
      .single();

    if (!rev || rev.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({ success: false, message: 'Invalid revision request or already processed' });
    }

    const breakdown = calculateCompensationBreakdown({ annualCtc: rev.proposed_ctc });

    // Supersede current
    await supabaseAdmin
      .from('employee_compensation')
      .update({ status: 'SUPERSEDED', effective_to: rev.effective_date })
      .eq('company_id', companyId)
      .eq('employee_id', rev.employee_id)
      .eq('status', 'ACTIVE');

    // Insert new compensation
    const { data: newComp } = await supabaseAdmin
      .from('employee_compensation')
      .insert({
        company_id: companyId,
        employee_id: rev.employee_id,
        annual_ctc: breakdown.annualCtc,
        monthly_ctc: breakdown.monthlyCtc,
        monthly_gross: breakdown.monthlyGross,
        basic_salary: breakdown.basicSalary,
        total_deductions: breakdown.totalDeductions,
        employer_contributions: breakdown.employerContributions,
        estimated_net_salary: breakdown.estimatedNetSalary,
        effective_from: rev.effective_date,
        status: 'ACTIVE',
      })
      .select()
      .single();

    // Mark Revision Approved
    await supabaseAdmin
      .from('salary_revisions')
      .update({
        status: 'APPROVED',
        approved_by: req.user.id,
        approval_date: new Date().toISOString(),
      })
      .eq('id', id);

    // Record Immutable History
    await supabaseAdmin.from('compensation_history').insert({
      company_id: companyId,
      employee_id: rev.employee_id,
      previous_ctc: rev.current_ctc,
      new_ctc: rev.proposed_ctc,
      previous_gross: rev.current_gross,
      new_gross: breakdown.monthlyGross,
      effective_date: rev.effective_date,
      revision_type: rev.revision_type,
      reason: rev.reason,
      approved_by: req.user.id,
    });

    return res.status(200).json({ success: true, message: 'Salary revision approved and applied', data: newComp });
  } catch (error) {
    next(error);
  }
});

/**
 * STATUTORY CONFIGURATIONS
 * GET /api/compensation/statutory
 * PUT /api/compensation/statutory
 */
router.get('/statutory', async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;

    const { data: pf } = await supabaseAdmin.from('pf_configurations').select('*').eq('company_id', companyId).eq('is_active', true).single();
    const { data: esi } = await supabaseAdmin.from('esi_configurations').select('*').eq('company_id', companyId).eq('is_active', true).single();
    const { data: pt } = await supabaseAdmin.from('professional_tax_configurations').select('*').eq('company_id', companyId).eq('is_active', true);

    return res.status(200).json({
      success: true,
      data: {
        pf: pf || { is_enabled: true, employee_contribution_pct: 12.0, employer_contribution_pct: 12.0, wage_ceiling: 15000 },
        esi: esi || { is_enabled: true, employee_contribution_pct: 0.75, employer_contribution_pct: 3.25, eligibility_wage_threshold: 21000 },
        pt: pt || [],
      },
    });
  } catch (error) {
    next(error);
  }
});

router.put('/statutory', requirePermission('compensation.manage_statutory'), async (req, res, next) => {
  try {
    const companyId = req.targetCompanyId;
    const { pf, esi } = req.body;

    if (pf) {
      await supabaseAdmin.from('pf_configurations').upsert({
        company_id: companyId,
        is_enabled: pf.is_enabled,
        employee_contribution_pct: pf.employee_contribution_pct,
        employer_contribution_pct: pf.employer_contribution_pct,
        wage_ceiling: pf.wage_ceiling,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'company_id' });
    }

    if (esi) {
      await supabaseAdmin.from('esi_configurations').upsert({
        company_id: companyId,
        is_enabled: esi.is_enabled,
        employee_contribution_pct: esi.employee_contribution_pct,
        employer_contribution_pct: esi.employer_contribution_pct,
        eligibility_wage_threshold: esi.eligibility_wage_threshold,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'company_id' });
    }

    return res.status(200).json({ success: true, message: 'Statutory rules updated successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * SALARY CALCULATOR (PREVIEW ONLY)
 * POST /api/compensation/calculator
 */
router.post('/calculator', async (req, res, next) => {
  try {
    const { annualCtc } = req.body;
    const result = calculateCompensationBreakdown({ annualCtc: parseFloat(annualCtc || 0) });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * EMPLOYEE SELF-SERVICE COMPENSATION
 * GET /api/compensation/me
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

    const { data: comp } = await supabaseAdmin
      .from('employee_compensation')
      .select('*, structure:salary_structures(name)')
      .eq('company_id', companyId)
      .eq('employee_id', employee.id)
      .eq('status', 'ACTIVE')
      .single();

    const { data: history } = await supabaseAdmin
      .from('compensation_history')
      .select('*')
      .eq('company_id', companyId)
      .eq('employee_id', employee.id)
      .order('effective_date', { ascending: false });

    return res.status(200).json({
      success: true,
      data: {
        compensation: comp || null,
        history: history || [],
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
