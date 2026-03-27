import { NextRequest, NextResponse } from "next/server";
import { apiClient, handleApiError } from "@/lib/api-client";

// GET /api/cart/abandoned - List abandoned carts for recovery
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");
    const hours = searchParams.get("hours") || "24";
    const limit = searchParams.get("limit") || "50";
    const offset = searchParams.get("offset") || "0";

    if (!storeId) {
      return NextResponse.json(
        { error: "storeId is required" },
        { status: 400 }
      );
    }

    // Call backend to get abandoned carts
    const response = await apiClient.get<any>('/api/v1/carts/abandoned', {
      storeId,
      hours,
      limit,
      offset,
    });

    return NextResponse.json({
      carts: response.data.carts,
      pagination: response.data.pagination,
    });
  } catch (error) {
    console.error("[CART_ABANDONED_GET] Error:", error);
    const { message, code } = handleApiError(error);
    return NextResponse.json(
      { error: message, code },
      { status: 500 }
    );
  }
}

// PATCH /api/cart/abandoned - Mark recovery email as sent
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { cartId, status, checkoutUrl } = body;

    if (!cartId || !status) {
      return NextResponse.json(
        { error: "cartId and status are required" },
        { status: 400 }
      );
    }

    // Call backend to update recovery status
    const response = await apiClient.patch<any>(`/api/v1/carts/${cartId}/recovery`, {
      status,
      checkoutUrl,
    });

    return NextResponse.json({
      success: true,
      cart: response.data.cart,
    });
  } catch (error) {
    console.error("[CART_ABANDONED_PATCH] Error:", error);
    const { message, code } = handleApiError(error);
    return NextResponse.json(
      { error: message, code },
      { status: 500 }
    );
  }
}
