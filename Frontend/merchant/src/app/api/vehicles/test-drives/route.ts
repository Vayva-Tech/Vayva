import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { z } from "zod";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const vehicleId = searchParams.get("vehicleId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Call backend API to fetch test drives
    const result = await apiJson<{
      testDrives: Array<{
        id: string;
        vehicleId: string;
        customerName: string;
        customerEmail: string;
        customerPhone: string;
        preferredDate: Date;
        status: string;
      }>;
      total: number;
    }>(
      `${process.env.BACKEND_API_URL}/api/vehicles/test-drives?status=${status || ''}&vehicleId=${vehicleId || ''}&dateFrom=${dateFrom || ''}&dateTo=${dateTo || ''}&limit=${limit}&offset=${offset}`,
      {
        headers: auth.headers,
      }
    );
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/vehicles/test-drives", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
