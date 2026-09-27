import { z } from 'zod';

export const punchSchema = z.object({
  punchType: z.enum(['CHECK_IN', 'CHECK_OUT', 'BREAK_START', 'BREAK_END']),
  source: z.enum(['WEB', 'MOBILE', 'BIOMETRIC', 'IMPORT', 'ADMIN']).default('WEB'),
  deviceId: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  accuracy: z.number().optional(),
});

export const correctionSchema = z.object({
  date: z.string().min(1, { message: 'Date is required' }),
  requestedCheckIn: z.string().min(1, { message: 'Requested check-in time is required' }),
  requestedCheckOut: z.string().min(1, { message: 'Requested check-out time is required' }),
  reason: z.string().min(5, { message: 'Reason required (minimum 5 characters)' }),
});

export const shiftSchema = z.object({
  name: z.string().min(2, { message: 'Shift name required' }),
  code: z.string().min(2, { message: 'Shift code required' }),
  startTime: z.string().min(1, { message: 'Start time required' }),
  endTime: z.string().min(1, { message: 'End time required' }),
  gracePeriodMins: z.number().default(15),
  minWorkingHours: z.number().default(8.0),
  breakDurationMins: z.number().default(60),
  overtimeThresholdHours: z.number().default(8.0),
  isNightShift: z.boolean().default(false),
  isCrossMidnight: z.boolean().default(false),
});

export const holidaySchema = z.object({
  name: z.string().min(2, { message: 'Holiday name required' }),
  date: z.string().min(1, { message: 'Date required' }),
  type: z.enum(['PUBLIC', 'COMPANY', 'OPTIONAL']).default('PUBLIC'),
  branchId: z.string().nullable().optional(),
  description: z.string().optional(),
});

export const overtimePolicySchema = z.object({
  minOvertimeThresholdMins: z.number().default(30),
  maxDailyOvertimeHours: z.number().default(4.0),
  maxMonthlyOvertimeHours: z.number().default(40.0),
  weekdayRate: z.number().default(1.5),
  weekendRate: z.number().default(2.0),
  holidayRate: z.number().default(2.0),
  requireApproval: z.boolean().default(true),
});

export const wfhRequestSchema = z.object({
  date: z.string().min(1, { message: 'Date required' }),
  reason: z.string().min(5, { message: 'Reason required' }),
});
