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
 * GET /api/auth/google/callback
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
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

    if (clientId && clientSecret && process.env.NEXT_PUBLIC_APP_URL) {
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }).toString(),
      });

      if (tokenRes.ok) {
        const tokenJson = (await tokenRes.json().catch(() => null)) as any;
        const accessToken = typeof tokenJson?.access_token === "string" ? tokenJson.access_token : null;
        const refreshToken = typeof tokenJson?.refresh_token === "string" ? tokenJson.refresh_token : undefined;
        const expiresIn = typeof tokenJson?.expires_in === "number" ? tokenJson.expires_in : undefined;

        if (accessToken) {
          const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined;

          // Try to capture a real Google Ads customer ID (requires developer token).
          let customerId: string | undefined;
          let accountName: string | undefined;
          try {
            const developerToken =
              process.env.GOOGLE_ADS_DEVELOPER_TOKEN || process.env.NEXT_PUBLIC_GOOGLE_ADS_DEVELOPER_TOKEN;
            if (developerToken) {
              const res = await fetch(
                "https://googleads.googleapis.com/v19/customers:listAccessibleCustomers",
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "developer-token": developerToken,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({}),
                },
              );
              const json = (await res.json().catch(() => null)) as any;
              const resources = Array.isArray(json?.resourceNames) ? json.resourceNames : [];
              const first = typeof resources[0] === "string" ? resources[0] : null; // customers/123
              if (first) {
                const parts = first.split("/");
                const id = parts[1];
                if (id) customerId = id;
              }
            }
          } catch {
            // best-effort; OAuth is still valid even if Ads API config is incomplete
          }

          await fetch(new URL("/api/ad-platforms/accounts", request.nextUrl.origin), {
            method: "POST",
            headers: {
              ...auth.headers,
            },
            body: JSON.stringify({
              platform: "google",
              accountId: customerId || `google_${auth.user.storeId}`,
              accountName: accountName || "Google Ads",
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
  url.searchParams.set("connectedPlatform", "google");
  return NextResponse.redirect(url);
}

