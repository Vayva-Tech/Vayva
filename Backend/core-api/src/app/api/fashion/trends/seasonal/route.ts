import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { z } from "zod";
import { logger } from "@/lib/logger";

const SeasonalQuerySchema = z.object({
  year: z.string().transform(Number).pipe(z.number().min(2020).max(2030)).default(new Date().getFullYear().toString()),
  season: z.enum(["SPRING", "SUMMER", "FALL", "WINTER"]).optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.FASHION_TRENDS_VIEW,
  async (req, { storeId, db }) => {
    try {
      const { searchParams } = new URL(req.url);
      
      const year = searchParams.get("year") || new Date().getFullYear().toString();
      const season = searchParams.get("season") as any;
      
      SeasonalQuerySchema.parse({ year, season });
      
      // Define seasonal date ranges
      const seasons = {
        SPRING: { start: new Date(year, 2, 1), end: new Date(year, 4, 31) },
        SUMMER: { start: new Date(year, 5, 1), end: new Date(year, 7, 31) },
        FALL: { start: new Date(year, 8, 1), end: new Date(year, 10, 30) },
        WINTER: { start: new Date(year, 11, 1), end: new Date(Number(year) + 1, 1, 28) }
      };
      
      // If no specific season, get all seasons
      const _dateRanges = season ? [seasons[season]] : Object.values(seasons);
      
      const seasonalData: any[] = [];
      
      for (const [seasonName, { start, end }] of Object.entries(seasons)) {
        if (season && season !== seasonName) continue;
        
        // Get seasonal sales data
        const seasonalStats = await db.$queryRaw`
          SELECT 
            p.id as product_id,
            p.name as product_name,
            p.category,
            p.tags,
            COUNT(oi.id) as items_sold,
            SUM(oi.quantity) as total_quantity,
            SUM(oi.price * oi.quantity) as total_revenue,
            AVG(oi.price) as avg_price,
            COUNT(DISTINCT o.id) as order_count
          FROM "Product" p
          JOIN "OrderItem" oi ON p.id = oi."productId"
          JOIN "Order" o ON oi."orderId" = o.id
          WHERE o."storeId" = ${storeId}
            AND o."createdAt" >= ${start}
            AND o."createdAt" <= ${end}
            AND o.status IN ('completed', 'fulfilled')
          GROUP BY p.id, p.name, p.category, p.tags
          ORDER BY total_quantity DESC
          LIMIT 20
        `;
        
        // Get seasonal growth compared to previous year
        const prevYearStart = new Date(start);
        const prevYearEnd = new Date(end);
        prevYearStart.setFullYear(prevYearStart.getFullYear() - 1);
        prevYearEnd.setFullYear(prevYearEnd.getFullYear() - 1);
        
        const prevYearStats = await db.$queryRaw`
          SELECT 
            p.id as product_id,
            SUM(oi.quantity) as prev_total_quantity,
            SUM(oi.price * oi.quantity) as prev_total_revenue
          FROM "Product" p
          JOIN "OrderItem" oi ON p.id = oi."productId"
          JOIN "Order" o ON oi."orderId" = o.id
          WHERE o."storeId" = ${storeId}
            AND o."createdAt" >= ${prevYearStart}
            AND o."createdAt" <= ${prevYearEnd}
            AND o.status IN ('completed', 'fulfilled')
          GROUP BY p.id
        `;
        
        // Calculate growth percentages
        const prevStatsMap = new Map();
        (prevYearStats as any[]).forEach(row => {
          prevStatsMap.set(row.product_id, {
            quantity: Number(row.prev_total_quantity) || 0,
            revenue: Number(row.prev_total_revenue) || 0
          });
        });
        
        const enhancedStats = (seasonalStats as any[]).map(product => {
          const prevStats = prevStatsMap.get(product.product_id) || { quantity: 0, revenue: 0 };
          const quantityGrowth = prevStats.quantity > 0 
            ? ((Number(product.total_quantity) - prevStats.quantity) / prevStats.quantity) * 100
            : (Number(product.total_quantity) > 0 ? 100 : 0);
            
          const revenueGrowth = prevStats.revenue > 0
            ? ((Number(product.total_revenue) - prevStats.revenue) / prevStats.revenue) * 100
            : (Number(product.total_revenue) > 0 ? 100 : 0);
          
          return {
            ...product,
            quantityGrowth: parseFloat(quantityGrowth.toFixed(2)),
            revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
            trend: quantityGrowth > 10 ? 'hot' : quantityGrowth > 0 ? 'rising' : quantityGrowth < -10 ? 'declining' : 'stable'
          };
        });
        
        seasonalData.push({
          season: seasonName,
          year: Number(year),
          dateRange: {
            start: start.toISOString(),
            end: end.toISOString()
          },
          topProducts: enhancedStats,
          summary: {
            totalItemsSold: enhancedStats.reduce((sum, p) => sum + Number(p.items_sold), 0),
            totalRevenue: enhancedStats.reduce((sum, p) => sum + Number(p.total_revenue), 0),
            totalOrders: enhancedStats.reduce((sum, p) => sum + Number(p.order_count), 0),
            uniqueProducts: enhancedStats.length
          }
        });
      }
      
      return NextResponse.json({
        success: true,
        data: seasonalData,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid parameters",
              details: error.errors,
            },
          },
          { status: 400 }
        );
      }
      
      logger.error("[FASHION_TRENDS_SEASONAL_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SEASONAL_TRENDS_FAILED",
            message: "Failed to fetch seasonal trend data",
          },
        },
        { status: 500 }
      );
    }
  }
);