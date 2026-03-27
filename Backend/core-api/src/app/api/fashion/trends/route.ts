/**
 * Fashion Trends API
 * GET /api/fashion/trends - List trends
 * POST /api/fashion/trends - Add trend (manual curation)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "100");
    const category = searchParams.get("category");

    const where: any = {};
    if (category) where.category = category;

    const trends = await prisma.trend.findMany({
      where,
      orderBy: { popularity: "desc" },
      take: limit
    });

    return NextResponse.json({ data: trends, success: true });
  } catch (error) {
    logger.error("Failed to fetch fashion trends", error);
    return NextResponse.json(
      { error: "Failed to fetch trends", success: false },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, source, imageUrl, popularity } = body;

    const trend = await prisma.trend.create({
      data: {
        title,
        description,
        category,
        source, // e.g., "Instagram", "Runway", "Street Style"
        imageUrl,
        popularity: popularity || 0
      }
    });

    logger.info("Fashion trend added", { trendId: trend.id });
    return NextResponse.json({ data: trend, success: true }, { status: 201 });
  } catch (error) {
    logger.error("Failed to create fashion trend", error);
    return NextResponse.json(
      { error: "Failed to create trend", success: false },
      { status: 500 }
    );
  }
}
