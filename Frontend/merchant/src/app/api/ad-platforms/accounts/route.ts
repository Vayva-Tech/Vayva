import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { getRedisClient } from "@/lib/redis";
import type { ConnectedAccount } from "@/types/ad-platforms";
import crypto from "crypto";

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function uniqBy<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const k = key(item);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

function getTokenEncryptionKey(): Buffer | null {
  const key = process.env.ADS_TOKEN_ENCRYPTION_KEY || process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!key || key.length < 32) return null;
  // Derive 32 bytes from the provided key material.
  return crypto.createHash("sha256").update(key).digest();
}

function encryptToken(plain: string): string {
  const key = getTokenEncryptionKey();
  if (!key) return plain;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:v1:${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

function decryptToken(value: string): string {
  if (!value.startsWith("enc:v1:")) return value;
  const key = getTokenEncryptionKey();
  if (!key) return value;
  const parts = value.split(":");
  const iv = Buffer.from(parts[2] || "", "base64");
  const tag = Buffer.from(parts[3] || "", "base64");
  const data = Buffer.from(parts[4] || "", "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString("utf8");
}

/**
 * GET /api/ad-platforms/accounts
 * List connected ad accounts for the current store.
 */
export async function GET(request: NextRequest) {
  const auth = await buildBackendAuthHeaders(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const redis = await getRedisClient();
  const key = `ads:accounts:${auth.user.storeId}`;
  const accounts = safeJsonParse<ConnectedAccount[]>(await redis.get(key)) || [];
  // Never return tokens to the client.
  const safeAccounts = accounts.map((a) => ({
    ...a,
    accessToken: "redacted",
    refreshToken: a.refreshToken ? "redacted" : undefined,
  }));
  return NextResponse.json({ accounts: safeAccounts });
}

/**
 * POST /api/ad-platforms/accounts
 * Upsert a connected account record (used by OAuth callbacks).
 */
export async function POST(request: NextRequest) {
  const auth = await buildBackendAuthHeaders(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as Partial<ConnectedAccount> | null;
  if (!body?.platform || !body?.accountId || !body?.accountName) {
    return NextResponse.json({ error: "Invalid account payload" }, { status: 400 });
  }

  const now = new Date();
  const accessToken = body.accessToken ? encryptToken(body.accessToken) : "pending";
  const refreshToken = body.refreshToken ? encryptToken(body.refreshToken) : undefined;
  const account: ConnectedAccount = {
    id: body.id || `${body.platform}_${body.accountId}`,
    platform: body.platform,
    accountName: body.accountName,
    accountId: body.accountId,
    accessToken,
    refreshToken,
    expiresAt: body.expiresAt,
    connectedAt: body.connectedAt || now,
    status: body.status || "active",
  };

  const redis = await getRedisClient();
  const key = `ads:accounts:${auth.user.storeId}`;
  const existing = safeJsonParse<ConnectedAccount[]>(await redis.get(key)) || [];
  const merged = uniqBy([account, ...existing], (a) => `${a.platform}:${a.accountId}`);
  await redis.set(key, JSON.stringify(merged), "EX", 60 * 60 * 24 * 30);
  return NextResponse.json({ success: true, account });
}

// Internal helper for server-side callers that need raw tokens.
export async function _getRawAccountsForStore(storeId: string): Promise<ConnectedAccount[]> {
  const redis = await getRedisClient();
  const key = `ads:accounts:${storeId}`;
  const accounts = safeJsonParse<ConnectedAccount[]>(await redis.get(key)) || [];
  return accounts.map((a) => ({
    ...a,
    accessToken: a.accessToken ? decryptToken(a.accessToken) : a.accessToken,
    refreshToken: a.refreshToken ? decryptToken(a.refreshToken) : a.refreshToken,
  }));
}
