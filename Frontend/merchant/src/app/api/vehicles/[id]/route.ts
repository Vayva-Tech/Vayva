import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const { id } = await params;
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await apiJson<{
      vehicle?: {
        id: string;
        name: string;
        description: string;
        price: number;
        productImages: Array<{ id: string; url: string }>;
        productVariants: Array<{ id: string; name: string }>;
      };
      error?: string;
    }>(buildBackendUrl(`/api/vehicles/${id}`), {
      headers: auth.headers,
    });

    if (result.error) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    handleApiError(error, { endpoint: "/api/vehicles/:id", operation: "GET" });
    return NextResponse.json({ error: "Failed to complete operation" }, { status: 500 });
  }
}
