// @ts-nocheck
import { prisma } from '@vayva/prisma';

// ============================================================================
// Demand Forecasting Types
// ============================================================================

export type ForecastHorizon = 30 | 60 | 90;

export interface ForecastParams {
  storeId: string;
  productId?: string;
  categoryId?: string;
  sku?: string;
  horizonDays: ForecastHorizon;
  includeSeasonality?: boolean;
  includeEvents?: boolean;
}

export interface DemandForecast {
  productId: string;
  sku?: string;
  productName: string;
  horizonDays: ForecastHorizon;
  forecastedDemand: DailyDemandPoint[];
  totalForecastedUnits: number;
  confidence: number;
  seasonalityFactor: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  recommendedReorderDate?: string;
  recommendedOrderQuantity?: number;
  alerts: ForecastAlert[];
  sizeCurveOptimization?: SizeCurveOptimization;
}

export interface DailyDemandPoint {
  date: string; // ISO date string
  forecastedUnits: number;
  lowerBound: number;
  upperBound: number;
}

export interface ForecastAlert {
  type: 'stockout-risk' | 'overstock-risk' | 'seasonal-spike' | 'slow-mover';
  severity: 'low' | 'medium' | 'high';
  message: string;
  affectedSku?: string;
  affectedSize?: string;
}

export interface SizeCurveOptimization {
  currentDistribution: SizeDistribution[];
  recommendedDistribution: SizeDistribution[];
  potentialRevenueLift: number;
  stockoutRisk: SizeStockoutRisk[];
}

export interface SizeDistribution {
  size: string;
  currentPercent: number;
  recommendedPercent: number;
}

export interface SizeStockoutRisk {
  size: string;
  currentStock: number;
  forecastedDemand: number;
  daysUntilStockout: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface SeasonalityPattern {
  month: number; // 1-12
  weekOfYear?: number; // 1-52
  factor: number; // multiplier, e.g. 1.5 = 50% above baseline
  events?: string[]; // e.g. "Black Friday", "Valentine's Day"
}

export interface AutoReplenishmentRule {
  id: string;
  storeId: string;
  productId: string;
  enabled: boolean;
  triggerType: 'stock-level' | 'forecast-based' | 'days-of-stock';
  triggerValue: number; // units, %, or days
  reorderQuantityType: 'fixed' | 'forecast-based' | 'economic-order-qty';
  reorderQuantity?: number;
  leadTimeDays: number;
  supplierId?: string;
  lastTriggeredAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Historical Sales Analysis
// ============================================================================

interface SalesDataPoint {
  date: Date;
  quantity: number;
}

interface ProductSalesData {
  id: string;
  title: string;
  productVariants: Array<{
    sku: string | null;
    inventory: number;
    size?: string | null;
  }>;
  orderItems: Array<{
    quantity: number;
    createdAt: Date;
  }>;
}

// ============================================================================
// Demand Forecast Service
// ============================================================================

export class DemandForecastService {
  private readonly FASHION_SEASONALITY: SeasonalityPattern[] = [
    { month: 1, factor: 0.7, events: ['New Year Sales'] },
    { month: 2, factor: 0.85, events: ["Valentine's Day"] },
    { month: 3, factor: 1.0 },
    { month: 4, factor: 1.1, events: ['Spring Collection Drop'] },
    { month: 5, factor: 1.15, events: ['Mother\'s Day'] },
    { month: 6, factor: 1.05, events: ['Summer Drop', 'Father\'s Day'] },
    { month: 7, factor: 0.9, events: ['Summer Sale'] },
    { month: 8, factor: 0.95, events: ['Back to School'] },
    { month: 9, factor: 1.05, events: ['Fall Collection Drop'] },
    { month: 10, factor: 1.1, events: ['Fall Sales'] },
    { month: 11, factor: 1.5, events: ['Black Friday', 'Cyber Monday'] },
    { month: 12, factor: 1.8, events: ['Holiday Season', 'Christmas'] },
  ];

