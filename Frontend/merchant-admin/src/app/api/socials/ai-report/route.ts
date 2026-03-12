import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";

/**
 * GET /api/socials/ai-report
 * Get AI performance report for social channels
 */
export async function GET(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: { storeId?: string; merchantId: string; userId: string }) => {
      const { searchParams } = new URL(request.url);
      const days = searchParams.get("days") || "30";

      const backendUrl = new URL(`${process.env.BACKEND_API_URL}/api/socials/ai-report`);
      backendUrl.searchParams.set("days", days);

      const backendResponse = await fetch(backendUrl.toString(), {
        headers: {
          "x-store-id": session.storeId || session.merchantId,
          "x-merchant-id": session.merchantId,
          "x-user-id": session.userId,
        },
      });

      const data = await backendResponse
        .json()
        .catch(() => ({ error: "Failed to fetch AI report" }));

      return {
        status: backendResponse.status,
        body: data,
      };
    },
    { requireAuth: true }
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}
