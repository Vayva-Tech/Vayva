import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";

/**
 * GET /api/whatsapp/instance/status
 * Get detailed WhatsApp instance status
 */
export async function GET(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: { storeId?: string; merchantId: string; userId: string }) => {
      const backendResponse = await fetch(
        `${process.env.BACKEND_API_URL}/api/whatsapp/instance/status`,
        {
          headers: {
            "x-store-id": session.storeId || session.merchantId,
            "x-merchant-id": session.merchantId,
            "x-user-id": session.userId,
          },
        }
      );

      const data = await backendResponse
        .json()
        .catch(() => ({ error: "Failed to fetch WhatsApp status" }));

      return {
        status: backendResponse.status,
        body: data,
      };
    },
    { requireAuth: true }
  );
}
