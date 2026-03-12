import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";

/**
 * GET /api/marketing/affiliates
 * Get affiliate program data and affiliates list
 */
export async function GET(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: any) => {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status") || "all";
      const limit = parseInt(searchParams.get("limit") || "20", 10);
      const offset = parseInt(searchParams.get("offset") || "0", 10);

      // Build query params
      const queryParams = new URLSearchParams();
      if (status !== "all") queryParams.set("status", status);
      queryParams.set("limit", limit.toString());
      queryParams.set("offset", offset.toString());

      // Forward to Backend API
      const backendResponse = await fetch(
        `${process.env.BACKEND_API_URL}/api/marketing/affiliates?${queryParams}`,
        {
          headers: {
            "x-merchant-id": session.merchantId,
          },
        }
      );

      if (!backendResponse.ok) {
        const error = await backendResponse.json().catch(() => ({ error: "Failed to fetch affiliates" }));
        return {
          status: backendResponse.status,
          body: { error: error.error || "Failed to fetch affiliates" },
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
