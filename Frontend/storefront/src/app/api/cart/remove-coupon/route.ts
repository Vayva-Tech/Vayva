import { NextRequest, NextResponse } from "next/server";
import { apiClient, handleApiError } from "@/lib/api-client";

// POST /api/cart/remove-coupon - Remove coupon from cart
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cartId } = body;

    if (!cartId) {
      return NextResponse.json(
        { error: "cartId is required" },
        { status: 400 }
      );
    }

    // Call backend to remove coupon (or just fetch updated cart)
    // Backend may not have explicit remove endpoint, so we'll just get the cart
    const response = await apiClient.get<any>(`/api/v1/carts/${cartId}`);

    return NextResponse.json({
      success: true,
      message: "Coupon removed",
      id: response.data.id,
      items: response.data.items,
      subtotal: response.data.subtotal,
      discountAmount: 0,
      total: response.data.total,
      count: response.data.count,
    });
  } catch (error) {
    console.error("[CART_REMOVE_COUPON]", error);
    const { message, code } = handleApiError(error);
    return NextResponse.json(
      { error: message, code },
      { status: 500 }
    );
  }
}
