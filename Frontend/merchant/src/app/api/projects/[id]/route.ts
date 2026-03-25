import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { id } = await params;

    // Call backend API to fetch project
    const result = await apiJson<{
      project?: {
        id: string;
        name: string;
        description: string;
        price: number;
        status: string;
        productImages: Array<{ id: string; url: string; position: number }>;
      };
      error?: string;
    }>(
      `${process.env.BACKEND_API_URL}/api/projects/${id}`,
      {
        headers: auth.headers,
      }
    );

    if (result.error) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: `/api/projects`,
      operation: "GET_PROJECT",
    });
    throw error;
  }
}
