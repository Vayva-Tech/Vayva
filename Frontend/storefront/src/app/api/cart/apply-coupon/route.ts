import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const applyCouponSchema = z.object({
  cartId: z.string().uuid(),
  code: z.string().min(1).max(50),
});

// POST /api/cart/apply-coupon - Apply coupon code to cart
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = applyCouponSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { cartId, code } = validated.data;

    // Find cart with items and product details
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    collections: {
                      select: { collectionId: true },
                    },
                  } as any,
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

    // Get storeId from first cart item
    const storeId = cart.items[0]?.variant.product.storeId;
    if (!storeId) {
      return NextResponse.json(
        { error: "Cannot apply coupon to empty cart" },
        { status: 400 }
      );
    }

    // Find coupon by code
    const coupon = await prisma.coupon.findUnique({
      where: { storeId_code: { storeId, code: code.toUpperCase() } },
      include: { rule: true },
    } as any);

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 404 }
      );
    }

    // Check coupon status
    if (coupon.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Coupon is not active" },
        { status: 400 }
      );
    }

    const rule = (coupon as any).rule;

    // Check date validity
    const now = new Date();
    if (now < rule.startsAt) {
      return NextResponse.json(
        { error: "Coupon not yet valid" },
        { status: 400 }
      );
    }

    if (rule.endsAt && now > rule.endsAt) {
      return NextResponse.json(
        { error: "Coupon has expired" },
        { status: 400 }
      );
    }

    // Calculate cart subtotal
    const subtotal = cart.items.reduce((sum: number, item: { quantity: number; variant: { price: { toNumber: () => number } } }) => {
      return sum + item.variant.price.toNumber() * item.quantity;
    }, 0);

    // Check minimum order amount
    if (rule.minOrderAmount && subtotal < rule.minOrderAmount.toNumber()) {
      return NextResponse.json(
        {
          error: `Minimum order amount of ${rule.minOrderAmount} required`,
          minRequired: rule.minOrderAmount,
          current: subtotal,
        },
        { status: 400 }
      );
    }

    // Check per-customer usage limit
    if (rule.usageLimitPerCustomer && cart.userId) {
      const customerUsage = await prisma.discountRedemption.count({
        where: {
          ruleId: rule.id,
          customerId: cart.userId,
        },
      });

      if (customerUsage >= rule.usageLimitPerCustomer) {
        return NextResponse.json(
          { error: "Usage limit exceeded for this customer" },
          { status: 400 }
        );
      }
    }

    // Check total usage limit
    if (rule.usageLimitTotal) {
      const totalUsage = await prisma.discountRedemption.count({
        where: { ruleId: rule.id },
      });

      if (totalUsage >= rule.usageLimitTotal) {
        return NextResponse.json(
          { error: "Coupon usage limit has been reached" },
          { status: 400 }
        );
      }
    }

    // Filter applicable items based on rule
    let applicableItems = cart.items;
    if (rule.appliesTo === "PRODUCTS" && rule.productIds.length > 0) {
      applicableItems = cart.items.filter((item: { variant: { product: { id: string } } }) =>
        rule.productIds.includes(item.variant.product.id)
      );
    } else if (rule.appliesTo === "COLLECTIONS" && rule.collectionIds.length > 0) {
      applicableItems = (cart.items as any[]).filter((item: { variant: { product: { collections: { collectionId: string }[] } } }) =>
        item.variant.product.collections.some((c: { collectionId: string }) =>
          rule.collectionIds.includes(c.collectionId)
        )
      );
    }

    if (applicableItems.length === 0) {
      return NextResponse.json(
        { error: "Coupon does not apply to items in cart" },
        { status: 400 }
      );
    }

    // Calculate applicable subtotal
    const applicableSubtotal = applicableItems.reduce((sum: number, item: { quantity: number; variant: { price: { toNumber: () => number } } }) => {
      return sum + item.variant.price.toNumber() * item.quantity;
    }, 0);

    // Calculate discount
    let discountAmount = 0;
    if (rule.type === "PERCENT") {
      discountAmount = applicableSubtotal * (rule.valuePercent?.toNumber() || 0) / 100;
    } else if (rule.type === "AMOUNT") {
      discountAmount = rule.valueAmount?.toNumber() || 0;
    }

    // Apply max discount cap
    if (rule.maxDiscountAmount && discountAmount > rule.maxDiscountAmount.toNumber()) {
      discountAmount = rule.maxDiscountAmount.toNumber();
    }

    // Ensure discount doesn't exceed applicable subtotal
    if (discountAmount > applicableSubtotal) {
      discountAmount = applicableSubtotal;
    }

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        ruleName: rule.name,
        type: rule.type,
      },
      discount: {
        amount: discountAmount,
        currency: rule.currency,
        applicableSubtotal,
      },
      summary: {
        subtotal,
        discount: discountAmount,
        total: subtotal - discountAmount,
      },
    });
  } catch (error) {
    console.error("[CART_APPLY_COUPON] Error:", error);
    return NextResponse.json(
      { error: "Failed to apply coupon" },
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

    // Basic validation check
    const result = await POST(new NextRequest(
      new Request(req.url, {
        method: "POST",
        body: JSON.stringify({ code, cartId }),
        headers: req.headers,
      })
    ));

    return result;
  } catch (error) {
    console.error("[CART_VALIDATE_COUPON] Error:", error);
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
