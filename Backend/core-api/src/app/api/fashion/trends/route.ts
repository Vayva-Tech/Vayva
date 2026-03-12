import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { z } from "zod";
import { logger } from "@/lib/logger";

const QuerySchema = z.object({
  period: z.enum(["daily", "weekly", "monthly", "quarterly"]).default("monthly"),
  days: z.string().transform(Number).pipe(z.number().min(7).max(365)).default("30"),
  category: z.string().optional(),
  productId: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.FASHION_TRENDS_VIEW,
  async (req, { storeId, db }) => {
    try {
      const { searchParams } = new URL(req.url);
      
      const queryData = Object.fromEntries(searchParams.entries());
      const { period, days, category, productId } = QuerySchema.parse(queryData);
      
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // Build where clause for orders
      const orderWhere: any = {
        storeId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: ["completed", "fulfilled"],
        },
      };
      
      // Get trending products
      const trendingProducts = await db.$queryRaw`
        SELECT 
          p.id,
          p.name,
          p.sku,
          p.category,
          p.images,
          COUNT(oi.id) as order_count,
          SUM(oi.quantity) as total_quantity_sold,
          SUM(oi.price * oi.quantity) as total_revenue,
          AVG(oi.price) as avg_price
        FROM "Product" p
        JOIN "OrderItem" oi ON p.id = oi."productId"
        JOIN "Order" o ON oi."orderId" = o.id
        WHERE o."storeId" = ${storeId}
          AND o."createdAt" >= ${startDate}
          AND o."createdAt" <= ${endDate}
          AND o.status IN ('completed', 'fulfilled')
          ${category ? `AND p.category = ${category}` : ''}
          ${productId ? `AND p.id = ${productId}` : ''}
        GROUP BY p.id, p.name, p.sku, p.category, p.images
        ORDER BY total_quantity_sold DESC
        LIMIT 50
      `;
      
      // Get category trends
      const categoryTrends = await db.$queryRaw`
        SELECT 
          p.category,
          COUNT(DISTINCT o.id) as order_count,
          COUNT(oi.id) as item_count,
          SUM(oi.quantity) as total_quantity,
          SUM(oi.price * oi.quantity) as total_revenue
        FROM "Product" p
        JOIN "OrderItem" oi ON p.id = oi."productId"
        JOIN "Order" o ON oi."orderId" = o.id
        WHERE o."storeId" = ${storeId}
          AND o."createdAt" >= ${startDate}
          AND o."createdAt" <= ${endDate}
          AND o.status IN ('completed', 'fulfilled')
          AND p.category IS NOT NULL
        GROUP BY p.category
        ORDER BY total_revenue DESC
      `;
      
      // Get sales growth data
      const salesGrowth = await db.$queryRaw`
        SELECT 
          DATE_TRUNC('day', o."createdAt") as date,
          COUNT(DISTINCT o.id) as order_count,
          SUM(o.total) as daily_revenue,
          COUNT(oi.id) as items_sold
        FROM "Order" o
        JOIN "OrderItem" oi ON o.id = oi."orderId"
        WHERE o."storeId" = ${storeId}
          AND o."createdAt" >= ${startDate}
          AND o."createdAt" <= ${endDate}
          AND o.status IN ('completed', 'fulfilled')
        GROUP BY DATE_TRUNC('day', o."createdAt")
        ORDER BY date
      `;
      
      return NextResponse.json({
        success: true,
        data: {
          trendingProducts,
          categoryTrends,
          salesGrowth,
          period,
          days,
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
        },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid query parameters",
              details: error.errors,
            },
          },
          { status: 400 }
        );
      }
      
      logger.error("[FASHION_TRENDS_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TRENDS_FETCH_FAILED",
            message: "Failed to fetch trend analytics",
          },
        },
        { status: 500 }
      );
    }
  }
);