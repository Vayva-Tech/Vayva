import { z } from "zod";
import { ListingStatus } from "../enums";

export const ProductVariantSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  name: z.string(), // e.g., "Size: L, Color: Red"
  sku: z.string().optional(),
  price: z.number().nonnegative(), // In minor units (kobo)
  compareAtPrice: z.number().nonnegative().optional(),
  inventoryQuantity: z.number().int().default(0),
  isTracked: z.boolean().default(true),
  options: z.record(z.string()), // { Size: "L", Color: "Red" }
});

export const ProductSchema = z.object({
  id: z.string().uuid(),
  storeId: z.string().uuid(),
  title: z.string().min(2),
  description: z.string().optional(),
  handle: z.string(), // URL friendly slug
  media: z
    .array(
      z.object({
        url: z.string().url(),
        type: z.enum(["IMAGE", "VIDEO"]),
        alt: z.string().optional(),
      }),
    )
    .default([]),

  category: z.string().optional(),
  tags: z.array(z.string()).default([]),

  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
  marketplaceStatus: z
    .nativeEnum(ListingStatus)
    .default(ListingStatus.UNLISTED),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CollectionSchema = z.object({
  id: z.string().uuid(),
  storeId: z.string().uuid(),
  title: z.string(),
  handle: z.string(),
  description: z.string().optional(),
  productIds: z.array(z.string().uuid()), // Simplification for MVP
});

export type Product = z.infer<typeof ProductSchema>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;
export type Collection = z.infer<typeof CollectionSchema>;
