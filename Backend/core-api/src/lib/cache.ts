import { getRedisClient } from "@/lib/redis";
import { logger } from "@vayva/shared";

export interface CacheConfig {
  ttl: number; // Time to live in seconds
  keyGenerator?: (req: Request, userId?: string) => string;
  cacheKeyPrefix: string;
  skipCache?: (req: Request) => boolean;
}

// Hot endpoint configurations
export const CACHE_CONFIGS: Record<string, CacheConfig> = {
  dashboardOverview: {
    ttl: 60 * 5, // 5 minutes
    cacheKeyPrefix: "cache:dashboard:overview",
    keyGenerator: (_req: Request, userId?: string) => {
      return `cache:dashboard:overview:${userId || "anon"}`;
    },
  },
  notificationCount: {
    ttl: 30, // 30 seconds - notifications change frequently
    cacheKeyPrefix: "cache:notifications:count",
    keyGenerator: (_req: Request, userId?: string) => {
      return `cache:notifications:count:${userId || "anon"}`;
    },
  },
  notificationsList: {
    ttl: 60, // 1 minute
    cacheKeyPrefix: "cache:notifications:list",
    keyGenerator: (req: Request, userId?: string) => {
      const url = new URL(req.url);
      const page = url.searchParams.get("page") || "1";
      const limit = url.searchParams.get("limit") || "20";
      return `cache:notifications:list:${userId || "anon"}:${page}:${limit}`;
    },
  },
  productList: {
    ttl: 60 * 2, // 2 minutes
    cacheKeyPrefix: "cache:products:list",
    keyGenerator: (req: Request, userId?: string) => {
      const url = new URL(req.url);
      const search = url.searchParams.get("search") || "";
      const category = url.searchParams.get("category") || "all";
      const page = url.searchParams.get("page") || "1";
      return `cache:products:list:${userId || "anon"}:${search}:${category}:${page}`;
    },
    skipCache: (req: Request) => {
      // Skip cache for POST/PUT/DELETE
      return ["POST", "PUT", "DELETE", "PATCH"].includes(req.method);
    },
  },
  orderStats: {
    ttl: 60 * 3, // 3 minutes
    cacheKeyPrefix: "cache:orders:stats",
    keyGenerator: (_req: Request, userId?: string) => {
      return `cache:orders:stats:${userId || "anon"}`;
    },
  },
  accountingLedger: {
    ttl: 60 * 5, // 5 minutes
    cacheKeyPrefix: "cache:accounting:ledger",
    keyGenerator: (req: Request, userId?: string) => {
      const url = new URL(req.url);
      const startDate = url.searchParams.get("startDate") || "";
      const endDate = url.searchParams.get("endDate") || "";
      return `cache:accounting:ledger:${userId || "anon"}:${startDate}:${endDate}`;
    },
  },
};

/**
 * Get cached response from Redis
 */
export async function getCachedResponse(
  cacheKey: string,
): Promise<{ data: unknown; etag: string } | null> {
  try {
    const redis = await getRedisClient();
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  } catch (error) {
    logger.warn("Cache get failed (failing open)", { error, cacheKey });
    return null;
  }
}

/**
 * Store response in Redis cache
 */
export async function setCachedResponse(
  cacheKey: string,
  data: unknown,
  ttl: number,
): Promise<void> {
  try {
    const redis = await getRedisClient();
    const etag = generateETag(data);
    const cacheData = { data, etag, cachedAt: Date.now() };
    await redis.setex(cacheKey, ttl, JSON.stringify(cacheData));
  } catch (error) {
    logger.warn("Cache set failed", { error, cacheKey });
  }
}

/**
 * Invalidate cache by pattern
 */
export async function invalidateCache(
  pattern: string,
  storeId?: string,
): Promise<void> {
  try {
    const redis = await getRedisClient();
    const fullPattern = storeId ? `${pattern}:${storeId}*` : `${pattern}*`;
    const keys = await redis.keys(fullPattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      logger.info("Cache invalidated", { pattern, count: keys.length, storeId });
    }
  } catch (error) {
    logger.warn("Cache invalidation failed", { error, pattern, storeId });
  }
}

/**
 * Generate ETag for cache validation
 */
function generateETag(data: unknown): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return `"${hash.toString(16)}"`;
}

/**
 * Cache middleware for Next.js API routes
 * Usage: Wrap your handler with this function
 * 
 * Example:
 * export async function GET(req: NextRequest) {
 *   return withCache(req, CACHE_CONFIGS.dashboardOverview, async (session) => {
 *     // Your handler logic
 *     return { data: dashboardData };
 *   });
 * }
 */
export async function withCache<T>(
  req: Request,
  config: CacheConfig,
  userId: string,
  handler: () => Promise<T>,
): Promise<{ data: T; cached: boolean; etag?: string }> {
  // Skip cache for non-GET requests or if skipCache returns true
  if (req.method !== "GET" || (config.skipCache && config.skipCache(req))) {
    const data = await handler();
    return { data, cached: false };
  }

  const cacheKey = config.keyGenerator
    ? config.keyGenerator(req, userId)
    : `${config.cacheKeyPrefix}:${userId}`;

  // Check If-None-Match header for conditional requests
  const ifNoneMatch = req.headers.get("if-none-match");

  // Try to get from cache
  const cached = await getCachedResponse(cacheKey);
  if (cached) {
    // Return 304 Not Modified if ETag matches
    if (ifNoneMatch && ifNoneMatch === cached.etag) {
      return { data: cached.data as T, cached: true, etag: cached.etag };
    }
    return { data: cached.data as T, cached: true, etag: cached.etag };
  }

  // Execute handler and cache result
  const data = await handler();
  await setCachedResponse(cacheKey, data, config.ttl);
  const etag = generateETag(data);

  return { data, cached: false, etag };
}

/**
 * Middleware wrapper for hot endpoints
 * Automatically applies caching based on route configuration
 */
export function createCacheMiddleware(config: CacheConfig) {
  return async function cacheMiddleware(
    req: Request,
    userId: string,
    handler: () => Promise<unknown>,
  ) {
    return withCache(req, config, userId, handler);
  };
}
