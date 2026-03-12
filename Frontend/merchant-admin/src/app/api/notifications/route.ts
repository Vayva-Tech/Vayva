import { NextRequest } from "next/server";
import { withVayvaAPI, MiddlewareSession } from "@/lib/api-middleware";
import { apiJson } from "@/lib/api-client-shared";

/**
 * GET /api/notifications
 * Fetch notifications from backend API
 */
export async function GET(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: MiddlewareSession) => {
      const { searchParams } = new URL(request.url);
      const limit = searchParams.get("limit") || "50";
      const unreadOnly = searchParams.get("unread") === "true";

      // Forward to backend API
      const queryParams = new URLSearchParams();
      queryParams.set("limit", limit);
      if (unreadOnly) queryParams.set("unread", "true");
      queryParams.set("merchantId", session.merchantId);

      try {
        const data = await apiJson<{
          items: unknown[];
          total: number;
          unread: number;
        }>(
          `${process.env.BACKEND_API_URL}/api/notifications?${queryParams.toString()}`,
          { method: "GET" }
        );

        return {
          status: 200,
          body: data,
        };
      } catch {
        // Fallback to mock data if backend unavailable
        return {
          status: 200,
          body: {
            items: [],
            total: 0,
            unread: 0,
          },
        };
      }
    },
    { requireAuth: true }
  );
}
