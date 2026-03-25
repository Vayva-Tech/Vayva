const buckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Process-local fixed window limiter (suitable for single-instance or best-effort per pod).
 * For strict global limits, use Redis-backed middleware at the edge.
 */
export function checkMemoryRateLimit(
  key: string,
  max: number,
  windowMs: number,
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }
  entry.count += 1;
  if (entry.count > max) {
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: max - entry.count };
}

export const rateLimit = {
  check: async (identifier: string, limit: number, window: number) => {
    const { allowed, remaining } = checkMemoryRateLimit(
      identifier,
      limit,
      window,
    );
    return { success: allowed, remaining };
  },
};
