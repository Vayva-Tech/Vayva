// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/products/categories - Get product categories
export async function GET(request: NextRequest) {
  try {
    const result = await apiJson(`${process.env.BACKEND_API_URL}/api/products/categories`, {
      headers: {
        "x-store-id": storeId,
      },
    });
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/products/categories",
      operation: "GET_PRODUCT_CATEGORIES",
    });
    return NextResponse.json(
      { error: "Failed to fetch product categories" },
      { status: 500 }
    );
  }
}