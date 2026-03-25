import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { getRedisClient } from "@/lib/redis";
import type { Campaign } from "@/types/ad-platforms";
import crypto from "crypto";

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function getTokenEncryptionKey(): Buffer | null {
  const key = process.env.ADS_TOKEN_ENCRYPTION_KEY || process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!key || key.length < 32) return null;
  return crypto.createHash("sha256").update(key).digest();
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

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams,
) {
  const auth = await buildBackendAuthHeaders(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { action?: "pause" | "resume"; platform?: string } | null;
  const action = body?.action;
  if (!action || (action !== "pause" && action !== "resume")) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const platform = body?.platform;
  if (platform === "meta") {
    // Fetch raw token from Redis (never from the client-facing endpoint).
    const redis = await getRedisClient();
    const accKey = `ads:accounts:${auth.user.storeId}`;
    const accounts = safeJsonParse<any[]>(await redis.get(accKey)) || [];
    const meta = accounts.find((a) => a.platform === "meta");
    const accessToken = meta?.accessToken ? decryptToken(String(meta.accessToken)) : undefined;
    if (!accessToken || accessToken === "pending" || accessToken === "redacted") {
      return NextResponse.json({ error: "Meta not connected" }, { status: 400 });
    }

    const status = action === "pause" ? "PAUSED" : "ACTIVE";
    const updateUrl = new URL(`https://graph.facebook.com/v18.0/${encodeURIComponent(id)}`);
    const res = await fetch(updateUrl.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        access_token: accessToken,
        status,
      }).toString(),
    });
    const json = (await res.json().catch(() => null)) as any;
    if (!res.ok || json?.success === false) {
      return NextResponse.json({ error: "Failed to update Meta campaign", details: json }, { status: 502 });
    }
    return NextResponse.json({ success: true });
  }

  if (platform === "tiktok") {
    const redis = await getRedisClient();
    const accKey = `ads:accounts:${auth.user.storeId}`;
    const accounts = safeJsonParse<any[]>(await redis.get(accKey)) || [];
    const tk = accounts.find((a) => a.platform === "tiktok");
    const accessToken = tk?.accessToken ? decryptToken(String(tk.accessToken)) : undefined;
    const advertiserId = tk?.accountId;
    if (!accessToken || accessToken === "pending" || accessToken === "redacted" || !advertiserId) {
      return NextResponse.json({ error: "TikTok not connected" }, { status: 400 });
    }
    const operationStatus = action === "pause" ? "DISABLE" : "ENABLE";
    const res = await fetch("https://business-api.tiktok.com/open_api/v1.3/campaign/status/update/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": accessToken,
      },
      body: JSON.stringify({
        advertiser_id: advertiserId,
        campaign_id: id,
        operation_status: operationStatus,
      }),
    });
    const json = (await res.json().catch(() => null)) as any;
    if (!res.ok || json?.code) {
      return NextResponse.json({ error: "Failed to update TikTok campaign", details: json }, { status: 502 });
    }
    return NextResponse.json({ success: true });
  }

  if (platform === "google") {
    const redis = await getRedisClient();
    const accKey = `ads:accounts:${auth.user.storeId}`;
    const accounts = safeJsonParse<any[]>(await redis.get(accKey)) || [];
    const g = accounts.find((a) => a.platform === "google");
    const accessToken = g?.accessToken ? decryptToken(String(g.accessToken)) : undefined;
    const customerId = g?.accountId;
    if (!accessToken || accessToken === "pending" || accessToken === "redacted" || !customerId) {
      return NextResponse.json({ error: "Google not connected" }, { status: 400 });
    }
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    if (!developerToken) {
      return NextResponse.json({ error: "Missing GOOGLE_ADS_DEVELOPER_TOKEN" }, { status: 501 });
    }
    const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;
    const status = action === "pause" ? "PAUSED" : "ENABLED";
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      "developer-token": developerToken,
      "Content-Type": "application/json",
    };
    if (loginCustomerId) headers["login-customer-id"] = loginCustomerId;
    const res = await fetch(
      `https://googleads.googleapis.com/v19/customers/${encodeURIComponent(customerId)}/campaigns:mutate`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          operations: [
            {
              update: {
                resourceName: `customers/${customerId}/campaigns/${id}`,
                status,
              },
              updateMask: "status",
            },
          ],
        }),
      },
    );
    const json = (await res.json().catch(() => null)) as any;
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to update Google campaign", details: json }, { status: 502 });
    }
    return NextResponse.json({ success: true });
  }

  const redis = await getRedisClient();
  const key = `ads:campaigns:${auth.user.storeId}`;
  const existing = safeJsonParse<Campaign[]>(await redis.get(key)) || [];
  const updated = existing.map((c) => {
    if (c.id !== id) return c;
    return {
      ...c,
      status: action === "pause" ? "paused" : "active",
      updatedAt: new Date(),
    };
  });
  await redis.set(key, JSON.stringify(updated), "EX", 60 * 60 * 24 * 30);
  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams,
) {
  const auth = await buildBackendAuthHeaders(request);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as { platform?: string } | null;
  if (body?.platform === "meta") {
    const redis = await getRedisClient();
    const accKey = `ads:accounts:${auth.user.storeId}`;
    const accounts = safeJsonParse<any[]>(await redis.get(accKey)) || [];
    const meta = accounts.find((a) => a.platform === "meta");
    const accessToken = meta?.accessToken ? decryptToken(String(meta.accessToken)) : undefined;
    if (!accessToken || accessToken === "pending" || accessToken === "redacted") {
      return NextResponse.json({ error: "Meta not connected" }, { status: 400 });
    }
    const delUrl = new URL(`https://graph.facebook.com/v18.0/${encodeURIComponent(id)}`);
    delUrl.searchParams.set("access_token", accessToken);
    const res = await fetch(delUrl.toString(), { method: "DELETE" });
    const json = (await res.json().catch(() => null)) as any;
    if (!res.ok || json?.success === false) {
      return NextResponse.json({ error: "Failed to delete Meta campaign", details: json }, { status: 502 });
    }
    return NextResponse.json({ success: true });
  }

  if (body?.platform === "tiktok") {
    const redis = await getRedisClient();
    const accKey = `ads:accounts:${auth.user.storeId}`;
    const accounts = safeJsonParse<any[]>(await redis.get(accKey)) || [];
    const tk = accounts.find((a) => a.platform === "tiktok");
    const accessToken = tk?.accessToken ? decryptToken(String(tk.accessToken)) : undefined;
    const advertiserId = tk?.accountId;
    if (!accessToken || accessToken === "pending" || accessToken === "redacted" || !advertiserId) {
      return NextResponse.json({ error: "TikTok not connected" }, { status: 400 });
    }
    const res = await fetch("https://business-api.tiktok.com/open_api/v1.3/campaign/delete/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Token": accessToken,
      },
      body: JSON.stringify({
        advertiser_id: advertiserId,
        campaign_ids: [id],
      }),
    });
    const json = (await res.json().catch(() => null)) as any;
    if (!res.ok || json?.code) {
      return NextResponse.json({ error: "Failed to delete TikTok campaign", details: json }, { status: 502 });
    }
    return NextResponse.json({ success: true });
  }

  if (body?.platform === "google") {
    const redis = await getRedisClient();
    const accKey = `ads:accounts:${auth.user.storeId}`;
    const accounts = safeJsonParse<any[]>(await redis.get(accKey)) || [];
    const g = accounts.find((a) => a.platform === "google");
    const accessToken = g?.accessToken ? decryptToken(String(g.accessToken)) : undefined;
    const customerId = g?.accountId;
    if (!accessToken || accessToken === "pending" || accessToken === "redacted" || !customerId) {
      return NextResponse.json({ error: "Google not connected" }, { status: 400 });
    }
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    if (!developerToken) {
      return NextResponse.json({ error: "Missing GOOGLE_ADS_DEVELOPER_TOKEN" }, { status: 501 });
    }
    const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      "developer-token": developerToken,
      "Content-Type": "application/json",
    };
    if (loginCustomerId) headers["login-customer-id"] = loginCustomerId;
    const res = await fetch(
      `https://googleads.googleapis.com/v19/customers/${encodeURIComponent(customerId)}/campaigns:mutate`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          operations: [
            {
              remove: `customers/${customerId}/campaigns/${id}`,
            },
          ],
        }),
      },
    );
    const json = (await res.json().catch(() => null)) as any;
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to delete Google campaign", details: json }, { status: 502 });
    }
    return NextResponse.json({ success: true });
  }

  const redis = await getRedisClient();
  const key = `ads:campaigns:${auth.user.storeId}`;
  const existing = safeJsonParse<Campaign[]>(await redis.get(key)) || [];
  const next = existing.filter((c) => c.id !== id);
  await redis.set(key, JSON.stringify(next), "EX", 60 * 60 * 24 * 30);
  return NextResponse.json({ success: true });
}
