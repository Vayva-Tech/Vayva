/**
 * Authentication Validation Schemas
 */

import { z } from 'zod';
import { emailSchema, passwordSchema, phoneSchema } from './common.schemas';

/**
 * Sign in input schema
 */
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  otpMethod: z.enum(['EMAIL', 'WHATSAPP']).optional(),
});

export type SignInInput = z.infer<typeof signInSchema>;

/**
 * Sign up input schema
 */
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: phoneSchema,
  businessName: z.string().min(1, 'Business name is required'),
  industrySlug: z.string().optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

/**
 * OTP verification schema
 */
export const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: z.string().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits'),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

/**
 * Password reset request schema
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * Password reset completion schema
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Change password schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * Update profile schema
 */
export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: phoneSchema,
  avatarUrl: z.string().url().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
