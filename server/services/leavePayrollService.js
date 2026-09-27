/**
 * leavePayrollService.js
 * Exposes getPayrollLeaveSummary for consumption by the Payroll Processing Engine.
 * Summarizes Paid Leave Days, Unpaid Leave Days (LOP), Encashment Days, and Comp-Off Used.
 * DO NOT calculate salary here.
 */

import { supabaseAdmin } from '../config/supabase.js';

export async function getPayrollLeaveSummary(companyId, employeeId, startDate, endDate) {
  let query = supabaseAdmin
    .from('leave_requests')
    .select('*, leave_type:leave_types(category, code)')
    .eq('company_id', companyId)
    .eq('status', 'APPROVED')
    .gte('start_date', startDate)
    .lte('end_date', endDate);

  if (employeeId) {
    query = query.eq('employee_id', employeeId);
  }

  const { data: approvedRequests, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch payroll leave summary: ${error.message}`);
  }

  const summary = {
    paidLeaveDays: 0,
    unpaidLeaveDays: 0,
    lopDays: 0,
    halfDayLop: 0,
    encashmentDays: 0,
    compOffUsed: 0,
  };

  (approvedRequests || []).forEach((req) => {
    const isUnpaid = req.leave_type?.category === 'UNPAID';
    const isCompOff = req.leave_type?.code === 'COMP_OFF';

    if (isUnpaid) {
      summary.unpaidLeaveDays += parseFloat(req.duration || 0);
      summary.lopDays += parseFloat(req.duration || 0);
      if (req.day_type !== 'FULL_DAY') {
        summary.halfDayLop += 1;
      }
    } else {
      summary.paidLeaveDays += parseFloat(req.duration || 0);
    }

    if (isCompOff) {
      summary.compOffUsed += parseFloat(req.duration || 0);
    }
  });

  // Fetch approved encashments in range
  let encashQuery = supabaseAdmin
    .from('leave_encashments')
    .select('days')
    .eq('company_id', companyId)
    .eq('status', 'APPROVED')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  if (employeeId) {
    encashQuery = encashQuery.eq('employee_id', employeeId);
  }

  const { data: encashments } = await encashQuery;

  (encashments || []).forEach((enc) => {
    summary.encashmentDays += parseFloat(enc.days || 0);
  });

  return summary;
}
