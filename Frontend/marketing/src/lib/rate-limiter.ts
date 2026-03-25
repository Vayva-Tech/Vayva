/**
 * Simple in-memory rate limiter for marketing API endpoints
 * Production deployment should use Redis-based rate limiting (e.g., @upstash/ratelimit)
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (use Redis in production)
const store: RateLimitStore = {};

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // Window in milliseconds
}

const defaultConfig: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
};

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Check if request is within rate limit
 * Uses sliding window algorithm
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = defaultConfig
): RateLimitResult {
  const now = Date.now();
  const record = store[identifier];

  if (!record || now > record.resetTime) {
    // New window
    store[identifier] = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: store[identifier].resetTime,
    };
  }

  // Existing window
  if (record.count >= config.maxRequests) {
    // Rate limit exceeded
    return {
      success: false,
      remaining: 0,
      resetTime: record.resetTime,
      retryAfter: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  // Increment counter
  record.count++;
  return {
    success: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Get client identifier (IP address or fingerprint)
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers (works behind proxy/CDN)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback to remote address
  return 'unknown';
}

/**
 * Create rate limit headers
 */
export function getRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': '10',
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetTime.toString(),
    ...(result.retryAfter && {
      'Retry-After': result.retryAfter.toString(),
    }),
  };
}

/**
 * Clean up old entries from store (call periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (now > store[key].resetTime) {
      delete store[key];
    }
  });
}

// Auto-cleanup every 5 minutes
if (typeof globalThis !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}
