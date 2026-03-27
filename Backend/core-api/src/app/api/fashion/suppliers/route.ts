/**
 * Fashion Suppliers API
 * GET /api/fashion/suppliers - List suppliers
 * POST /api/fashion/suppliers - Add supplier
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "200");
    const category = searchParams.get("category");

    const where: any = {};
    if (category) where.category = category;

    const suppliers = await prisma.supplier.findMany({
      where,
      include: {
        products: true
      },
      orderBy: { name: "asc" },
      take: limit
    });

    return NextResponse.json({ data: suppliers, success: true });
  } catch (error) {
    logger.error("Failed to fetch fashion suppliers", error);
    return NextResponse.json(
      { error: "Failed to fetch suppliers", success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, contactName, email, phone, address, category, rating } = body;

    const supplier = await prisma.supplier.create({
      data: {
        name,
        contactName,
        email,
        phone,
        address,
        category,
        rating: rating || 0
      }
    });

    logger.info("Fashion supplier created", { supplierId: supplier.id });
    return NextResponse.json({ data: supplier, success: true }, { status: 201 });
  } catch (error) {
    logger.error("Failed to create fashion supplier", error);
    return NextResponse.json(
      { error: "Failed to create supplier", success: false },
      { status: 500 }
    );
  }
}
