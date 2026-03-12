import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

// Cart item schema
const cartItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(100),
});

// Cart update schema
const cartUpdateSchema = z.object({
  items: z.array(cartItemSchema).min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

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

// GET /api/cart - Get current cart
export async function GET(req: NextRequest) {
  try {
    const sessionToken = await getSessionToken();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // Try to find cart by userId or session token
    const cart = await prisma.cart.findFirst({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          { sessionToken },
        ],
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
      },
    });

    if (!cart) {
      return NextResponse.json({ items: [], total: 0, count: 0 });
    }

    // Calculate totals
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

    const total = items.reduce((sum: number, item: typeof items[0]) => {
      const price = Number(item.variant.price) || 0;
      return sum + price * item.quantity;
    }, 0);

    return NextResponse.json({
      id: cart.id,
      items,
      total,
      count: items.reduce((sum: number, item: typeof items[0]) => sum + item.quantity, 0),
      email: cart.email,
      phone: cart.phone,
      recoveryStatus: cart.recoveryStatus,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    });
  } catch (error) {
    console.error("[CART_GET] Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// POST /api/cart - Create or update cart
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = cartUpdateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid cart data", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { items: cartItems, email, phone } = validated.data;
    const sessionToken = await getSessionToken();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    // Find existing cart
    let cart = await prisma.cart.findFirst({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          { sessionToken },
        ],
      },
      include: { items: true },
    });

    // Validate all variants exist and have sufficient stock
    const variantIds = cartItems.map((item) => item.variantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: {
        inventoryItems: {
          select: { available: true },
        },
      },
    });

    const variantMap = new Map<string, typeof variants[0]>(variants.map((v: typeof variants[0]) => [v.id, v]));

    for (const item of cartItems) {
      const variant = variantMap.get(item.variantId);
      if (!variant) {
        return NextResponse.json(
          { error: `Variant ${item.variantId} not found` },
          { status: 404 }
        );
      }

      const availableStock = variant.inventoryItems[0]?.available || 0;
      if (availableStock < item.quantity && (variant as any).trackInventory) {
        return NextResponse.json(
          {
            error: `Insufficient stock for variant ${variant.sku || variant.id}`,
            available: availableStock,
            requested: item.quantity,
          },
          { status: 400 }
        );
      }
    }

    // Create or update cart in transaction
    const result = await prisma.$transaction(async (tx) => {
      if (!cart) {
        // Create new cart
        cart = await tx.cart.create({
          data: {
            userId: userId || null,
            sessionToken: userId ? null : sessionToken,
            email: email || null,
            phone: phone || null,
            recoveryStatus: "NONE",
          },
          include: { items: true },
        });
      } else {
        // Update existing cart contact info
        if (email || phone) {
          cart = await tx.cart.update({
            where: { id: cart.id },
            data: {
              email: email || cart.email,
              phone: phone || cart.phone,
              userId: userId || cart.userId,
              sessionToken: userId ? null : sessionToken,
            },
            include: { items: true },
          });
        }

        // Delete existing items
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });
      }

      // Create new cart items
      await tx.cartItem.createMany({
        data: cartItems.map((item) => ({
          cartId: cart!.id,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      });

      // Fetch updated cart
      return tx.cart.findUnique({
        where: { id: cart.id },
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
        },
      });
    });

    // Calculate totals for response
    const items = result?.items.map((item: typeof result.items[0]) => ({
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
    })) || [];

    const total = items.reduce((sum: number, item: typeof items[0]) => {
      const price = Number(item.variant.price) || 0;
      return sum + price * item.quantity;
    }, 0);

    return NextResponse.json({
      id: result?.id,
      items,
      total,
      count: items.reduce((sum: number, item: typeof items[0]) => sum + item.quantity, 0),
      email: result?.email,
      phone: result?.phone,
      recoveryStatus: result?.recoveryStatus,
      createdAt: result?.createdAt,
      updatedAt: result?.updatedAt,
    });
  } catch (error) {
    console.error("[CART_POST] Error saving cart:", error);
    return NextResponse.json(
      { error: "Failed to save cart" },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Clear cart
export async function DELETE(req: NextRequest) {
  try {
    const sessionToken = await getSessionToken();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const cart = await prisma.cart.findFirst({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          { sessionToken },
        ],
      },
    });

    if (cart) {
      await prisma.cart.delete({
        where: { id: cart.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CART_DELETE] Error clearing cart:", error);
    return NextResponse.json(
      { error: "Failed to clear cart" },
      { status: 500 }
    );
  }
}
