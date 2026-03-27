/**
 * Rate Limiting Middleware
 * Protects APIs from abuse and DDoS attacks
 */

import rateLimit from 'express-rate-limit';
import { NextRequest, NextResponse } from 'next/server';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the request limit. Please try again later.',
    retryAfter: 900 // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many login attempts',
    message: 'Please try again after 15 minutes or reset your password.',
    retryAfter: 900
  },
  skipSuccessfulRequests: true, // only count failed attempts
});

// Payment endpoints - very strict
export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 payment requests per hour
  message: {
    error: 'Too many payment requests',
    message: 'Payment request limit exceeded. Please contact support.',
    retryAfter: 3600
  },
});

// Dashboard stats - more permissive (read-only)
export const dashboardLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per minute
  message: {
    error: 'Too many dashboard requests',
    message: 'Dashboard refresh rate limit exceeded.',
    retryAfter: 60
  },
});

// Industry-specific rate limiters
export const industryDashboardLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60, // 60 requests per minute per industry dashboard
  message: {
    error: 'Too many requests',
    message: 'Dashboard request limit exceeded.',
    retryAfter: 60
  },
});

// Helper function to apply rate limiting in Next.js API routes
export function withRateLimiter(
  handler: (req: NextRequest) => Promise<NextResponse>,
  limiter: ReturnType<typeof rateLimit>,
  identifier: string = 'ip'
) {
  return async function (request: NextRequest): Promise<NextResponse> {
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') ||
               'anonymous';
    
    const key = identifier === 'user' 
      ? `user:${request.headers.get('authorization')}`
      : `ip:${ip}`;

    // Check rate limit
    const response = await new Promise<NextResponse>((resolve, reject) => {
      limiter(
        { headers: { get: () => key } } as any,
        { setHeader: () => {} } as any,
        (err) => {
          if (err) reject(err);
          else resolve(handler(request));
        }
      );
    });

    return response;
  };
}
