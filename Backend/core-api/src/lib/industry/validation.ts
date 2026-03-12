import { NextRequest } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/logger";

/**
 * Industry-specific validation schemas
 */

// Base schemas that can be extended
export const BasePaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export const BaseDateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const BaseStatusSchema = z.object({
  status: z.enum(["active", "inactive", "draft", "published"]).optional(),
});

// Fashion industry schemas
export const LookbookSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  isActive: z.boolean().default(true),
  products: z.array(z.string()).optional(), // Product IDs
  coverImage: z.string().url().optional(),
  sortOrder: z.number().min(0).default(0),
});

export const SizeGuideSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  measurements: z.array(
    z.object({
      name: z.string().min(1),
      unit: z.enum(["cm", "inch"]),
      values: z.record(z.string(), z.number()),
    })
  ),
  isActive: z.boolean().default(true),
});

export const CollectionSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  isActive: z.boolean().default(true),
  products: z.array(z.string()).optional(),
  featuredImage: z.string().url().optional(),
  sortOrder: z.number().min(0).default(0),
});

// Restaurant industry schemas
export const TableSchema = z.object({
  tableName: z.string().min(1).max(50),
  capacity: z.number().min(1).max(50),
  location: z.string().max(100).optional(),
  isAvailable: z.boolean().default(true),
  minimumSpend: z.number().min(0).optional(),
  isVip: z.boolean().default(false),
});

export const MenuItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  price: z.number().min(0),
  category: z.string().min(1),
  prepTime: z.number().min(0), // minutes
  isVegetarian: z.boolean().default(false),
  isVegan: z.boolean().default(false),
  allergens: z.array(z.string()).optional(),
  ingredients: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

export const ReservationSchema = z.object({
  customerName: z.string().min(1).max(100),
  customerPhone: z.string().min(10).max(20),
  customerEmail: z.string().email().optional(),
  tableId: z.string().min(1),
  reservationDate: z.string().datetime(),
  partySize: z.number().min(1).max(50),
  specialRequests: z.string().max(500).optional(),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]).default("pending"),
});

// Retail industry schemas
export const StoreSchema = z.object({
  name: z.string().min(1).max(100),
  location: z.string().min(1).max(200),
  phone: z.string().min(10).max(20),
  email: z.string().email(),
  isActive: z.boolean().default(true),
  managerId: z.string().optional(),
});

export const LoyaltyTierSchema = z.object({
  name: z.string().min(1).max(50),
  minPoints: z.number().min(0),
  discountPercent: z.number().min(0).max(100),
  benefits: z.array(z.string()).optional(),
});

export const GiftCardSchema = z.object({
  amount: z.number().min(1),
  recipientName: z.string().min(1).max(100),
  recipientEmail: z.string().email(),
  senderName: z.string().min(1).max(100),
  message: z.string().max(500).optional(),
  expiryDate: z.string().datetime().optional(),
});

/**
 * Validation utility functions
 */
export class IndustryValidator {
  static validate(schema: z.ZodSchema, data: any) {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(e => ({
          field: e.path.join("."),
          message: e.message,
        }));
        throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
      }
      throw error;
    }
  }

  static async validateRequestBody(req: NextRequest, schema: z.ZodSchema) {
    try {
      const body = await req.json();
      return this.validate(schema, body);
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error("Invalid JSON in request body");
      }
      throw error;
    }
  }

  static validateQueryParams(searchParams: URLSearchParams, schema: z.ZodSchema) {
    const params: Record<string, any> = {};
    
    for (const [key, value] of searchParams.entries()) {
      // Convert to appropriate types
      if (/^\d+$/.test(value)) {
        params[key] = parseInt(value, 10);
      } else if (value === "true" || value === "false") {
        params[key] = value === "true";
      } else {
        params[key] = value;
      }
    }
    
    return this.validate(schema, params);
  }

  static sanitizeString(str: string, maxLength: number = 1000): string {
    if (!str) return "";
    return str.trim().substring(0, maxLength);
  }

  static sanitizeNumber(num: any, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number {
    const parsed = typeof num === "string" ? parseFloat(num) : num;
    if (isNaN(parsed)) return min;
    return Math.min(Math.max(parsed, min), max);
  }
}

/**
 * Industry-specific error codes and messages
 */
export const INDUSTRY_ERRORS = {
  FASHION: {
    LOOKBOOK_NOT_FOUND: "LOOKBOOK_NOT_FOUND",
    SIZE_GUIDE_EXISTS: "SIZE_GUIDE_EXISTS",
    COLLECTION_INVALID: "COLLECTION_INVALID",
  },
  RESTAURANT: {
    TABLE_NOT_FOUND: "TABLE_NOT_FOUND",
    RESERVATION_CONFLICT: "RESERVATION_CONFLICT",
    MENU_ITEM_UNAVAILABLE: "MENU_ITEM_UNAVAILABLE",
  },
  RETAIL: {
    STORE_NOT_FOUND: "STORE_NOT_FOUND",
    LOYALTY_TIER_EXISTS: "LOYALTY_TIER_EXISTS",
    GIFT_CARD_INVALID: "GIFT_CARD_INVALID",
  },
};

/**
 * Common industry utilities
 */
export class IndustryUtils {
  static formatDate(date: Date | string): string {
    return new Date(date).toISOString();
  }

  static calculateDiscount(originalPrice: number, discountPercent: number): number {
    return originalPrice * (discountPercent / 100);
  }

  static generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  static isValidPhoneNumber(phone: string): boolean {
    return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ""));
  }

  static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}