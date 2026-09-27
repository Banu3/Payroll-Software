import { z } from 'zod';

export const createCompanySchema = z.object({
  companyInfo: z.object({
    name: z.string().min(2, { message: 'Company name is required' }),
    legalName: z.string().optional(),
    registrationNumber: z.string().optional(),
    industry: z.string().min(2, { message: 'Industry is required' }),
    companyType: z.string().optional(),
    website: z.string().optional(),
    email: z.string().email({ message: 'Valid corporate email required' }),
    phone: z.string().min(5, { message: 'Phone number required' }),
    logoUrl: z.string().optional(),
  }),
  address: z.object({
    address: z.string().min(3, { message: 'Address required' }),
    city: z.string().min(2, { message: 'City required' }),
    state: z.string().min(2, { message: 'State required' }),
    country: z.string().min(2, { message: 'Country required' }),
    postalCode: z.string().min(2, { message: 'Postal code required' }),
  }),
  primaryAdmin: z.object({
    adminName: z.string().min(2, { message: 'Admin full name is required' }),
    adminEmail: z.string().email({ message: 'Valid admin email address required' }),
    phone: z.string().optional(),
  }),
  payrollConfig: z.object({
    payFrequency: z.enum(['Monthly', 'Bi-weekly', 'Weekly']),
    currency: z.string().default('USD'),
    financialYearStart: z.string().default('January'),
    payrollDate: z.number().min(1).max(31).default(30),
  }),
  plan: z.object({
    planCode: z.string().default('PROFESSIONAL'),
    employeeLimit: z.number().default(250),
    storageLimitGb: z.number().default(25),
  }),
});

export const suspendCompanySchema = z.object({
  reason: z.string().min(5, { message: 'Reason for suspension is required (minimum 5 characters)' }),
});

export const inviteAdminSchema = z.object({
  name: z.string().min(2, { message: 'Admin name required' }),
  email: z.string().email({ message: 'Valid email address required' }),
  role: z.enum(['HR_ADMIN', 'MANAGER']),
});

export const branchSchema = z.object({
  branchName: z.string().min(2, { message: 'Branch name required' }),
  branchCode: z.string().min(2, { message: 'Branch code required' }),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  timezone: z.string().default('UTC'),
  phone: z.string().optional(),
  managerId: z.string().nullable().optional(),
});

export const departmentSchema = z.object({
  name: z.string().min(2, { message: 'Department name required' }),
  code: z.string().min(2, { message: 'Department code required' }),
  headId: z.string().nullable().optional(),
});

export const designationSchema = z.object({
  name: z.string().min(2, { message: 'Designation name required' }),
  code: z.string().min(2, { message: 'Designation code required' }),
  departmentId: z.string().nullable().optional(),
  level: z.string().optional(),
  description: z.string().optional(),
});

export const updateFeatureFlagsSchema = z.object({
  features: z.record(z.boolean()),
});
