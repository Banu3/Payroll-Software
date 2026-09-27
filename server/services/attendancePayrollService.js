/**
 * attendancePayrollService.js
 * Exposes getPayrollAttendanceSummary for consumption by the Payroll Processing Engine.
 * Summarizes working days, present days, absent days, paid/unpaid leave, half days, late minutes, overtime hours, etc.
 * DO NOT calculate salary here.
 */

import { supabase } from '../config/supabaseClient.js';

export async function getPayrollAttendanceSummary(companyId, employeeId, startDate, endDate) {
  // Query attendance records in the period range
  let query = supabase
    .from('attendance')
    .select('*')
    .eq('company_id', companyId)
    .gte('date', startDate)
    .lte('date', endDate);

  if (employeeId) {
    query = query.eq('employee_id', employeeId);
  }

  const { data: records, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch payroll attendance summary: ${error.message}`);
  }

  const summary = {
    totalRecords: records.length,
    workingDays: 0,
    presentDays: 0,
    absentDays: 0,
    paidLeaveDays: 0,
    unpaidLeaveDays: 0,
    halfDays: 0,
    lateCount: 0,
    totalLateMinutes: 0,
    wfhDays: 0,
    overtimeHours: 0,
    holidayWorkDays: 0,
    weeklyOffWorkDays: 0,
  };

  records.forEach((rec) => {
    if (rec.status !== 'WEEKLY_OFF' && rec.status !== 'HOLIDAY') {
      summary.workingDays += 1;
    }

    if (rec.status === 'PRESENT') {
      summary.presentDays += 1;
    } else if (rec.status === 'ABSENT') {
      summary.absentDays += 1;
    } else if (rec.status === 'LATE') {
      summary.presentDays += 1;
      summary.lateCount += 1;
      summary.totalLateMinutes += rec.late_minutes || 0;
    } else if (rec.status === 'HALF_DAY') {
      summary.halfDays += 1;
      summary.presentDays += 0.5;
    } else if (rec.status === 'ON_LEAVE') {
      summary.paidLeaveDays += 1;
    } else if (rec.status === 'WFH') {
      summary.wfhDays += 1;
      summary.presentDays += 1;
    }

    if (rec.overtime_hours > 0) {
      summary.overtimeHours += rec.overtime_hours;
    }

    if (rec.status === 'PRESENT' && rec.is_holiday) {
      summary.holidayWorkDays += 1;
    }

    if (rec.status === 'PRESENT' && rec.is_weekly_off) {
      summary.weeklyOffWorkDays += 1;
    }
  });

  summary.overtimeHours = Math.round(summary.overtimeHours * 100) / 100;

  return summary;
}
