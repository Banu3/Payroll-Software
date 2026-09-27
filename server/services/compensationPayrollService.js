/**
 * compensationPayrollService.js
 * Final Payroll-Ready Data Contract Service for Part 7 Payroll Engine.
 * Exposes getPayrollCompensation(companyId, employeeId, payrollPeriod) and statutory config getters.
 */

import { supabaseAdmin } from '../config/supabase.js';

export async function getPayrollCompensation(companyId, employeeId, payrollPeriod) {
  // 1. Fetch Active Employee Compensation
  const { data: compRecord, error: compErr } = await supabaseAdmin
    .from('employee_compensation')
    .select('*, structure:salary_structures(*)')
    .eq('company_id', companyId)
    .eq('employee_id', employeeId)
    .eq('status', 'ACTIVE')
    .single();

  if (compErr || !compRecord) {
    throw new Error(`Active salary compensation record not found for employee ID: ${employeeId}`);
  }

  // 2. Fetch Compensation Breakdown Components
  const { data: compComponents } = await supabaseAdmin
    .from('employee_compensation_components')
    .select('*, component:salary_components(*)')
    .eq('employee_compensation_id', compRecord.id);

  // 3. Fetch Statutory Configurations
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

  const { data: ptConfigs } = await supabaseAdmin
    .from('professional_tax_configurations')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true);

  // 4. Fetch Tax Declaration
  const { data: taxDecl } = await supabaseAdmin
    .from('employee_tax_declarations')
    .select('*')
    .eq('company_id', companyId)
    .eq('employee_id', employeeId)
    .single();

  // 5. Fetch Approved Reimbursements
  const { data: reimbursements } = await supabaseAdmin
    .from('employee_reimbursements')
    .select('*')
    .eq('company_id', companyId)
    .eq('employee_id', employeeId)
    .eq('status', 'APPROVED');

  // 6. Fetch Active Loan EMIs
  const { data: loans } = await supabaseAdmin
    .from('loan_payroll_deductions')
    .select('*')
    .eq('company_id', companyId)
    .eq('employee_id', employeeId)
    .eq('status', 'ACTIVE');

  return {
    employeeCompensation: compRecord,
    salaryStructure: compRecord.structure,
    effectiveComponents: compComponents || [],
    annualCTC: compRecord.annual_ctc,
    monthlyCTC: compRecord.monthly_ctc,
    grossEarnings: compRecord.monthly_gross,
    basicSalary: compRecord.basic_salary,
    employeeDeductions: compRecord.total_deductions,
    employerContributions: compRecord.employer_contributions,
    estimatedNetSalary: compRecord.estimated_net_salary,
    statutoryConfiguration: {
      pf: pfConfig || { is_enabled: true, employee_contribution_pct: 12.0, employer_contribution_pct: 12.0, wage_ceiling: 15000 },
      esi: esiConfig || { is_enabled: true, employee_contribution_pct: 0.75, employer_contribution_pct: 3.25, eligibility_wage_threshold: 21000 },
      pt: ptConfigs || [],
    },
    taxConfiguration: taxDecl || { regime: 'NEW', declared_80c: 0, declared_80d: 0 },
    payrollEligibleReimbursements: reimbursements || [],
    payrollEligibleLoans: loans || [],
  };
}

export async function getEffectiveSalaryStructure(companyId, structureId) {
  const { data } = await supabaseAdmin
    .from('salary_structures')
    .select('*, components:salary_structure_components(*, component:salary_components(*))')
    .eq('company_id', companyId)
    .eq('id', structureId)
    .single();
  return data;
}
