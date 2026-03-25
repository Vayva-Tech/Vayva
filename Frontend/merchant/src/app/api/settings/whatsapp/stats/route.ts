import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    // Call backend API to fetch WhatsApp stats
    const result = await apiJson<{
        status: "HEALTHY" | "DEGRADED";
        lastReceived: Date | null;
        successRate: string;
        events24h: number;
        failed: number;
        recentEvents: Array<{
            event: string;
            status: string;
            timestamp: Date;
        }>;
    }>(
        `${process.env.BACKEND_API_URL}/api/settings/whatsapp/stats`,
        {
            headers: auth.headers,
        }
    );

    return NextResponse.json(result, {
        headers: {
            "Cache-Control": "no-store",
        },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/settings/whatsapp/stats',
      operation: 'GET_WHATSAPP_STATS',
    });
    return NextResponse.json(
      { error: 'Failed to complete operation' },
      { status: 500 }
    );
  }
}
