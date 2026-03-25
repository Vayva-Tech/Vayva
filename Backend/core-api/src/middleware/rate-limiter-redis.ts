import { NextRequest, NextResponse } from 'next/server';
import { getRedis } from '@vayva/redis';

interface RateLimitConfig {
  interval: number; // milliseconds
  maxRequests: number;
}

/**
 * Rate limiting middleware for API routes using Redis
 * 
 * Usage:
 * export default withRateLimiting(handler, { interval: 900000, maxRequests: 10 });
 */
export function withRateLimiting(
  handler: (req: NextRequest) => Promise<NextResponse>,
  config: RateLimitConfig
) {
  return async function (req: NextRequest): Promise<NextResponse> {
    const clientId = getClientIdentifier(req);
    const now = Date.now();
    const windowKey = `ratelimit:${clientId}:${Math.floor(now / config.interval)}`;

    try {
      const redis = await getRedis();

      // Increment request count in current window
      const currentCount = await redis.incr(windowKey);
      
      // Set expiry on first request
      if (currentCount === 1) {
        await redis.expire(windowKey, Math.ceil(config.interval / 1000));
      }

      // Check if rate limited
      if (currentCount > config.maxRequests) {
        const ttl = await redis.ttl(windowKey);
        const retryAfter = Math.max(ttl, 1);

        return NextResponse.json(
          {
            error: 'Too many requests',
            message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
            retryAfter,
          },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': config.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': (now + ttl * 1000).toString(),
              'Retry-After': retryAfter.toString(),
            },
          }
        );
      }

      // Add rate limit headers to successful response
      const response = await handler(req);

      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
      response.headers.set(
        'X-RateLimit-Remaining',
        (config.maxRequests - currentCount).toString()
      );
      response.headers.set('X-RateLimit-Reset', (now + config.interval).toString());

      return response;
    } catch (error) {
      console.error('Rate limiting error:', error);
      
      // Fallback: allow request if Redis is unavailable
      // This prevents rate limiting from blocking all traffic
      return handler(req);
    }
  };
}

/**
 * Get unique client identifier
 * Prioritizes: API key > User ID > IP address
 */
function getClientIdentifier(req: NextRequest): string {
  // Check for API key
  const apiKey = req.headers.get('x-api-key');
  if (apiKey) return `api:${apiKey}`;

  // Check for user ID (from auth)
  const userId = req.headers.get('x-user-id');
  if (userId) return `user:${userId}`;

  // Fallback to IP address
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return `ip:${ip}`;
}

/**
 * Pre-configured rate limit presets
 */
export const RateLimitPresets = {
  // OAuth endpoints: 10 requests per 15 minutes
  oauth: { interval: 900000, maxRequests: 10 },
  
  // General API: 100 requests per minute
  general: { interval: 60000, maxRequests: 100 },
  
  // Email sending: 5 per hour
  email: { interval: 3600000, maxRequests: 5 },
  
  // Webhook receivers: 1000 per minute
  webhook: { interval: 60000, maxRequests: 1000 },
  
  // AI insights: 20 per hour
  ai: { interval: 3600000, maxRequests: 20 },
};

/**
 * Utility: Clear rate limit for a client (admin function)
 */
export async function clearRateLimit(clientId: string): Promise<void> {
  try {
    const redis = await getRedis();
    const pattern = `ratelimit:${clientId}:*`;
    const keys = await redis.keys(pattern);
    
    if (keys.length > 0) {
      await redis.del(...keys);
      console.warn(`Cleared rate limit for ${clientId}`);
    }
  } catch (error) {
    console.error('Failed to clear rate limit:', error);
  }
}

/**
 * Utility: Get current rate limit status for a client
 */
export async function getRateLimitStatus(
  clientId: string,
  config: RateLimitConfig
): Promise<{ count: number; remaining: number; resetIn: number }> {
  try {
    const redis = await getRedis();
    const now = Date.now();
    const windowKey = `ratelimit:${clientId}:${Math.floor(now / config.interval)}`;

    const [count, ttl] = await Promise.all([
      redis.get(windowKey),
      redis.ttl(windowKey),
    ]);

    const currentCount = parseInt(count || '0', 10);
    const remaining = Math.max(0, config.maxRequests - currentCount);
    const resetIn = Math.max(0, ttl * 1000);

    return { count: currentCount, remaining, resetIn };
  } catch (error) {
    console.error('Failed to get rate limit status:', error);
    return { count: 0, remaining: config.maxRequests, resetIn: 0 };
  }
}
