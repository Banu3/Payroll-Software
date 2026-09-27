import { z } from 'zod';

export const payslipTemplateSchema = z.object({
  name: z.string().min(2, 'Template name must be at least 2 characters'),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('ACTIVE'),
  show_company_logo: z.boolean().default(true),
  show_employer_contributions: z.boolean().default(true),
  show_attendance_summary: z.boolean().default(true),
  show_tax_details: z.boolean().default(true),
  show_bank_details: z.boolean().default(true),
  mask_bank_account: z.boolean().default(true),
  mask_pan: z.boolean().default(true),
  header_text: z.string().optional(),
  footer_text: z.string().optional(),
  primary_color: z.string().default('#2563eb'),
  secondary_color: z.string().default('#1e293b')
});

export const payslipSettingsSchema = z.object({
  default_template_id: z.string().uuid().nullable().optional(),
  auto_generate: z.boolean().default(false),
  auto_email: z.boolean().default(false),
  email_attachment: z.boolean().default(true),
  employee_download_enabled: z.boolean().default(true),
  employee_print_enabled: z.boolean().default(true),
  retention_years: z.number().int().min(1).max(20).default(7),
  number_format: z.string().default('PS-{YYYY}-{MM}-{6DIGITS}'),
  watermark_enabled: z.boolean().default(false),
  watermark_text: z.string().default('CONFIDENTIAL')
});

export const bulkGeneratePayslipsSchema = z.object({
  payrollRunId: z.string().uuid('Invalid payroll run ID'),
  sendEmailImmediately: z.boolean().default(false)
});

export const sendPayslipEmailSchema = z.object({
  payslipId: z.string().uuid('Invalid payslip ID'),
  customMessage: z.string().optional()
});

export const generateSalaryCertificateSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  purpose: z.string().min(3, 'Purpose must be specified (e.g. Loan Application, Visa Processing)'),
  includeCTCBreakdown: z.boolean().default(true)
});

export const generatePayrollStatementSchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  startYear: z.number().int().min(2020),
  startMonth: z.number().int().min(1).max(12),
  endYear: z.number().int().min(2020),
  endMonth: z.number().int().min(1).max(12)
});
