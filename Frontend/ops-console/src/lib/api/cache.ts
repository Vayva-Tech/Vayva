/**
 * Caching Service for Ops Console
 * 
 * Provides Redis-backed caching with in-memory fallback.
 * Used for API response caching, session caching, and frequent data.
 */

import { logger } from "@vayva/shared";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  keyPrefix?: string;
}

// In-memory cache for development/fallback
const memoryCache = new Map<string, CacheEntry<unknown>>();

/**
 * Check if Redis is available
 */
function isRedisAvailable(): boolean {
  return !!process.env.REDIS_URL;
}

/**
 * Get Redis client
 */
async function getRedisClient() {
  if (!isRedisAvailable()) return null;
  
  try {
    const { Redis } = await import("ioredis");
    return new Redis(process.env.REDIS_URL!);
  } catch (error) {
    logger.warn("[CACHE] Redis not available, using memory cache", {
      error: error instanceof Error
        ? { message: error.message, stack: error.stack }
        : error,
    });
    return null;
  }
}

/**
 * Generate cache key
 */
function generateCacheKey(key: string, prefix?: string): string {
  return prefix ? `${prefix}:${key}` : `ops:${key}`;
}

/**
 * Set value in cache
 */
export async function setCache<T>(
  key: string,
  value: T,
  config: CacheConfig
): Promise<void> {
  const fullKey = generateCacheKey(key, config.keyPrefix);
  const expiresAt = Date.now() + config.ttl;
  
  // Try Redis first
  const redis = await getRedisClient();
  if (redis) {
    try {
      await redis.setex(
        fullKey,
        Math.ceil(config.ttl / 1000),
        JSON.stringify(value)
      );
      return;
    } catch (error) {
      logger.error("[CACHE] Redis set error, falling back to memory", {
        error: error instanceof Error
          ? { message: error.message, stack: error.stack }
          : error,
      });
    }
  }
  
  // Fallback to memory cache
  memoryCache.set(fullKey, { value, expiresAt });
}

/**
 * Get value from cache
 */
export async function getCache<T>(key: string, prefix?: string): Promise<T | null> {
  const fullKey = generateCacheKey(key, prefix);
  
  // Try Redis first
  const redis = await getRedisClient();
  if (redis) {
    try {
      const value = await redis.get(fullKey);
      if (value) {
        return JSON.parse(value) as T;
      }
      return null;
    } catch (error) {
      logger.error("[CACHE] Redis get error, falling back to memory", {
        error: error instanceof Error
          ? { message: error.message, stack: error.stack }
          : error,
      });
    }
  }
  
  // Fallback to memory cache
  const entry = memoryCache.get(fullKey);
  if (!entry) return null;
  
  // Check expiration
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(fullKey);
    return null;
  }
  
  return entry.value as T;
}

/**
 * Delete value from cache
 */
export async function deleteCache(key: string, prefix?: string): Promise<void> {
  const fullKey = generateCacheKey(key, prefix);
  
  const redis = await getRedisClient();
  if (redis) {
    try {
      await redis.del(fullKey);
      return;
    } catch (error) {
      logger.error("[CACHE] Redis delete error", {
        error: error instanceof Error
          ? { message: error.message, stack: error.stack }
          : error,
      });
    }
  }
  
  memoryCache.delete(fullKey);
}

/**
 * Clear all cache entries with prefix
 */
export async function clearCache(prefix?: string): Promise<void> {
  const pattern = prefix ? `${prefix}:*` : "ops:*";
  
  const redis = await getRedisClient();
  if (redis) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return;
    } catch (error) {
      logger.error("[CACHE] Redis clear error", {
        error: error instanceof Error
          ? { message: error.message, stack: error.stack }
          : error,
      });
    }
  }
  
  // Clear memory cache
  for (const key of memoryCache.keys()) {
    if (!prefix || key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
}

/**
 * Cache decorator for functions
 */
export function withCache<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  config: CacheConfig & { keyGenerator: (...args: TArgs) => string }
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs) => {
    const key = config.keyGenerator(...args);
    
    // Try cache first
    const cached = await getCache<TReturn>(key, config.keyPrefix);
    if (cached !== null) {
      return cached;
    }
    
    // Execute function
    const result = await fn(...args);
    
    // Cache result
    await setCache(key, result, config);
    
    return result;
  };
}

/**
 * Cache configurations for common use cases
 */
export const CachePresets = {
  // Dashboard stats - 30 seconds
  DASHBOARD_STATS: { ttl: 30 * 1000, keyPrefix: "dashboard" },
  
  // User sessions - 5 minutes
  USER_SESSION: { ttl: 5 * 60 * 1000, keyPrefix: "session" },
  
  // Merchant lists - 1 minute
  MERCHANT_LIST: { ttl: 60 * 1000, keyPrefix: "merchants" },
  
  // Order lists - 30 seconds
  ORDER_LIST: { ttl: 30 * 1000, keyPrefix: "orders" },
  
  // KYC queue - 2 minutes
  KYC_QUEUE: { ttl: 2 * 60 * 1000, keyPrefix: "kyc" },
  
  // Audit logs - 5 minutes
  AUDIT_LOGS: { ttl: 5 * 60 * 1000, keyPrefix: "audit" },
  
  // Static data - 1 hour
  STATIC_DATA: { ttl: 60 * 60 * 1000, keyPrefix: "static" },
} as const;

/**
 * Cleanup expired memory cache entries
 */
export function cleanupExpiredCache(): void {
  const now = Date.now();
  for (const [key, entry] of memoryCache.entries()) {
    if (now > entry.expiresAt) {
      memoryCache.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof window === "undefined") {
  setInterval(cleanupExpiredCache, 5 * 60 * 1000);
}
