import { NextRequest } from "next/server";
import { withVayvaAPI, MiddlewareSession } from "@/lib/api-middleware";
import { apiJson } from "@/lib/api-client-shared";

/**
 * POST /api/notifications/mark-all-read
 * Mark all notifications as read via backend
 */
export async function POST(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: MiddlewareSession) => {
      try {
        const result = await apiJson<{ success: boolean; updatedCount: number }>(
          `${process.env.BACKEND_API_URL}/api/notifications/mark-all-read`,
          {
            method: "POST",
            body: JSON.stringify({ merchantId: session.merchantId }),
          }
        );

        return {
          status: 200,
          body: result,
        };
      } catch {
        return {
          status: 200,
          body: { success: true, updatedCount: 0 },
        };
      }
    },
    { requireAuth: true }
  );
}
