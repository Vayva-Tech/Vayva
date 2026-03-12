import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";
import { logger } from "@vayva/shared";

/**
 * GET /api/whatsapp/instance
 * Get WhatsApp instance status and QR code
 */
export async function GET(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: { storeId?: string; merchantId: string; userId: string }) => {
      const backendResponse = await fetch(
        `${process.env.BACKEND_API_URL}/api/whatsapp/instance`,
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
        .catch(() => ({ error: "Failed to fetch WhatsApp instance" }));

      return {
        status: backendResponse.status,
        body: data,
      };
    },
    { requireAuth: true }
  );
}

/**
 * POST /api/whatsapp/instance
 * Create or restart WhatsApp instance
 */
export async function POST(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: { storeId?: string; merchantId: string; userId: string }) => {
      const backendResponse = await fetch(
        `${process.env.BACKEND_API_URL}/api/whatsapp/instance`,
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
        .catch(() => ({ error: "Failed to create WhatsApp instance" }));

      if (backendResponse.ok) {
        logger.info("[WhatsApp Instance Created]", {
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
