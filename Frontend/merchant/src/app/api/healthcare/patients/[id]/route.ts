import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

// GET /api/healthcare/patients/[id] - Get patient details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || typeof id !== "string" || !id.trim()) {
      return NextResponse.json(
        { success: false, error: "Patient id is required" },
        { status: 400 }
      );
    }

    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await apiJson<{
      success: boolean;
      data?: unknown;
      error?: string;
    }>(`${backendBase()}/api/healthcare/patients/${encodeURIComponent(id)}`, {
      headers: auth.headers,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Patient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/healthcare/patients/[id]",
      operation: "GET_PATIENT_DETAILS",
    });
    return NextResponse.json(
      { error: "Failed to fetch patient details" },
      { status: 500 }
    );
  }
}
