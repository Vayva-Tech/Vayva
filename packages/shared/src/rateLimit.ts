import { getRedis } from "@vayva/redis";
import type { Redis } from "ioredis";

export type RateLimitResult =
  | { ok: true; remaining?: number; retryAfterSec?: number }
  | { ok: false; retryAfterSec: number };

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("rate limit timeout")), ms);
    promise
      .then((v) => {
        clearTimeout(t);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(t);
        reject(e);
      });
  });
}

/**
 * Fixed-window rate limit using Redis INCR + EXPIRE.
 *
 * - **Fail-open** if Redis is unavailable.
 * - Key should already be namespaced, e.g. `rl:login:ip:1.2.3.4`.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> {
  if (!key || !Number.isFinite(limit) || !Number.isFinite(windowSec)) {
    return { ok: true };
  }

  const redisKey = `rl:${key}`;

  try {
    const redis = (await withTimeout(getRedis(), 1200)) as unknown as Redis;

    const current = Number(await withTimeout(redis.incr(redisKey), 1200));
    if (current === 1) {
      await withTimeout(redis.expire(redisKey, windowSec), 1200);
    }

    const ttl = Number(await withTimeout(redis.ttl(redisKey), 1200));
    const retryAfterSec = Math.max(0, Number.isFinite(ttl) ? ttl : windowSec);

    if (current > limit) {
      return { ok: false, retryAfterSec };
    }

    return { ok: true, remaining: Math.max(0, limit - current), retryAfterSec };
  } catch {
    return { ok: true };
  }
}
