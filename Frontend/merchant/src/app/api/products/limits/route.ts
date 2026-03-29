import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

interface PlanLimit {
  products: number;
  imagesPerProduct: number;
  variantsPerProduct: number;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    // Call backend API to fetch product limits
    const result = await apiJson<{
      plan: string;
      limits: PlanLimit;
      usage: {
        products: number;
      };
    }>(
      `${process.env.BACKEND_API_URL}/api/products/limits`,
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
    handleApiError(
      error,
      {
        endpoint: "/products/limits",
        operation: "GET_PRODUCT_LIMITS",
      }
    );
    throw error;
  }
}
