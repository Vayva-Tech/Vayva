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
 * GET /api/auth/meta/callback
 * OAuth callback landing.
 * Exchanges `code` for tokens and stores them server-side.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const parsed = safeParseState(state);
  const callback = parsed.callback || "/dashboard/marketing/campaigns";

  const auth = await buildBackendAuthHeaders(request);
  if (auth && code) {
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/meta/callback`;

    if (appId && appSecret && process.env.NEXT_PUBLIC_APP_URL) {
      const tokenUrl = new URL("https://graph.facebook.com/v18.0/oauth/access_token");
      tokenUrl.searchParams.set("client_id", appId);
      tokenUrl.searchParams.set("client_secret", appSecret);
      tokenUrl.searchParams.set("redirect_uri", redirectUri);
      tokenUrl.searchParams.set("code", code);

      const tokenRes = await fetch(tokenUrl.toString(), { method: "GET" });
      if (tokenRes.ok) {
        const tokenJson = (await tokenRes.json().catch(() => null)) as any;
        const accessToken = typeof tokenJson?.access_token === "string" ? tokenJson.access_token : null;
        const expiresIn = typeof tokenJson?.expires_in === "number" ? tokenJson.expires_in : undefined;
        if (accessToken) {
          const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined;

          // Fetch ad accounts to store a real account ID for campaign operations.
          let accountId: string | undefined;
          let accountName: string | undefined;
          try {
            const accountsUrl = new URL("https://graph.facebook.com/v18.0/me/adaccounts");
            accountsUrl.searchParams.set("fields", "id,account_id,name");
            accountsUrl.searchParams.set("access_token", accessToken);
            const accountsRes = await fetch(accountsUrl.toString(), { method: "GET" });
            const accountsJson = (await accountsRes.json().catch(() => null)) as any;
            const first = Array.isArray(accountsJson?.data) ? accountsJson.data[0] : null;
            if (first && typeof first.id === "string") accountId = first.id; // e.g. "act_123"
            if (first && typeof first.name === "string") accountName = first.name;
          } catch {
            // best-effort; still store token so connection is "real"
          }

          await fetch(new URL("/ad-platforms/accounts", request.nextUrl.origin), {
            method: "POST",
            headers: {
              ...auth.headers,
            },
            body: JSON.stringify({
              platform: "meta",
              accountId: accountId || `meta_${auth.user.storeId}`,
              accountName: accountName || "Meta Ads",
              accessToken,
              expiresAt,
              status: "active",
            }),
          }).catch(() => null);
        }
      }
    }
  }

  const url = new URL(callback, request.nextUrl.origin);
  url.searchParams.set("connectedPlatform", "meta");
  return NextResponse.redirect(url);
}

