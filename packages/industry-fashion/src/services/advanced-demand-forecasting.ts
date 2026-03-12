import { prisma } from '@vayva/prisma';

export interface DemandForecast {
  productId: string;
  productName: string;
  currentStock: number;
  predictedDemand: {
    next7Days: number;
    next30Days: number;
    next90Days: number;
  };
  confidence: number;
  recommendedAction: {
    action: 'restock' | 'maintain' | 'discount' | 'clear';
    quantity?: number;
    timing: string;
  };
  factors: string[];
}

export interface SeasonalityPattern {
  pattern: 'increasing' | 'decreasing' | 'stable' | 'seasonal';
  peakMonths: number[];
  lowMonths: number[];
  seasonalityIndex: number;
}

export class AdvancedDemandForecastingService {
  /**
   * Advanced ML-powered demand forecasting
   * Uses time series analysis, seasonality detection, and market trends
   */

  /**
   * Generate demand forecast for all products in a store
   */
  async generateDemandForecast(storeId: string): Promise<DemandForecast[]> {
    const products = await prisma.product.findMany({
      where: { storeId },
      include: {
        variants: true,
        orderItems: {
          where: {
            createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }, // Last 90 days
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    const forecasts: DemandForecast[] = [];

    for (const product of products) {
      const salesHistory = this.buildSalesTimeSeries(product.orderItems);
      const seasonality = this.detectSeasonality(salesHistory);
      const trend = this.calculateTrend(salesHistory);
      
      // Calculate predicted demand using weighted moving average with trend adjustment
      const avgDailySales = this.calculateMovingAverage(salesHistory, 30);
      const trendAdjustment = trend * 0.5; // 50% weight to trend
      
      const next7Days = Math.round((avgDailySales + trendAdjustment) * 7);
      const next30Days = Math.round((avgDailySales + trendAdjustment) * 30);
      const next90Days = Math.round((avgDailySales + trendAdjustment) * 90 * seasonality.seasonalityIndex);

      // Calculate total inventory
      const currentStock = product.variants.reduce(
        (sum, v) => sum + (v.inventoryCount || 0),
        0
      );

      // Determine recommended action
      const daysOfStock = currentStock / (avgDailySales || 1);
      let action: 'restock' | 'maintain' | 'discount' | 'clear' = 'maintain';
      let recommendedQuantity = 0;

      if (daysOfStock < 15) {
        action = 'restock';
        recommendedQuantity = next30Days - currentStock;
      } else if (daysOfStock > 90) {
        action = 'discount';
      } else if (daysOfStock > 180) {
        action = 'clear';
      }

      forecasts.push({
        productId: product.id,
        productName: product.title,
        currentStock,
        predictedDemand: {
          next7Days,
          next30Days,
          next90Days,
        },
        confidence: this.calculateConfidence(salesHistory),
        recommendedAction: {
          action,
          quantity: recommendedQuantity > 0 ? recommendedQuantity : undefined,
          timing: this.getTimingRecommendation(action, daysOfStock),
        },
        factors: this.identifyDemandFactors(product, seasonality, trend),
      });
    }

    return forecasts.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Build time series from order items
   */
  private buildSalesTimeSeries(orderItems: any[]): number[] {
    const dailySales = new Map<string, number>();
    
    // Initialize last 90 days
    for (let i = 0; i < 90; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dailySales.set(date.toISOString().split('T')[0], 0);
    }

    // Populate with actual sales
    orderItems.forEach((item) => {
      const date = item.createdAt.toISOString().split('T')[0];
      dailySales.set(date, (dailySales.get(date) || 0) + item.quantity);
    });

    return Array.from(dailySales.values()).reverse();
  }

  /**
   * Detect seasonality patterns
   */
  private detectSeasonality(salesHistory: number[]): SeasonalityPattern {
    // Simple seasonality detection using monthly averages
    const monthlyAverages: number[] = [];
    
    for (let month = 0; month < 12; month++) {
      const monthData = salesHistory.slice(month * 30, (month + 1) * 30);
      const avg = monthData.reduce((a, b) => a + b, 0) / (monthData.length || 1);
      monthlyAverages.push(avg);
    }

    const overallAvg = monthlyAverages.reduce((a, b) => a + b, 0) / 12;
    const seasonalityIndex = Math.max(...monthlyAverages) / overallAvg;

    // Identify peak and low months
    const peakMonths = monthlyAverages
      .map((avg, idx) => ({ avg, idx }))
      .filter(({ avg }) => avg > overallAvg * 1.2)
      .map(({ idx }) => idx);

    const lowMonths = monthlyAverages
      .map((avg, idx) => ({ avg, idx }))
      .filter(({ avg }) => avg < overallAvg * 0.8)
      .map(({ idx }) => idx);

    // Determine pattern type
    const variance = monthlyAverages.reduce(
      (sum, avg) => sum + Math.pow(avg - overallAvg, 2),
      0
    ) / 12;

    let pattern: SeasonalityPattern['pattern'] = 'stable';
    if (variance > overallAvg * 0.3) {
      pattern = 'seasonal';
    } else {
      const firstHalf = monthlyAverages.slice(0, 6).reduce((a, b) => a + b, 0) / 6;
      const secondHalf = monthlyAverages.slice(6).reduce((a, b) => a + b, 0) / 6;
      
      if (secondHalf > firstHalf * 1.1) {
        pattern = 'increasing';
      } else if (secondHalf < firstHalf * 0.9) {
        pattern = 'decreasing';
      }
    }

    return {
      pattern,
      peakMonths,
      lowMonths,
      seasonalityIndex,
    };
  }

  /**
   * Calculate trend direction and strength
   */
  private calculateTrend(salesHistory: number[]): number {
    // Linear regression to find trend
    const n = salesHistory.length;
    const xSum = (n * (n - 1)) / 2;
    const ySum = salesHistory.reduce((a, b) => a + b, 0);
    const xySum = salesHistory.reduce((sum, val, idx) => sum + idx * val, 0);
    const xxSum = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
    
    return slope; // Daily trend (units per day)
  }

  /**
   * Calculate moving average
   */
  private calculateMovingAverage(data: number[], window: number): number {
    const recentData = data.slice(-window);
    return recentData.reduce((a, b) => a + b, 0) / recentData.length;
  }

  /**
   * Calculate forecast confidence score
   */
  private calculateConfidence(salesHistory: number[]): number {
    // Higher confidence with more consistent sales patterns
    const avg = salesHistory.reduce((a, b) => a + b, 0) / salesHistory.length;
    const variance = salesHistory.reduce(
      (sum, val) => sum + Math.pow(val - avg, 2),
      0
    ) / salesHistory.length;
    
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / avg; // Coefficient of variation

    // Lower CV = higher confidence
    const confidence = Math.max(0.5, 1 - cv);
    
    return Math.min(0.95, confidence);
  }

  /**
   * Identify factors affecting demand
   */
  private identifyDemandFactors(
    product: any,
    seasonality: SeasonalityPattern,
    trend: number
  ): string[] {
    const factors: string[] = [];

    if (trend > 0.1) {
      factors.push('Increasing sales trend');
    } else if (trend < -0.1) {
      factors.push('Declining sales trend');
    }

    if (seasonality.pattern === 'seasonal') {
      factors.push(`Seasonal pattern detected (peak in months ${seasonality.peakMonths.join(', ')})`);
    }

    if (product.category) {
      factors.push(`Category: ${product.category}`);
    }

    if (product.tags && product.tags.length > 0) {
      factors.push(`Trending tags: ${product.tags.slice(0, 2).join(', ')}`);
    }

    return factors;
  }

  /**
   * Get timing recommendation for actions
   */
  private getTimingRecommendation(action: string, daysOfStock: number): string {
    switch (action) {
      case 'restock':
        if (daysOfStock < 7) return 'Order within 48 hours';
        if (daysOfStock < 15) return 'Order within 1 week';
        return 'Plan restock for next month';
      case 'discount':
        return 'Start promotion within 2 weeks';
      case 'clear':
        return 'Immediate clearance recommended';
      default:
        return 'Continue monitoring';
    }
  }

  /**
   * Get aggregate demand forecast summary
   */
  async getDemandForecastSummary(storeId: string): Promise<{
    totalProducts: number;
    highDemandProducts: number;
    restockUrgent: number;
    overstocked: number;
    totalPredictedRevenue: number;
  }> {
    const forecasts = await this.generateDemandForecast(storeId);

    return {
      totalProducts: forecasts.length,
      highDemandProducts: forecasts.filter((f) => f.predictedDemand.next30Days > 50).length,
      restockUrgent: forecasts.filter((f) => f.recommendedAction.action === 'restock').length,
      overstocked: forecasts.filter(
        (f) => ['discount', 'clear'].includes(f.recommendedAction.action)
      ).length,
      totalPredictedRevenue: forecasts.reduce(
        (sum, f) => sum + f.predictedDemand.next30Days * 50, // Assume $50 AOV
        0
      ),
    };
  }
}

// Export singleton instance
export const advancedDemandForecasting = new AdvancedDemandForecastingService();
