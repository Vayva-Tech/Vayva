import type { Redis } from "ioredis";
import { getRedis } from "@vayva/redis";

const globalForRedis = global as unknown as { redis: Redis };

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Redis connection timeout")),
      ms,
    );
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

export async function getRedisClient(): Promise<Redis> {
  if (globalForRedis.redis) return globalForRedis.redis;

  const client = await withTimeout(getRedis(), 1500);

  if (process.env.NODE_ENV !== "production") {
    globalForRedis.redis = client;
  }
  return client;
}
