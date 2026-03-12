/**
 * Neighborhood Trends API Route
 * GET /api/realestate/neighborhoods/[id]/trends - Get neighborhood market trends
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET Neighborhood Trends
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (request, { storeId, params }) => {
    try {
      const { id: neighborhoodId } = await params;
      
      if (!neighborhoodId) {
        return NextResponse.json(
          { error: "Neighborhood ID required" },
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

      // Get quarterly price trends for the past 2 years
      const quarterlyTrends = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('quarter', "createdAt") as quarter,
          AVG("price") as avg_price,
          COUNT(*) as sales_count,
          AVG("bedrooms") as avg_bedrooms,
          AVG("bathrooms") as avg_bathrooms,
          AVG("area") as avg_area
        FROM "properties"
        WHERE "storeId" = ${storeId}
          AND "city" = ${city}
          AND "state" = ${state}
          AND "status" = 'sold'
          AND "createdAt" >= CURRENT_DATE - INTERVAL '2 years'
        GROUP BY DATE_TRUNC('quarter', "createdAt")
        ORDER BY quarter ASC
      `;

      // Get seasonal trends
      const seasonalTrends = await prisma.$queryRaw`
        SELECT 
          EXTRACT(MONTH FROM "createdAt") as month,
          AVG("price") as avg_price,
          COUNT(*) as sales_count,
          AVG(EXTRACT(DAY FROM "createdAt")) as avg_day_of_month
        FROM "properties"
        WHERE "storeId" = ${storeId}
          AND "city" = ${city}
          AND "state" = ${state}
          AND "status" = 'sold'
        GROUP BY EXTRACT(MONTH FROM "createdAt")
        ORDER BY month ASC
      `;

      // Get days on market trends
      const domTrends = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', p."createdAt") as month,
          AVG(EXTRACT(DAY FROM (v."scheduledAt" - p."createdAt"))) as avg_days_on_market
        FROM "properties" p
        LEFT JOIN "viewings" v ON p."id" = v."propertyId" 
          AND v."status" IN ('completed', 'cancelled')
        WHERE p."storeId" = ${storeId}
          AND p."city" = ${city}
          AND p."state" = ${state}
          AND p."createdAt" >= CURRENT_DATE - INTERVAL '1 year'
        GROUP BY DATE_TRUNC('month', p."createdAt")
        ORDER BY month ASC
      `;

      // Get buyer demand indicators
      const demandIndicators = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(DISTINCT "email") as unique_buyers,
          COUNT(*) as total_inquiries,
          AVG("price") as avg_budget
        FROM "real_estate_leads"
        WHERE "merchantId" = ${storeId}
          AND "preferredLocations" @> ARRAY[${city}]::text[]
          AND "createdAt" >= CURRENT_DATE - INTERVAL '1 year'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month ASC
      `;

      // Calculate trend analysis
      const priceAnalysis = {
        trendDirection: quarterlyTrends.length >= 2 
          ? (quarterlyTrends[quarterlyTrends.length - 1].avg_price > quarterlyTrends[0].avg_price ? "upward" : "downward")
          : "stable",
        volatility: quarterlyTrends.length > 1 
          ? quarterlyTrends.reduce((acc, curr, idx, arr) => {
              if (idx === 0) return 0;
              const prev = arr[idx - 1];
              return acc + Math.abs((curr.avg_price - prev.avg_price) / prev.avg_price);
            }, 0) / (quarterlyTrends.length - 1) * 100
          : 0,
        annualGrowth: quarterlyTrends.length >= 4 
          ? ((quarterlyTrends[quarterlyTrends.length - 1].avg_price - quarterlyTrends[0].avg_price) / quarterlyTrends[0].avg_price) * 100
          : 0
      };

      return NextResponse.json({
        success: true,
        data: {
          neighborhood: {
            city,
            state,
            id: neighborhoodId
          },
          quarterlyTrends,
          seasonalTrends: seasonalTrends.map(season => ({
            ...season,
            monthName: new Date(2023, season.month - 1, 1).toLocaleString('default', { month: 'long' })
          })),
          domTrends,
          demandIndicators,
          analysis: {
            price: priceAnalysis,
            marketHeat: {
              salesVelocity: quarterlyTrends.reduce((sum, q) => sum + q.sales_count, 0) / quarterlyTrends.length,
              buyerInterest: demandIndicators.reduce((sum, d) => sum + d.unique_buyers, 0) / demandIndicators.length,
              inventoryPressure: domTrends.length > 0 
                ? domTrends[domTrends.length - 1].avg_days_on_market 
                : null
            },
            seasonality: {
              peakSeason: seasonalTrends.reduce((max, curr) => 
                curr.sales_count > max.sales_count ? curr : max
              , seasonalTrends[0]),
              slowSeason: seasonalTrends.reduce((min, curr) => 
                curr.sales_count < min.sales_count ? curr : min
              , seasonalTrends[0])
            }
          }
        },
      });
    } catch (error: unknown) {
      logger.error("[NEIGHBORHOOD_TRENDS_GET]", error, { storeId, neighborhoodId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);