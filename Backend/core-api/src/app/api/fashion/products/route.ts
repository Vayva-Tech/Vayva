/**
 * Fashion Products API
 * GET /api/fashion/products - List products
 * POST /api/fashion/products - Create product
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "500");
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    const where: any = {};
    
    if (category) where.category = category;
    if (status) where.status = status;

    const products = await prisma.product.findMany({
      where,
      include: {
        variants: true,
        images: true,
        collections: true
      },
      orderBy: { createdAt: "desc" },
      take: limit
    });

    return NextResponse.json({ data: products, success: true });
  } catch (error) {
    logger.error("Failed to fetch fashion products", error);
    return NextResponse.json(
      { error: "Failed to fetch products", success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, cost, category, sku, images } = body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        basePrice: price,
        cost,
        category,
        sku,
        status: "active",
        images: images ? { create: images.map((img: string) => ({ url: img })) } : undefined
      },
      include: {
        variants: true,
        images: true
      }
    });

    logger.info("Fashion product created", { productId: product.id });
    return NextResponse.json({ data: product, success: true }, { status: 201 });
  } catch (error) {
    logger.error("Failed to create fashion product", error);
    return NextResponse.json(
      { error: "Failed to create product", success: false },
      { status: 500 }
    );
  }
}
