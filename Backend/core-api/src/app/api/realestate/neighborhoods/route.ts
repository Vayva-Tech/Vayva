/**
 * Neighborhoods API Routes
 * GET /api/realestate/neighborhoods - List neighborhoods
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET List Neighborhoods
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (request, { storeId }) => {
    try {
      const { searchParams } = new URL(request.url);
      const city = searchParams.get("city");
      const state = searchParams.get("state");
      const limit = parseInt(searchParams.get("limit") || "50");

      // Since we don't have a dedicated neighborhoods table yet,
      // we'll aggregate from existing properties
      const neighborhoods = await prisma.$queryRaw`
        SELECT 
          city,
          state,
          COUNT(*) as property_count,
          AVG(price) as avg_price,
          MIN(price) as min_price,
          MAX(price) as max_price,
          AVG(bedrooms) as avg_bedrooms,
          AVG(bathrooms) as avg_bathrooms
        FROM "properties"
        WHERE "storeId" = ${storeId}
          ${city ? `AND "city" = ${city}` : ''}
          ${state ? `AND "state" = ${state}` : ''}
        GROUP BY city, state
        ORDER BY property_count DESC
        LIMIT ${limit}
      `;

      return NextResponse.json({
        success: true,
        data: neighborhoods,
      });
    } catch (error: unknown) {
      logger.error("[NEIGHBORHOODS_GET]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);