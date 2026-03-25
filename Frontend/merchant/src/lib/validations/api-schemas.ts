/**
 * Centralized Zod schemas for API input validation
 * Use these across all API routes for consistent validation
 */

import { z } from "zod";

// ============ AUTH SCHEMAS ============
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  otpMethod: z.enum(["EMAIL", "SMS", "WHATSAPP"]).optional(),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[a-z]/, "Password must contain lowercase letter")
    .regex(/[0-9]/, "Password must contain number"),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  businessName: z.string().min(1).max(255),
  phone: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain uppercase letter")
    .regex(/[a-z]/, "Password must contain lowercase letter")
    .regex(/[0-9]/, "Password must contain number"),
});

export const verifyOTPSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

// ============ PRODUCT SCHEMAS ============
export const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  compareAtPrice: z.number().positive().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  inventory: z.number().int().nonnegative().default(0),
  trackInventory: z.boolean().default(false),
  images: z.array(z.string().url()).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  variants: z.array(z.object({
    name: z.string(),
    value: z.string(),
    priceAdjustment: z.number().optional(),
  })).optional(),
});

export const updateProductSchema = createProductSchema.partial();

// ============ ORDER SCHEMAS ============
export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
  })).min(1, "Order must have at least one item"),
  customer: z.object({
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string().optional(),
  }),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
  billingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }).optional(),
  paymentMethod: z.enum(["CARD", "TRANSFER", "CASH", "WALLET"]),
  notes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
});

// ============ CUSTOMER SCHEMAS ============
export const createCustomerSchema = z.object({
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

// ============ PAYMENT SCHEMAS ============
export const processPaymentSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().length(3, "Currency must be 3 letters"),
  orderId: z.string(),
  paymentMethod: z.enum(["CARD", "TRANSFER", "WALLET"]),
  cardToken: z.string().optional(),
  saveCard: z.boolean().default(false),
});

export const refundPaymentSchema = z.object({
  paymentId: z.string(),
  amount: z.number().positive(),
  reason: z.string(),
});

// ============ SETTINGS SCHEMAS ============
export const updateStoreSettingsSchema = z.object({
  storeName: z.string().min(1).max(255),
  storeEmail: z.string().email().optional(),
  storePhone: z.string().optional(),
  currency: z.string().length(3).optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  shippingEnabled: z.boolean().optional(),
  pickupEnabled: z.boolean().optional(),
});

export const updateBrandingSchema = z.object({
  logo: z.string().url().optional(),
  favicon: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be valid hex color"),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  font: z.string().optional(),
});

// ============ TEAM SCHEMAS ============
export const inviteTeamMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["OWNER", "ADMIN", "STAFF", "VIEWER"]),
  permissions: z.array(z.string()).optional(),
  message: z.string().optional(),
});

export const updateTeamMemberSchema = z.object({
  role: z.enum(["OWNER", "ADMIN", "STAFF", "VIEWER"]).optional(),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// ============ INVENTORY SCHEMAS ============
export const adjustInventorySchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  adjustment: z.number().int(),
  reason: z.enum([
    "SALE",
    "RETURN",
    "DAMAGED",
    "LOST",
    "FOUND",
    "ADJUSTMENT",
  ]),
  notes: z.string().optional(),
});

// ============ MARKETING SCHEMAS ============
export const createDiscountSchema = z.object({
  code: z.string().min(3).max(50),
  type: z.enum(["PERCENTAGE", "FIXED", "FREE_SHIPPING"]),
  value: z.number().positive(),
  minOrderValue: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  maxUsesPerCustomer: z.number().int().positive().optional(),
  startsAt: z.string(),
  endsAt: z.string().optional(),
  applicableProducts: z.array(z.string()).optional(),
  applicableCollections: z.array(z.string()).optional(),
});

export const createCampaignSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(["EMAIL", "SMS", "WHATSAPP", "PUSH"]),
  audience: z.object({
    segment: z.enum(["ALL", "NEW", "VIP", "INACTIVE"]),
    filters: z.record(z.unknown()).optional(),
  }),
  content: z.object({
    subject: z.string().optional(),
    body: z.string(),
    ctaUrl: z.string().url().optional(),
  }),
  scheduledAt: z.string(),
});

// ============ SUPPORT SCHEMAS ============
export const createTicketSchema = z.object({
  subject: z.string().min(1).max(255),
  description: z.string().min(10),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  category: z.enum(["TECHNICAL", "BILLING", "GENERAL", "FEATURE_REQUEST"]),
  attachments: z.array(z.string().url()).optional(),
  orderId: z.string().optional(),
});

export const updateTicketSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  assigneeId: z.string().optional(),
  response: z.string().optional(),
});

// ============ ANALYTICS SCHEMAS ============
export const analyticsQuerySchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  metrics: z.array(z.string()),
  dimensions: z.array(z.string()).optional(),
  filters: z.record(z.unknown()).optional(),
  groupBy: z.string().optional(),
});

// ============ FILE UPLOAD SCHEMAS ============
export const uploadFileSchema = z.object({
  fileName: z.string(),
  fileSize: z.number().int().max(10 * 1024 * 1024), // 10MB
  mimeType: z.string().refine(
    (type) => ["image/jpeg", "image/png", "image/gif", "application/pdf"].includes(type),
    "Invalid file type"
  ),
});

// ============ GENERIC SCHEMAS ============
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  search: z.string().optional(),
});

export const idParamSchema = z.object({
  id: z.string(),
});

export const slugParamSchema = z.object({
  slug: z.string(),
});

// Helper function to validate and parse data
export function validate<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(JSON.stringify(result.error.issues));
  }
  return result.data;
}

// Helper function to create validation middleware
export function createValidator<T extends z.ZodType>(schema: T) {
  return async (data: unknown): Promise<z.infer<T>> => {
    try {
      return await schema.parseAsync(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        throw new ValidationError(messages);
      }
      throw error;
    }
  };
}

// Custom validation error class
export class ValidationError extends Error {
  constructor(
    public issues: Array<{ field: string; message: string }>
  ) {
    super("Validation failed");
    this.name = "ValidationError";
  }
}
