import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/products - Get all products for the merchant
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const backendBase = process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";
    const incoming = new URL(request.url).searchParams;
    const backendUrl = new URL(`${backendBase}/api/products`);
    incoming.forEach((value, key) => {
      backendUrl.searchParams.set(key, value);
    });
    if (!backendUrl.searchParams.has("limit")) {
      backendUrl.searchParams.set("limit", "80");
    }

    const result = await apiJson<{
      items?: Array<{
        id: string;
        name: string;
        productType?: string | null;
        status: string;
        price: number;
      }>;
      nextCursor?: string | null;
      requestId?: string;
    }>(backendUrl.toString(), { headers: auth.headers });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/products',
      operation: 'GET_PRODUCTS',
    });
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
