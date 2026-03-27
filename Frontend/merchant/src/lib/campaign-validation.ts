/**
 * Campaign Form Validation Schemas
 * 
 * Zod schemas for validating campaign creation forms
 */

import { z } from 'zod';

/**
 * Campaign name validation
 * - Min 3 characters, max 100 characters
 * - Alphanumeric with basic punctuation
 */
export const campaignNameSchema = z.string()
  .min(3, 'Campaign name must be at least 3 characters')
  .max(100, 'Campaign name cannot exceed 100 characters')
  .regex(/^[a-zA-Z0-9\s\-_.,!?']+$/, 'Campaign name can only contain letters, numbers, and basic punctuation');

/**
 * Budget amount validation
 * - Minimum ₦1,000
 * - Maximum ₦10,000,000
 * - Must be a positive integer
 */
export const budgetAmountSchema = z.number()
  .min(1000, 'Minimum budget is ₦1,000')
  .max(10000000, 'Maximum budget is ₦10,000,000')
  .int('Budget must be a whole number');

/**
 * Budget type validation
 */
export const budgetTypeSchema = z.enum(['daily', 'lifetime']);

/**
 * Complete budget schema
 */
export const budgetSchema = z.object({
  type: budgetTypeSchema,
  amount: budgetAmountSchema,
});

/**
 * Campaign objective validation
 */
export const objectiveSchema = z.enum([
  'awareness',
  'traffic',
  'engagement',
  'leads',
  'sales',
  'app_installs',
  'conversions',
]);

/**
 * Schedule validation
 * - Start date must be today or in the future
 * - End date (if provided) must be after start date
 */
export const scheduleSchema = z.object({
  startDate: z.string().refine(
    (date) => {
      const startDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return startDate >= today;
    },
    { message: 'Start date must be today or in the future' }
  ),
  endDate: z.string().optional(),
}).refine(
  (data) => {
    if (!data.endDate) return true;
    return new Date(data.endDate) > new Date(data.startDate);
  },
  { message: 'End date must be after start date' }
);

/**
 * Targeting demographics validation
 */
export const demographicsSchema = z.object({
  ageMin: z.number().min(13).max(65).optional(),
  ageMax: z.number().min(13).max(65).optional(),
  gender: z.enum(['male', 'female', 'all']).optional(),
}).refine(
  (data) => {
    if (data.ageMin && data.ageMax) {
      return data.ageMin <= data.ageMax;
    }
    return true;
  },
  { message: 'Age minimum must be less than or equal to age maximum' }
);

/**
 * Targeting schema
 */
export const targetingSchema = z.object({
  audiences: z.array(z.string()).optional(),
  demographics: demographicsSchema.optional(),
  locations: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
});

/**
 * Ad creative validation
 */
export const adCreativeSchema = z.object({
  type: z.enum(['image', 'video', 'carousel', 'collection']),
  headline: z.string().max(100, 'Headline cannot exceed 100 characters').optional(),
  body: z.string().max(500, 'Body text cannot exceed 500 characters').optional(),
  callToAction: z.string().min(1, 'Call to action is required'),
  mediaUrls: z.array(z.string().url()).min(1, 'At least one media URL is required'),
  linkUrl: z.string().url().optional(),
});

/**
 * Complete campaign create input schema
 */
export const campaignCreateInputSchema = z.object({
  platform: z.enum(['meta', 'google', 'tiktok']),
  name: campaignNameSchema,
  objective: objectiveSchema,
  budget: budgetSchema,
  schedule: scheduleSchema,
  targeting: targetingSchema.optional(),
  creatives: z.array(adCreativeSchema).min(1, 'At least one ad creative is required'),
});

/**
 * Type inference from schemas
 */
export type CampaignCreateInputType = z.infer<typeof campaignCreateInputSchema>;

/**
 * Validation helper function
 */
export function validateCampaignData(data: unknown): { success: boolean; data?: CampaignCreateInputType; errors?: z.ZodError } {
  const result = campaignCreateInputSchema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
}
