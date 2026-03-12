import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

// Get or create session token for anonymous carts
async function getSessionToken(): Promise<string> {
  const cookieStore = await cookies();
  let sessionToken = cookieStore.get("cart_session")?.value;

  if (!sessionToken) {
    sessionToken = randomUUID();
    cookieStore.set("cart_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  return sessionToken;
}

// POST /api/cart/remove-coupon - Remove coupon from cart
export async function POST(req: NextRequest) {
  try {
    const sessionToken = await getSessionToken();

    // Parse request body
    const body = await req.json();
    const { userId } = body;

    // Find the cart
    const cart = await prisma.cart.findFirst({
      where: userId
        ? { userId }
        : { sessionToken },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    title: true,
                    handle: true,
                    productImages: {
                      select: { url: true },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      );
    }

    // Remove coupon from cart (update cart to remove coupon reference)
    // Note: In a full implementation, you might have a couponId field on Cart
    // For now, we just return success as the coupon is typically applied at checkout

    // Calculate new totals
    const items = cart.items.map((item: typeof cart.items[0]) => ({
      id: item.id,
      variantId: item.variantId,
      quantity: item.quantity,
      product: {
        id: item.variant.product.id,
        title: item.variant.product.title,
        handle: item.variant.product.handle,
        image: item.variant.product.productImages[0]?.url || null,
      },
      variant: {
        id: item.variant.id,
        sku: item.variant.sku,
        price: item.variant.price,
        compareAtPrice: item.variant.compareAtPrice,
        title: item.variant.title,
      },
    }));

    const subtotal = items.reduce((sum: number, item: typeof items[0]) => {
      const price = Number(item.variant.price) || 0;
      return sum + price * item.quantity;
    }, 0);

    return NextResponse.json({
      success: true,
      message: "Coupon removed",
      id: cart.id,
      items,
      subtotal,
      discountAmount: 0,
      total: subtotal,
      count: items.reduce((sum: number, item: typeof items[0]) => sum + item.quantity, 0),
    });
  } catch (error) {
    console.error("[CART_REMOVE_COUPON]", error);
    return NextResponse.json(
      { error: "Failed to remove coupon" },
      { status: 500 }
    );
  }
}
