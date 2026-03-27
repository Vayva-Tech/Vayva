/**
 * Fashion Orders API
 * GET /api/fashion/orders - List orders
 * POST /api/fashion/orders - Create order
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "100");
    const status = searchParams.get("status");

    const where: any = {};
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: true,
        items: {
          include: {
            product: true,
            variant: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: limit
    });

    return NextResponse.json({ data: orders, success: true });
  } catch (error) {
    logger.error("Failed to fetch fashion orders", error);
    return NextResponse.json(
      { error: "Failed to fetch orders", success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, items, shippingAddress, billingAddress } = body;

    // Calculate total
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const order = await prisma.order.create({
      data: {
        customerId,
        totalAmount,
        status: "pending",
        shippingAddress,
        billingAddress,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: true,
        customer: true
      }
    });

    logger.info("Fashion order created", { orderId: order.id });
    return NextResponse.json({ data: order, success: true }, { status: 201 });
  } catch (error) {
    logger.error("Failed to create fashion order", error);
    return NextResponse.json(
      { error: "Failed to create order", success: false },
      { status: 500 }
    );
  }
}
