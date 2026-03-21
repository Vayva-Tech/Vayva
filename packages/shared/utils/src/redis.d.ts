import { Redis, RedisOptions } from "ioredis";
export interface RedisConfig {
    url?: string;
    options?: RedisOptions;
}
/**
 * Determines if we are currently in a build environment where Redis should not connect.
 */
export declare function isBuildTime(): boolean;
/**
 * Returns a Redis instance, lazily initialized.
 * Throws an error if called during build time (unless forced).
 */
export declare function getRedis(config?: RedisConfig): Redis;
/**
 * Helper to close connection safely
 */
export declare function closeRedis(): Promise<void>;
/**
 * Alias for getRedis - returns Redis client instance
 */
export declare const getRedisClient: typeof getRedis;
