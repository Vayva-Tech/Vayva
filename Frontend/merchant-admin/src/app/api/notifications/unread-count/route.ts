import { NextRequest } from "next/server";
import { withVayvaAPI, MiddlewareSession } from "@/lib/api-middleware";
import { apiJson } from "@/lib/api-client-shared";

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications from backend
 */
export async function GET(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: MiddlewareSession) => {
      try {
        const data = await apiJson<{ count: number }>(
          `${process.env.BACKEND_API_URL}/api/notifications/unread-count?merchantId=${session.merchantId}`,
          { method: "GET" }
        );
        return {
          status: 200,
          body: data,
        };
      } catch {
        return {
          status: 200,
          body: { count: 0 },
        };
      }
    },
    { requireAuth: true }
  );
}
