import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";

/**
 * GET /api/auth/google
 * Initiate Google Ads OAuth flow
 */
export async function GET(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: any) => {
      const { searchParams } = new URL(request.url);
      const callback = searchParams.get("callback") || "/dashboard/marketing/campaigns";

      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        return {
          status: 500,
          body: {
            error: "Google integration not configured",
            message: "Please contact support to enable Google Ads integration",
          },
        };
      }

      // Build OAuth URL
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;
      const scopes = [
        "https://www.googleapis.com/auth/adwords",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ].join(" ");

      const oauthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      oauthUrl.searchParams.set("client_id", clientId);
      oauthUrl.searchParams.set("redirect_uri", redirectUri);
      oauthUrl.searchParams.set("response_type", "code");
      oauthUrl.searchParams.set("scope", scopes);
      oauthUrl.searchParams.set("access_type", "offline");
      oauthUrl.searchParams.set("prompt", "consent");
      oauthUrl.searchParams.set("state", JSON.stringify({
        merchantId: session.merchantId,
        userId: session.userId,
        callback,
        platform: "google",
      }));

      return {
        status: 200,
        body: {
          oauthUrl: oauthUrl.toString(),
          redirectUrl: oauthUrl.toString(),
        },
      };
    },
    { requireAuth: true }
  );
}
