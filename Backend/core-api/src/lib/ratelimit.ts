import { getRedisClient } from "./redis";

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}

const RATES = {
  auth: { limit: 5, window: 60 * 15 }, // 5 failures per 15 min
  api_write: { limit: 100, window: 60 },
  api_read: { limit: 300, window: 60 },
  default: { limit: 60, window: 60 },
};

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Rate limit timeout")), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export async function checkRateLimit(
  identifier: string,
  type: string = "default",
) {
  let redis;
  try {
    redis = await getRedisClient();
  } catch {
    return { success: true, limit: 0, remaining: 100, reset: 0 };
  }

  const rate =
    (RATES as Record<string, { limit: number; window: number }>)[type] ||
    RATES.default;
  const key = `ratelimit:${type}:${identifier}`;

  try {
    // Simple counter implementation
    const current = await withTimeout(redis.incr(key), 1200);
    if (current === 1) {
      await withTimeout(redis.expire(key, rate.window), 1200);
    }

    const reset = await withTimeout(redis.ttl(key), 1200);

    if (current > rate.limit) {
      return {
        success: false,
        limit: rate.limit,
        remaining: 0,
        reset,
      };
    }

    return {
      success: true,
      limit: rate.limit,
      remaining: rate.limit - current,
      reset,
    };
  } catch {
    return { success: true, limit: 0, remaining: 100, reset: 0 };
  }
}

/**
 * Custom rate limit check with per-route limits.
 * Throws RateLimitError if limit exceeded (matches legacy DB-based API).
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
  let redis;
  try {
    redis = await getRedisClient();
  } catch {
    return; // Fail open if Redis is unavailable
  }

  const key = `ratelimit:${routeKey}:${identifier}`;

  try {
    const current = await withTimeout(redis.incr(key), 1200);
    if (current === 1) {
      await withTimeout(redis.expire(key, windowSeconds), 1200);
    }

    if (current > limit) {
      const ttl = await withTimeout(redis.ttl(key), 1200);
      throw new RateLimitError(
        `Rate limit exceeded. Try again in ${ttl > 0 ? ttl : windowSeconds} seconds.`,
      );
    }
  } catch (e) {
    if (e instanceof RateLimitError) throw e;
    // Fail open on Redis errors
  }
}
