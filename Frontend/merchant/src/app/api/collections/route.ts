import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(
      Number.parseInt(
        searchParams.get("limit") || String(DEFAULT_PAGE_SIZE),
        10,
      ),
      MAX_PAGE_SIZE,
    );

    const result = await apiJson<{
      success: boolean;
      data: Array<{
        id: string;
        name: string;
        handle: string;
        count: number;
        visibility: string;
        updated: string;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(
      `${process.env.BACKEND_API_URL}/api/collections?page=${page}&limit=${limit}`,
      {
        headers: auth.headers,
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/collections", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
