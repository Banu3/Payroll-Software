/**
 * attendanceCalculationService.js
 * Centralized backend service for Attendance, Shift, and Overtime Calculations.
 */

import { supabase } from '../config/supabaseClient.js';

/**
 * Parses time string HH:mm (e.g., "09:00", "22:30") and combines with base date YYYY-MM-DD.
 * If addDays > 0, adds days to the base date.
 */
export function combineDateAndTime(dateStr, timeStr, addDays = 0) {
  if (!dateStr || !timeStr) return null;
  const d = new Date(`${dateStr}T${timeStr}:00`);
  if (isNaN(d.getTime())) return null;
  if (addDays > 0) {
    d.setDate(d.getDate() + addDays);
  }
  return d;
}

/**
 * Calculates time difference in fractional hours between two Date objects or ISO strings.
 * Guarantees non-negative result.
 */
export function calculateHoursDiff(start, end) {
  if (!start || !end) return 0;
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  if (isNaN(startTime) || isNaN(endTime) || endTime < startTime) return 0;
  const diffMs = endTime - startTime;
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
}

/**
 * Calculates difference in minutes.
 */
export function calculateMinutesDiff(start, end) {
  if (!start || !end) return 0;
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  if (isNaN(startTime) || isNaN(endTime) || endTime < startTime) return 0;
  return Math.round((endTime - startTime) / (1000 * 60));
}

/**
 * Calculates total break duration in hours from punch history or raw break records.
 * Expects array of punches sorted by timestamp.
 */
export function calculateBreakHours(punches = []) {
  let totalBreakMins = 0;
  let currentBreakStart = null;

  for (const p of punches) {
    if (p.punch_type === 'BREAK_START') {
      currentBreakStart = new Date(p.timestamp);
    } else if (p.punch_type === 'BREAK_END' && currentBreakStart) {
      const breakEnd = new Date(p.timestamp);
      if (breakEnd > currentBreakStart) {
        totalBreakMins += (breakEnd - currentBreakStart) / (1000 * 60);
      }
      currentBreakStart = null;
    }
  }

  return Math.round((totalBreakMins / 60) * 100) / 100;
}

/**
 * Determines whether a date falls on a weekly off for an employee/company.
 * weeklyOffDays: Array of day numbers, e.g. [0, 6] for Sun, Sat. Default 0 (Sun).
 */
export function isWeeklyOff(dateStr, weeklyOffDays = [0]) {
  const d = new Date(`${dateStr}T00:00:00`);
  return weeklyOffDays.includes(d.getDay());
}

/**
 * Central Attendance Calculation Engine
 * Receives:
 * - date (YYYY-MM-DD)
 * - shift object ({ start_time, end_time, grace_period_mins, min_working_hours, overtime_threshold_hours, is_cross_midnight })
 * - checkIn (ISO timestamp string or null)
 * - checkOut (ISO timestamp string or null)
 * - punches (array of raw punches)
 * - isHoliday (boolean)
 * - isLeave (boolean)
 * - isWfh (boolean)
 * - isWeeklyOffDay (boolean)
 */
export function calculateAttendanceRecord({
  date,
  shift,
  checkIn,
  checkOut,
  punches = [],
  isHoliday = false,
  isLeave = false,
  isWfh = false,
  isWeeklyOffDay = false,
}) {
  let scheduledStart = null;
  let scheduledEnd = null;

  if (shift && shift.start_time && shift.end_time) {
    scheduledStart = combineDateAndTime(date, shift.start_time);
    const crossMidnight = shift.is_cross_midnight || shift.end_time < shift.start_time;
    scheduledEnd = combineDateAndTime(date, shift.end_time, crossMidnight ? 1 : 0);
  }

  // Calculate gross hours & breaks
  let grossHours = 0;
  let breakHours = 0;
  let netHours = 0;

  if (checkIn && checkOut) {
    grossHours = calculateHoursDiff(checkIn, checkOut);
    breakHours = calculateBreakHours(punches);
    netHours = Math.max(0, Math.round((grossHours - breakHours) * 100) / 100);
  }

  // Calculate Late & Early exit
  let lateMinutes = 0;
  let earlyExitMinutes = 0;

  if (checkIn && scheduledStart) {
    const graceMs = (shift?.grace_period_mins || 15) * 60 * 1000;
    const allowedCheckIn = new Date(scheduledStart.getTime() + graceMs);
    const actualCheckIn = new Date(checkIn);
    if (actualCheckIn > allowedCheckIn) {
      lateMinutes = calculateMinutesDiff(scheduledStart, actualCheckIn);
    }
  }

  if (checkOut && scheduledEnd) {
    const actualCheckOut = new Date(checkOut);
    if (actualCheckOut < scheduledEnd) {
      earlyExitMinutes = calculateMinutesDiff(actualCheckOut, scheduledEnd);
    }
  }

  // Overtime Calculation
  const overtimeThreshold = shift?.overtime_threshold_hours || 8.0;
  let overtimeHours = 0;
  if (netHours > overtimeThreshold) {
    overtimeHours = Math.round((netHours - overtimeThreshold) * 100) / 100;
  }

  // Status determination logic
  let status = 'ABSENT';

  if (isHoliday) {
    status = netHours > 0 ? 'PRESENT' : 'HOLIDAY';
  } else if (isLeave) {
    status = 'ON_LEAVE';
  } else if (isWfh) {
    status = netHours > 0 ? 'WFH' : 'WFH';
  } else if (isWeeklyOffDay) {
    status = netHours > 0 ? 'PRESENT' : 'WEEKLY_OFF';
  } else if (checkIn && !checkOut) {
    status = 'MISSED_PUNCH';
  } else if (!checkIn && checkOut) {
    status = 'MISSED_PUNCH';
  } else if (checkIn && checkOut) {
    const minHours = shift?.min_working_hours || 4.0;
    if (netHours < minHours) {
      status = 'HALF_DAY';
    } else if (lateMinutes > 0) {
      status = 'LATE';
    } else {
      status = 'PRESENT';
    }
  } else {
    status = 'ABSENT';
  }

  return {
    date,
    scheduled_start: scheduledStart ? scheduledStart.toISOString() : null,
    scheduled_end: scheduledEnd ? scheduledEnd.toISOString() : null,
    actual_check_in: checkIn || null,
    actual_check_out: checkOut || null,
    gross_hours: grossHours,
    break_hours: breakHours,
    net_hours: netHours,
    late_minutes: lateMinutes,
    early_exit_minutes: earlyExitMinutes,
    overtime_hours: overtimeHours,
    status,
  };
}
