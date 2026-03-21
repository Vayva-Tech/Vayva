import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

interface PlanLimit {
  products: number;
  imagesPerProduct: number;
  variantsPerProduct: number;
}

export async function GET(request: NextRequest) {
  const storeId = request.headers.get("x-store-id") || "";
  try {
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
        headers: {
          "x-store-id": storeId,
        },
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
        endpoint: "/api/products/limits",
        operation: "GET_PRODUCT_LIMITS",
        storeId,
      }
    );
    throw error;
  }
}
