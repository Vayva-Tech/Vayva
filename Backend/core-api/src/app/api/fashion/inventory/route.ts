/**
 * Fashion Inventory API
 * GET /api/fashion/inventory - List inventory items
 * POST /api/fashion/inventory - Add inventory item
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "500");
    const lowStock = searchParams.get("low-stock");

    const where: any = {};
    
    if (lowStock === "true") {
      where.quantity = { lte: prisma.inventoryItem.fields.minLevel };
    }

    const inventory = await prisma.inventoryItem.findMany({
      where,
      include: {
        product: true,
        variant: true
      },
      orderBy: { quantity: "asc" },
      take: limit
    });

    return NextResponse.json({ data: inventory, success: true });
  } catch (error) {
    logger.error("Failed to fetch fashion inventory", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory", success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, variantId, quantity, minLevel, location } = body;

    const inventory = await prisma.inventoryItem.create({
      data: {
        productId,
        variantId,
        quantity,
        minLevel,
        location
      }
    });

    logger.info("Fashion inventory item created", { inventoryId: inventory.id });
    return NextResponse.json({ data: inventory, success: true }, { status: 201 });
  } catch (error) {
    logger.error("Failed to create fashion inventory", error);
    return NextResponse.json(
      { error: "Failed to create inventory item", success: false },
      { status: 500 }
    );
  }
}
