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
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);

    const queryParams = new URLSearchParams({
      storeId,
      limit: limit.toString(),
    });

    if (query) queryParams.set("search", query);

    const response = await apiJson(
      `${process.env.BACKEND_API_URL}/api/v1/blog/posts?${queryParams}`,
      {
        headers: auth.headers,
      }
    );

    // Transform backend response to match frontend expectations
    const formatted = (response.data?.posts || []).map((p: any) => ({
      id: p.id,
      name: p.title,
      slug: p.slug,
      status: p.status,
      publishedAt: p.publishedAt,
      image: p.featuredImage || null,
      excerpt: p.excerpt || null,
    }));

    return NextResponse.json(
      { success: true, data: formatted },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    handleApiError(error, {
      endpoint: "/editor-data/posts",
      operation: "GET_EDITOR_POSTS",
    });
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
