import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

function backendBase(): string {
  return process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";
}

// GET /api/beauty/services - Get beauty services
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);

    const queryParams = new URLSearchParams();
    queryParams.set("storeId", storeId);
    if (category) queryParams.set("category", category);
    if (status) queryParams.set("status", status);
    queryParams.set("limit", limit.toString());
    queryParams.set("page", page.toString());

    const result = await apiJson<{
      success: boolean;
      data: {
        services: Array<{
          id: string;
          name: string;
          description: string;
          category: string;
          duration: number;
          price: number;
          status: string;
          imageUrl: string;
          bookingCount: number;
        }>;
        pagination: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      };
    }>(`${backendBase()}/api/beauty/services?${queryParams}`, {
      headers: auth.headers,
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/beauty/services",
      operation: "GET_BEAUTY_SERVICES",
    });
    return NextResponse.json({ error: "Failed to fetch beauty services" }, { status: 500 });
  }
}
