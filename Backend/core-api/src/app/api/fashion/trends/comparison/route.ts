import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.FASHION_TRENDS_VIEW,
  async (req, { storeId, db }) => {
    try {
      const { searchParams } = new URL(req.url);
      const productId = searchParams.get("productId");
      const categoryId = searchParams.get("categoryId");
      const period = searchParams.get("period") || "30d";
      
      // Parse period (e.g., "30d", "90d", "1y")
      let days = 30;
      if (period.endsWith('d')) {
        days = parseInt(period.replace('d', ''));
      } else if (period.endsWith('y')) {
        days = parseInt(period.replace('y', '')) * 365;
      }
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // Get current period data
      const currentPeriodData = await db.$queryRaw`
        SELECT 
          p.id,
          p.name,
          p.category,
          COUNT(oi.id) as current_items_sold,
          SUM(oi.quantity) as current_quantity,
          SUM(oi.price * oi.quantity) as current_revenue
        FROM "Product" p
        JOIN "OrderItem" oi ON p.id = oi."productId"
        JOIN "Order" o ON oi."orderId" = o.id
        WHERE o."storeId" = ${storeId}
          AND o."createdAt" >= ${startDate}
          AND o."createdAt" <= ${endDate}
          AND o.status IN ('completed', 'fulfilled')
          ${productId ? `AND p.id = ${productId}` : ''}
          ${categoryId ? `AND p."categoryId" = ${categoryId}` : ''}
        GROUP BY p.id, p.name, p.category
      `;
      
      // Get previous period data for comparison
      const prevEndDate = new Date(startDate);
      const prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - days);
      
      const previousPeriodData = await db.$queryRaw`
        SELECT 
          p.id,
          COUNT(oi.id) as prev_items_sold,
          SUM(oi.quantity) as prev_quantity,
          SUM(oi.price * oi.quantity) as prev_revenue
        FROM "Product" p
        JOIN "OrderItem" oi ON p.id = oi."productId"
        JOIN "Order" o ON oi."orderId" = o.id
        WHERE o."storeId" = ${storeId}
          AND o."createdAt" >= ${prevStartDate}
          AND o."createdAt" < ${prevEndDate}
          AND o.status IN ('completed', 'fulfilled')
          ${productId ? `AND p.id = ${productId}` : ''}
          ${categoryId ? `AND p."categoryId" = ${categoryId}` : ''}
        GROUP BY p.id
      `;
      
      // Create maps for easy lookup
      const prevDataMap = new Map();
      (previousPeriodData as any[]).forEach(row => {
        prevDataMap.set(row.id, {
          itemsSold: Number(row.prev_items_sold) || 0,
          quantity: Number(row.prev_quantity) || 0,
          revenue: Number(row.prev_revenue) || 0
        });
      });
      
      // Calculate comparisons and rankings
      const comparisonData = (currentPeriodData as any[]).map(product => {
        const prevData = prevDataMap.get(product.id) || { itemsSold: 0, quantity: 0, revenue: 0 };
        
        const quantityChange = Number(product.current_quantity) - prevData.quantity;
        const revenueChange = Number(product.current_revenue) - prevData.revenue;
        
        const quantityGrowth = prevData.quantity > 0 
          ? (quantityChange / prevData.quantity) * 100
          : (Number(product.current_quantity) > 0 ? 100 : 0);
          
        const revenueGrowth = prevData.revenue > 0
          ? (revenueChange / prevData.revenue) * 100
          : (Number(product.current_revenue) > 0 ? 100 : 0);
        
        return {
          productId: product.id,
          productName: product.name,
          category: product.category,
          currentPeriod: {
            itemsSold: Number(product.current_items_sold),
            quantity: Number(product.current_quantity),
            revenue: Number(product.current_revenue)
          },
          previousPeriod: prevData,
          changes: {
            quantity: quantityChange,
            revenue: parseFloat(revenueChange.toFixed(2)),
            itemsSold: Number(product.current_items_sold) - prevData.itemsSold
          },
          growthRates: {
            quantity: parseFloat(quantityGrowth.toFixed(2)),
            revenue: parseFloat(revenueGrowth.toFixed(2))
          },
          trend: quantityGrowth > 20 ? 'strong_growth' : 
                 quantityGrowth > 5 ? 'moderate_growth' :
                 quantityGrowth > -5 ? 'stable' :
                 quantityGrowth > -20 ? 'moderate_decline' : 'strong_decline'
        };
      });
      
      // Sort by revenue growth (descending)
      comparisonData.sort((a, b) => b.growthRates.revenue - a.growthRates.revenue);
      
      // Add rankings
      const rankedData = comparisonData.map((item, index) => ({
        ...item,
        rank: index + 1,
        percentile: Math.round(((comparisonData.length - index - 1) / comparisonData.length) * 100)
      }));
      
      return NextResponse.json({
        success: true,
        data: {
          period: {
            current: { start: startDate.toISOString(), end: endDate.toISOString() },
            previous: { start: prevStartDate.toISOString(), end: prevEndDate.toISOString() },
            days
          },
          products: rankedData,
          summary: {
            totalProducts: rankedData.length,
            growingProducts: rankedData.filter(p => p.growthRates.quantity > 0).length,
            decliningProducts: rankedData.filter(p => p.growthRates.quantity < 0).length,
            stableProducts: rankedData.filter(p => p.growthRates.quantity >= -5 && p.growthRates.quantity <= 5).length
          }
        },
      });
    } catch (error: any) {
      logger.error("[FASHION_TRENDS_COMPARISON_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TRENDS_COMPARISON_FAILED",
            message: "Failed to fetch trend comparison data",
          },
        },
        { status: 500 }
      );
    }
  }
);