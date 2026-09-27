import { z } from 'zod';

export const companyBankAccountSchema = z.object({
  bank_name: z.string().min(2, 'Bank name must be at least 2 characters'),
  account_name: z.string().min(2, 'Account holder name is required'),
  account_number: z.string().min(6, 'Valid bank account number required'),
  ifsc_code: z.string().min(4, 'Valid IFSC code required'),
  branch_name: z.string().optional(),
  account_type: z.enum(['CURRENT', 'SAVINGS', 'SALARY']).default('CURRENT'),
  currency: z.string().default('INR'),
  is_default: z.boolean().default(false)
});

export const createPaymentBatchSchema = z.object({
  payrollRunId: z.string().uuid('Invalid payroll run ID'),
  companyBankAccountId: z.string().uuid('Invalid company bank account ID').optional().nullable(),
  notes: z.string().optional()
});

export const generateBankFileSchema = z.object({
  paymentBatchId: z.string().uuid('Invalid payment batch ID'),
  fileFormat: z.enum(['CSV', 'TXT', 'XLSX']).default('CSV')
});

export const reconcileBatchSchema = z.object({
  paymentBatchId: z.string().uuid('Invalid payment batch ID')
});

export const retryFailedPaymentSchema = z.object({
  batchItemId: z.string().uuid('Invalid batch item ID'),
  correctedAccountNumber: z.string().optional(),
  correctedIFSC: z.string().optional()
});

export const generateStatutoryReportSchema = z.object({
  reportType: z.enum(['PF_ECR', 'ESI_RETURN', 'PT_SLAB_REPORT', 'TDS_FORM_24Q', 'PAYROLL_REGISTER']),
  year: z.number().int().min(2020),
  month: z.number().int().min(1).max(12)
});
