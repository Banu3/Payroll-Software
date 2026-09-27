/**
 * overtimeCalculationService.js
 * Calculates overtime hours, policy rates, and estimated value based on configurable company policies.
 */

import { supabase } from '../config/supabaseClient.js';

export function calculateOvertimePay({
  overtimeHours,
  hourlyRate = 0,
  dayType = 'WEEKDAY', // 'WEEKDAY' | 'WEEKEND' | 'HOLIDAY'
  policy = {
    weekday_rate: 1.5,
    weekend_rate: 2.0,
    holiday_rate: 2.0,
    min_overtime_threshold_mins: 30,
    max_daily_overtime_hours: 4.0,
  },
}) {
  if (!overtimeHours || overtimeHours <= 0) {
    return { overtimeHours: 0, effectiveRate: 1.0, estimatedValue: 0 };
  }

  // Check min threshold
  const overtimeMins = overtimeHours * 60;
  if (overtimeMins < (policy.min_overtime_threshold_mins || 30)) {
    return { overtimeHours: 0, effectiveRate: 1.0, estimatedValue: 0 };
  }

  // Cap daily overtime
  const cappedHours = Math.min(
    overtimeHours,
    policy.max_daily_overtime_hours || 4.0
  );

  let multiplier = policy.weekday_rate || 1.5;
  if (dayType === 'WEEKEND') {
    multiplier = policy.weekend_rate || 2.0;
  } else if (dayType === 'HOLIDAY') {
    multiplier = policy.holiday_rate || 2.0;
  }

  const estimatedValue = Math.round(cappedHours * hourlyRate * multiplier * 100) / 100;

  return {
    overtimeHours: cappedHours,
    effectiveRate: multiplier,
    estimatedValue,
  };
}

export async function getCompanyOvertimePolicy(companyId) {
  const { data, error } = await supabase
    .from('overtime_policies')
    .select('*')
    .eq('company_id', companyId)
    .single();

  if (error || !data) {
    // Return standard fallback policy
    return {
      min_overtime_threshold_mins: 30,
      max_daily_overtime_hours: 4.0,
      max_monthly_overtime_hours: 40.0,
      weekday_rate: 1.5,
      weekend_rate: 2.0,
      holiday_rate: 2.0,
      require_approval: true,
    };
  }

  return data;
}
