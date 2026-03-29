import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;

    const response = await apiJson(
      `${process.env.BACKEND_API_URL}/api/v1/commerce/collections?storeId=${storeId}`,
      {
        headers: auth.headers,
      }
    );

    const formatted = (response.data?.collections || []).map((col: any) => ({
      id: col.id,
      name: col.title,
      slug: col.handle,
      productCount: col._count?.collectionProducts || 0,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    handleApiError(error, { endpoint: "/editor-data/collections", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
