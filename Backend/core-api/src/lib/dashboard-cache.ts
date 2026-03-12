import { getRedisClient } from "@/lib/redis";
import { logger } from "@vayva/shared";
import type { UniversalDashboardData } from "@vayva/industry-core";

// ========================================================================
// Dashboard Cache Configuration
// ========================================================================

export interface DashboardCacheConfig {
  ttl: number; // Time to live in seconds
  staleWhileRevalidate: number; // Stale data served while revalidating (seconds)
  cacheKeyPrefix: string;
  includeUserId: boolean;
  includeRange: boolean;
  compressionEnabled: boolean;
}

// Cache configurations for different dashboard data types
export const DASHBOARD_CACHE_CONFIGS: Record<string, DashboardCacheConfig> = {
  universal: {
    ttl: 60 * 5, // 5 minutes - dashboard data changes moderately
    staleWhileRevalidate: 60 * 2, // Serve stale data for 2 minutes while revalidating
    cacheKeyPrefix: "dashboard:universal",
    includeUserId: true,
    includeRange: true,
    compressionEnabled: true,
  },
  industryConfig: {
    ttl: 60 * 60, // 1 hour - industry configs rarely change
    staleWhileRevalidate: 60 * 10, // 10 minutes stale tolerance
    cacheKeyPrefix: "dashboard:industry:config",
    includeUserId: false,
    includeRange: false,
    compressionEnabled: false,
  },
  kpis: {
    ttl: 60 * 3, // 3 minutes - KPIs change more frequently
    staleWhileRevalidate: 60 * 1, // 1 minute stale tolerance
    cacheKeyPrefix: "dashboard:kpis",
    includeUserId: true,
    includeRange: true,
    compressionEnabled: true,
  },
};

// ========================================================================
// Cache Entry Structure
// ========================================================================

interface CacheEntry<T> {
  data: T;
  etag: string;
  cachedAt: number;
  expiresAt: number;
  staleUntil?: number;
}

// ========================================================================
// Dashboard Cache Service
// ========================================================================

export class DashboardCacheService {
  private static instance: DashboardCacheService;
  
  private constructor() {}

  static getInstance(): DashboardCacheService {
    if (!DashboardCacheService.instance) {
      DashboardCacheService.instance = new DashboardCacheService();
    }
    return DashboardCacheService.instance;
  }

  /**
   * Generate cache key based on configuration
   */
  private generateCacheKey(
    config: DashboardCacheConfig,
    storeId: string,
    rangeKey?: string
  ): string {
    let key = config.cacheKeyPrefix;
    
    if (config.includeUserId) {
      key += `:${storeId}`;
    }
    
    if (config.includeRange && rangeKey) {
      key += `:${rangeKey}`;
    }
    
    return key;
  }

  /**
   * Compress data for storage (simple JSON compression)
   */
  private compressData(data: unknown): string {
    try {
      return JSON.stringify(data);
    } catch (error) {
      logger.warn("[DASHBOARD_CACHE] Compression failed", { error });
      return "{}";
    }
  }

  /**
   * Decompress data
   */
  private decompressData(compressed: string): unknown {
    try {
      return JSON.parse(compressed);
    } catch (error) {
      logger.warn("[DASHBOARD_CACHE] Decompression failed", { error });
      return null;
    }
  }

