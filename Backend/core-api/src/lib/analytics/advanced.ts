/**
 * Advanced Analytics Service
 * 
 * Provides cohort analysis, predictions, and advanced merchant insights
 * using Prisma raw queries for efficiency.
 */

import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

interface CohortAnalysisResult {
  cohortMonth: string;
  cohortSize: number;
  retentionRates: number[];
  revenuePerCohort: number;
}

interface PredictionResult {
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  trend: "up" | "down" | "stable";
}

/**
 * Perform cohort analysis on merchant customers
 * Groups customers by signup month and tracks retention/revenue
 */
export async function performCohortAnalysis(
  storeId: string,
  months = 6
): Promise<CohortAnalysisResult[]> {
  try {
    // Get customer signup cohorts
    const cohorts = await prisma.$queryRaw<{ cohort_month: string; customer_count: number }[]>`
      SELECT 
        DATE_TRUNC('month', "createdAt")::text as cohort_month,
        COUNT(*)::int as customer_count
      FROM "Customer"
      WHERE "storeId" = ${storeId}
        AND "createdAt" >= NOW() - INTERVAL '${months} months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY cohort_month DESC
    `;

    const results: CohortAnalysisResult[] = [];

    for (const cohort of cohorts) {
      const cohortMonth = cohort.cohort_month.slice(0, 7); // YYYY-MM
      const cohortSize = cohort.customer_count;

      // Calculate retention for each subsequent month
      const retentionRates: number[] = [];
      
      for (let i = 0; i < months; i++) {
        const activeCustomers = await prisma.$queryRaw<{ count: number }[]>`
          SELECT COUNT(DISTINCT "customerId")::int as count
          FROM "Order"
          WHERE "storeId" = ${storeId}
            AND "customerId" IN (
              SELECT id FROM "Customer"
              WHERE "storeId" = ${storeId}
                AND DATE_TRUNC('month', "createdAt") = ${cohort.cohort_month}::timestamp
            )
            AND DATE_TRUNC('month', "createdAt") = (
              ${cohort.cohort_month}::timestamp + INTERVAL '${i} months'
            )
        `;

        const retentionRate = cohortSize > 0 
          ? Math.round((activeCustomers[0]?.count || 0) / cohortSize * 100)
          : 0;
        
        retentionRates.push(retentionRate);
      }

      // Calculate revenue per cohort
      const revenueData = await prisma.$queryRaw<{ total: number }[]>`
        SELECT COALESCE(SUM("totalAmount"), 0)::float as total
        FROM "Order"
        WHERE "storeId" = ${storeId}
          AND "customerId" IN (
            SELECT id FROM "Customer"
            WHERE "storeId" = ${storeId}
              AND DATE_TRUNC('month', "createdAt") = ${cohort.cohort_month}::timestamp
          )
      `;

      results.push({
        cohortMonth,
        cohortSize,
        retentionRates,
        revenuePerCohort: Math.round(revenueData[0]?.total || 0),
      });
    }

    return results;
  } catch (error) {
    logger.error("Cohort analysis failed", { error, storeId });
    throw error;
  }
}

/**
 * Simple linear regression for predictions
 * Uses least squares method for trend forecasting
 */
