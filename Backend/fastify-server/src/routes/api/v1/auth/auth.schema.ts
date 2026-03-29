/**
 * Authentication Schemas
 * Zod validation schemas for merchant authentication endpoints
 */

import { z } from 'zod';

// Email validation regex (RFC 5322 compliant simplified)
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const SignInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(emailRegex, 'Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
  otpMethod: z
    .enum(['EMAIL', 'WHATSAPP'])
    .optional()
    .default('EMAIL'),
});

export const SignUpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(emailRegex, 'Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name is too long'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name is too long'),
  storeName: z
    .string()
    .min(1, 'Store name is required')
    .max(100, 'Store name is too long'),
  industrySlug: z
    .string()
    .optional(),
  otpMethod: z
    .enum(['EMAIL', 'WHATSAPP'])
    .optional()
    .default('EMAIL'),
});

export const VerifyOTPSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(emailRegex, 'Invalid email address'),
  code: z
    .string()
    .length(6, 'Code must be 6 digits')
    .regex(/^\d{6}$/, 'Code must be numeric'),
  method: z
    .enum(['EMAIL', 'WHATSAPP'])
    .optional()
    .default('EMAIL'),
  rememberMe: z
    .boolean()
    .optional()
    .default(false),
});

export const ResendOTPSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(emailRegex, 'Invalid email address'),
  method: z
    .enum(['EMAIL', 'WHATSAPP'])
    .optional()
    .default('EMAIL'),
});

export const RequestPasswordResetSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(emailRegex, 'Invalid email address'),
});

export const ResetPasswordSchema = z.object({
  token: z
    .string()
    .min(1, 'Token is required'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

// Type exports
export type SignInInput = z.infer<typeof SignInSchema>;
export type SignUpInput = z.infer<typeof SignUpSchema>;
export type VerifyOTPInput = z.infer<typeof VerifyOTPSchema>;
export type ResendOTPInput = z.infer<typeof ResendOTPSchema>;
export type RequestPasswordResetInput = z.infer<typeof RequestPasswordResetSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
