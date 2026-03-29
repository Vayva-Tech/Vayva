/**
 * Onboarding Validation Schemas
 * 
 * Zod schemas for validating onboarding data at runtime.
 */

import { z } from "zod";

// Identity validation
export const IdentitySchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address").optional(),
  nin: z.string().length(11, "NIN must be 11 digits").optional(),
  bvn: z.string().length(11, "BVN must be 11 digits").optional(),
});

// Business validation
export const BusinessSchema = z.object({
  storeName: z.string().min(3, "Store name must be at least 3 characters"),
  country: z.string().min(2, "Please select your country"),
  storeSlug: z
    .string()
    .min(3, "Store URL must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Store URL can only contain lowercase letters, numbers, and hyphens"),
  legalName: z.string().optional(),
  registeredAddress: z
    .object({
      addressLine1: z.string().min(5, "Address line 1 is required"),
      addressLine2: z.string().optional(),
      city: z.string().min(2, "City is required"),
      state: z.string().min(2, "State is required"),
      landmark: z.string().optional(),
    })
    .optional(),
});

// Finance validation
export const FinanceSchema = z.object({
  currency: z.string().optional(),
  payoutScheduleAcknowledged: z.boolean().optional(),
  bankName: z.string().min(2, "Bank name is required").optional(),
  accountNumber: z.string().min(10, "Account number must be at least 10 digits").optional(),
  accountName: z.string().optional(),
  bankCode: z.string().optional(),
});

// KYC validation
export const KycSchema = z.object({
  nin: z.string().length(11, "NIN must be 11 digits").optional(),
  bvn: z.string().length(11, "BVN must be 11 digits").optional(),
  verificationStatus: z.string().optional(),
});

// Socials validation
export const SocialsSchema = z.object({
  instagram: z.string().url("Please enter a valid Instagram URL").optional().or(z.literal("")),
  whatsapp: z.string().min(10, "Please enter a valid WhatsApp number").optional(),
  facebook: z.string().url("Please enter a valid Facebook URL").optional().or(z.literal("")),
  twitter: z.string().url("Please enter a valid Twitter URL").optional().or(z.literal("")),
  linkedin: z.string().url("Please enter a valid LinkedIn URL").optional().or(z.literal("")),
});

// Tools validation
export const ToolsSchema = z.object({
  enabledTools: z.array(z.string()).min(1, "Please select at least one tool"),
});

// Industry slug validation
export const IndustrySlugSchema = z.enum([
  "retail",
  "fashion",
  "grocery",
  "beauty",
  "food",
  "real-estate",
  "education",
  "healthcare",
  "automotive",
  "nonprofit",
  "b2b",
  "other",
]);

// Complete onboarding state schema
export const OnboardingStateSchema = z.object({
  schemaVersion: z.number().optional(),
  industrySlug: IndustrySlugSchema.optional(),
  kycStatus: z.string().optional(),
  identity: IdentitySchema.optional(),
  business: BusinessSchema.optional(),
  finance: FinanceSchema.optional(),
  kyc: KycSchema.optional(),
  socials: SocialsSchema.optional(),
  tools: ToolsSchema.optional(),
  logistics: z
    .object({
      deliveryMode: z.string().optional(),
      pickupAddress: z.string().optional(),
    })
    .optional(),
  whatsapp: z.object({ number: z.string().optional() }).optional(),
  storeDetails: z
    .object({
      slug: z.string().optional(),
      domainPreference: z.string().optional(),
      publishStatus: z.string().optional(),
    })
    .optional(),
});

// Update payload schema
export const OnboardingUpdatePayloadSchema = z.object({
  data: OnboardingStateSchema.partial().optional(),
  step: z.string().optional(),
  isComplete: z.boolean().optional(),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETE", "TRIAL_MODE"]).optional(),
});

// Skip step payload schema
export const SkipStepPayloadSchema = z.object({
  stepId: z.string().optional(),
  reason: z.string().optional(),
});

// Export type inference helpers
export type IdentityData = z.infer<typeof IdentitySchema>;
export type BusinessData = z.infer<typeof BusinessSchema>;
export type FinanceData = z.infer<typeof FinanceSchema>;
export type KycData = z.infer<typeof KycSchema>;
export type SocialsData = z.infer<typeof SocialsSchema>;
export type ToolsData = z.infer<typeof ToolsSchema>;
