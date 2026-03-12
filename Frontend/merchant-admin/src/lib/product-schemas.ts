import { z } from "zod";

export const ProductCreateSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  price: z.number().min(0),
  sku: z.string().optional(),
  handle: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  productType: z.string().optional(),
  trackInventory: z.boolean().default(true),
  metadata: z.record(z.unknown()).optional(),
});

export const ProductUpdateSchema = ProductCreateSchema.partial();
// 1. Retail & Fashion
export const RetailAttributesSchema = z.object({
  sizes: z.array(z.string()).optional(), // Optional in prompt they are arrays, but might be empty. Prompt said "sizes": ["S", "M"] which implies values.
  colors: z.array(z.string()).optional(),
  material: z.string().optional(),
  size_chart_url: z.string().url().optional(),
  weight_kg: z.number().optional(),
});
// 2. Service (Appointments)
export const ServiceAttributesSchema = z.object({
  duration_minutes: z.number().int().positive().optional(),
  buffer_time: z.number().int().nonnegative().optional(),
  location_type: z.enum(["Physical", "Virtual"]).optional(),
  meeting_link: z.string().url().optional(),
});
// 3. Food & Catering
export const FoodAttributesSchema = z.object({
  ingredients: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  prep_time_mins: z.number().int().nonnegative().optional(),
  extras: z
    .array(
      z.object({
        name: z.string(),
        price: z.number(),
      }),
    )
    .optional(),
});
// 4. Digital Assets
export const DigitalAttributesSchema = z.object({
  file_url: z.string().url().optional(),
  file_size: z.string().optional(),
  file_extension: z.enum([".zip", ".pdf", ".mp4", "other"]).optional(), // Prompt listed specific exts, added 'other' for safety
  license_type: z.enum(["Personal", "Commercial"]).optional(),
});
// 5. Real Estate
export const RealEstateAttributesSchema = z.object({
  property_type: z.enum(["Apartment", "Land", "Office", "House"]).optional(),
  bedrooms: z.number().nonnegative().optional(),
  bathrooms: z.number().nonnegative().optional(),
  sqft: z.number().positive().optional(),
  parking_spaces: z.number().nonnegative().optional(),
  virtual_tour_url: z.string().url().optional(),
  amenities: z.array(z.string()).optional(),
});
// 6. Events & Tickets
export const EventsAttributesSchema = z.object({
  event_date: z.string().datetime().optional(), // ISO string
  venue_address: z.string().optional(),
  ticket_tiers: z
    .array(
      z.object({
        type: z.string(),
        price: z.number(),
      }),
    )
    .optional(),
  is_virtual: z.boolean().optional(),
});
// 7. Education (Courses)
export const EducationAttributesSchema = z.object({
  curriculum: z
    .array(
      z.object({
        module_title: z.string(),
        lessons: z.array(z.string()),
      }),
    )
    .optional(),
  total_hours: z.number().positive().optional(),
  certificate_included: z.boolean().optional(),
});
// 8. B2B / Wholesale
export const WholesaleAttributesSchema = z.object({
  moq: z.number().int().positive().optional(), // Minimum Order Quantity
  bulk_pricing: z
    .array(
      z.object({
        range: z.string(), // "10-50"
        price: z.number(),
      }),
    )
    .optional(),
  lead_time_days: z.number().int().nonnegative().optional(),
});
// 9. Nonprofit (Donations)
export const NonprofitAttributesSchema = z.object({
  goal_amount: z.number().positive().optional(),
  impact_metrics: z.string().optional(),
  is_recurring: z.boolean().optional(),
});
// 10. Marketplace (Multi-vendor)
export const MarketplaceAttributesSchema = z.object({
  vendor_id: z.string().optional(),
  commission_rate: z.number().min(0).max(100).optional(),
  vendor_rating: z.number().min(0).max(5).optional(),
});
// Map segments to schemas
export const SCHEMA_MAP = {
  retail: RetailAttributesSchema,
  food: FoodAttributesSchema,
  services: ServiceAttributesSchema,
  digital: DigitalAttributesSchema,
  "real-estate": RealEstateAttributesSchema,
  events: EventsAttributesSchema,
  education: EducationAttributesSchema,
  wholesale: WholesaleAttributesSchema,
  "non-profit": NonprofitAttributesSchema,
  other: RetailAttributesSchema, // Default
};
