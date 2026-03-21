import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";

/**
 * GET /api/auth/meta
 * Initiate Meta (Facebook/Instagram) OAuth flow
 */
export async function GET(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: any) => {
      const { searchParams } = new URL(request.url);
      const callback = searchParams.get("callback") || "/dashboard/marketing/campaigns";

      const appId = process.env.META_APP_ID;
      const appSecret = process.env.META_APP_SECRET;

      if (!appId || !appSecret) {
        return {
          status: 500,
          body: {
            error: "Meta integration not configured",
            message: "Please contact support to enable Meta integration",
          },
        };
      }

      // Build OAuth URL
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/meta/callback`;
      const scopes = [
        "ads_management",
        "ads_read",
        "business_management",
        "instagram_basic",
        "instagram_content_publish",
      ].join(",");

      const oauthUrl = new URL("https://www.facebook.com/v18.0/dialog/oauth");
      oauthUrl.searchParams.set("client_id", appId);
      oauthUrl.searchParams.set("redirect_uri", redirectUri);
      oauthUrl.searchParams.set("scope", scopes);
      oauthUrl.searchParams.set("state", JSON.stringify({
        merchantId: session.merchantId,
        userId: session.userId,
        callback,
        platform: "meta",
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
