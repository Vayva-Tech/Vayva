import { NextRequest } from "next/server";
import { withVayvaAPI, MiddlewareSession } from "@/lib/api-middleware";

/**
 * GET /api/storefront/url
 * Get the storefront URL for the current merchant
 */
export async function GET(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: MiddlewareSession) => {
      // Forward to Backend API
      const backendResponse = await fetch(
        `${process.env.BACKEND_API_URL}/api/storefront/url`,
        {
          headers: {
            "x-merchant-id": session.merchantId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch storefront URL" }));
        return {
          status: backendResponse.status,
          body: { error: error.error || "Failed to fetch storefront URL" },
        };
      }

      const data = await backendResponse.json();

      return {
        status: 200,
        body: data,
      };
    },
    { requireAuth: true }
  );
}
