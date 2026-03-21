import { env } from "@/lib/config/env";
import { logger } from "@vayva/shared";

/**
 * Redis client for caching and session management
 * Uses ioredis when available, falls back to in-memory for development
 */

type RedisValue = string | number | Buffer;

// In-memory fallback for development when Redis is not available
const memoryCache = new Map<string, { value: string; expires: number | null }>();

function getMemoryValue(key: string): string | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (entry.expires && Date.now() > entry.expires) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value;
}

function setMemoryValue(key: string, value: string, ttlSeconds?: number): void {
  memoryCache.set(key, {
    value,
    expires: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
  });
}

function deleteMemoryKeys(...keys: string[]): number {
  let deleted = 0;
  for (const key of keys) {
    if (memoryCache.has(key)) {
      memoryCache.delete(key);
      deleted++;
    }
  }
  return deleted;
}

// ioredis client instance
let redisClient: any = null;

/**
 * Get or create Redis client
 * Falls back to in-memory cache in development if Redis is not configured
 */
export async function getRedisClient() {
  // Return cached client if already initialized
  if (redisClient) return redisClient;

  const redisUrl = env.REDIS_URL || process.env?.REDIS_URL || process.env?.CACHE_REDIS_URI;

  // Try to use real Redis if URL is configured
  if (redisUrl && redisUrl !== "redis://localhost:6379") {
    try {
      // Dynamic import ioredis to avoid bundling issues
      const { default: Redis } = await import("ioredis");
      
      const client = new Redis(redisUrl, {
        retryStrategy: (times: number) => {
          if (times > 3) {
            logger.error("Redis connection failed after 3 retries, falling back to memory");
            return null;
          }
          return Math.min(times * 50, 2000);
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
      });

      client.on("error", (err: Error) => {
        logger.error("Redis error", { error: err.message });
      });

      client.on("connect", () => {
        logger.info("Redis connected");
      });

      redisClient = client;
      return client;
    } catch (error) {
      logger.error("Failed to initialize Redis client", { error });
    }
  }

  // Fallback to in-memory implementation
  logger.info("Using in-memory cache (Redis not configured)");
  
  redisClient = {
    get: async (key: string) => getMemoryValue(key),
    set: async (key: string, value: RedisValue, ...args: (string | number)[]) => {
      let ttl: number | undefined;
      // Handle "EX", seconds pattern
      const exIndex = args.indexOf("EX");
      if (exIndex >= 0 && typeof args[exIndex + 1] === "number") {
        ttl = args[exIndex + 1] as number;
      }
      setMemoryValue(key, String(value), ttl);
      return "OK";
    },
    setex: async (key: string, seconds: number, value: RedisValue) => {
      setMemoryValue(key, String(value), seconds);
      return "OK";
    },
    del: async (...keys: string[]) => deleteMemoryKeys(...keys),
    incr: async (key: string) => {
      const current = parseInt(getMemoryValue(key) || "0", 10);
      const next = current + 1;
      setMemoryValue(key, String(next));
      return next;
    },
    expire: async (key: string, seconds: number) => {
      const value = getMemoryValue(key);
      if (value === null) return 0;
      setMemoryValue(key, value, seconds);
      return 1;
    },
    ttl: async (key: string) => {
      const entry = memoryCache.get(key);
      if (!entry) return -2;
      if (!entry.expires) return -1;
      const remaining = Math.ceil((entry.expires - Date.now()) / 1000);
      return remaining > 0 ? remaining : -2;
    },
    exists: async (...keys: string[]) => {
      return keys.filter(k => memoryCache.has(k) && getMemoryValue(k) !== null).length;
    },
    ping: async () => "PONG",
    quit: async () => {},
  };

  return redisClient;
}

/**
 * Close Redis connection gracefully
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient?.quit) {
    await redisClient.quit();
    redisClient = null;
  }
}
