import { z } from 'zod';

export const createPayrollRunSchema = z.object({
  monthYear: z.string().min(6, { message: 'Month year required (e.g. 2026-09)' }),
  payDate: z.string().min(1, { message: 'Pay date is required' }),
  branchId: z.string().uuid().optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),
});

export const payrollAdjustmentSchema = z.object({
  employeeId: z.string().uuid({ message: 'Valid employee ID required' }),
  type: z.enum(['ARREARS', 'RECOVERY', 'BONUS_ADJUSTMENT', 'DEDUCTION_ADJUSTMENT', 'OVERTIME_CORRECTION', 'TAX_ADJUSTMENT']),
  amount: z.number({ message: 'Numerical adjustment amount required' }),
  reason: z.string().min(5, { message: 'Reason required (min 5 chars)' }),
});

export const payrollApprovalSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  comments: z.string().optional(),
});
