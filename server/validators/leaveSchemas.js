import { z } from 'zod';

export const leaveTypeSchema = z.object({
  name: z.string().min(2, { message: 'Leave name is required' }),
  code: z.string().min(2, { message: 'Leave code is required' }),
  description: z.string().optional(),
  category: z.enum(['PAID', 'UNPAID']).default('PAID'),
  annualAllowance: z.number().min(0).default(12.0),
  accrualFrequency: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUAL']).default('MONTHLY'),
  allowCarryForward: z.boolean().default(true),
  maxCarryForward: z.number().min(0).default(5.0),
  allowEncashment: z.boolean().default(false),
  maxEncashment: z.number().min(0).default(0.0),
  allowHalfDay: z.boolean().default(true),
  allowNegativeBalance: z.boolean().default(false),
  maxConsecutiveDays: z.number().min(1).default(10),
  minNoticeDays: z.number().min(0).default(0),
  documentRequired: z.boolean().default(false),
  documentRequiredAfterDays: z.number().min(1).default(3),
  genderEligibility: z.enum(['ALL', 'MALE', 'FEMALE', 'OTHER']).default('ALL'),
  probationEligibility: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

export const leavePolicySchema = z.object({
  name: z.string().min(2, { message: 'Policy name is required' }),
  description: z.string().optional(),
  effectiveFrom: z.string().min(1, { message: 'Effective from date is required' }),
  effectiveTo: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const leaveRequestSchema = z.object({
  leaveTypeId: z.string().uuid({ message: 'Valid leave type ID required' }),
  startDate: z.string().min(1, { message: 'Start date is required' }),
  endDate: z.string().min(1, { message: 'End date is required' }),
  dayType: z.enum(['FULL_DAY', 'FIRST_HALF', 'SECOND_HALF']).default('FULL_DAY'),
  reason: z.string().min(5, { message: 'Reason required (min 5 chars)' }),
  isEmergency: z.boolean().default(false),
  documentUrl: z.string().optional().nullable(),
});

export const leaveAdjustmentSchema = z.object({
  employeeId: z.string().uuid({ message: 'Valid employee ID required' }),
  leaveTypeId: z.string().uuid({ message: 'Valid leave type ID required' }),
  adjustmentDays: z.number({ message: 'Adjustment days numerical value required' }),
  effectiveDate: z.string().optional(),
  reason: z.string().min(5, { message: 'Reason for adjustment required' }),
});

export const leaveEncashmentSchema = z.object({
  leaveTypeId: z.string().uuid({ message: 'Valid leave type ID required' }),
  days: z.number().min(0.5, { message: 'Days must be at least 0.5' }),
});

export const compOffSchema = z.object({
  earnedDate: z.string().min(1, { message: 'Earned date required' }),
  reason: z.string().min(5, { message: 'Reason required' }),
});

export const blackoutPeriodSchema = z.object({
  name: z.string().min(2, { message: 'Blackout period name required' }),
  startDate: z.string().min(1, { message: 'Start date required' }),
  endDate: z.string().min(1, { message: 'End date required' }),
  departmentId: z.string().optional().nullable(),
  branchId: z.string().optional().nullable(),
  reason: z.string().optional(),
});
