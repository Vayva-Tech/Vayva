import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";
import { logger } from "@vayva/shared";

/**
 * POST /api/socials/instagram/disconnect
 * Disconnect Instagram account
 */
export async function POST(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: { storeId?: string; merchantId: string; userId: string }) => {
      const backendResponse = await fetch(
        `${process.env.BACKEND_API_URL}/api/socials/instagram/disconnect`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-store-id": session.storeId || session.merchantId,
            "x-merchant-id": session.merchantId,
            "x-user-id": session.userId,
          },
        }
      );

      const data = await backendResponse
        .json()
        .catch(() => ({ error: "Failed to disconnect Instagram" }));

      if (backendResponse.ok) {
        logger.info("[Instagram Disconnected]", {
          merchantId: session.merchantId,
          userId: session.userId,
        });
      }

      return {
        status: backendResponse.status,
        body: data,
      };
    },
    { requireAuth: true }
  );
}
