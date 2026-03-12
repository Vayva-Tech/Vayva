import { z } from "zod";

export const StoreSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/),
  logoUrl: z.string().url().optional(),

  // Contact
  email: z.string().email(),
  phone: z.string(),
  address: z.string().optional(),
  city: z.string().optional(), // Default: Lagos
  country: z.string().default("NG"),
  currency: z.string().default("NGN"),

  // Policies
  returnsMarkdown: z.string().optional(),
  shippingMarkdown: z.string().optional(),
  privacyMarkdown: z.string().optional(),
  termsMarkdown: z.string().optional(),

  // Policy Contact Details
  policyContact: z
    .object({
      email: z.string().email(),
      phone: z.string(),
      whatsapp: z.string().optional(),
      address: z.string().optional(),
      businessHours: z.string().optional(),
    })
    .optional(),

  // Settings
  timezone: z.string().default("Africa/Lagos"),
  isActive: z.boolean().default(true),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Store = z.infer<typeof StoreSchema>;
