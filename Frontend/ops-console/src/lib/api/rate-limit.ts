/**
 * Rate Limiting Service for Ops Console API
 * 
 * Provides configurable rate limiting with Redis support for production
 * and in-memory fallback for development.
 */

import { logger } from "@vayva/shared";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Default rate limits by endpoint type
export const RateLimits = {
  // Authentication endpoints (strict)
  AUTH_LOGIN: { maxRequests: 5, windowMs: 5 * 60 * 1000 }, // 5 per 5 minutes
  AUTH_MFA: { maxRequests: 3, windowMs: 5 * 60 * 1000 }, // 3 per 5 minutes
  
  // Write operations (moderate)
  WRITE_DEFAULT: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 per minute
  WRITE_SENSITIVE: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 per minute
  BULK_OPERATIONS: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 per minute
  
  // Read operations (generous)
  READ_DEFAULT: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 per minute
  
  // Export operations (strict due to resource usage)
  EXPORT: { maxRequests: 3, windowMs: 60 * 1000 }, // 3 per minute
} as const;

// In-memory store for development/testing
const memoryStore = new Map<string, RateLimitEntry>();

/**
 * Check if Redis is available (production)
 */
function isRedisAvailable(): boolean {
  return !!process.env.REDIS_URL;
}

/**
 * Get Redis client (lazy initialization)
 */
async function getRedisClient() {
  if (!isRedisAvailable()) return null;
  
  try {
    // Dynamic import to avoid loading Redis in dev if not needed
    const { Redis } = await import("ioredis");
    return new Redis(process.env.REDIS_URL!);
  } catch (error) {
    logger.warn("[RATE_LIMIT] Redis not available, falling back to memory store", {
      error: error instanceof Error
        ? { message: error.message, stack: error.stack }
        : error,
    });
    return null;
  }
}

/**
 * Generate rate limit key
 */
function getRateLimitKey(
  identifier: string,
  endpoint: string,
  limitType: keyof typeof RateLimits
): string {
  return `ratelimit:${limitType}:${identifier}:${endpoint}`;
}

/**
 * Check rate limit using in-memory store
 */
function checkMemoryRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = memoryStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    // First request or window expired
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    memoryStore.set(key, newEntry);
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: newEntry.resetTime,
    };
  }
  
  // Window still active
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }
  
  entry.count++;
  memoryStore.set(key, entry);
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Check rate limit using Redis (production)
 */
async function checkRedisRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const redis = await getRedisClient();
  if (!redis) {
    return checkMemoryRateLimit(key, config);
  }
  
  try {
    const now = Date.now();
    const windowKey = `${key}:${Math.floor(now / config.windowMs)}`;
    
    // Use Redis pipeline for atomic operations
    const pipeline = redis.pipeline();
    pipeline.incr(windowKey);
    pipeline.pexpire(windowKey, config.windowMs);
    
    const results = await pipeline.exec();
    const count = (results?.[0]?.[1] as number) || 0;
    
    const resetTime = Math.floor(now / config.windowMs) * config.windowMs + config.windowMs;
    
    if (count > config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime,
      };
    }
    
    return {
      allowed: true,
      remaining: Math.max(0, config.maxRequests - count),
      resetTime,
    };
  } catch (error) {
    logger.error("[RATE_LIMIT] Redis error, falling back to memory", { error });
    return checkMemoryRateLimit(key, config);
  }
}

/**
 * Main rate limiting function
 */
export async function checkRateLimit(
  identifier: string,
  endpoint: string,
  limitType: keyof typeof RateLimits = "READ_DEFAULT"
): Promise<{ allowed: boolean; remaining: number; resetTime: number; retryAfter?: number }> {
  const config = RateLimits[limitType];
  const key = getRateLimitKey(identifier, endpoint, limitType);
  
  let result: { allowed: boolean; remaining: number; resetTime: number };
  
  if (isRedisAvailable()) {
    result = await checkRedisRateLimit(key, config);
  } else {
    result = checkMemoryRateLimit(key, config);
  }
  
  // Calculate retry-after seconds
  const retryAfter = !result.allowed
    ? Math.ceil((result.resetTime - Date.now()) / 1000)
    : undefined;
  
  return {
    ...result,
    retryAfter,
  };
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(
  req: Request,
  userId?: string
): string {
  // Prefer user ID if authenticated
  if (userId) {
    return `user:${userId}`;
  }
  
  // Fall back to IP address
  const ip = req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";
  
  return `ip:${ip}`;
}

/**
 * Rate limiting middleware for API routes
 */
export async function withRateLimit<T>(
  req: Request,
  handler: () => Promise<T>,
  options: {
    limitType: keyof typeof RateLimits;
    endpoint: string;
    userId?: string;
  }
): Promise<T | Response> {
  const identifier = getClientIdentifier(req, options.userId);
  
  const result = await checkRateLimit(identifier, options.endpoint, options.limitType);
  
  if (!result.allowed) {
    logger.warn("[RATE_LIMIT] Request blocked", {
      identifier,
      endpoint: options.endpoint,
      limitType: options.limitType,
    });
    
    // Return 429 response
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-RateLimit-Limit": String(RateLimits[options.limitType].maxRequests),
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": String(Math.ceil(result.resetTime / 1000)),
    };
    
    if (result.retryAfter) {
      headers["Retry-After"] = String(result.retryAfter);
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: "RATE_001",
          message: "Rate limit exceeded. Please try again later.",
        },
        meta: {
          requestId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date().toISOString(),
        },
      }),
      {
        status: 429,
        headers,
      }
    );
  }
  
  // Add rate limit headers to successful response
  const response = await handler();
  
  if (response instanceof Response) {
    response.headers.set("X-RateLimit-Limit", String(RateLimits[options.limitType].maxRequests));
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    response.headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetTime / 1000)));
  }
  
  return response;
}

/**
 * Reset rate limit for testing
 */
export function resetRateLimit(
  identifier: string,
  endpoint: string,
  limitType: keyof typeof RateLimits
): void {
  const key = getRateLimitKey(identifier, endpoint, limitType);
  memoryStore.delete(key);
}

/**
 * Cleanup expired entries from memory store (call periodically)
 */
export function cleanupExpiredRateLimits(): void {
  const now = Date.now();
  for (const [key, entry] of memoryStore.entries()) {
    if (now > entry.resetTime) {
      memoryStore.delete(key);
    }
  }
}
