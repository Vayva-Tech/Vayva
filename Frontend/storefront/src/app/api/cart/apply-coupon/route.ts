import { NextRequest, NextResponse } from "next/server";
import { apiClient, handleApiError } from "@/lib/api-client";

// POST /api/cart/apply-coupon - Apply coupon code to cart
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cartId, code } = body;

    if (!cartId || !code) {
      return NextResponse.json(
        { error: "cartId and code are required" },
        { status: 400 }
      );
    }

    // Call backend to apply coupon
    const response = await apiClient.post<any>(`/api/v1/carts/${cartId}/coupon`, {
      couponCode: code.toUpperCase(),
    });

    return NextResponse.json({
      success: true,
      coupon: response.data.coupon,
      discount: response.data.discount,
      summary: response.data.summary,
    });
  } catch (error) {
    console.error("[CART_APPLY_COUPON] Error:", error);
    const { message, code } = handleApiError(error);
    return NextResponse.json(
      { error: message, code },
      { status: 500 }
    );
  }
}

// GET /api/cart/apply-coupon?code=XXX&cartId=XXX - Validate coupon without applying
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const cartId = searchParams.get("cartId");

    if (!code || !cartId) {
      return NextResponse.json(
        { error: "Code and cartId are required" },
        { status: 400 }
      );
    }

    // Call backend to validate coupon (same as POST but don't persist)
    const response = await apiClient.post<any>(`/api/v1/carts/${cartId}/coupon/validate`, {
      couponCode: code.toUpperCase(),
    });

    return NextResponse.json({
      success: true,
      coupon: response.data.coupon,
      discount: response.data.discount,
      summary: response.data.summary,
    });
  } catch (error) {
    console.error("[CART_VALIDATE_COUPON] Error:", error);
    const { message, code } = handleApiError(error);
    return NextResponse.json(
      { error: message, code },
      { status: 500 }
    );
  }
}
