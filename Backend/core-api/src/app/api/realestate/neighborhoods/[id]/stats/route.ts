/**
 * Neighborhood Stats API Route
 * GET /api/realestate/neighborhoods/[id]/stats - Get neighborhood statistics
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET Neighborhood Statistics
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (request, { storeId, params }) => {
    try {
      const { id: neighborhoodId } = await params; // Format: "city,state"
      
      if (!neighborhoodId) {
        return NextResponse.json(
          { error: "Neighborhood ID required (format: city,state)" },
          { status: 400 }
        );
      }

      const [city, state] = neighborhoodId.split(",");

      if (!city || !state) {
        return NextResponse.json(
          { error: "Invalid neighborhood ID format" },
          { status: 400 }
        );
      }

      // Get property statistics for this neighborhood
      const stats = await prisma.$queryRaw`
        SELECT 
          COUNT(*) as total_properties,
          COUNT(CASE WHEN "status" = 'available' THEN 1 END) as available_properties,
          COUNT(CASE WHEN "status" = 'sold' THEN 1 END) as sold_properties,
          COUNT(CASE WHEN "status" = 'pending' THEN 1 END) as pending_properties,
          AVG("price") as avg_price,
          MIN("price") as min_price,
          MAX("price") as max_price,
          AVG("bedrooms") as avg_bedrooms,
          AVG("bathrooms") as avg_bathrooms,
          AVG("area") as avg_area,
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "price") as median_price
        FROM "properties"
        WHERE "storeId" = ${storeId}
          AND "city" = ${city}
          AND "state" = ${state}
      `;

      // Get price trends (last 6 months)
      const priceTrends = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          AVG("price") as avg_price,
          COUNT(*) as property_count
        FROM "properties"
        WHERE "storeId" = ${storeId}
          AND "city" = ${city}
          AND "state" = ${state}
          AND "createdAt" >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month ASC
      `;

      // Get property type distribution
      const propertyTypeDistribution = await prisma.$queryRaw`
        SELECT 
          "type",
          COUNT(*) as count,
          AVG("price") as avg_price
        FROM "properties"
        WHERE "storeId" = ${storeId}
          AND "city" = ${city}
          AND "state" = ${state}
        GROUP BY "type"
        ORDER BY count DESC
      `;

      // Get recent sales data
      const recentSales = await prisma.$queryRaw`
        SELECT 
          "price",
          "bedrooms",
          "bathrooms",
          "area",
          "createdAt" as sale_date
        FROM "properties"
        WHERE "storeId" = ${storeId}
          AND "city" = ${city}
          AND "state" = ${state}
          AND "status" = 'sold'
        ORDER BY "createdAt" DESC
        LIMIT 20
      `;

      return NextResponse.json({
        success: true,
        data: {
          neighborhood: {
            city,
            state,
            id: neighborhoodId
          },
          statistics: stats[0],
          priceTrends,
          propertyTypeDistribution,
          recentSales,
          marketHealth: {
            inventoryMonths: stats[0].available_properties > 0 
              ? (stats[0].available_properties / (recentSales.length > 0 ? recentSales.length / 6 : 1)).toFixed(1)
              : "N/A",
            priceChange: priceTrends.length >= 2 
              ? (((priceTrends[priceTrends.length - 1].avg_price - priceTrends[0].avg_price) / priceTrends[0].avg_price) * 100).toFixed(2)
              : "0"
          }
        },
      });
    } catch (error: unknown) {
      logger.error("[NEIGHBORHOOD_STATS_GET]", error, { storeId, neighborhoodId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);