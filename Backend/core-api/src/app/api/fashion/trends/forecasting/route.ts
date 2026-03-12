import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { z } from "zod";
import { logger } from "@/lib/logger";

const ForecastSchema = z.object({
  months: z.number().min(1).max(12).default(6),
  productId: z.string().optional(),
  category: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.FASHION_TRENDS_VIEW,
  async (req, { storeId, db }) => {
    try {
      const { searchParams } = new URL(req.url);
      
      const months = parseInt(searchParams.get("months") || "6");
      const productId = searchParams.get("productId");
      const category = searchParams.get("category");
      
      ForecastSchema.parse({ months, productId, category });
      
      // Calculate date ranges
      const now = new Date();
      const historicalStart = new Date();
      historicalStart.setMonth(historicalStart.getMonth() - (months * 2)); // Double the forecast period for historical data
      
      const forecastStart = new Date();
      forecastStart.setDate(forecastStart.getDate() + 1);
      
      const forecastEnd = new Date();
      forecastEnd.setMonth(forecastEnd.getMonth() + months);
      
      // Get historical sales data
      const historicalData = await db.$queryRaw`
        SELECT 
          DATE_TRUNC('month', o."createdAt") as month,
          p.id as product_id,
          p.name as product_name,
          p.category,
          SUM(oi.quantity) as quantity_sold,
          SUM(oi.price * oi.quantity) as revenue
        FROM "Order" o
        JOIN "OrderItem" oi ON o.id = oi."orderId"
        JOIN "Product" p ON oi."productId" = p.id
        WHERE o."storeId" = ${storeId}
          AND o."createdAt" >= ${historicalStart}
          AND o."createdAt" <= ${now}
          AND o.status IN ('completed', 'fulfilled')
          ${productId ? `AND p.id = ${productId}` : ''}
          ${category ? `AND p.category = ${category}` : ''}
        GROUP BY DATE_TRUNC('month', o."createdAt"), p.id, p.name, p.category
        ORDER BY month, quantity_sold DESC
      `;
      
      // Simple forecasting algorithm (moving average + trend)
      const forecasts: any[] = [];
      
      // Group data by product
      const productDataMap = new Map();
      (historicalData as any[]).forEach(row => {
        if (!productDataMap.has(row.product_id)) {
          productDataMap.set(row.product_id, {
            id: row.product_id,
            name: row.product_name,
            category: row.category,
            monthlyData: [],
          });
        }
        productDataMap.get(row.product_id).monthlyData.push({
          month: row.month,
          quantity: Number(row.quantity_sold),
          revenue: Number(row.revenue),
        });
      });
      
      // Generate forecasts for each product
      productDataMap.forEach(productData => {
        const monthlyQuantities = productData.monthlyData.map(d => d.quantity);
        
        if (monthlyQuantities.length < 2) return; // Need at least 2 data points
        
        // Calculate trend (simple linear regression slope)
        const n = monthlyQuantities.length;
        const xValues = Array.from({ length: n }, (_, i) => i);
        const yValues = monthlyQuantities;
        
        const sumX = xValues.reduce((a, b) => a + b, 0);
        const sumY = yValues.reduce((a, b) => a + b, 0);
        const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
        const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        // Moving average for smoothing
        const windowSize = Math.min(3, monthlyQuantities.length);
        const movingAvg = monthlyQuantities.slice(-windowSize).reduce((a, b) => a + b, 0) / windowSize;
        
        // Generate monthly forecasts
        const productForecasts = [];
        for (let i = 1; i <= months; i++) {
          const forecastMonth = new Date(now.getFullYear(), now.getMonth() + i, 1);
          const forecastValue = Math.max(0, Math.round(movingAvg + slope * i));
          
          productForecasts.push({
            month: forecastMonth.toISOString(),
            predictedQuantity: forecastValue,
            predictedRevenue: forecastValue * (productData.monthlyData[productData.monthlyData.length - 1]?.revenue / productData.monthlyData[productData.monthlyData.length - 1]?.quantity || 0),
            confidence: Math.max(0.6, 1 - (i * 0.05)), // Decreasing confidence over time
          });
        }
        
        forecasts.push({
          productId: productData.id,
          productName: productData.name,
          category: productData.category,
          historicalData: productData.monthlyData,
          forecasts: productForecasts,
          trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
          trendStrength: Math.abs(slope) / movingAvg,
        });
      });
      
      return NextResponse.json({
        success: true,
        data: {
          forecasts: forecasts.sort((a, b) => 
            b.forecasts[b.forecasts.length - 1].predictedQuantity - 
            a.forecasts[a.forecasts.length - 1].predictedQuantity
          ),
          period: {
            months,
            historicalStart: historicalStart.toISOString(),
            forecastStart: forecastStart.toISOString(),
            forecastEnd: forecastEnd.toISOString(),
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
              message: "Invalid parameters",
              details: error.errors,
            },
          },
          { status: 400 }
        );
      }
      
      logger.error("[FASHION_TRENDS_FORECASTING_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORECASTING_FAILED",
            message: "Failed to generate trend forecasting",
          },
        },
        { status: 500 }
      );
    }
  }
);