function linearRegression(data: number[]): { slope: number; intercept: number; r2: number } {
  const n = data.length;
  if (n < 2) return { slope: 0, intercept: data[0] || 0, r2: 0 };

  const x = Array.from({ length: n }, (_, i) => i);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = data.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((total, xi, i) => total + xi * data[i], 0);
  const sumXX = x.reduce((total, xi) => total + xi * xi, 0);
  const sumYY = data.reduce((total, yi) => total + yi * yi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared
  const yMean = sumY / n;
  const ssTotal = data.reduce((total, yi) => total + Math.pow(yi - yMean, 2), 0);
  const ssResidual = data.reduce((total, yi, i) => {
    const predicted = slope * i + intercept;
    return total + Math.pow(yi - predicted, 2);
  }, 0);
  const r2 = ssTotal > 0 ? 1 - ssResidual / ssTotal : 0;

  return { slope, intercept, r2 };
}

/**
 * Generate predictions for key metrics
 */
export async function generatePredictions(
  storeId: string
): Promise<PredictionResult[]> {
  try {
    const predictions: PredictionResult[] = [];

    // Get daily revenue for last 30 days
    const revenueData = await prisma.$queryRaw<{ date: string; revenue: number }[]>`
      SELECT 
        DATE("createdAt")::text as date,
        COALESCE(SUM("totalAmount"), 0)::float as revenue
      FROM "Order"
      WHERE "storeId" = ${storeId}
        AND "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    if (revenueData.length >= 7) {
      const revenues = revenueData.map(d => d.revenue);
      const regression = linearRegression(revenues);
      
      // Predict next 7 days
      const nextIndex = revenues.length;
      const predictedRevenue = regression.slope * nextIndex + regression.intercept;
      const currentAvg = revenues.slice(-7).reduce((a, b) => a + b, 0) / 7;

      predictions.push({
        metric: "Daily Revenue",
        currentValue: Math.round(currentAvg),
        predictedValue: Math.round(predictedRevenue),
        confidence: Math.round(regression.r2 * 100),
        trend: regression.slope > 0 ? "up" : regression.slope < 0 ? "down" : "stable",
      });
    }

    // Get daily order count
    const orderData = await prisma.$queryRaw<{ date: string; orders: number }[]>`
      SELECT 
        DATE("createdAt")::text as date,
        COUNT(*)::int as orders
      FROM "Order"
      WHERE "storeId" = ${storeId}
        AND "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    if (orderData.length >= 7) {
      const orders = orderData.map(d => d.orders);
      const regression = linearRegression(orders);
      
      const nextIndex = orders.length;
      const predictedOrders = regression.slope * nextIndex + regression.intercept;
      const currentAvg = orders.slice(-7).reduce((a, b) => a + b, 0) / 7;

      predictions.push({
        metric: "Daily Orders",
        currentValue: Math.round(currentAvg),
        predictedValue: Math.round(predictedOrders),
        confidence: Math.round(regression.r2 * 100),
        trend: regression.slope > 0 ? "up" : regression.slope < 0 ? "down" : "stable",
      });
    }

    // Get customer acquisition
    const customerData = await prisma.$queryRaw<{ date: string; customers: number }[]>`
      SELECT 
        DATE("createdAt")::text as date,
        COUNT(*)::int as customers
      FROM "Customer"
      WHERE "storeId" = ${storeId}
        AND "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    if (customerData.length >= 7) {
      const customers = customerData.map(d => d.customers);
      const regression = linearRegression(customers);
      
      const nextIndex = customers.length;
      const predictedCustomers = regression.slope * nextIndex + regression.intercept;
      const currentAvg = customers.slice(-7).reduce((a, b) => a + b, 0) / 7;

      predictions.push({
        metric: "New Customers",
        currentValue: Math.round(currentAvg),
        predictedValue: Math.round(predictedCustomers),
        confidence: Math.round(regression.r2 * 100),
        trend: regression.slope > 0 ? "up" : regression.slope < 0 ? "down" : "stable",
      });
    }

    return predictions;
  } catch (error) {
    logger.error("Prediction generation failed", { error, storeId });
    throw error;
  }
}

/**
 * Get repeat purchase rate
 */
export async function getRepeatPurchaseRate(
  storeId: string,
  months = 3
): Promise<{ repeatRate: number; avgOrdersPerCustomer: number }> {
  try {
    const result = await prisma.$queryRaw<{ 
      total_customers: number; 
      repeat_customers: number;
      total_orders: number;
    }[]>`
      WITH customer_orders AS (
        SELECT 
          "customerId",
          COUNT(*) as order_count
        FROM "Order"
        WHERE "storeId" = ${storeId}
          AND "createdAt" >= NOW() - INTERVAL '${months} months'
        GROUP BY "customerId"
      )
      SELECT 
        COUNT(*)::int as total_customers,
        COUNT(CASE WHEN order_count > 1 THEN 1 END)::int as repeat_customers,
        SUM(order_count)::int as total_orders
      FROM customer_orders
    `;

    const { total_customers, repeat_customers, total_orders } = result[0];
    
    return {
      repeatRate: total_customers > 0 
        ? Math.round(repeat_customers / total_customers * 100)
        : 0,
      avgOrdersPerCustomer: total_customers > 0
        ? Math.round(total_orders / total_customers * 10) / 10
        : 0,
    };
  } catch (error) {
    logger.error("Repeat purchase rate calculation failed", { error, storeId });
    throw error;
  }
}

/**
 * Get customer lifetime value (CLV) distribution
 */
export async function getCLVDistribution(
  storeId: string
): Promise<{ range: string; count: number; avgValue: number }[]> {
  try {
    const result = await prisma.$queryRaw<{ 
      clv_range: string; 
      customer_count: number;
      avg_clv: number;
    }[]>`
      WITH customer_clv AS (
        SELECT 
          "customerId",
          SUM("totalAmount") as clv
        FROM "Order"
        WHERE "storeId" = ${storeId}
        GROUP BY "customerId"
      )
      SELECT 
        CASE 
          WHEN clv < 10000 THEN '₦0 - ₦10k'
          WHEN clv < 50000 THEN '₦10k - ₦50k'
          WHEN clv < 100000 THEN '₦50k - ₦100k'
          WHEN clv < 500000 THEN '₦100k - ₦500k'
          ELSE '₦500k+'
        END as clv_range,
        COUNT(*)::int as customer_count,
        AVG(clv)::float as avg_clv
      FROM customer_clv
      GROUP BY 1
      ORDER BY MIN(clv)
    `;

    return result.map(r => ({
      range: r.clv_range,
      count: r.customer_count,
      avgValue: Math.round(r.avg_clv),
    }));
  } catch (error) {
    logger.error("CLV distribution calculation failed", { error, storeId });
    throw error;
  }
}
