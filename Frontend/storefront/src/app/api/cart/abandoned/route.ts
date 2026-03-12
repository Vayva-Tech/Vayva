import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// GET /api/cart/abandoned - List abandoned carts for recovery
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");
    const hours = parseInt(searchParams.get("hours") || "24", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    if (!storeId) {
      return NextResponse.json(
        { error: "storeId is required" },
        { status: 400 }
      );
    }

    // Calculate cutoff time for abandoned carts
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    // Find abandoned carts (updated before cutoff, no recovery email sent)
    const abandonedCarts = await prisma.cart.findMany({
      where: {
        items: {
          some: {}, // Has at least one item
        },
        updatedAt: {
          lt: cutoffTime,
        },
        recoveryStatus: "NONE",
        NOT: {
          user: {
            orders: {
              some: {
                createdAt: {
                  gt: cutoffTime,
                },
              },
            },
          },
        } as any,
      },
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
                      where: { isMain: true } as any,
                      take: 1,
                      select: { url: true },
                    },
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: { updatedAt: "desc" },
    });

    // Calculate cart values
    const cartsWithValue = abandonedCarts.map((cart: typeof abandonedCarts[0]) => {
      const total = cart.items.reduce((sum: number, item: { quantity: number; variant: { price: { toNumber: () => number } } }) => {
        return sum + item.variant.price.toNumber() * item.quantity;
      }, 0);

      return {
        id: cart.id,
        email: cart.email || cart.user?.email,
        phone: cart.phone,
        userId: cart.userId,
        userName: cart.user?.email || null,
        itemCount: cart.items.length,
        totalValue: total,
        lastUpdated: cart.updatedAt,
        createdAt: cart.createdAt,
        recoveryStatus: cart.recoveryStatus,
        items: cart.items.map((item: { id: string; variantId: string; quantity: number; variant: { product: { id: string; title: string; handle: string; productImages: { url: string }[] }; sku: string | null; price: { toNumber: () => number } } }) => ({
          id: item.id,
          variantId: item.variantId,
          quantity: item.quantity,
          productName: item.variant.product.title,
          productImage: item.variant.product.productImages[0]?.url,
          sku: item.variant.sku,
          price: item.variant.price.toNumber(),
        })),
      };
    });

    // Get total count for pagination
    const totalCount = await prisma.cart.count({
      where: {
        items: { some: {} },
        updatedAt: { lt: cutoffTime },
        recoveryStatus: "NONE",
      },
    });

    return NextResponse.json({
      carts: cartsWithValue,
      pagination: {
        total: totalCount,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("[CART_ABANDONED_GET] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch abandoned carts" },
      { status: 500 }
    );
  }
}

// PATCH /api/cart/abandoned - Mark recovery email as sent
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const schema = z.object({
      cartId: z.string().uuid(),
      status: z.enum(["SENT", "RECOVERED", "EXPIRED"]),
      checkoutUrl: z.string().optional(),
    });

    const validated = schema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { cartId, status, checkoutUrl } = validated.data;

    const updatedCart = await prisma.cart.update({
      where: { id: cartId },
      data: {
        recoveryStatus: status,
        checkoutUrl: checkoutUrl || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      cart: {
        id: updatedCart.id,
        recoveryStatus: updatedCart.recoveryStatus,
        checkoutUrl: updatedCart.checkoutUrl,
      },
    });
  } catch (error) {
    console.error("[CART_ABANDONED_PATCH] Error:", error);
    return NextResponse.json(
      { error: "Failed to update cart recovery status" },
      { status: 500 }
    );
  }
}
