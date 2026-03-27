/**
 * Fashion Collections API
 * GET /api/fashion/collections - List collections
 * POST /api/fashion/collections - Create collection
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "100");
    const season = searchParams.get("season");

    const where: any = {};
    if (season) where.season = season;

    const collections = await prisma.collection.findMany({
      where,
      include: {
        products: true
      },
      orderBy: { createdAt: "desc" },
      take: limit
    });

    return NextResponse.json({ data: collections, success: true });
  } catch (error) {
    logger.error("Failed to fetch fashion collections", error);
    return NextResponse.json(
      { error: "Failed to fetch collections", success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, season, year, imageUrl } = body;

    const collection = await prisma.collection.create({
      data: {
        name,
        description,
        season, // "Spring", "Summer", "Fall", "Winter"
        year,
        imageUrl
      }
    });

    logger.info("Fashion collection created", { collectionId: collection.id });
    return NextResponse.json({ data: collection, success: true }, { status: 201 });
  } catch (error) {
    logger.error("Failed to create fashion collection", error);
    return NextResponse.json(
      { error: "Failed to create collection", success: false },
      { status: 500 }
    );
  }
}
