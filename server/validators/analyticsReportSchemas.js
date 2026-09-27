import { z } from 'zod';

export const saveCustomReportSchema = z.object({
  name: z.string().min(2, 'Report name is required'),
  description: z.string().optional(),
  dataSource: z.enum([
    'EMPLOYEES', 'ATTENDANCE', 'LEAVE', 'PAYROLL', 'COMPENSATION', 'PAYMENTS', 'STATUTORY', 'OVERTIME'
  ]),
  selectedFields: z.array(z.string()).min(1, 'Select at least one field'),
  filters: z.array(z.object({
    field: z.string(),
    operator: z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'contains', 'in']),
    value: z.any()
  })).optional().default([]),
  grouping: z.string().optional().nullable(),
  sorting: z.object({
    field: z.string().optional(),
    direction: z.enum(['asc', 'desc']).optional().default('asc')
  }).optional().default({}),
  visibility: z.enum(['PRIVATE', 'TEAM', 'HR', 'COMPANY']).default('PRIVATE')
});

export const scheduleReportSchema = z.object({
  reportId: z.string().uuid('Invalid report ID'),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY']).default('MONTHLY'),
  format: z.enum(['CSV', 'XLSX', 'PDF']).default('CSV'),
  recipients: z.array(z.string().email()).min(1, 'At least one recipient email is required')
});

export const dashboardLayoutSchema = z.object({
  layoutName: z.string().default('DEFAULT'),
  widgets: z.array(z.object({
    id: z.string(),
    type: z.string(),
    title: z.string(),
    visible: z.boolean().default(true),
    width: z.string().optional()
  }))
});
