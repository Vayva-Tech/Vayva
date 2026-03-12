import { z } from "zod";
import { ListingStatus } from "../enums";

export const MarketplaceListingSchema = z.object({
  id: z.string().uuid(),
  storeId: z.string().uuid(),
  productId: z.string().uuid(),

  // Marketplace Specific Overrides
  title: z.string().min(5), // Marketplace might need longer titles
  description: z.string(),
  price: z.number().int().positive(),

  // Moderation
  status: z.nativeEnum(ListingStatus).default(ListingStatus.PENDING_REVIEW),
  rejectionReason: z.string().optional(),

  // Analytics
  viewCount: z.number().int().default(0),
  conversionRate: z.number().default(0),

  publishedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type MarketplaceListing = z.infer<typeof MarketplaceListingSchema>;
