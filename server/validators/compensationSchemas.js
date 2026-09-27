import { z } from 'zod';

export const salaryComponentSchema = z.object({
  name: z.string().min(2, { message: 'Component name is required' }),
  code: z.string().min(2, { message: 'Component code is required' }),
  type: z.enum(['EARNING', 'DEDUCTION', 'EMPLOYER_CONTRIBUTION', 'REIMBURSEMENT', 'BENEFIT']),
  category: z.enum(['BASIC', 'ALLOWANCE', 'STATUTORY', 'TAX', 'REIMBURSEMENT', 'LOAN_DEDUCTION']).default('ALLOWANCE'),
  calculationMethod: z.enum(['FIXED_AMOUNT', 'PERCENTAGE_OF_BASIC', 'PERCENTAGE_OF_GROSS', 'PERCENTAGE_OF_CTC', 'PERCENTAGE_OF_COMPONENT', 'FORMULA']).default('FIXED_AMOUNT'),
  value: z.number().min(0).default(0.0),
  percentage: z.number().min(0).max(100).default(0.0),
  baseComponentId: z.string().uuid().optional().nullable(),
  frequency: z.enum(['MONTHLY', 'ANNUAL', 'ONE_TIME']).default('MONTHLY'),
  isTaxable: z.boolean().default(true),
  isStatutory: z.boolean().default(false),
  isActive: z.boolean().default(true),
  description: z.string().optional(),
});

export const salaryStructureSchema = z.object({
  name: z.string().min(2, { message: 'Structure name is required' }),
  code: z.string().min(2, { message: 'Structure code is required' }),
  description: z.string().optional(),
  effectiveFrom: z.string().min(1, { message: 'Effective date is required' }),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED']).default('ACTIVE'),
  branchId: z.string().uuid().optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),
  designationId: z.string().uuid().optional().nullable(),
  components: z.array(z.object({
    componentId: z.string().uuid(),
    calculationMethod: z.string(),
    value: z.number().default(0),
    percentage: z.number().default(0),
    formula: z.string().optional(),
    sequenceOrder: z.number().default(1),
  })).min(1, { message: 'At least one salary component required' }),
});

export const assignCompensationSchema = z.object({
  employeeId: z.string().uuid({ message: 'Valid employee ID required' }),
  structureId: z.string().uuid().optional().nullable(),
  annualCtc: z.number().min(1, { message: 'Annual CTC must be greater than 0' }),
  effectiveFrom: z.string().min(1, { message: 'Effective date is required' }),
});

export const salaryRevisionSchema = z.object({
  employeeId: z.string().uuid({ message: 'Valid employee ID required' }),
  proposedCtc: z.number().min(1, { message: 'Proposed CTC is required' }),
  effectiveDate: z.string().min(1, { message: 'Effective date is required' }),
  revisionType: z.enum([
    'ANNUAL_INCREMENT', 'PROMOTION', 'PERFORMANCE_REVISION', 'MARKET_ADJUSTMENT', 'PROBATION_COMPLETION', 'JOINING_REVISION', 'CORRECTION', 'TRANSFER', 'SPECIAL_REVISION'
  ]),
  reason: z.string().min(5, { message: 'Reason for revision required' }),
  comments: z.string().optional(),
});

export const statutoryConfigSchema = z.object({
  pfEnabled: z.boolean().default(true),
  pfEmployeePct: z.number().default(12.0),
  pfEmployerPct: z.number().default(12.0),
  pfWageCeiling: z.number().default(15000.0),
  esiEnabled: z.boolean().default(true),
  esiEmployeePct: z.number().default(0.75),
  esiEmployerPct: z.number().default(3.25),
  esiThreshold: z.number().default(21000.0),
});

export const taxDeclarationSchema = z.object({
  financialYear: z.string().default('2026-2027'),
  regime: z.enum(['OLD', 'NEW']).default('NEW'),
  declared80c: z.number().min(0).default(0),
  declared80d: z.number().min(0).default(0),
  hraRentPaid: z.number().min(0).default(0),
  otherExemptions: z.number().min(0).default(0),
});

export const reimbursementSchema = z.object({
  employeeId: z.string().uuid(),
  type: z.enum(['TRAVEL', 'MEDICAL', 'FOOD', 'COMMUNICATION', 'OTHER']),
  amount: z.number().min(1),
  description: z.string().optional(),
  effectiveDate: z.string().optional(),
});
