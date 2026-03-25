import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10), 1), 100);

    // Call backend API to fetch projects
    const result = await apiJson<{
      projects: Array<{
        id: string;
        name: string;
        description: string;
        price: number;
        status: string;
        productImages: Array<{ id: string; url: string; position: number }>;
        createdAt: Date;
      }>;
    }>(
      `${process.env.BACKEND_API_URL}/api/projects?limit=${limit}`,
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
      endpoint: '/api/projects',
      operation: 'GET_PROJECTS',
    });
    throw error;
  }
}
