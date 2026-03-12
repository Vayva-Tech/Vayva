import { NextResponse } from "next/server";
import { getRedisClient } from "@/lib/redis";
const IDEMPOTENCY_HEADER = "x-idempotency-key";
const EXPIRY_SECONDS = 60 * 60 * 24; // 24 hours
export async function verifyIdempotency(req: Request) {
  const key = req.headers.get(IDEMPOTENCY_HEADER);
  if (!key) return { cached: null, key: null };
  const compositeKey = `idempotency:${key}`;
  const redis = await getRedisClient();
  const data = await redis.get(compositeKey);
  if (data) {
    const record = JSON.parse(data);
    return {
      cached: NextResponse.json(record.body, {
        status: record.status,
        headers: {
          ...record.headers,
          "x-idempotency-hit": "true",
        },
      }),
      key,
    };
  }
  // Set a "Processing" lock?
  // For simplicity, we assume we process and save at end.
  // Ideally we use SETNX with short TTL to block concurrent.
  return { cached: null, key: compositeKey };
}
export async function saveIdempotencyResponse(
  key: string,
  bodyData: Record<string, unknown>,
  statusCode: number,
) {
  if (!key) return;
  // Only cache successful or definitive failures (e.g. 400, 401).
  // Do not cache 500s usually?
  // For strict idempotency, we MUST cache whatever happened.
  const record = {
    status: statusCode,
    body: bodyData,
    headers: {}, // Serialize essential headers if needed
    createdAt: Date.now(),
  };
  const redis = await getRedisClient();
  await redis.setex(key, EXPIRY_SECONDS, JSON.stringify(record));
}
