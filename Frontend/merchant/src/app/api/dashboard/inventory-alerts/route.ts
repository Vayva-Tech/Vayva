import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/dashboard/inventory-alerts - Get inventory alerts
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const result = await apiJson<{
      success: boolean;
      data?: Array<{ id: string; productName: string; currentStock: number; threshold: number; alertType: string; lastUpdated: string }>;
      meta?: { total: number };
    }>(
      `${process.env.BACKEND_API_URL}/api/dashboard/inventory-alerts`,
      {
        headers: auth.headers,
      }
    );
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/dashboard/inventory-alerts",
      operation: "GET_INVENTORY_ALERTS",
    });
    return NextResponse.json(
      { error: "Failed to fetch inventory alerts" },
      { status: 500 }
    );
  }
}
