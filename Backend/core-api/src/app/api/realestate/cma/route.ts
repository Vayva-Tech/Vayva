/**
 * CMA API Routes
 * POST /api/realestate/cma - Generate CMA report
 * GET /api/realestate/cma - List CMA reports
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// POST Generate CMA
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (request, { storeId, user }) => {
    try {
      const body = await request.json();
      const { propertyId, config, notes } = body;

      if (!propertyId) {
        return NextResponse.json(
          { error: "Property ID is required" },
          { status: 400 }
        );
      }

      // Get property data
      const property = await prisma.property.findFirst({
        where: { id: propertyId, storeId },
      });

      if (!property) {
        return NextResponse.json(
          { error: "Property not found" },
          { status: 404 }
        );
      }

      // Get comparable listings
      const listings = await prisma.property.findMany({
        where: {
          storeId,
          status: "sold",
          id: { not: propertyId },
        },
        take: 10,
      });

      // Create CMA report in database
      const cmaReport = await prisma.cMAReport.create({
        data: {
          merchantId: storeId,
          agentId: user.id,
          propertyId,
          estimatedValue: 0, // Will be calculated
          valueRangeLow: 0,
          valueRangeHigh: 0,
          valueRecommended: 0,
          pricePerSqft: 0,
          confidenceScore: 0,
          daysOnMarketEstimate: 0,
          notes,
        },
      });

      // TODO: Integrate with @vayva/industry-realestate for actual CMA calculation

      return NextResponse.json({
        success: true,
        data: cmaReport,
      });
    } catch (error: unknown) {
      logger.error("[CMA_POST]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// GET List CMA Reports
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (request, { storeId }) => {
    try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const propertyId = searchParams.get("propertyId");

      const reports = await prisma.cMAReport.findMany({
        where: {
          merchantId: storeId,
          ...(propertyId ? { propertyId } : {}),
        },
        include: {
          property: true,
          comparables: true,
        },
        orderBy: { generatedAt: "desc" },
        take: limit,
        skip: offset,
      });

      const total = await prisma.cMAReport.count({
        where: {
          merchantId: storeId,
          ...(propertyId ? { propertyId } : {}),
        },
      });

      return NextResponse.json({
        success: true,
        data: reports,
        meta: { total, limit, offset },
      });
    } catch (error: unknown) {
      logger.error("[CMA_GET]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);
