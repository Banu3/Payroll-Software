/**
 * leavePolicyResolver.js
 * Centralized resolution engine for employee leave policies based on deterministic priority:
 * 1. Individual Employee Override (Priority 100)
 * 2. Department / Branch / Designation Policy (Priority 50)
 * 3. Company Default Policy (Priority 10)
 */

import { supabaseAdmin } from '../config/supabase.js';

export async function resolveEmployeeLeavePolicy(companyId, employeeId) {
  // Fetch employee details
  const { data: employee } = await supabaseAdmin
    .from('employees')
    .select('id, department_id, branch_id, designation_id, employment_status, is_on_probation')
    .eq('id', employeeId)
    .eq('company_id', companyId)
    .single();

  if (!employee) return [];

  // Query policy assignments ordered by priority desc
  const { data: assignments, error } = await supabaseAdmin
    .from('leave_policy_assignments')
    .select('*, leave_type:leave_types(*)')
    .eq('company_id', companyId)
    .order('priority', { ascending: false });

  if (error || !assignments) return [];

  const effectiveTypesMap = new Map();

  for (const assign of assignments) {
    const leaveTypeId = assign.leave_type_id;

    // Skip if we already resolved a higher-priority policy for this leave type
    if (effectiveTypesMap.has(leaveTypeId)) continue;

    let matches = false;
    if (assign.employee_id && assign.employee_id === employee.id) {
      matches = true;
    } else if (assign.department_id && assign.department_id === employee.department_id) {
      matches = true;
    } else if (assign.branch_id && assign.branch_id === employee.branch_id) {
      matches = true;
    } else if (!assign.employee_id && !assign.department_id && !assign.branch_id) {
      matches = true; // Company fallback
    }

    if (matches && assign.leave_type && assign.leave_type.is_active) {
      effectiveTypesMap.set(leaveTypeId, {
        ...assign.leave_type,
        allowance_days: assign.allowance_days || assign.leave_type.annual_allowance,
      });
    }
  }

  return Array.from(effectiveTypesMap.values());
}
