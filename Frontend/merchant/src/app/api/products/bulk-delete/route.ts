import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * POST /api/products/bulk-delete
 * Bulk delete products via backend API
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();
    if (body === null || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const idsRaw = (body as Record<string, unknown>).ids;
    if (!Array.isArray(idsRaw) || idsRaw.length === 0) {
      return NextResponse.json({ error: "No product IDs provided" }, { status: 400 });
    }
    const ids = idsRaw.filter((x): x is string => typeof x === "string");
    if (ids.length !== idsRaw.length) {
      return NextResponse.json({ error: "Invalid product IDs" }, { status: 400 });
    }

    if (ids.length > 100) {
      return NextResponse.json(
        { error: "Maximum 100 products per batch" },
        { status: 400 },
      );
    }

    const result = await apiJson<{
      success: boolean;
      deleted: number;
      message?: string;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/products/bulk-delete`, {
      method: "POST",
      headers: { ...auth.headers },
      body: JSON.stringify({ ids }),
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to delete products");
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/products/bulk-delete",
      operation: "BULK_DELETE_PRODUCTS",
    });
    return NextResponse.json(
      { error: "Failed to delete products" },
      { status: 500 },
    );
  }
}
