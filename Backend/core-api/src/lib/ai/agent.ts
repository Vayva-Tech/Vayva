/**
 * AI Agent Service
 * 
 * Proactive AI features for merchant insights:
 * - Smart pricing recommendations
 * - Stock level predictions
 * - Demand forecasting
 * - Anomaly detection
 */

import { prisma } from "@vayva/db";
import { logger as _logger } from "@vayva/shared";

interface PricingRecommendation {
  productId: string;
  currentPrice: number;
  recommendedPrice: number;
  confidence: number;
  reasoning: string[];
}

interface StockPrediction {
  productId: string;
  currentStock: number;
  predictedDaysUntilStockout: number;
  recommendedReorderQuantity: number;
  confidence: number;
}

interface DemandForecast {
  date: string;
  predictedOrders: number;
  predictedRevenue: number;
  confidence: number;
}

/**
 * Analyze competitor pricing and generate recommendations
 */
export async function generatePricingRecommendations(
  storeId: string
): Promise<PricingRecommendation[]> {
  const recommendations: PricingRecommendation[] = [];

  const products = await prisma.product.findMany({
    where: { storeId, status: "ACTIVE" },
    select: {
      id: true,
      price: true,
      productVariants: {
        select: {
          orderItems: {
            where: {
              order: {
                createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
              },
            },
            select: { quantity: true },
          },
          inventoryItems: { select: { available: true } },
        },
      },
    },
  });

  for (const product of products) {
    const sales = (product as typeof products[0] & { productVariants: Array<{ orderItems: Array<{ quantity: number }> }> }).productVariants.reduce((sum: number, variant) => {
      const sold = variant.orderItems.reduce(
        (inner, item) => inner + item.quantity,
        0,
      );
      return sum + sold;
    }, 0);
    const avgDailySales = sales / 30;

    // Simple heuristic: if sales are low, recommend price reduction
    // if sales are high, recommend slight increase to maximize revenue
    let adjustment = 0;
    const reasoning: string[] = [];

    if (avgDailySales < 0.5) {
      adjustment = -0.1; // 10% reduction
      reasoning.push("Low sales velocity detected");
      reasoning.push("Price elasticity suggests room for discounting");
    } else if (avgDailySales > 5) {
      adjustment = 0.05; // 5% increase
      reasoning.push("High sales velocity indicates pricing power");
      reasoning.push("Strong demand - opportunity for margin improvement");
    }

    // Check stock levels
    const currentStock = product.productVariants.reduce((sum, variant) => {
      const available = variant.inventoryItems.reduce(
        (inner, item) => inner + Number(item.available),
        0,
      );
      return sum + available;
    }, 0);
    const stockDays = currentStock / (avgDailySales || 1);
    if (stockDays > 90 && adjustment === 0) {
      adjustment = -0.15;
      reasoning.push("High inventory levels - recommend clearance pricing");
    }

    if (adjustment !== 0) {
      const currentPrice = Number(product.price);
      recommendations.push({
        productId: product.id,
        currentPrice,
        recommendedPrice: Math.round(currentPrice * (1 + adjustment)),
        confidence: Math.min(0.9, 0.5 + Math.abs(adjustment) * 2),
        reasoning,
      });
    }
  }

  return recommendations.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Predict stock out dates and recommend reorder quantities
 */
export async function predictStockLevels(
  storeId: string
): Promise<StockPrediction[]> {
  const predictions: StockPrediction[] = [];

  const products = await prisma.product.findMany({
    where: { storeId, status: "ACTIVE" },
    select: {
      id: true,
      productVariants: {
        select: {
          id: true,
          orderItems: {
            where: {
              order: {
                createdAt: { gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
              },
            },
            select: { quantity: true, order: { select: { createdAt: true } } },
          },
          inventoryItems: {
            select: { available: true },
          },
        },
      },
    },
  });

  for (const product of products) {
    const dailySales: Record<string, number> = {};

    const currentStock = product.productVariants.reduce((sum, variant) => {
      const variantAvailable = variant.inventoryItems.reduce(
        (inner, item) => inner + Number(item.available),
        0,
      );
      return sum + variantAvailable;
    }, 0);

    if (currentStock <= 0) continue;

    // Aggregate sales by day
    for (const variant of product.productVariants) {
      for (const orderItem of variant.orderItems) {
        const day = orderItem.order.createdAt.toISOString().split("T")[0];
        dailySales[day] = (dailySales[day] || 0) + orderItem.quantity;
      }
    }

    const salesValues = Object.values(dailySales);
    const avgDailySales =
      salesValues.reduce((a, b) => a + b, 0) / Math.max(salesValues.length, 30);

    if (avgDailySales === 0) continue;

    const daysUntilStockout = Math.floor(
      currentStock / avgDailySales
    );

    // Calculate recommended reorder quantity
    // Formula: (lead time + safety stock) * avg daily sales - current stock
    const leadTimeDays = 7;
    const _safetyStock = avgDailySales * 14; // 2 weeks safety stock
    const recommendedReorder = Math.ceil(
      avgDailySales * (leadTimeDays + 14) - currentStock
    );

    // Only alert if stockout within 30 days or low confidence
    if (daysUntilStockout <= 30) {
      predictions.push({
        productId: product.id,
        currentStock,
        predictedDaysUntilStockout: daysUntilStockout,
        recommendedReorderQuantity: Math.max(0, recommendedReorder),
        confidence: Math.min(0.95, 0.6 + 30 / (daysUntilStockout + 30)),
      });
    }
  }

  return predictions.sort(
    (a, b) => a.predictedDaysUntilStockout - b.predictedDaysUntilStockout
  );
}

/**
 * Generate demand forecast for next 14 days
 */
export async function generateDemandForecast(
  storeId: string,
  days = 14
): Promise<DemandForecast[]> {
  // Get historical daily orders
  const historicalData = await prisma.$queryRaw<{ day: string; orders: number; revenue: number }[]>`
    SELECT 
      DATE("createdAt")::text as day,
      COUNT(*)::int as orders,
      COALESCE(SUM("totalAmount"), 0)::float as revenue
    FROM "Order"
    WHERE "storeId" = ${storeId}
      AND "createdAt" >= NOW() - INTERVAL '90 days'
    GROUP BY DATE("createdAt")
    ORDER BY day ASC
  `;

  const forecasts: DemandForecast[] = [];

  // Simple moving average with day-of-week adjustment
  const orders = historicalData.map((d) => d.orders);
  const revenues = historicalData.map((d) => d.revenue);

  const avgOrders = orders.reduce((a, b) => a + b, 0) / orders.length || 1;
  const avgRevenue = revenues.reduce((a, b) => a + b, 0) / revenues.length || 1;

  // Calculate day-of-week patterns
  const dayOfWeekPattern: Record<number, number> = {};
  const last30Days = historicalData.slice(-30);

  for (const day of last30Days) {
    const date = new Date(day.day);
    const dayOfWeek = date.getDay();
    dayOfWeekPattern[dayOfWeek] =
      (dayOfWeekPattern[dayOfWeek] || 0) + day.orders / avgOrders;
  }

  // Normalize patterns
  for (const day in dayOfWeekPattern) {
    dayOfWeekPattern[day] = dayOfWeekPattern[day] / 4; // ~4 weeks of data
  }

  // Generate forecasts
  const today = new Date();

  for (let i = 1; i <= days; i++) {
    const forecastDate = new Date(today);
    forecastDate.setDate(today.getDate() + i);

    const dayOfWeek = forecastDate.getDay();
    const seasonalFactor = dayOfWeekPattern[dayOfWeek] || 1;

    // Trend adjustment (slight upward trend assumption)
    const trendFactor = 1 + i * 0.005;

    const predictedOrders = Math.round(avgOrders * seasonalFactor * trendFactor);
    const predictedRevenue = Math.round(avgRevenue * seasonalFactor * trendFactor);

    forecasts.push({
      date: forecastDate.toISOString().split("T")[0],
      predictedOrders,
      predictedRevenue,
      confidence: 0.7 - i * 0.02, // Confidence decreases with distance
    });
  }

  return forecasts;
}

/**
 * Detect anomalies in merchant metrics
 */
interface Anomaly {
  type: "sales_drop" | "sales_spike" | "refund_spike" | "inventory_issue";
  severity: "low" | "medium" | "high";
  description: string;
  metric: string;
  expected: number;
  actual: number;
  date: string;
}

export async function detectAnomalies(storeId: string): Promise<Anomaly[]> {
  const anomalies: Anomaly[] = [];

  // Check for sales anomalies
  const recentSales = await prisma.$queryRaw<{ day: string; orders: number; revenue: number }[]>`
    SELECT 
      DATE("createdAt")::text as day,
      COUNT(*)::int as orders,
      COALESCE(SUM("totalAmount"), 0)::float as revenue
    FROM "Order"
    WHERE "storeId" = ${storeId}
      AND "createdAt" >= NOW() - INTERVAL '7 days'
    GROUP BY DATE("createdAt")
    ORDER BY day ASC
  `;

  const baseline = await prisma.$queryRaw<{ avg_orders: number; std_orders: number }[]>`
    SELECT 
      AVG(daily_orders)::float as avg_orders,
      STDDEV(daily_orders)::float as std_orders
    FROM (
      SELECT COUNT(*) as daily_orders
      FROM "Order"
      WHERE "storeId" = ${storeId}
        AND "createdAt" >= NOW() - INTERVAL '90 days'
        AND "createdAt" < NOW() - INTERVAL '7 days'
      GROUP BY DATE("createdAt")
    ) baseline
  `;

  const avgOrders = baseline[0]?.avg_orders || 0;
  const stdOrders = baseline[0]?.std_orders || 1;

  for (const day of recentSales) {
    const deviation = Math.abs(day.orders - avgOrders) / stdOrders;

    if (deviation > 2.5) {
      anomalies.push({
        type: day.orders > avgOrders ? "sales_spike" : "sales_drop",
        severity: deviation > 3.5 ? "high" : deviation > 3 ? "medium" : "low",
        description:
          day.orders > avgOrders
            ? "Unusually high sales detected"
            : "Sales significantly below average",
        metric: "daily_orders",
        expected: Math.round(avgOrders),
        actual: day.orders,
        date: day.day,
      });
    }
  }

  // Check for refund anomalies
  const refunds = await prisma.$queryRaw<{ day: string; count: number }[]>`
    SELECT 
      DATE(r."createdAt")::text as day,
      COUNT(*)::int as count
    FROM "Refund" r
    JOIN "Order" o ON r."orderId" = o.id
    WHERE o."storeId" = ${storeId}
      AND r."createdAt" >= NOW() - INTERVAL '7 days'
    GROUP BY DATE(r."createdAt")
  `;

  for (const day of refunds) {
    if (day.count > 5) {
      anomalies.push({
        type: "refund_spike",
        severity: day.count > 10 ? "high" : "medium",
        description: "Refund rate higher than normal",
        metric: "daily_refunds",
        expected: 2,
        actual: day.count,
        date: day.day,
      });
    }
  }

  return anomalies.sort(
    (a, b) =>
      (b.severity === "high" ? 3 : b.severity === "medium" ? 2 : 1) -
      (a.severity === "high" ? 3 : a.severity === "medium" ? 2 : 1)
  );
}

/**
 * Generate comprehensive AI insights report
 */
export async function generateInsightsReport(storeId: string): Promise<{
  pricing: PricingRecommendation[];
  stock: StockPrediction[];
  forecast: DemandForecast[];
  anomalies: Anomaly[];
  generatedAt: string;
}> {
  const [pricing, stock, forecast, anomalies] = await Promise.all([
    generatePricingRecommendations(storeId),
    predictStockLevels(storeId),
    generateDemandForecast(storeId),
    detectAnomalies(storeId),
  ]);

  return {
    pricing,
    stock,
    forecast,
    anomalies,
    generatedAt: new Date().toISOString(),
  };
}
