import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { NotificationService } from "@vayva/ai-agent";
import { z } from "zod";

// GET /api/carts - List all carts (admin/ops)
async function listCarts(req: NextRequest, _context: APIContext) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId");
  const userId = searchParams.get("userId");
  const recoveryStatus = searchParams.get("recoveryStatus") as
    | "NONE"
    | "SENT"
    | "RECOVERED"
    | "EXPIRED"
    | null;
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  const where: Record<string, unknown> = {};

  if (storeId) {
    // Note: Cart model doesn't have storeId directly
    // We filter through the items -> variants -> products -> stores
  }

  if (userId) {
    where.userId = userId;
  }

  if (recoveryStatus) {
    where.recoveryStatus = recoveryStatus;
  }

  const carts = await prisma.cart.findMany({
    where,
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  storeId: true,
                  productImages: {
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
          firstName: true,
          lastName: true,
        },
      },
    },
    take: limit,
    skip: offset,
    orderBy: { updatedAt: "desc" },
  });

  // Filter by storeId if provided (post-query filter)
  let filteredCarts = carts;
  if (storeId) {
    filteredCarts = carts.filter((cart: typeof carts[0]) =>
      cart.items.some((item) => item.variant.product.storeId === storeId)
    );
  }

  // Calculate totals
  const cartsWithTotals = filteredCarts.map((cart) => {
    const total = cart.items.reduce(
      (sum, item) =>
        sum + Number(item.variant.price) * item.quantity,
      0
    );

    return {
      id: cart.id,
      userId: cart.userId,
      email: cart.email || cart.user?.email,
      phone: cart.phone,
      userName: cart.user ? `${cart.user.firstName || ""} ${cart.user.lastName || ""}`.trim() || undefined : undefined,
      itemCount: cart.items.length,
      totalValue: total,
      recoveryStatus: cart.recoveryStatus,
      checkoutUrl: cart.checkoutUrl,
      lastUpdated: cart.updatedAt,
      createdAt: cart.createdAt,
      storeIds: [...new Set(cart.items.map((i: typeof cart.items[0]) => i.variant.product.storeId))],
    };
  });

  const totalCount = await prisma.cart.count({ where });

  return NextResponse.json({
    carts: cartsWithTotals,
    pagination: {
      total: totalCount,
      limit,
      offset,
    },
  });
}

// PATCH /api/carts - Send recovery emails or update status
async function updateCart(req: NextRequest, _context: APIContext) {
  const body = await req.json();

  const schema = z.object({
    cartId: z.string().uuid(),
    action: z.enum(["send_recovery", "mark_recovered", "mark_expired"]),
    checkoutUrl: z.string().optional(),
    emailTemplate: z.string().optional(),
  });

  const validated = schema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json(
      { error: "Invalid data", details: validated.error.flatten() },
      { status: 400 }
    );
  }

  const { cartId, action, checkoutUrl } = validated.data;

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  storeId: true,
                  productImages: {
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
          firstName: true,
          lastName: true,
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

  if (action === "send_recovery") {
    // Check if already sent
    if (cart.recoveryStatus === "SENT") {
      return NextResponse.json(
        { error: "Recovery email already sent for this cart" },
        { status: 400 }
      );
    }

    // Send recovery email
    const email = cart.email || cart.user?.email;
    if (!email) {
      return NextResponse.json(
        { error: "No email available for this cart" },
        { status: 400 }
      );
    }

    // Calculate cart value
    const total = cart.items.reduce(
      (sum, item) =>
        sum + Number(item.variant.price) * item.quantity,
      0
    );

    // Queue recovery email
    await NotificationService.queueEmail({
      to: email,
      template: "cart_recovery",
      data: {
        customerName: cart.user ? `${cart.user.firstName || ""} ${cart.user.lastName || ""}`.trim() || "Valued Customer" : "Valued Customer",
        cartId: cart.id,
        items: cart.items.map((item) => ({
          productName: item.variant.product.title,
          productImage: item.variant.product.productImages[0]?.url,
          quantity: item.quantity,
          price: Number(item.variant.price),
          variantTitle: item.variant.title,
        })),
        total,
        checkoutUrl: checkoutUrl || `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cartId=${cart.id}`,
        expiresIn: "48 hours",
      },
    });

    // Update cart status
    await prisma.cart.update({
      where: { id: cartId },
      data: {
        recoveryStatus: "SENT",
        checkoutUrl: checkoutUrl || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Recovery email queued successfully",
    });
  }

  if (action === "mark_recovered") {
    await prisma.cart.update({
      where: { id: cartId },
      data: { recoveryStatus: "RECOVERED" },
    });

    return NextResponse.json({
      success: true,
      message: "Cart marked as recovered",
    });
  }

  if (action === "mark_expired") {
    await prisma.cart.update({
      where: { id: cartId },
      data: { recoveryStatus: "EXPIRED" },
    });

    return NextResponse.json({
      success: true,
      message: "Cart marked as expired",
    });
  }

  return NextResponse.json(
    { error: "Unknown action" },
    { status: 400 }
  );
}

// DELETE /api/carts - Delete old carts (cleanup)
async function deleteOldCarts(req: NextRequest, _context: APIContext) {
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "30", 10);

  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Delete carts older than cutoff that are recovered or expired
  const deleted = await prisma.cart.deleteMany({
    where: {
      updatedAt: {
        lt: cutoffDate,
      },
      recoveryStatus: {
        in: ["RECOVERED", "EXPIRED"],
      },
    },
  });

  return NextResponse.json({
    success: true,
    deleted: deleted.count,
    message: `Deleted ${deleted.count} old carts`,
  });
}

export const GET = withVayvaAPI("CART_VIEW", listCarts);

export const PATCH = withVayvaAPI("CART_MANAGE", updateCart);

export const DELETE = withVayvaAPI("CART_MANAGE", deleteOldCarts);
