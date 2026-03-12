/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { getRedisClient } from "@/lib/redis";
import { logger } from "@vayva/shared";
import { NextResponse } from "next/server";

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}

export class RateLimitService {
  /**
   * Check rate limit for a given key
   */
  async check(key: string, config = { windowMs: 60000, max: 10 }) {
    const now = Date.now();
    const windowStart = now - config.windowMs;
    // Create a unique key for the rate limit bucket
    const redisKey = `ratelimit:${key}`;
    try {
      // Use a simple counter with expiration
      // In a real production scenario with high concurrency, a Lua script or sliding window is better
      // But for this hardening phase, a fixed window counter is sufficient and robust enough
      const redis = await getRedisClient();
      const current = await redis.incr(redisKey);
      if (current === 1) {
        // Set expiration if it's the first request
        await redis.expire(redisKey, Math.ceil(config.windowMs / 1000));
      }
      const remaining = Math.max(0, config.max - current);
      const reset = Math.ceil(now / 1000) + Math.ceil(config.windowMs / 1000); // Approximate reset time
      return {
        success: current <= config.max,
        limit: config.max,
        remaining,
        reset,
      };
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.warn("Rate limit check failed (failing open)", {
        error: _errMsg,
        app: "merchant",
      });
      // Fail open to avoid blocking legitimate traffic if Redis is down
      return {
        success: true,
        limit: config.max,
        remaining: 1,
        reset: Math.ceil(now / 1000) + 60,
      };
    }
  }
  /**
   * Middleware-compatible rate limiter
   */
  async middlewareCheck(
    req: Request,
    keyPrefix = "global",
    config: { windowMs: number; max: number },
  ) {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const key = `${keyPrefix}:${ip}`;
    const result = await this.check(key, config);
    if (!result.success) {
      // Log security event for monitoring
      try {
        // Dynamic import to avoid circular dependencies if any
        const { logAuditEvent, AuditEventType } = await import("@/lib/audit");
        await logAuditEvent(
          "", // No specific store context for global middleware check
          "system",
          AuditEventType.SECURITY_RATE_LIMIT_BLOCKED,
          {
            ipAddress: ip,
            targetType: "endpoint",
            targetId: req.url,
            reason: "Rate limit exceeded",
            meta: { limit: result.limit, remaining: result.remaining },
          },
        );
      } catch (e) {
        logger.error("Failed to log security event", {
          error: e instanceof Error ? e.message : String(e),
        });
      }
      return NextResponse.json(
        { error: "Too many requests, please try again later." },
        { status: 429, headers: { "Retry-After": String(result.reset) } },
      );
    }
    return null; // Null means pass
  }
}
export const rateLimitService = new RateLimitService();

export async function checkRateLimit(
  identifier: string,
  type: "api_read" | "api_write" | string,
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const configByType: Record<string, { windowMs: number; max: number }> = {
    api_read: { windowMs: 60_000, max: 120 },
    api_write: { windowMs: 60_000, max: 30 },
  };
  const config = configByType[type] ?? { windowMs: 60_000, max: 30 };
  return rateLimitService.check(`${type}:${identifier}`, config);
}

/**
 * Legacy-compatible rate limit check that throws RateLimitError
 * @param identifier - User ID, IP, or other unique key
 * @param routeKey - Unique key for the route/action
 * @param limit - Max allowed requests in the window
 * @param windowSeconds - Time window in seconds
 */
export async function checkRateLimitCustom(
  identifier: string,
  routeKey: string,
  limit: number,
  windowSeconds: number,
): Promise<void> {
  const key = `${routeKey}:${identifier}`;
  const result = await rateLimitService.check(key, {
    windowMs: windowSeconds * 1000,
    max: limit,
  });

  if (!result.success) {
    throw new RateLimitError(
      `Rate limit exceeded. Try again in ${result.reset} seconds.`,
    );
  }
}