  /**
   * Generate demand forecast for a product or category
   */
  async forecast(params: ForecastParams): Promise<DemandForecast[]> {
    if (params.productId) {
      return [await this.forecastProduct(params.storeId, params.productId, params.horizonDays, params)];
    }

    if (params.categoryId) {
      return this.forecastCategory(params.storeId, params.categoryId, params.horizonDays, params);
    }

    throw new Error('Must provide either productId or categoryId');
  }

  /**
   * Forecast demand for a single product
   */
  async forecastProduct(
    storeId: string,
    productId: string,
    horizonDays: ForecastHorizon,
    options: Partial<ForecastParams> = {}
  ): Promise<DemandForecast> {
    // Fetch product with sales history
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        productVariants: {
          select: { sku: true, inventory: true, size: true },
        },
        orderItems: {
          where: {
            order: { storeId },
            createdAt: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // last 90 days
            },
          },
          select: { quantity: true, createdAt: true },
        },
      },
    }) as ProductSalesData | null;

    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    // Calculate historical daily demand
    const salesHistory = this.aggregateDailySales(product.orderItems.map(item => ({
      date: item.createdAt,
      quantity: item.quantity,
    })));
    const avgDailyDemand = this.calculateAvgDailyDemand(salesHistory);
    const trend = this.detectTrend(salesHistory);

    // Apply seasonality if requested
    const seasonalityFactor = options.includeSeasonality !== false
      ? this.calculateSeasonalityFactor(new Date())
      : 1.0;

    // Generate daily forecast points
    const forecastedDemand = this.generateDailyForecast(
      avgDailyDemand,
      horizonDays,
      trend,
      options.includeSeasonality !== false
    );

    const totalForecastedUnits = forecastedDemand.reduce(
      (sum, d) => sum + d.forecastedUnits,
      0
    );

    // Calculate size curve optimization
    const sizeCurveOptimization = this.optimizeSizeCurve(
      product.productVariants as Array<{ sku: string | null; inventory: number; size?: string | null }>,
      forecastedDemand
    );

    // Generate alerts
    const alerts = this.generateAlerts(
      product.productVariants as Array<{ sku: string | null; inventory: number; size?: string | null }>,
      totalForecastedUnits,
      sizeCurveOptimization
    );

    // Calculate reorder recommendations
    const totalInventory = product.productVariants.reduce(
      (sum: number, v) => sum + (v.inventory || 0),
      0
    );
    const daysOfStock = avgDailyDemand > 0 ? totalInventory / avgDailyDemand : 999;
    const recommendedReorderDate = daysOfStock < horizonDays
      ? new Date(Date.now() + daysOfStock * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    return {
      productId,
      sku: product.productVariants[0]?.sku ?? undefined,
      productName: product.title,
      horizonDays,
      forecastedDemand,
      totalForecastedUnits: Math.round(totalForecastedUnits),
      confidence: this.calculateConfidence(Array.from(salesHistory.values()).length, trend),
      seasonalityFactor,
      trend,
      recommendedReorderDate,
      recommendedOrderQuantity: recommendedReorderDate
        ? Math.ceil(totalForecastedUnits * 1.1) // 10% buffer
        : undefined,
      alerts,
      sizeCurveOptimization,
    };
  }

  /**
   * Forecast demand for an entire category
   */
  private async forecastCategory(
    storeId: string,
    categoryId: string,
    horizonDays: ForecastHorizon,
    options: Partial<ForecastParams>
  ): Promise<DemandForecast[]> {
    const products = await prisma.product.findMany({
      where: { storeId, categoryId, status: 'active' },
      select: { id: true },
      take: 50,
    });

    const forecasts = await Promise.all(
      products.map((p: { id: string }) =>
        this.forecastProduct(storeId, p.id, horizonDays, options).catch(() => null)
      )
    );

    return forecasts.filter((f: DemandForecast | null): f is DemandForecast => f !== null);
  }

  /**
   * Get auto-replenishment rules for a store
   */
  async getAutoReplenishmentRules(storeId: string): Promise<AutoReplenishmentRule[]> {
    const rules = await prisma.autoReplenishmentRule.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });

    return rules.map((r: {
      id: string;
      storeId: string;
      productId: string;
      enabled: boolean;
      triggerType: string;
      triggerValue: number;
      reorderQuantityType: string;
      reorderQuantity: number | null;
      leadTimeDays: number;
      supplierId: string | null;
      lastTriggeredAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
    }) => ({
      id: r.id,
      storeId: r.storeId,
      productId: r.productId,
      enabled: r.enabled,
      triggerType: r.triggerType as AutoReplenishmentRule['triggerType'],
      triggerValue: r.triggerValue,
      reorderQuantityType: r.reorderQuantityType as AutoReplenishmentRule['reorderQuantityType'],
      reorderQuantity: r.reorderQuantity ?? undefined,
      leadTimeDays: r.leadTimeDays,
      supplierId: r.supplierId ?? undefined,
      lastTriggeredAt: r.lastTriggeredAt?.toISOString(),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  /**
   * Create or update auto-replenishment rule
   */
  async upsertAutoReplenishmentRule(
    storeId: string,
    data: Omit<AutoReplenishmentRule, 'id' | 'storeId' | 'createdAt' | 'updatedAt' | 'lastTriggeredAt'>
  ): Promise<AutoReplenishmentRule> {
    const rule = await prisma.autoReplenishmentRule.upsert({
      where: {
        storeId_productId: { storeId, productId: data.productId },
      },
      create: {
        storeId,
        productId: data.productId,
        enabled: data.enabled,
        triggerType: data.triggerType,
        triggerValue: data.triggerValue,
        reorderQuantityType: data.reorderQuantityType,
        reorderQuantity: data.reorderQuantity,
        leadTimeDays: data.leadTimeDays,
        supplierId: data.supplierId,
      },
      update: {
        enabled: data.enabled,
        triggerType: data.triggerType,
        triggerValue: data.triggerValue,
        reorderQuantityType: data.reorderQuantityType,
        reorderQuantity: data.reorderQuantity,
        leadTimeDays: data.leadTimeDays,
        supplierId: data.supplierId,
      },
    });

    return {
      id: rule.id,
      storeId: rule.storeId,
      productId: rule.productId,
      enabled: rule.enabled,
      triggerType: rule.triggerType as AutoReplenishmentRule['triggerType'],
      triggerValue: Number(rule.triggerValue),
      reorderQuantityType: rule.reorderQuantityType as AutoReplenishmentRule['reorderQuantityType'],
      reorderQuantity: rule.reorderQuantity ? Number(rule.reorderQuantity) : undefined,
      leadTimeDays: rule.leadTimeDays,
      supplierId: rule.supplierId ?? undefined,
      lastTriggeredAt: rule.lastTriggeredAt?.toISOString(),
      createdAt: rule.createdAt.toISOString(),
      updatedAt: rule.updatedAt.toISOString(),
    };
  }

  /**
   * Check and trigger auto-replenishment for a store
   */
  async checkAndTriggerReplenishment(storeId: string): Promise<{
    triggered: string[];
    skipped: string[];
  }> {
    const rules = await prisma.autoReplenishmentRule.findMany({
      where: { storeId, enabled: true },
      include: {
        product: {
          include: { productVariants: { select: { inventory: true } } },
        },
      },
    });

    const triggered: string[] = [];
    const skipped: string[] = [];

    for (const rule of rules as Array<{
      id: string;
      productId: string;
      triggerType: string;
      triggerValue: number;
      reorderQuantityType: string;
      reorderQuantity: number | null;
      leadTimeDays: number;
      product: {
        title: string;
        productVariants: Array<{ inventory: number }>;
      };
    }>) {
      const totalInventory = rule.product.productVariants.reduce(
        (sum, v) => sum + (v.inventory || 0),
        0
      );

      let shouldTrigger = false;

      if (rule.triggerType === 'stock-level' && totalInventory <= rule.triggerValue) {
        shouldTrigger = true;
      } else if (rule.triggerType === 'days-of-stock') {
        // Would need sales velocity data here
        shouldTrigger = false; // Placeholder
      }

      if (shouldTrigger) {
        // Mark as triggered
        await prisma.autoReplenishmentRule.update({
          where: { id: rule.id },
          data: { lastTriggeredAt: new Date() },
        });

        triggered.push(rule.productId);
      } else {
        skipped.push(rule.productId);
      }
    }

    return { triggered, skipped };
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private aggregateDailySales(
    orderItems: SalesDataPoint[]
  ): Map<string, number> {
    const dailySales = new Map<string, number>();

    for (const item of orderItems) {
      const dateKey = new Date(item.date).toISOString().split('T')[0];
      const existing = dailySales.get(dateKey) || 0;
      dailySales.set(dateKey, existing + item.quantity);
    }

    return dailySales;
  }

  private calculateAvgDailyDemand(salesHistory: Map<string, number>): number {
    if (salesHistory.size === 0) return 0;
    const total = Array.from(salesHistory.values()).reduce((a, b) => a + b, 0);
    return total / Math.max(salesHistory.size, 1);
  }

  private detectTrend(salesHistory: Map<string, number>): DemandForecast['trend'] {
    const values = Array.from(salesHistory.values());
    if (values.length < 7) return 'stable';

    const half = Math.floor(values.length / 2);
    const firstHalfAvg = values.slice(0, half).reduce((a, b) => a + b, 0) / half;
    const secondHalfAvg = values.slice(half).reduce((a, b) => a + b, 0) / (values.length - half);

    const changePct = firstHalfAvg > 0
      ? (secondHalfAvg - firstHalfAvg) / firstHalfAvg
      : 0;

    if (changePct > 0.1) return 'increasing';
    if (changePct < -0.1) return 'decreasing';
    return 'stable';
  }

  private calculateSeasonalityFactor(date: Date): number {
    const month = date.getMonth() + 1;
    const pattern = this.FASHION_SEASONALITY.find(p => p.month === month);
    return pattern?.factor ?? 1.0;
  }

  private generateDailyForecast(
    avgDailyDemand: number,
    horizonDays: ForecastHorizon,
    trend: DemandForecast['trend'],
    applySeasonality: boolean
  ): DailyDemandPoint[] {
    const points: DailyDemandPoint[] = [];
    const trendMultiplier = trend === 'increasing' ? 1.005 : trend === 'decreasing' ? 0.995 : 1.0;

    for (let day = 0; day < horizonDays; day++) {
      const date = new Date(Date.now() + day * 24 * 60 * 60 * 1000);
      const dayTrendFactor = Math.pow(trendMultiplier, day);

      const seasonalityFactor = applySeasonality
        ? this.calculateSeasonalityFactor(date)
        : 1.0;

      const forecastedUnits = avgDailyDemand * dayTrendFactor * seasonalityFactor;
      const uncertainty = Math.max(0.2, 0.1 + day / horizonDays * 0.3); // grows with horizon

      points.push({
        date: date.toISOString().split('T')[0],
        forecastedUnits: Math.round(forecastedUnits * 10) / 10,
        lowerBound: Math.round(forecastedUnits * (1 - uncertainty) * 10) / 10,
        upperBound: Math.round(forecastedUnits * (1 + uncertainty) * 10) / 10,
      });
    }

    return points;
  }

  private optimizeSizeCurve(
    variants: Array<{ sku: string | null; inventory: number; size?: string | null }>,
    forecastedDemand: DailyDemandPoint[]
  ): SizeCurveOptimization | undefined {
    const sizeVariants = variants.filter(v => v.size);
    if (sizeVariants.length === 0) return undefined;

    const totalInventory = sizeVariants.reduce((sum, v) => sum + (v.inventory || 0), 0);
    const totalForecasted = forecastedDemand.reduce((sum, d) => sum + d.forecastedUnits, 0);

    // Standard fashion size distribution benchmarks
    const STANDARD_SIZE_DISTRIBUTION: Record<string, number> = {
      XS: 0.05, S: 0.2, M: 0.3, L: 0.25, XL: 0.15, XXL: 0.05,
      '0': 0.05, '2': 0.1, '4': 0.15, '6': 0.2, '8': 0.2, '10': 0.15, '12': 0.1, '14': 0.05,
    };

    const currentDistribution: SizeDistribution[] = sizeVariants.map(v => ({
      size: v.size!,
      currentPercent: totalInventory > 0 ? (v.inventory / totalInventory) * 100 : 0,
      recommendedPercent: (STANDARD_SIZE_DISTRIBUTION[v.size!] ?? 0.1) * 100,
    }));

    const stockoutRisk: SizeStockoutRisk[] = sizeVariants.map(v => {
      const sizeShare = STANDARD_SIZE_DISTRIBUTION[v.size!] ?? 0.1;
      const forecastedForSize = totalForecasted * sizeShare;
      const daysUntilStockout = forecastedForSize > 0
        ? (v.inventory / (forecastedForSize / forecastedDemand.length))
        : 999;

      const riskLevel = daysUntilStockout < 7
        ? 'critical'
        : daysUntilStockout < 14
        ? 'high'
        : daysUntilStockout < 30
        ? 'medium'
        : 'low';

      return {
        size: v.size!,
        currentStock: v.inventory,
        forecastedDemand: Math.round(forecastedForSize),
        daysUntilStockout: Math.round(daysUntilStockout),
        riskLevel,
      };
    });

    // Estimate revenue lift from optimized distribution
    const misalignedSizes = currentDistribution.filter(
      d => Math.abs(d.currentPercent - d.recommendedPercent) > 10
    );
    const potentialRevenueLift = misalignedSizes.length * 2.5; // 2.5% per misaligned size

    return {
      currentDistribution,
      recommendedDistribution: currentDistribution.map(d => ({
        ...d,
        currentPercent: d.recommendedPercent,
      })),
      potentialRevenueLift,
      stockoutRisk,
    };
  }

  private generateAlerts(
    variants: Array<{ sku: string | null; inventory: number; size?: string | null }>,
    totalForecastedUnits: number,
    sizeCurve?: SizeCurveOptimization
  ): ForecastAlert[] {
    const alerts: ForecastAlert[] = [];
    const totalInventory = variants.reduce((sum, v) => sum + (v.inventory || 0), 0);

    // Stockout risk
    if (totalInventory < totalForecastedUnits * 0.7) {
      alerts.push({
        type: 'stockout-risk',
        severity: totalInventory < totalForecastedUnits * 0.3 ? 'high' : 'medium',
        message: `Inventory (${totalInventory} units) may not meet forecasted demand (${Math.round(totalForecastedUnits)} units)`,
      });
    }

    // Overstock risk
    if (totalInventory > totalForecastedUnits * 2.5) {
      alerts.push({
        type: 'overstock-risk',
        severity: 'medium',
        message: `High overstock risk: ${totalInventory} units on hand vs ${Math.round(totalForecastedUnits)} forecasted`,
      });
    }

    // Slow mover
    if (totalForecastedUnits < 5) {
      alerts.push({
        type: 'slow-mover',
        severity: 'low',
        message: 'Low forecasted demand - consider markdowns or promotions',
      });
    }

    // Size-level stockout risks
    if (sizeCurve) {
      for (const risk of sizeCurve.stockoutRisk) {
        if (risk.riskLevel === 'critical' || risk.riskLevel === 'high') {
          alerts.push({
            type: 'stockout-risk',
            severity: risk.riskLevel === 'critical' ? 'high' : 'medium',
            message: `Size ${risk.size} will stockout in ~${risk.daysUntilStockout} days`,
            affectedSize: risk.size,
          });
        }
      }
    }

    return alerts;
  }

  private calculateConfidence(
    historyDays: number,
    trend: DemandForecast['trend']
  ): number {
    let confidence = 0.5;

    // More history = higher confidence
    if (historyDays >= 60) confidence += 0.2;
    else if (historyDays >= 30) confidence += 0.1;
    else if (historyDays >= 14) confidence += 0.05;

    // Stable trends are more predictable
    if (trend === 'stable') confidence += 0.1;
    else if (trend === 'increasing') confidence += 0.05;

    return Math.min(confidence, 0.95);
  }
}

export const demandForecast = new DemandForecastService();
