import IORedis from "ioredis";
/**
 * BUILD-SAFE REDIS FACTORY
 *
 * Prevents Redis connection attempts during Next.js build phase.
 * Provides lazy initialization and explicit error handling.
 */
let redisInstance = null;
let lastRedisErrorLogAtMs = 0;
/**
 * Determines if we are currently in a build environment where Redis should not connect.
 */
export function isBuildTime() {
    return (process.env.NEXT_PHASE === "phase-production-build" ||
        process.env.VERCEL_BUILD_STEP === "1" ||
        (process.env.VERCEL_ENV &&
            !process.env.REDIS_URL &&
            !process.env.UPSTASH_REDIS_REST_URL) ||
        !!process.env.CI ||
        // If we're in production and no REDIS_URL is provided, we should probably fail safe at build time
        (process.env.NODE_ENV === "production" &&
            !process.env.REDIS_URL &&
            !process.env.UPSTASH_REDIS_REST_URL));
}
/**
 * Returns a Redis instance, lazily initialized.
 * Throws an error if called during build time (unless forced).
 */
export async function getRedis(config = {}) {
    if (redisInstance)
        return redisInstance;
    if (isBuildTime()) {
        console.warn("⚠️ Redis initialization attempted during build time. Returning a proxy to prevent connection.");
        // Return a proxy that fails at runtime if called
        return new Proxy({}, {
            get(_, prop) {
                if (prop === "on" || prop === "quit" || prop === "disconnect")
                    return () => { };
                return () => {
                    throw new Error(`❌ Redis method "${String(prop)}" called during build time or Redis is not configured.`);
                };
            },
        });
    }
    const url = config.url || process.env.REDIS_URL || "redis://localhost:6379";
    try {
        const instance = new IORedis(url, {
            maxRetriesPerRequest: null,
            ...config.options,
        });
        redisInstance = instance;
        instance.on("error", (err) => {
            const now = Date.now();
            if (now - lastRedisErrorLogAtMs < 60000)
                return;
            lastRedisErrorLogAtMs = now;
            console.error("❌ Redis Connection Error:", err);
        });
        return instance;
    }
    catch (error) {
        console.error("❌ Failed to initialize Redis:", error);
        if (process.env.NODE_ENV !== "production") {
            const proxy = new Proxy({}, {
                get(_, prop) {
                    if (prop === "on" || prop === "quit" || prop === "disconnect")
                        return () => { };
                    return () => null;
                },
            });
            redisInstance = proxy;
            return proxy;
        }
        throw error;
    }
}
/**
 * Helper to close connection safely
 */
export async function closeRedis() {
    if (redisInstance) {
        const instance = redisInstance;
        redisInstance = null;
        await instance.quit();
    }
}
//# sourceMappingURL=index.js.map