import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/education/modules?courseId=xxx - Get modules for a course
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "courseId is required" },
        { status: 400 }
      );
    }

    // Fetch modules via backend API
    const response = await apiJson(`${process.env.BACKEND_API_URL}/api/education/modules?courseId=${courseId}`, {
      method: 'GET',
      headers: auth.headers,
    });

    return NextResponse.json(response);
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/education/modules',
      operation: 'GET_MODULES',
    });
    return NextResponse.json(
      { error: 'Failed to complete operation' },
      { status: 500 }
    );
  }
}
