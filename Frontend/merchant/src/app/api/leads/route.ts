import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
      const status = searchParams.get("status");
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");

      // Build query params
      const queryParams = new URLSearchParams();
      if (status) queryParams.set("status", status);
      queryParams.set("limit", limit.toString());
      queryParams.set("offset", offset.toString());

      // Call backend API
      const result = await apiJson<{
        success: boolean;
        data?: Array<{ id: string; name: string; email: string; phone: string; status: string; createdAt: string }>;
        meta?: { total: number; limit: number; offset: number };
      }>(
        `${process.env.BACKEND_API_URL}/api/leads?${queryParams.toString()}`,
      {
          headers: auth.headers,
        }
      );
      
      return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/leads", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
