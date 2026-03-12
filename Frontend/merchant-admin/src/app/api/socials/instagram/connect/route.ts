import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";

/**
 * GET /api/socials/instagram/connect
 * Initiate Instagram OAuth connection
 */
export async function GET(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: { storeId?: string; merchantId: string; userId: string }) => {
      const { searchParams } = new URL(request.url);
      const returnTo = searchParams.get("returnTo") || "/dashboard/socials";

      const backendUrl = new URL(
        `${process.env.BACKEND_API_URL}/api/socials/instagram/connect`
      );
      backendUrl.searchParams.set("returnTo", returnTo);

      const backendResponse = await fetch(backendUrl.toString(), {
        headers: {
          "x-store-id": session.storeId || session.merchantId,
          "x-merchant-id": session.merchantId,
          "x-user-id": session.userId,
        },
      });

      const data = await backendResponse
        .json()
        .catch(() => ({ error: "Failed to initiate Instagram connection" }));

      return {
        status: backendResponse.status,
        body: data,
      };
    },
    { requireAuth: true }
  );
}
