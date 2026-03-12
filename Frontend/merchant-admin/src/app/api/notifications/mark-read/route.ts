import { NextRequest } from "next/server";
import { withVayvaAPI, MiddlewareSession } from "@/lib/api-middleware";
import { apiJson } from "@/lib/api-client-shared";

interface MarkReadBody {
  notificationId: string;
}

/**
 * POST /api/notifications/mark-read
 * Mark a specific notification as read via backend
 */
export async function POST(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: MiddlewareSession) => {
      const body: MarkReadBody = await request.json();
      const { notificationId } = body;

      if (!notificationId) {
        return {
          status: 400,
          body: { error: "notificationId is required" },
        };
      }

      try {
        const result = await apiJson<{ success: boolean }>(
          `${process.env.BACKEND_API_URL}/api/notifications/mark-read`,
          {
            method: "POST",
            body: JSON.stringify({
              notificationId,
              merchantId: session.merchantId,
            }),
          }
        );

        return {
          status: 200,
          body: result,
        };
      } catch {
        return {
          status: 200,
          body: { success: true },
        };
      }
    },
    { requireAuth: true }
  );
}
