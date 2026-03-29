/**
 * Common Zod Schemas
 * 
 * Reusable validation schemas used across the application
 */

import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address');

/**
 * Password validation schema
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .optional();

/**
 * Phone number schema (Nigerian format)
 */
export const phoneSchema = z
  .string()
  .min(10, 'Phone number must be at least 10 digits')
  .regex(/^\+?234|0?[789]\d{9}$/, 'Invalid Nigerian phone number')
  .optional();

/**
 * URL schema
 */
export const urlSchema = z
  .string()
  .url('Invalid URL')
  .optional();

/**
 * UUID schema
 */
export const uuidSchema = z.string().uuid('Invalid UUID');

/**
 * Positive number schema
 */
export const positiveNumberSchema = z
  .number()
  .positive('Must be a positive number');

/**
 * Non-negative number schema
 */
export const nonNegativeNumberSchema = z
  .number()
  .nonnegative('Cannot be negative');

/**
 * Date string schema
 */
export const dateStringSchema = z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), 'Invalid date');

/**
 * Enum for order status
 */
export const orderStatusEnum = z.enum([
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]);

/**
 * Enum for payment status
 */
export const paymentStatusEnum = z.enum([
  'pending',
  'completed',
  'failed',
  'refunded',
  'partially_refunded',
]);

/**
 * Enum for inventory status
 */
export const inventoryStatusEnum = z.enum([
  'in_stock',
  'low_stock',
  'out_of_stock',
  'pre_order',
]);

/**
 * Enum for plan types
 */
export const planTypeEnum = z.enum(['starter', 'pro', 'pro_plus']);

/**
 * Address schema
 */
export const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().default('Nigeria'),
  postalCode: z.string().optional(),
});

/**
 * Money/currency amount schema
 */
export const moneySchema = z.object({
  amount: positiveNumberSchema,
  currency: z.string().default('NGN'),
});

/**
 * Pagination query schema
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Date range schema
 */
export const dateRangeSchema = z.object({
  startDate: dateStringSchema,
  endDate: dateStringSchema.refine((val, ctx) => {
    // This will be validated properly in the superRefine
    return true;
  }),
}).superRefine((data, ctx) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  
  if (start > end) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'End date must be after start date',
      path: ['endDate'],
    });
  }
});

/**
 * File upload metadata schema
 */
export const fileUploadSchema = z.object({
  filename: z.string(),
  mimetype: z.string(),
  size: z.number().int().positive(),
  url: z.string().url(),
});

/**
 * Metadata object schema
 */
export const metadataSchema = z.record(z.string(), z.unknown());
