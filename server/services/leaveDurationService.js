/**
 * leaveDurationService.js
 * Centralized service for calculating exact leave duration in days.
 * Considers: Start/End dates, Half-Day flag, Part 4 Holidays, Weekly Offs, and Sandwich Leave Policy.
 */

import { supabaseAdmin } from '../config/supabase.js';

export async function calculateLeaveDuration({
  companyId,
  branchId = null,
  startDate,
  endDate,
  dayType = 'FULL_DAY', // 'FULL_DAY' | 'FIRST_HALF' | 'SECOND_HALF'
  enableSandwichPolicy = false,
}) {
  if (dayType === 'FIRST_HALF' || dayType === 'SECOND_HALF') {
    return { chargeableDays: 0.5, totalCalendarDays: 1, excludedHolidays: 0, excludedWeeklyOffs: 0 };
  }

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    return { chargeableDays: 0, totalCalendarDays: 0, excludedHolidays: 0, excludedWeeklyOffs: 0 };
  }

  // Fetch Part 4 Company/Branch Holidays in range
  const { data: holidays } = await supabaseAdmin
    .from('holidays')
    .select('date')
    .eq('company_id', companyId)
    .gte('date', startDate)
    .lte('date', endDate);

  const holidaySet = new Set((holidays || []).map((h) => h.date));

  let totalCalendarDays = 0;
  let excludedHolidays = 0;
  let excludedWeeklyOffs = 0;
  let chargeableDays = 0;

  let current = new Date(start);
  while (current <= end) {
    totalCalendarDays += 1;
    const dateStr = current.toISOString().split('T')[0];
    const dayOfWeek = current.getDay(); // 0 = Sun, 6 = Sat

    const isWeeklyOff = dayOfWeek === 0 || dayOfWeek === 6; // Standard Sun/Sat
    const isHoliday = holidaySet.has(dateStr);

    if (enableSandwichPolicy) {
      // Sandwich policy: Count weekends/holidays if sandwiched between leave days
      chargeableDays += 1;
    } else {
      if (isHoliday) {
        excludedHolidays += 1;
      } else if (isWeeklyOff) {
        excludedWeeklyOffs += 1;
      } else {
        chargeableDays += 1;
      }
    }

    current.setDate(current.getDate() + 1);
  }

  return {
    chargeableDays: Math.max(0.5, chargeableDays),
    totalCalendarDays,
    excludedHolidays,
    excludedWeeklyOffs,
  };
}
