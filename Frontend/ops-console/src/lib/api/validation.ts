/**
 * Input Validation Utilities
 * 
 * Provides secure input validation and sanitization for API routes.
 * Prevents injection attacks and ensures data integrity.
 */

import { z } from "zod";

// ============================================================================
// Email Validation
// ============================================================================

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email format")
  .transform((email) => email.toLowerCase().trim());

// ============================================================================
// Password Validation
// ============================================================================

export const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .max(128, "Password must not exceed 128 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    "Password must contain uppercase, lowercase, number, and special character"
  );

// ============================================================================
// UUID Validation
// ============================================================================

export const uuidSchema = z
  .string()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    "Invalid UUID format"
  );

// ============================================================================
// Pagination Validation
// ============================================================================

export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().min(1, "Page must be at least 1")),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().min(1).max(100, "Limit must not exceed 100")),
});

// ============================================================================
// Search Query Validation
// ============================================================================

export const searchQuerySchema = z
  .string()
  .max(200, "Search query too long")
  .transform((q) => q.trim())
  .refine((q) => {
    // Prevent SQL injection patterns
    const dangerousPatterns = [
      /;/,
      /--/,
      /\/\*/,
      /\*\//,
      /xp_/i,
      /exec\s*\(/i,
      /union\s+select/i,
    ];
    return !dangerousPatterns.some((pattern) => pattern.test(q));
  }, "Invalid characters in search query");

// ============================================================================
// Merchant Schemas
// ============================================================================

export const createMerchantSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: emailSchema,
  phone: z.string().max(20).optional(),
  businessType: z.enum(["retail", "wholesale", "service", "digital"]),
});

export const bulkMerchantActionSchema = z.object({
  action: z.enum(["activate", "suspend", "delete", "updateTier"]),
  merchantIds: z.array(uuidSchema).min(1).max(100),
  data: z.object({
    tier: z.string().optional(),
  }).optional(),
});

// ============================================================================
// Order Schemas
// ============================================================================

export const orderStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]);

export const paymentStatusSchema = z.enum([
  "PENDING",
  "SUCCESS",
  "FAILED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
]);

export const orderQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  status: orderStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  storeId: uuidSchema.optional(),
  q: searchQuerySchema.optional(),
});

// ============================================================================
// KYC Schemas
// ============================================================================

export const ninSchema = z
  .string()
  .regex(/^\d{11}$/, "NIN must be 11 digits");

export const cacNumberSchema = z
  .string()
  .regex(/^(RC|BN)?\d+$/, "Invalid CAC number format")
  .optional();

export const kycActionSchema = z.object({
  id: uuidSchema,
  action: z.enum(["approve", "reject"]),
  notes: z.string().max(500).optional(),
});

export const bulkKycSchema = z.object({
  ids: z.array(uuidSchema).min(1).max(50),
  action: z.enum(["approve", "reject"]),
  notes: z.string().max(500).optional(),
});

// ============================================================================
// Dispute Schemas
// ============================================================================

export const approveRefundSchema = z.object({
  refundAmount: z.number().positive("Refund amount must be positive"),
  reason: z.string().min(1).max(500),
});

export const escalateDisputeSchema = z.object({
  note: z.string().max(500).optional(),
});

export const rejectDisputeSchema = z.object({
  reason: z.string().min(1).max(500),
});

// ============================================================================
// User Management Schemas
// ============================================================================

export const createUserSchema = z.object({
  email: emailSchema,
  name: z.string().min(1).max(100).trim(),
  role: z.enum(["OPS_OWNER", "OPS_ADMIN", "OPS_SUPPORT"]),
  password: passwordSchema.optional(),
});

export const updateUserSchema = z.object({
  userId: uuidSchema,
  action: z.enum(["TOGGLE_STATUS", "RESET_2FA"]),
});

// ============================================================================
// Audit Log Schemas
// ============================================================================

export const auditLogQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  eventType: z.string().max(50).optional(),
  actorId: uuidSchema.optional(),
  targetId: z.string().max(100).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// ============================================================================
// Impersonation Schemas
// ============================================================================

export const startImpersonationSchema = z.object({
  targetUserId: uuidSchema,
  targetType: z.enum(["merchant", "customer", "admin"]).default("merchant"),
  reason: z.string().min(10).max(500),
  sessionDuration: z.number().min(5).max(60).default(30), // minutes
});

// ============================================================================
// Sanitization Utilities
// ============================================================================

/**
 * Sanitize string to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Sanitize object values recursively
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = {} as T;
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[key as keyof T] = sanitizeString(value) as T[keyof T];
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      result[key as keyof T] = sanitizeObject(value as Record<string, unknown>) as T[keyof T];
    } else if (Array.isArray(value)) {
      result[key as keyof T] = value.map((item: any) =>
        typeof item === "string" ? sanitizeString(item) : item
      ) as T[keyof T];
    } else {
      result[key as keyof T] = value as T[keyof T];
    }
  }
  
  return result;
}

/**
 * Validate and sanitize JSON input
 */
export function safeJSONParse<T>(input: string, schema: z.ZodSchema<T>): T | null {
  try {
    const parsed = JSON.parse(input);
    return schema.parse(parsed);
  } catch {
    return null;
  }
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: { name: string; type: string; size: number },
  options: {
    allowedTypes?: string[];
    maxSize?: number; // bytes
  } = {}
): { valid: boolean; error?: string } {
  const { allowedTypes = ["image/jpeg", "image/png", "application/pdf"], maxSize = 5 * 1024 * 1024 } = options;
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `Invalid file type. Allowed: ${allowedTypes.join(", ")}` };
  }
  
  // Check file size
  if (file.size > maxSize) {
    return { valid: false, error: `File too large. Max size: ${maxSize / 1024 / 1024}MB` };
  }
  
  // Check for path traversal in filename
  if (file.name.includes("..") || file.name.includes("/") || file.name.includes("\\")) {
    return { valid: false, error: "Invalid filename" };
  }
  
  return { valid: true };
}

/**
 * Rate limiting key generator
 */
export function generateRateLimitKey(
  identifier: string,
  endpoint: string
): string {
  return `rate_limit:${endpoint}:${identifier}`;
}

/**
 * IP address extraction and validation
 */
export function extractIPAddress(req: Request): string | null {
  // Try various headers
  const headers = req.headers;
  const forwarded = headers.get("x-forwarded-for");
  const realIP = headers.get("x-real-ip");
  
  if (forwarded) {
    // Get first IP from forwarded chain
    const ips = forwarded.split(",").map((ip) => ip.trim());
    const firstIP = ips[0];
    if (isValidIP(firstIP)) {
      return firstIP;
    }
  }
  
  if (realIP && isValidIP(realIP)) {
    return realIP;
  }
  
  return null;
}

/**
 * Validate IP address format
 */
function isValidIP(ip: string): boolean {
  // IPv4 validation
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(ip)) {
    const parts = ip.split(".").map(Number);
    return parts.every((part) => part >= 0 && part <= 255);
  }
  
  // IPv6 validation (simplified)
  const ipv6Regex = /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i;
  if (ipv6Regex.test(ip)) {
    return true;
  }
  
  return false;
}
