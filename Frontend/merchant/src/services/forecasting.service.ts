import { api } from '@/lib/api-client';
import {
  SalesForecast,
  CashFlowForecast,
  InventoryForecast,
  PeriodType,
  ForecastFactors,
  ForecastingOverview
} from "@/types/intelligence";

export class ForecastingService {
  // Sales Forecasting Methods
  static async getSalesForecast(
    storeId: string,
    periodType: PeriodType,
    startDate: Date,
    endDate: Date
  ): Promise<SalesForecast[]> {
    const response = await api.get('/forecasting/sales', {
      storeId,
      periodType,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    return response.data || [];
  }

  static async generateSalesForecast(
    storeId: string,
    periodType: PeriodType,
    periods: number
  ): Promise<SalesForecast[]> {
    const response = await api.post('/forecasting/sales/generate', {
      storeId,
      periodType,
      periods,
    });
    return response.data || [];
  }

  static async getCashFlowForecast(
    storeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CashFlowForecast[]> {
    const response = await api.get('/forecasting/cashflow', {
      storeId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
    return response.data || [];
  }
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
    const response = await api.post('/forecasting/cashflow/generate', {
      storeId,
      days,
    });
    return response.data || [];
  }

  // Inventory Forecasting Methods
  static async getInventoryForecast(
    storeId: string,
    productId?: string
  ): Promise<InventoryForecast[]> {
    const response = await api.get('/forecasting/inventory', {
      storeId,
      productId,
    });
    return response.data || [];
  }

  static async generateInventoryForecast(
    storeId: string,
    productId: string
  ): Promise<InventoryForecast> {
    const response = await api.post('/forecasting/inventory/generate', {
      storeId,
      productId,
    });
    return response.data || {};
  }

  // Helper Methods
  static async getForecastingOverview(storeId: string): Promise<ForecastingOverview> {
    const response = await api.get(`/forecasting/${storeId}/overview`);
    return response.data || {};
  }
}
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
