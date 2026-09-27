import { z } from 'zod';

export const createEmployeeSchema = z.object({
  basicInfo: z.object({
    firstName: z.string().min(1, { message: 'First name is required' }),
    middleName: z.string().optional(),
    lastName: z.string().min(1, { message: 'Last name is required' }),
    preferredName: z.string().optional(),
    dob: z.string().optional(),
    gender: z.string().optional(),
    workEmail: z.string().email({ message: 'Valid work email required' }),
    personalEmail: z.string().email({ message: 'Valid personal email required' }).optional().or(z.literal('')),
    phone: z.string().min(7, { message: 'Phone number required' }),
    alternatePhone: z.string().optional(),
    profilePhotoUrl: z.string().optional(),
  }),
  contactInfo: z.object({
    addressLine1: z.string().min(3, { message: 'Address required' }),
    addressLine2: z.string().optional(),
    city: z.string().min(2, { message: 'City required' }),
    state: z.string().min(2, { message: 'State required' }),
    country: z.string().min(2, { message: 'Country required' }),
    postalCode: z.string().min(2, { message: 'Postal code required' }),
    isPermanent: z.boolean().default(false),
  }),
  employmentInfo: z.object({
    joiningDate: z.string().default(new Date().toISOString().split('T')[0]),
    employmentType: z.enum(['Full Time', 'Part Time', 'Contract', 'Intern', 'Consultant']).default('Full Time'),
    probationPeriodMonths: z.number().default(3),
    noticePeriodDays: z.number().default(30),
    workLocation: z.string().default('Main Office'),
    branchId: z.string().optional(),
    departmentId: z.string().optional(),
    designationId: z.string().optional(),
    reportingManagerId: z.string().nullable().optional(),
  }),
  salaryInfo: z.object({
    annualCtc: z.number().min(0).default(60000),
    basic: z.number().min(0).default(30000),
    hra: z.number().min(0).default(12000),
    da: z.number().min(0).default(6000),
    specialAllowance: z.number().min(0).default(12000),
    conveyance: z.number().min(0).default(0),
    medicalAllowance: z.number().min(0).default(0),
    variablePay: z.number().min(0).default(0),
    pfDeduction: z.number().min(0).default(3600),
    esiDeduction: z.number().min(0).default(0),
    professionalTax: z.number().min(0).default(2400),
    tdsDeduction: z.number().min(0).default(0),
  }).optional(),
  bankInfo: z.object({
    accountHolderName: z.string().min(2, { message: 'Account holder name required' }),
    bankName: z.string().min(2, { message: 'Bank name required' }),
    accountNumber: z.string().min(5, { message: 'Account number required' }),
    ifscCode: z.string().min(4, { message: 'IFSC / Routing code required' }),
    branchName: z.string().optional(),
  }).optional(),
  statutoryInfo: z.object({
    pan: z.string().optional(),
    aadhaar: z.string().optional(),
    uan: z.string().optional(),
    esiNumber: z.string().optional(),
    taxRegime: z.string().default('New Regime'),
  }).optional(),
  emergencyContacts: z.array(z.object({
    name: z.string().min(2, { message: 'Contact name required' }),
    relationship: z.string().min(2, { message: 'Relationship required' }),
    phone: z.string().min(7, { message: 'Phone required' }),
    alternatePhone: z.string().optional(),
    email: z.string().optional(),
    isPrimary: z.boolean().default(true),
  })).optional(),
});

export const transferEmployeeSchema = z.object({
  branchId: z.string().optional(),
  departmentId: z.string().optional(),
  designationId: z.string().optional(),
  reportingManagerId: z.string().nullable().optional(),
  effectiveDate: z.string().min(1, { message: 'Effective date required' }),
  reason: z.string().min(3, { message: 'Reason required' }),
});

export const promoteEmployeeSchema = z.object({
  designationId: z.string().min(1, { message: 'New designation required' }),
  annualCtc: z.number().min(0, { message: 'New CTC required' }),
  effectiveDate: z.string().min(1, { message: 'Effective date required' }),
  reason: z.string().min(3, { message: 'Reason required' }),
});

export const verifyDocumentSchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED']),
  rejectionReason: z.string().optional(),
});
