import { z } from 'zod';

export const automationRuleSchema = z.object({
  name: z.string().min(2, 'Automation rule name required'),
  description: z.string().optional(),
  triggerType: z.enum(['EVENT_BASED', 'TIME_BASED', 'CONDITION_BASED', 'MANUAL']).default('EVENT_BASED'),
  triggerEvent: z.string().min(2, 'Trigger event is required (e.g. employee.created, document.expiring)'),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.string(),
    value: z.any()
  })).optional().default([]),
  actions: z.array(z.object({
    type: z.string(),
    target: z.string().optional(),
    payload: z.any().optional()
  })).min(1, 'At least one automation action is required'),
  schedule: z.string().optional().default('0 0 * * *'),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'DISABLED', 'ERROR']).default('ACTIVE')
});

export const hrTaskSchema = z.object({
  taskName: z.string().min(2, 'Task name is required'),
  description: z.string().optional(),
  assignedTo: z.string().uuid().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  dueDate: z.string().optional().nullable(),
  relatedEmployeeId: z.string().uuid().optional().nullable(),
  relatedPayrollRunId: z.string().uuid().optional().nullable()
});

export const aiChatQuerySchema = z.object({
  message: z.string().min(1, 'Query message required'),
  contextType: z.enum(['GENERAL', 'PAYROLL_EXPLANATION', 'SEARCH', 'INSIGHTS', 'REPORT_ASSISTANT']).default('GENERAL')
});

export const webhookSchema = z.object({
  name: z.string().min(2, 'Webhook name required'),
  endpointUrl: z.string().url('Valid HTTPS endpoint URL required'),
  subscribedEvents: z.array(z.string()).min(1, 'Select at least one event')
});

export const apiKeySchema = z.object({
  name: z.string().min(2, 'API Key description name required'),
  scopes: z.array(z.string()).min(1, 'Select at least one scope'),
  expiresInDays: z.number().int().min(1).max(365).default(90)
});
