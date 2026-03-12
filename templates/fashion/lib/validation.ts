import { z } from 'zod';
import { NextResponse } from 'next/server';

// Generic API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

// Validation schemas
export const ProductQuerySchema = z.object({
  category: z.string().optional(),
  minPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  maxPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  search: z.string().optional(),
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('20').transform(Number),
  sortBy: z.enum(['newest', 'price_asc', 'price_desc', 'rating']).optional().default('newest'),
});

export const CheckoutInitiateSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1, "Product ID is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
  })).min(1, "Cart cannot be empty"),
  customerInfo: z.object({
    email: z.string().email("Valid email is required"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    phone: z.string().optional(),
  }),
  shippingAddress: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
    zipCode: z.string().min(1, "ZIP code is required"),
  }),
  billingAddress: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
    zipCode: z.string().min(1, "ZIP code is required"),
  }).optional(),
});

export const PaymentVerifySchema = z.object({
  reference: z.string().min(1, "Payment reference is required"),
  orderId: z.string().min(1, "Order ID is required"),
});

export const OrderQuerySchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'all']).optional(),
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('10').transform(Number),
});

// Validation helper function
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error };
    }
    throw error;
  }
}

// Error response helpers
export function createErrorResponse(
  message: string,
  status: number = 400,
  code?: string,
  details?: any
): NextResponse {
  const response: ApiResponse = {
    success: false,
    error: {
      message,
      code,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  return NextResponse.json(response, { status });
}

export function createSuccessResponse<T>(
  data: T,
  status: number = 200,
  meta?: any
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };

  return NextResponse.json(response, { status });
}

// Rate limiting middleware
interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(config: RateLimitConfig) {
  return function (clientId: string) {
    const now = Date.now();
    const window = rateLimitStore.get(clientId);

    if (!window || now > window.resetTime) {
      rateLimitStore.set(clientId, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return { success: true };
    }

    if (window.count >= config.max) {
      return {
        success: false,
        message: config.message || 'Too many requests, please try again later',
        resetTime: window.resetTime,
      };
    }

    window.count++;
    rateLimitStore.set(clientId, window);
    return { success: true };
  };
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+="[^"]*"/gi, '');
}

// Logger utility
export class ApiLogger {
  static info(message: string, meta?: any) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta || '');
  }

  static error(message: string, error?: any, meta?: any) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, {
      error,
      ...meta,
    });
  }

  static warn(message: string, meta?: any) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta || '');
  }
}