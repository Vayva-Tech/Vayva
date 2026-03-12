/**
 * Rate Limiting Middleware
 * Implements tier-based rate limiting for API endpoints
 */

import { NextRequest, NextResponse } from 'next/server';

export interface RateLimitConfig {
  free: number;        // requests per hour
  starter: number;     // requests per hour
  pro: number;         // requests per hour
  enterprise: number;  // requests per hour
}

export const DEFAULT_LIMITS: RateLimitConfig = {
  free: 100,
  starter: 500,
  pro: 2000,
  enterprise: 10000,
};

interface RateLimitState {
  count: number;
  resetAt: number;
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitState>();

/**
 * Get rate limit based on plan tier
 */
export function getRateLimitForTier(tier: string): number {
  switch (tier.toLowerCase()) {
    case 'enterprise':
      return DEFAULT_LIMITS.enterprise;
    case 'pro':
      return DEFAULT_LIMITS.pro;
    case 'starter':
      return DEFAULT_LIMITS.starter;
    default:
      return DEFAULT_LIMITS.free;
  }
}

/**
 * Check if request should be rate limited
 */
export function checkRateLimit(
  userId: string,
  tier: string = 'free'
): { allowed: boolean; remaining: number; resetAt: number } {
  const limit = getRateLimitForTier(tier);
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour window
  
  const state = rateLimitStore.get(userId);
  
  if (!state || now > state.resetAt) {
    // New window
    rateLimitStore.set(userId, {
      count: 1,
      resetAt: now + windowMs,
    });
    
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: now + windowMs,
    };
  }
  
  if (state.count >= limit) {
    // Rate limited
    return {
      allowed: false,
      remaining: 0,
      resetAt: state.resetAt,
    };
  }
  
  // Increment counter
  state.count++;
  rateLimitStore.set(userId, state);
  
  return {
    allowed: true,
    remaining: limit - state.count,
    resetAt: state.resetAt,
  };
}

/**
 * Create rate limiting middleware
 */
export function withRateLimit<T extends (...args: any[]) => any>(
  handler: T,
  options?: {
    tierField?: string;
    customLimits?: Partial<RateLimitConfig>;
  }
) {
  return async (request: NextRequest, ...rest: any[]) => {
    try {
      // Extract user ID from request (adjust based on your auth)
      const userId = request.headers.get('x-user-id');
      const tier = request.headers.get('x-plan-tier') || 'free';
      
      if (!userId) {
        // Can't rate limit without user ID, allow but log
        console.warn('[RATE LIMIT] No user ID provided');
        return handler(request, ...rest);
      }
      
      const limits = options?.customLimits 
        ? { ...DEFAULT_LIMITS, ...options.customLimits }
        : DEFAULT_LIMITS;
      
      const limit = getRateLimitForTier(tier);
      const result = checkRateLimit(userId, tier);
      
      // Add rate limit headers to response
      const headers = {
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(result.resetAt),
      };
      
      if (!result.allowed) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: `You've exceeded your ${limit} requests per hour limit.`,
            retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
          },
          {
            status: 429,
            headers,
          }
        );
      }
      
      // Proceed with request
      const response = await handler(request, ...rest);
      
      // Add headers to response
      if (response instanceof NextResponse) {
        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      }
      
      return response;
    } catch (error) {
      console.error('[RATE LIMIT] Error:', error);
      return handler(request, ...rest);
    }
  };
}

/**
 * Clean up old entries (call periodically)
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [userId, state] of rateLimitStore.entries()) {
    if (now > state.resetAt) {
      rateLimitStore.delete(userId);
      cleaned++;
    }
  }
  
  return cleaned;
}
