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
    const moduleId = searchParams.get("moduleId");
    const courseId = searchParams.get("courseId");

    if (!moduleId && !courseId) {
      return NextResponse.json(
        { success: false, error: "moduleId or courseId is required" },
        { status: 400 }
      );
    }

    // Fetch lessons via backend API
    const params: Record<string, string> = {};
    if (moduleId) params.moduleId = moduleId;
    if (courseId) params.courseId = courseId;
    
    const response = await apiJson(`${process.env.BACKEND_API_URL}/api/education/lessons?${new URLSearchParams(params)}`, {
      method: 'GET',
      headers: auth.headers,
    });

    return NextResponse.json(response);
  } catch (error) {
    handleApiError(error, { endpoint: "/education/lessons", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
