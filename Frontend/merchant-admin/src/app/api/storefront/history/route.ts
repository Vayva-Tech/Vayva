import { NextRequest } from "next/server";
import { withVayvaAPI, MiddlewareSession } from "@/lib/api-middleware";
import { z } from "zod";

/**
 * GET /api/storefront/history
 * Get deployment history for the storefront
 */
export async function GET(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: MiddlewareSession) => {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "20", 10);
      const offset = parseInt(searchParams.get("offset") || "0", 10);

      // Forward to Backend API to get deployment history
      const queryParams = new URLSearchParams();
      queryParams.set("limit", limit.toString());
      queryParams.set("offset", offset.toString());

      const backendResponse = await fetch(
        `${process.env.BACKEND_API_URL}/api/storefront/history?${queryParams}`,
        {
          headers: {
            "x-merchant-id": session.merchantId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch history" }));
        return {
          status: backendResponse.status,
          body: { error: error.error || "Failed to fetch history" },
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
