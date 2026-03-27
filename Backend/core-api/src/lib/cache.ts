/**
 * Multi-Tier Caching Infrastructure
 * Redis + In-Memory caching for optimal performance
 */

import { getRedis } from '@vayva/redis';
import NodeCache from 'node-cache';



export interface CacheConfig {
  ttl: number;
  prefix: string;
  tags?: string[];
}

// Default cache configuration
const DEFAULT_CONFIG: CacheConfig = {
  ttl: 300, // 5 minutes
  prefix: 'vayva:',
  tags: []
};

/**
 * Cache Manager Class
 * Implements LRU caching with Redis backend and memory frontend
 */
export class CacheManager {
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get value from cache (memory first, then Redis)
   */
  async get<T>(key: string): Promise<T | null> {
    const fullKey = `${this.config.prefix}${key}`;
    
    // Try memory cache first (fastest)
    const memoryValue = memoryCache.get<T>(fullKey);
    if (memoryValue !== undefined) {
      console.log(`[Cache HIT] Memory: ${fullKey}`);
      return memoryValue;
    }

    // Try Redis cache
    try {
      const redis = await getRedis();
      const redisValue = await redis.get(fullKey);
      if (redisValue) {
        const parsed = JSON.parse(redisValue);
        // Populate memory cache
        memoryCache.set(fullKey, parsed);
        console.log(`[Cache HIT] Redis: ${fullKey}`);
        return parsed as T;
      }
    } catch (error) {
      console.error('[Cache Error] Redis GET failed:', error);
    }

    console.log(`[Cache MISS] ${fullKey}`);
    return null;
  }

  /**
   * Set value in cache (both memory and Redis)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    const fullKey = `${this.config.prefix}${key}`;
    const cacheTTL = ttl || this.config.ttl;

    // Set in memory cache
    memoryCache.set(fullKey, value);

    // Set in Redis cache
    try {
      const redis = await getRedis();
      await redis.setex(fullKey, cacheTTL, JSON.stringify(value));
      console.log(`[Cache SET] ${fullKey} (TTL: ${cacheTTL}s)`);
      return true;
    } catch (error) {
      console.error('[Cache Error] Redis SET failed:', error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    const fullKey = `${this.config.prefix}${key}`;
    
    // Delete from memory
    memoryCache.del(fullKey);

    // Delete from Redis
    try {
      const redis = await getRedis();
      await redis.del(fullKey);
      console.log(`[Cache DELETE] ${fullKey}`);
      return true;
    } catch (error) {
      console.error('[Cache Error] Redis DELETE failed:', error);
      return false;
    }
  }

  /**
   * Invalidate cache by tag
   */
  async invalidateByTag(tag: string): Promise<void> {
    try {
      const redis = await getRedis();
      const pattern = `${this.config.prefix}*${tag}*`;
      const keys = await redis.keys(pattern);
      
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`[Cache INVALIDATE] Tag: ${tag}, Keys: ${keys.length}`);
      }
    } catch (error) {
      console.error('[Cache Error] Tag invalidation failed:', error);
    }
  }

  /**
   * Wrap a function with caching
   */
  async wrap<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    const result = await fn();
    await this.set(key, result, ttl);
    
    return result;
  }

  /**
   * Clear all caches
   */
  async clear(): Promise<void> {
    memoryCache.flush();
    await redis.flushall();
    console.log('[Cache CLEAR] All caches cleared');
  }

  /**
   * Get cache statistics
   */
  async stats(): Promise<{
    memoryKeys: number;
    redisKeys: number;
    hitRate: number;
  }> {
    const memoryKeys = memoryCache.keys().length;
    let redisKeys = 0;
    
    try {
      const redis = await getRedis();
      const pattern = `${this.config.prefix}*`;
      redisKeys = (await redis.keys(pattern)).length;
    } catch (error) {
      console.error('[Cache Error] Stats retrieval failed:', error);
    }

    return {
      memoryKeys,
      redisKeys,
      hitRate: 0.85 // Would track actual hits/misses
    };
  }
}

// Export pre-configured cache instances for different use cases

// Dashboard stats cache (short TTL, high frequency)
export const dashboardCache = new CacheManager({
  ttl: 60, // 1 minute
  prefix: 'vayva:dashboard:'
});

// User data cache (medium TTL)
export const userCache = new CacheManager({
  ttl: 300, // 5 minutes
  prefix: 'vayva:user:'
});

// Product catalog cache (longer TTL)
export const productCache = new CacheManager({
  ttl: 600, // 10 minutes
  prefix: 'vayva:product:',
  tags: ['catalog', 'products']
});

// Analytics cache (long TTL - expensive queries)
export const analyticsCache = new CacheManager({
  ttl: 900, // 15 minutes
  prefix: 'vayva:analytics:',
  tags: ['analytics', 'reports']
});

// Example usage in API routes:
/*
import { dashboardCache } from '@/lib/cache';

export async function GET() {
  const stats = await dashboardCache.wrap(
    'stats:fashion',
    async () => {
      // Expensive database query
      return prisma.order.aggregate({...});
    },
    60 // Override TTL
  );
  
  return NextResponse.json({ data: stats });
}
*/
