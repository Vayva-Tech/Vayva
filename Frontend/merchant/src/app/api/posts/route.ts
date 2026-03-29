import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/posts - Get all blog posts
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10);
    const offset = Number.parseInt(searchParams.get("offset") || "0", 10);

    const query = new URLSearchParams();
    query.set("status", status ?? "");
    query.set("limit", String(limit));
    query.set("offset", String(offset));

    const result = await apiJson<{
      success: boolean;
      data?: Array<{ id: string; title: string; content: string; status: string }>;
      meta?: { total: number; limit: number; offset: number };
    }>(`${process.env.BACKEND_API_URL}/api/posts?${query.toString()}`, {
      headers: auth.headers,
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/posts",
      operation: "GET_POSTS",
    });
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}