  /**
   * Generate ETag for cache validation
   */
  private generateETag(data: unknown): string {
    const str = this.compressData(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash + char) | 0;
    }
    return `"${Math.abs(hash).toString(16)}"`;
  }

  /**
   * Get data from cache
   */
  async get<T>(
    configName: keyof typeof DASHBOARD_CACHE_CONFIGS,
    storeId: string,
    rangeKey?: string
  ): Promise<{ data: T; etag: string; isStale: boolean } | null> {
    try {
      const config = DASHBOARD_CACHE_CONFIGS[configName];
      if (!config) {
        logger.warn("[DASHBOARD_CACHE] Invalid cache config", { configName });
        return null;
      }

      const redis = await getRedisClient();
      if (!redis) {
        logger.debug("[DASHBOARD_CACHE] Redis not available, skipping cache");
        return null;
      }

      const cacheKey = this.generateCacheKey(config, storeId, rangeKey);
      const cached = await redis.get(cacheKey);
      
      if (!cached) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(cached);
      const now = Date.now();

      // Check if expired
      if (now > entry.expiresAt) {
        // Check if within stale-while-revalidate window
        if (entry.staleUntil && now <= entry.staleUntil) {
          logger.debug("[DASHBOARD_CACHE] Serving stale data", { 
            cacheKey, 
            expiredAt: new Date(entry.expiresAt).toISOString(),
            staleUntil: new Date(entry.staleUntil).toISOString()
          });
          return { 
            data: entry.data, 
            etag: entry.etag, 
            isStale: true 
          };
        }
        // Truly expired, remove from cache
        await redis.del(cacheKey);
        return null;
      }

      return { 
        data: entry.data, 
        etag: entry.etag, 
        isStale: false 
      };

    } catch (error) {
      logger.warn("[DASHBOARD_CACHE] Get failed (failing open)", { 
        error: error instanceof Error ? error.message : String(error),
        configName,
        storeId
      });
      return null;
    }
  }

  /**
   * Set data in cache
   */
  async set<T>(
    configName: keyof typeof DASHBOARD_CACHE_CONFIGS,
    storeId: string,
    data: T,
    rangeKey?: string
  ): Promise<void> {
    try {
      const config = DASHBOARD_CACHE_CONFIGS[configName];
      if (!config) {
        logger.warn("[DASHBOARD_CACHE] Invalid cache config", { configName });
        return;
      }

      const redis = await getRedisClient();
      if (!redis) {
        logger.debug("[DASHBOARD_CACHE] Redis not available, skipping cache set");
        return;
      }

      const cacheKey = this.generateCacheKey(config, storeId, rangeKey);
      const etag = this.generateETag(data);
      const now = Date.now();
      
      const entry: CacheEntry<T> = {
        data,
        etag,
        cachedAt: now,
        expiresAt: now + (config.ttl * 1000),
        staleUntil: now + ((config.ttl + config.staleWhileRevalidate) * 1000)
      };

      const compressedData = this.compressData(entry);
      await redis.setex(cacheKey, config.ttl + config.staleWhileRevalidate, compressedData);

      logger.debug("[DASHBOARD_CACHE] Data cached successfully", { 
        cacheKey, 
        ttl: config.ttl,
        dataSize: compressedData.length
      });

    } catch (error) {
      logger.warn("[DASHBOARD_CACHE] Set failed", { 
        error: error instanceof Error ? error.message : String(error),
        configName,
        storeId
      });
    }
  }

  /**
   * Invalidate cache entries
   */
  async invalidate(
    configName: keyof typeof DASHBOARD_CACHE_CONFIGS,
    storeId?: string,
    rangeKey?: string
  ): Promise<void> {
    try {
      const config = DASHBOARD_CACHE_CONFIGS[configName];
      if (!config) {
        logger.warn("[DASHBOARD_CACHE] Invalid cache config", { configName });
        return;
      }

      const redis = await getRedisClient();
      if (!redis) {
        return;
      }

      let pattern = config.cacheKeyPrefix;
      
      if (storeId) {
        pattern += `:${storeId}`;
        if (rangeKey && config.includeRange) {
          pattern += `:${rangeKey}`;
        }
      }
      
      pattern += "*";

      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.info("[DASHBOARD_CACHE] Cache invalidated", { 
          pattern, 
          count: keys.length 
        });
      }

    } catch (error) {
      logger.warn("[DASHBOARD_CACHE] Invalidation failed", { 
        error: error instanceof Error ? error.message : String(error),
        configName,
        storeId
      });
    }
  }

  /**
   * Invalidate all dashboard caches for a store
   */
  async invalidateAllForStore(storeId: string): Promise<void> {
    logger.info("[DASHBOARD_CACHE] Invalidating all caches for store", { storeId });
    
    const promises = Object.keys(DASHBOARD_CACHE_CONFIGS).map(configName => 
      this.invalidate(configName as keyof typeof DASHBOARD_CACHE_CONFIGS, storeId)
    );
    
    await Promise.all(promises);
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    connected: boolean;
    keys: number;
    hitRate?: number;
  }> {
    try {
      const redis = await getRedisClient();
      if (!redis) {
        return { connected: false, keys: 0 };
      }

      // Count dashboard-related keys
      const dashboardKeys = await redis.keys("dashboard:*");
      
      return {
        connected: true,
        keys: dashboardKeys.length,
      };

    } catch (error) {
      logger.warn("[DASHBOARD_CACHE] Stats retrieval failed", { 
        error: error instanceof Error ? error.message : String(error) 
      });
      return { connected: false, keys: 0 };
    }
  }
}

// ========================================================================
// Convenience Functions
// ========================================================================

export const dashboardCache = DashboardCacheService.getInstance();

/**
 * Cache wrapper for dashboard data fetching
 */
export async function withDashboardCache<T>(
  configName: keyof typeof DASHBOARD_CACHE_CONFIGS,
  storeId: string,
  fetcher: () => Promise<T>,
  rangeKey?: string
): Promise<{ data: T; cached: boolean; etag: string; isStale: boolean }> {
  // Try cache first
  const cached = await dashboardCache.get<T>(configName, storeId, rangeKey);
  
  if (cached) {
    logger.debug("[DASHBOARD_CACHE] Cache HIT", { configName, storeId, rangeKey });
    return {
      data: cached.data,
      cached: true,
      etag: cached.etag,
      isStale: cached.isStale
    };
  }

  logger.debug("[DASHBOARD_CACHE] Cache MISS", { configName, storeId, rangeKey });
  
  // Fetch fresh data
  const data = await fetcher();
  
  // Cache the result
  await dashboardCache.set(configName, storeId, data, rangeKey);
  
  const etag = dashboardCache['generateETag'](data); // Using private method via bracket notation
  
  return {
    data,
    cached: false,
    etag,
    isStale: false
  };
}

/**
 * Invalidate dashboard cache on data changes
 * Call this when orders, bookings, or other dashboard-relevant data changes
 */
export async function invalidateDashboardOnDataChange(
  storeId: string,
  dataType: 'order' | 'booking' | 'customer' | 'inventory' | 'all' = 'all'
): Promise<void> {
  logger.info("[DASHBOARD_CACHE] Invalidating due to data change", { 
    storeId, 
    dataType 
  });

  if (dataType === 'all') {
    await dashboardCache.invalidateAllForStore(storeId);
  } else {
    // Invalidate specific cache types based on data type
    const configsToInvalidate: (keyof typeof DASHBOARD_CACHE_CONFIGS)[] = ['universal'];
    
    if (dataType === 'order' || dataType === 'booking') {
      configsToInvalidate.push('kpis');
    }
    
    await Promise.all(
      configsToInvalidate.map(config => 
        dashboardCache.invalidate(config, storeId)
      )
    );
  }
}