import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/fitness/classes - Get all fitness classes
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const status = searchParams.get("status");
    const instructorId = searchParams.get("instructorId");

    const queryParams = new URLSearchParams({
      storeId,
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (status) queryParams.set("status", status);
    if (instructorId) queryParams.set("instructorId", instructorId);

    const response = await apiJson(
      `${process.env.BACKEND_API_URL}/api/v1/fitness/classes?${queryParams}`,
      {
        headers: auth.headers,
      }
    );

    return NextResponse.json(response);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/fitness/classes",
      operation: "GET_FITNESS_CLASSES",
    });
    return NextResponse.json(
      { error: "Failed to fetch fitness classes" },
      { status: 500 }
    );
  }
}
