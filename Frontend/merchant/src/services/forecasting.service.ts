import { prisma } from "@/lib/prisma";
import {
  SalesForecast,
  CashFlowForecast,
  InventoryForecast,
  PeriodType,
  ForecastFactors,
  ForecastingOverview
} from "@/types/intelligence";
import type { Prisma } from "@vayva/db";
type Decimal = Prisma.Decimal;
type InputJsonValue = Prisma.InputJsonValue;

// Helper to convert Decimal to number
const toNumber = (d: Decimal | number): number =>
  typeof d === "number" ? d : Number(d);

// Mapper functions to convert Prisma results to custom types
const mapSalesForecast = (f: {
  id: string;
  storeId: string;
  period: Date;
  periodType: string;
  predictedRevenue: Decimal | number;
  confidence: Decimal | number;
  upperBound: Decimal | number;
  lowerBound: Decimal | number;
  factors: unknown;
  createdAt: Date;
  updatedAt: Date;
}): SalesForecast => ({
  ...f,
  periodType: f.periodType as PeriodType,
  predictedRevenue: toNumber(f.predictedRevenue),
  confidence: toNumber(f.confidence),
  upperBound: toNumber(f.upperBound),
  lowerBound: toNumber(f.lowerBound),
  factors: f.factors as ForecastFactors,
});

const mapCashFlowForecast = (f: {
  id: string;
  storeId: string;
  date: Date;
  predictedInflow: Decimal | number;
  predictedOutflow: Decimal | number;
  netFlow: Decimal | number;
  runwayDays: number | null;
  alerts: unknown;
  createdAt: Date;
}): CashFlowForecast => ({
  ...f,
  predictedInflow: toNumber(f.predictedInflow),
  predictedOutflow: toNumber(f.predictedOutflow),
  netFlow: toNumber(f.netFlow),
  alerts: f.alerts as { lowBalance: boolean; shortfallRisk: number },
});

const mapInventoryForecast = (f: {
  id: string;
  storeId: string;
  productId: string;
  predictedDemand: number;
  stockoutRisk: Decimal | number;
  suggestedReorder: number;
  optimalReorderDate: Date;
  confidence: Decimal | number;
  createdAt: Date;
}): InventoryForecast => ({
  ...f,
  stockoutRisk: toNumber(f.stockoutRisk),
  confidence: toNumber(f.confidence),
});

