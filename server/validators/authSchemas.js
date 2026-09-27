import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid corporate email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  rememberMe: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid corporate email address' }),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, { message: 'Reset token is required' }),
  newPassword: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character' }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required' }),
  newPassword: z.string()
    .min(8, { message: 'New password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Must include uppercase letter' })
    .regex(/[a-z]/, { message: 'Must include lowercase letter' })
    .regex(/[0-9]/, { message: 'Must include a number' })
    .regex(/[^A-Za-z0-9]/, { message: 'Must include a special character' }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const firstLoginProfileSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(1, { message: 'First name is required' }),
    lastName: z.string().min(1, { message: 'Last name is required' }),
    dob: z.string().optional(),
    gender: z.string().optional(),
    maritalStatus: z.string().optional(),
    nationality: z.string().optional(),
  }),
  contactInfo: z.object({
    personalEmail: z.string().email({ message: 'Valid email required' }).optional().or(z.literal('')),
    phone: z.string().min(7, { message: 'Valid phone number required' }),
    currentAddress: z.string().min(5, { message: 'Address required' }),
    permanentAddress: z.string().optional(),
  }),
  bankInfo: z.object({
    accountHolderName: z.string().min(2, { message: 'Account holder name required' }),
    bankName: z.string().min(2, { message: 'Bank name required' }),
    accountNumber: z.string().min(5, { message: 'Account number required' }),
    ifscCode: z.string().min(4, { message: 'IFSC / Routing code required' }),
    taxId: z.string().optional(),
  }),
  emergencyContact: z.object({
    contactName: z.string().min(2, { message: 'Contact name required' }),
    relationship: z.string().min(2, { message: 'Relationship required' }),
    phone: z.string().min(7, { message: 'Phone number required' }),
  }),
  documents: z.array(z.any()).optional(),
  securitySetup: z.object({
    enable2FA: z.boolean().optional(),
    securityQuestions: z.any().optional(),
  }).optional(),
});
