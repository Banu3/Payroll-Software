/**
 * leaveValidationService.js
 * Centralized Leave Validation Engine.
 * Enforces balance limits, overlap checks, notice days, probation rules, blackout periods, and document requirements.
 */

import { supabaseAdmin } from '../config/supabase.js';
import { getOrCreateLeaveBalance } from './leaveLedgerService.js';

export async function validateLeaveRequest({
  companyId,
  employeeId,
  leaveTypeId,
  startDate,
  endDate,
  requestedDays,
  isEmergency = false,
  documentUrl = null,
}) {
  const errors = [];

  // 1. Fetch Employee Profile
  const { data: employee } = await supabaseAdmin
    .from('employees')
    .select('*, department_id, branch_id')
    .eq('id', employeeId)
    .eq('company_id', companyId)
    .single();

  if (!employee) {
    return { isValid: false, errors: ['Employee record not found'] };
  }

  // 2. Fetch Leave Type Definition
  const { data: leaveType } = await supabaseAdmin
    .from('leave_types')
    .select('*')
    .eq('id', leaveTypeId)
    .eq('company_id', companyId)
    .single();

  if (!leaveType || !leaveType.is_active) {
    return { isValid: false, errors: ['Leave type is inactive or invalid'] };
  }

  // 3. Probation Eligibility Check
  if (employee.is_on_probation && !leaveType.probation_eligibility) {
    errors.push(`Leave type [${leaveType.name}] is not permitted during probation period`);
  }

  // 4. Balance Check
  if (leaveType.category === 'PAID' && !leaveType.allow_negative_balance) {
    const balanceRecord = await getOrCreateLeaveBalance(companyId, employeeId, leaveTypeId);
    const available = parseFloat(balanceRecord.available || 0);

    if (requestedDays > available) {
      errors.push(`Insufficient leave balance. Available: ${available} day(s), Requested: ${requestedDays} day(s)`);
    }
  }

  // 5. Document Requirement Check
  if (leaveType.document_required || (requestedDays >= (leaveType.document_required_after_days || 3))) {
    if (!documentUrl && !isEmergency) {
      errors.push(`Supporting document/medical certificate is required for requests exceeding ${leaveType.document_required_after_days || 3} day(s)`);
    }
  }

  // 6. Overlapping Leave Request Check
  const { data: overlapping } = await supabaseAdmin
    .from('leave_requests')
    .select('id, start_date, end_date, status')
    .eq('company_id', companyId)
    .eq('employee_id', employeeId)
    .in('status', ['PENDING', 'MANAGER_APPROVED', 'HR_APPROVED', 'APPROVED'])
    .lte('start_date', endDate)
    .gte('end_date', startDate);

  if (overlapping && overlapping.length > 0) {
    errors.push(`You already have an existing ${overlapping[0].status.toLowerCase()} leave request overlapping ${startDate} to ${endDate}`);
  }

  // 7. Blackout Periods Check
  const { data: blackouts } = await supabaseAdmin
    .from('leave_blackout_periods')
    .select('name, start_date, end_date')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .lte('start_date', endDate)
    .gte('end_date', startDate);

  if (blackouts && blackouts.length > 0 && !isEmergency) {
    errors.push(`Leave request conflicts with company blackout period: ${blackouts[0].name} (${blackouts[0].start_date} to ${blackouts[0].end_date})`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    leaveType,
    employee,
  };
}
