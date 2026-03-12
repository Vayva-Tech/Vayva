// Security enhancements for the Fashion template
import { z } from 'zod';
import { NextResponse } from 'next/server';

// Security utilities class
export class SecurityUtils {
  // CSRF Token generation
  static generateCSRFToken(): string {
    return crypto.randomUUID();
  }

  // XSS sanitization for browser environments
  static sanitizeHTML(input: string): string {
    if (typeof document === 'undefined') return input; // Server-side check
    
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  // Input validation and sanitization
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove basic HTML tags
      .replace(/javascript:/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .substring(0, 1000); // Limit length
  }

  // Email validation
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Phone number validation (Nigerian format)
  static validatePhone(phone: string): boolean {
    const phoneRegex = /^(\+?234|0)?[789]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  // Password strength validation
  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Enhanced validation schemas with security
export const SecureProductQuerySchema = z.object({
  category: z.string().optional().transform(SecurityUtils.sanitizeInput),
  minPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  maxPrice: z.string().optional().transform(val => val ? parseFloat(val) : undefined),
  search: z.string().optional().transform(SecurityUtils.sanitizeInput),
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('20').transform(Number),
  sortBy: z.enum(['newest', 'price_asc', 'price_desc', 'rating']).optional().default('newest'),
});

export const SecureCheckoutInitiateSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1, "Product ID is required").max(50),
    quantity: z.number().min(1, "Quantity must be at least 1").max(99),
  })).min(1, "Cart cannot be empty").max(50, "Cart too large"),
  customerInfo: z.object({
    email: z.string().email("Valid email is required").max(254),
    firstName: z.string().min(1, "First name is required").max(50),
    lastName: z.string().min(1, "Last name is required").max(50),
    phone: z.string().optional().refine(
      val => !val || SecurityUtils.validatePhone(val),
      "Invalid phone number format"
    ),
  }),
  shippingAddress: z.object({
    street: z.string().min(1, "Street address is required").max(200),
    city: z.string().min(1, "City is required").max(100),
    state: z.string().min(1, "State is required").max(100),
    country: z.string().min(1, "Country is required").max(100),
    zipCode: z.string().min(1, "ZIP code is required").max(20),
  }),
  billingAddress: z.object({
    street: z.string().min(1, "Street address is required").max(200),
    city: z.string().min(1, "City is required").max(100),
    state: z.string().min(1, "State is required").max(100),
    country: z.string().min(1, "Country is required").max(100),
    zipCode: z.string().min(1, "ZIP code is required").max(20),
  }).optional(),
}).refine(
  data => {
    // Ensure billing address matches shipping if not provided
    if (!data.billingAddress) {
      data.billingAddress = { ...data.shippingAddress };
    }
    return true;
  }
);

export const SecurePaymentVerifySchema = z.object({
  reference: z.string().min(1, "Payment reference is required").max(100),
  orderId: z.string().min(1, "Order ID is required").max(50),
});

export const SecureUserRegistrationSchema = z.object({
  email: z.string().email("Valid email is required").max(254),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  phone: z.string().optional().refine(
    val => !val || SecurityUtils.validatePhone(val),
    "Invalid phone number format"
  ),
}).superRefine((data, ctx) => {
  const passwordValidation = SecurityUtils.validatePassword(data.password);
  if (!passwordValidation.valid) {
    passwordValidation.errors.forEach(error => {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: error,
        path: ['password']
      });
    });
  }
});

// Rate limiting with sliding window
export class EnhancedRateLimiter {
  private static store = new Map<string, { timestamps: number[] }>();

  static checkLimit(
    clientId: string, 
    maxRequests: number, 
    windowMs: number
  ): { allowed: boolean; resetTime?: number } {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!this.store.has(clientId)) {
      this.store.set(clientId, { timestamps: [now] });
      return { allowed: true };
    }

    const clientData = this.store.get(clientId)!;
    
    // Remove expired timestamps
    clientData.timestamps = clientData.timestamps.filter(timestamp => timestamp > windowStart);
    
    if (clientData.timestamps.length >= maxRequests) {
      const oldestTimestamp = Math.min(...clientData.timestamps);
      return { 
        allowed: false, 
        resetTime: oldestTimestamp + windowMs 
      };
    }

    clientData.timestamps.push(now);
    this.store.set(clientId, clientData);
    
    return { allowed: true };
  }

  static getRemainingRequests(clientId: string, maxRequests: number, windowMs: number): number {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    const clientData = this.store.get(clientId);
    if (!clientData) return maxRequests;
    
    const recentRequests = clientData.timestamps.filter(timestamp => timestamp > windowStart);
    return Math.max(0, maxRequests - recentRequests.length);
  }
}

// Security headers middleware
export function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'");
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  return response;
}

// Input validation for API routes
export function validateAndSanitizeInputs(inputs: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(inputs)) {
    if (typeof value === 'string') {
      sanitized[key] = SecurityUtils.sanitizeInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? SecurityUtils.sanitizeInput(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// Brute force protection
export class BruteForceProtection {
  private static attempts = new Map<string, { count: number; lastAttempt: number }>();
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  static recordAttempt(identifier: string): { blocked: boolean; remainingAttempts?: number } {
    const now = Date.now();
    const attemptData = this.attempts.get(identifier) || { count: 0, lastAttempt: 0 };

    // Reset count if lockout period has passed
    if (now - attemptData.lastAttempt > this.LOCKOUT_DURATION) {
      attemptData.count = 0;
    }

    attemptData.count++;
    attemptData.lastAttempt = now;
    this.attempts.set(identifier, attemptData);

    if (attemptData.count >= this.MAX_ATTEMPTS) {
      return { blocked: true };
    }

    return { 
      blocked: false, 
      remainingAttempts: this.MAX_ATTEMPTS - attemptData.count 
    };
  }

  static isBlocked(identifier: string): boolean {
    const attemptData = this.attempts.get(identifier);
    if (!attemptData) return false;

    const now = Date.now();
    return attemptData.count >= this.MAX_ATTEMPTS && 
           (now - attemptData.lastAttempt) < this.LOCKOUT_DURATION;
  }

  static clearAttempts(identifier: string): void {
    this.attempts.delete(identifier);
  }
}