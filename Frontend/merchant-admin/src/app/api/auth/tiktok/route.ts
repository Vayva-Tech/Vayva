import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";

/**
 * GET /api/auth/tiktok
 * Initiate TikTok Ads OAuth flow
 */
export async function GET(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: any) => {
      const { searchParams } = new URL(request.url);
      const callback = searchParams.get("callback") || "/dashboard/marketing/campaigns";

      const appId = process.env.TIKTOK_APP_ID;
      const appSecret = process.env.TIKTOK_APP_SECRET;

      if (!appId || !appSecret) {
        return {
          status: 500,
          body: {
            error: "TikTok integration not configured",
            message: "Please contact support to enable TikTok Ads integration",
          },
        };
      }

      // Build OAuth URL
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/tiktok/callback`;
      const scopes = [
        "ads.read",
        "ads_management",
        "user.info.basic",
      ].join(",");

      const oauthUrl = new URL("https://ads.tiktok.com/marketing_api/auth");
      oauthUrl.searchParams.set("app_id", appId);
      oauthUrl.searchParams.set("redirect_uri", redirectUri);
      oauthUrl.searchParams.set("scope", scopes);
      oauthUrl.searchParams.set("state", JSON.stringify({
        merchantId: session.merchantId,
        userId: session.userId,
        callback,
        platform: "tiktok",
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