export class ForecastingService {
  // Sales Forecasting Methods
  static async getSalesForecast(
    storeId: string,
    periodType: PeriodType,
    startDate: Date,
    endDate: Date
  ): Promise<SalesForecast[]> {
    const forecasts = await prisma.salesForecast?.findMany({
      where: {
        storeId,
        periodType,
        period: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { period: "asc" }
    });
    return forecasts.map(mapSalesForecast) as any;
  }

  static async generateSalesForecast(
    storeId: string,
    periodType: PeriodType,
    periods: number
  ): Promise<SalesForecast[]> {
    const now = new Date();
    const forecasts: SalesForecast[] = [];

    for (let i = 0; i < periods; i++) {
      const period = this.calculatePeriodDate(now, periodType, i);
      const historicalData = await this.getHistoricalSalesData(storeId, period, periodType);
      const prediction = this.calculateSalesPrediction(historicalData, periodType);

      const forecast = await prisma.salesForecast?.upsert({
        where: {
          storeId_period_periodType: {
            storeId,
            period,
            periodType
          }
        },
        update: {
          predictedRevenue: prediction.revenue,
          confidence: prediction.confidence,
          upperBound: prediction.upperBound,
          lowerBound: prediction.lowerBound,
          factors: prediction.factors as unknown as InputJsonValue
        },
        create: {
          storeId,
          period,
          periodType,
          predictedRevenue: prediction.revenue,
          confidence: prediction.confidence,
          upperBound: prediction.upperBound,
          lowerBound: prediction.lowerBound,
          factors: prediction.factors as unknown as InputJsonValue
        }
      });
      forecasts.push(mapSalesForecast(forecast));
    }

    return forecasts;
  }

  // Cash Flow Forecasting Methods
  static async getCashFlowForecast(
    storeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CashFlowForecast[]> {
    const forecasts = await prisma.cashFlowForecast?.findMany({
      where: {
        storeId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: "asc" }
    });
    return forecasts.map(mapCashFlowForecast) as any;
  }

  static async generateCashFlowForecast(
    storeId: string,
    days: number
  ): Promise<CashFlowForecast[]> {
    const now = new Date();
    const forecasts: CashFlowForecast[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);

      const prediction = await this.calculateCashFlowPrediction(storeId, date);

      const forecast = await prisma.cashFlowForecast?.upsert({
        where: {
          storeId_date: {
            storeId,
            date
          }
        },
        update: {
          predictedInflow: prediction.inflow,
          predictedOutflow: prediction.outflow,
          netFlow: prediction.netFlow,
          runwayDays: prediction.runwayDays,
          alerts: prediction.alerts as unknown as InputJsonValue
        },
        create: {
          storeId,
          date,
          predictedInflow: prediction.inflow,
          predictedOutflow: prediction.outflow,
          netFlow: prediction.netFlow,
          runwayDays: prediction.runwayDays,
          alerts: prediction.alerts as unknown as InputJsonValue
        }
      });
      forecasts.push(mapCashFlowForecast(forecast));
    }

    return forecasts;
  }

  // Inventory Forecasting Methods
  static async getInventoryForecast(
    storeId: string,
    productId?: string
  ): Promise<InventoryForecast[]> {
    const where: { storeId: string; productId?: string } = { storeId };
    if (productId) {
      where.productId = productId;
    }

    const forecasts = await prisma.inventoryForecast?.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });
    return forecasts.map(mapInventoryForecast) as any;
  }

  static async generateInventoryForecast(
    storeId: string,
    productId: string
  ): Promise<InventoryForecast> {
    const historicalData = await this.getHistoricalInventoryData(storeId, productId);
    const prediction = this.calculateInventoryPrediction(historicalData);

    const forecast = await prisma.inventoryForecast?.upsert({
      where: {
        storeId_productId: {
          storeId,
          productId
        }
      },
      update: {
        predictedDemand: prediction.demand,
        stockoutRisk: prediction.stockoutRisk,
        suggestedReorder: prediction.suggestedReorder,
        optimalReorderDate: prediction.optimalReorderDate,
        confidence: prediction.confidence
      },
      create: {
        storeId,
        productId,
        predictedDemand: prediction.demand,
        stockoutRisk: prediction.stockoutRisk,
        suggestedReorder: prediction.suggestedReorder,
        optimalReorderDate: prediction.optimalReorderDate,
        confidence: prediction.confidence
      }
    });

    return mapInventoryForecast(forecast);
  }

  // Helper Methods
  static async getForecastingOverview(storeId: string): Promise<ForecastingOverview> {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const [sales, cashFlow, inventory] = await Promise.all([
      this.getSalesForecast(storeId, "daily", now, thirtyDaysFromNow),
      this.getCashFlowForecast(storeId, now, thirtyDaysFromNow),
      this.getInventoryForecast(storeId)
    ]);

    return { sales, cashFlow, inventory };
  }

  private static calculatePeriodDate(baseDate: Date, periodType: PeriodType, offset: number): Date {
    const date = new Date(baseDate);
    switch (periodType) {
      case "daily":
        date.setDate(date.getDate() + offset);
        break;
      case "weekly":
        date.setDate(date.getDate() + offset * 7);
        break;
      case "monthly":
        date.setMonth(date.getMonth() + offset);
        break;
    }
    return date;
  }

  private static async getHistoricalSalesData(
    storeId: string,
    period: Date,
    periodType: PeriodType
  ): Promise<{ revenue: number; orders: number; avgOrderValue: number }> {
    const startDate = new Date(period);
    const endDate = new Date(period);

    switch (periodType) {
      case "daily":
        endDate.setDate(endDate.getDate() + 1);
        break;
      case "weekly":
        endDate.setDate(endDate.getDate() + 7);
        break;
      case "monthly":
        endDate.setMonth(endDate.getMonth() + 1);
        break;
    }

    const orders = await prisma.order?.findMany({
      where: {
        storeId,
        createdAt: {
          gte: startDate,
          lt: endDate
        },
        status: { notIn: ["CANCELLED", "REFUNDED"] }
      },
      select: {
        total: true
      }
    });

    const revenue = orders.reduce((sum: number, order: any) => sum + Number(order.total), 0);
    const avgOrderValue = orders.length > 0 ? revenue / orders.length : 0;

    return { revenue, orders: orders.length, avgOrderValue };
  }

  private static calculateSalesPrediction(
    historicalData: { revenue: number; orders: number; avgOrderValue: number },
    periodType: PeriodType
  ): {
    revenue: number;
    confidence: number;
    upperBound: number;
    lowerBound: number;
    factors: ForecastFactors;
  } {
    const baseRevenue = historicalData.revenue || 1000;
    const trend = Math.random() * 0.2 - 0.1; // -10% to +10%
    const seasonality = this.calculateSeasonality(new Date());

    const predictedRevenue = baseRevenue * (1 + trend + seasonality);
    const confidence = 0.85;
    const margin = predictedRevenue * 0.15;

    return {
      revenue: predictedRevenue,
      confidence,
      upperBound: predictedRevenue + margin,
      lowerBound: predictedRevenue - margin,
      factors: {
        seasonality,
        trend,
        events: periodType === "monthly" ? ["seasonal_adjustment"] : []
      }
    };
  }

  private static calculateSeasonality(date: Date): number {
    const month = date.getMonth();
    // Higher sales in November-December (holiday season)
    if (month === 10 || month === 11) return 0.15;
    // Lower sales in January-February
    if (month === 0 || month === 1) return -0.1;
    return 0;
  }

  private static async calculateCashFlowPrediction(
    storeId: string,
    date: Date
  ): Promise<{
    inflow: number;
    outflow: number;
    netFlow: number;
    runwayDays: number | null;
    alerts: { lowBalance: boolean; shortfallRisk: number };
  }> {
    // Calculate expected inflows from orders
    const expectedInflow = await prisma.order?.aggregate({
      where: {
        storeId,
        createdAt: {
          gte: new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000),
          lt: date
        },
        status: { notIn: ["CANCELLED", "REFUNDED"] }
      },
      _avg: { total: true }
    });

    const inflow = Number(expectedInflow._avg?.total) || 5000;
    const outflow = inflow * 0.7; // Assume 70% cost ratio
    const netFlow = inflow - outflow;

    return {
      inflow,
      outflow,
      netFlow,
      runwayDays: netFlow > 0 ? 30 : 15,
      alerts: {
        lowBalance: netFlow < 1000,
        shortfallRisk: netFlow < 0 ? 0.3 : 0
      }
    };
  }

  private static async getHistoricalInventoryData(
    storeId: string,
    productId: string
  ): Promise<{ avgDailySales: number; currentStock: number; leadTime: number }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orderItems = await prisma.orderItem?.findMany({
      where: {
        productId,
        order: {
          storeId,
          createdAt: { gte: thirtyDaysAgo },
          status: { notIn: ["CANCELLED", "REFUNDED"] }
        }
      },
      select: {
        quantity: true
      }
    });

    const totalSold = orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const avgDailySales = totalSold / 30;

    // Get current stock from inventory
    const inventoryItem = await prisma.inventoryItem?.findFirst({
      where: {
        productId
      },
      select: {
        onHand: true
      }
    });

    return {
      avgDailySales,
      currentStock: inventoryItem?.onHand || 0,
      leadTime: 7 // Default 7 days lead time
    };
  }

  private static calculateInventoryPrediction(data: {
    avgDailySales: number;
    currentStock: number;
    leadTime: number;
  }): {
    demand: number;
    stockoutRisk: number;
    suggestedReorder: number;
    optimalReorderDate: Date;
    confidence: number;
  } {
    const daysToProject = 30;
    const predictedDemand = Math.ceil(data.avgDailySales * daysToProject);
    const safetyStock = Math.ceil(data.avgDailySales * data.leadTime * 0.5);
    const reorderPoint = Math.ceil(data.avgDailySales * data.leadTime) + safetyStock;

    const daysUntilStockout = data.avgDailySales > 0
      ? data.currentStock / data.avgDailySales
      : 999;

    const stockoutRisk = daysUntilStockout < data.leadTime + 7 ? 0.7 : 0.1;
    const suggestedReorder = Math.max(0, predictedDemand + safetyStock - data.currentStock);

    const optimalReorderDate = new Date();
    if (daysUntilStockout < 999) {
      optimalReorderDate.setDate(optimalReorderDate.getDate() + Math.max(0, daysUntilStockout - data.leadTime));
    }

    return {
      demand: predictedDemand,
      stockoutRisk,
      suggestedReorder,
      optimalReorderDate,
      confidence: 0.8
    };
  }
}
