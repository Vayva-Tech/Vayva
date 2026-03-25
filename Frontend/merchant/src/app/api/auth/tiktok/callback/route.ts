import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";

function safeParseState(state: string | null): { callback?: string; platform?: string } {
  if (!state) return {};
  try {
    const parsed = JSON.parse(state) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const obj = parsed as Record<string, unknown>;
    return {
      callback: typeof obj.callback === "string" ? obj.callback : undefined,
      platform: typeof obj.platform === "string" ? obj.platform : undefined,
    };
  } catch {
    return {};
  }
}

/**
 * GET /api/auth/tiktok/callback
 * OAuth callback landing.
 * Exchanges `auth_code` for tokens and stores them server-side.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("auth_code") || searchParams.get("code");
  const state = searchParams.get("state");
  const parsed = safeParseState(state);
  const callback = parsed.callback || "/dashboard/marketing/campaigns";

  const auth = await buildBackendAuthHeaders(request);
  if (auth && code) {
    const appId = process.env.TIKTOK_APP_ID;
    const appSecret = process.env.TIKTOK_APP_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/tiktok/callback`;

    if (appId && appSecret && process.env.NEXT_PUBLIC_APP_URL) {
      // TikTok token exchange endpoint; response shape varies by app type.
      const tokenRes = await fetch("https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app_id: appId,
          secret: appSecret,
          auth_code: code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }),
      });

      if (tokenRes.ok) {
        const tokenJson = (await tokenRes.json().catch(() => null)) as any;
        const data = tokenJson?.data;
        const accessToken = typeof data?.access_token === "string" ? data.access_token : null;
        const refreshToken = typeof data?.refresh_token === "string" ? data.refresh_token : undefined;
        const expiresIn = typeof data?.expires_in === "number" ? data.expires_in : undefined;

        if (accessToken) {
          const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined;

          // Fetch advertiser list and store a real advertiser_id for campaign operations.
          let advertiserId: string | undefined;
          let advertiserName: string | undefined;
          try {
            const advUrl = new URL("https://business-api.tiktok.com/open_api/v1.3/oauth2/advertiser/get/");
            advUrl.searchParams.set("access_token", accessToken);
            const advRes = await fetch(advUrl.toString(), { method: "GET" });
            const advJson = (await advRes.json().catch(() => null)) as any;
            const list = Array.isArray(advJson?.data?.list) ? advJson.data.list : [];
            const first = list[0];
            if (first && typeof first.advertiser_id === "string") advertiserId = first.advertiser_id;
            if (first && typeof first.advertiser_name === "string") advertiserName = first.advertiser_name;
          } catch {
            // best-effort
          }

          await fetch(new URL("/api/ad-platforms/accounts", request.nextUrl.origin), {
            method: "POST",
            headers: {
              ...auth.headers,
            },
            body: JSON.stringify({
              platform: "tiktok",
              accountId: advertiserId || `tiktok_${auth.user.storeId}`,
              accountName: advertiserName || "TikTok Ads",
              accessToken,
              refreshToken,
              expiresAt,
              status: "active",
            }),
          }).catch(() => null);
        }
      }
    }
  }

  const url = new URL(callback, request.nextUrl.origin);
  url.searchParams.set("connectedPlatform", "tiktok");
  return NextResponse.redirect(url);
}

