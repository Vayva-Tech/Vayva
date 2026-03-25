/**
 * Menu Engineering Analysis
 * Classifies menu items into Stars, Puzzles, Plowhorses, and Dogs
 */

import {
  type RecipeCost,
  type MenuEngineeringMatrix,
  type MenuEngineeringRecommendation,
  type MenuItemClassification,
} from '../../types/recipe.js';

export interface MenuEngineeringConfig {
  popularityThreshold: number; // Percentile (0-100)
  profitabilityThreshold: number; // Percentile (0-100)
  analysisPeriodDays: number;
}

export interface MenuItemPerformance {
  menuItemId: string;
  name: string;
  totalRevenue: number;
  totalOrders: number;
  avgPrice: number;
  foodCostPercentage: number;
  marginPercentage: number;
}

export class MenuEngineeringService {
  private config: MenuEngineeringConfig;

  constructor(config: MenuEngineeringConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    // Hook for engine orchestration; analysis stays on-demand.
  }

  /**
   * Analyze menu items and classify them
   */
  analyzeMenu(
    recipeCosts: RecipeCost[],
    salesData: Map<string, { orders: number; revenue: number }>
  ): MenuEngineeringMatrix {
    // Calculate performance metrics
    const performanceData = recipeCosts.map(cost => {
      const sales = salesData.get(cost.menuItemId) || { orders: 0, revenue: 0 };
      return {
        ...cost,
        totalOrders: sales.orders,
        totalRevenue: sales.revenue,
      };
    });

    // Calculate thresholds
    const popularityThreshold = this.calculatePercentile(
      performanceData.map(p => p.totalOrders),
      this.config.popularityThreshold
    );
    const profitabilityThreshold = this.calculatePercentile(
      performanceData.map(p => p.marginPercentage),
      this.config.profitabilityThreshold
    );

    // Classify items
    const matrix: MenuEngineeringMatrix = {
      stars: [],
      puzzles: [],
      plowhorses: [],
      dogs: [],
    };

    for (const item of performanceData) {
      const isPopular = item.totalOrders >= popularityThreshold;
      const isProfitable = item.marginPercentage >= profitabilityThreshold;

      // Calculate scores (0-100)
      item.popularityScore = this.normalizeScore(item.totalOrders, performanceData.map(p => p.totalOrders));
      item.profitabilityScore = this.normalizeScore(item.marginPercentage, performanceData.map(p => p.marginPercentage));

      if (isPopular && isProfitable) {
        item.classification = 'star';
        matrix.stars.push(item);
      } else if (!isPopular && isProfitable) {
        item.classification = 'puzzle';
        matrix.puzzles.push(item);
      } else if (isPopular && !isProfitable) {
        item.classification = 'plowhorse';
        matrix.plowhorses.push(item);
      } else {
        item.classification = 'dog';
        matrix.dogs.push(item);
      }
    }

    return matrix;
  }

  /**
   * Generate recommendations for menu optimization
   */
  generateRecommendations(matrix: MenuEngineeringMatrix): MenuEngineeringRecommendation[] {
    const recommendations: MenuEngineeringRecommendation[] = [];

    // Stars: Promote and protect
    for (const star of matrix.stars) {
      recommendations.push({
        menuItemId: star.menuItemId,
        currentClassification: 'star',
        recommendedAction: 'promote',
        reason: 'High profit and high popularity - feature prominently on menu',
        potentialImpact: (star.totalRevenue || 0) * 0.1, // Potential 10% increase
      });
    }

    // Puzzles: Increase visibility
    for (const puzzle of matrix.puzzles) {
      recommendations.push({
        menuItemId: puzzle.menuItemId,
        currentClassification: 'puzzle',
        recommendedAction: 'promote',
        reason: 'High profit but low popularity - increase visibility through promotion or repositioning',
        potentialImpact: (puzzle.totalRevenue || 0) * 0.3, // Potential 30% increase with better placement
      });
    }

    // Plowhorses: Reprice or reformulate
    for (const plowhorse of matrix.plowhorses) {
      if (plowhorse.foodCostPercentage > 35) {
        recommendations.push({
          menuItemId: plowhorse.menuItemId,
          currentClassification: 'plowhorse',
          recommendedAction: 'reprice',
          reason: `Popular but high food cost (${plowhorse.foodCostPercentage.toFixed(1)}%). Consider modest price increase.`,
          potentialImpact: (plowhorse.totalRevenue || 0) * 0.05,
        });
      } else {
        recommendations.push({
          menuItemId: plowhorse.menuItemId,
          currentClassification: 'plowhorse',
          recommendedAction: 'reformulate',
          reason: 'Popular but thin margins. Consider ingredient substitutions to reduce cost.',
          potentialImpact: (plowhorse.totalRevenue || 0) * 0.08,
        });
      }
    }

    // Dogs: Consider removal
    for (const dog of matrix.dogs) {
      recommendations.push({
        menuItemId: dog.menuItemId,
        currentClassification: 'dog',
        recommendedAction: 'remove',
        reason: 'Low profit and low popularity - consider removing from menu to reduce complexity',
        potentialImpact: -(dog.totalCost * (salesData.get(dog.menuItemId)?.orders || 0)), // Cost savings
      });
    }

    return recommendations.sort((a, b) => b.potentialImpact - a.potentialImpact);
  }

  /**
   * Get summary statistics for the menu
   */
  getMenuSummary(matrix: MenuEngineeringMatrix): {
    totalItems: number;
    avgFoodCostPercentage: number;
    avgMarginPercentage: number;
    starsCount: number;
    puzzlesCount: number;
    plowhorsesCount: number;
    dogsCount: number;
    totalRevenue: number;
    totalProfit: number;
  } {
    const allItems = [
      ...matrix.stars,
      ...matrix.puzzles,
      ...matrix.plowhorses,
      ...matrix.dogs,
    ];

    const totalRevenue = allItems.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
    const totalCost = allItems.reduce((sum, item) => sum + item.totalCost, 0);

    return {
      totalItems: allItems.length,
      avgFoodCostPercentage: allItems.length > 0
        ? allItems.reduce((sum, item) => sum + item.foodCostPercentage, 0) / allItems.length
        : 0,
      avgMarginPercentage: allItems.length > 0
        ? allItems.reduce((sum, item) => sum + item.marginPercentage, 0) / allItems.length
        : 0,
      starsCount: matrix.stars.length,
      puzzlesCount: matrix.puzzles.length,
      plowhorsesCount: matrix.plowhorses.length,
      dogsCount: matrix.dogs.length,
      totalRevenue,
      totalProfit: totalRevenue - totalCost,
    };
  }

  /**
   * Compare current matrix to previous period
   */
  comparePeriods(
    current: MenuEngineeringMatrix,
    previous: MenuEngineeringMatrix
  ): {
    itemsChanged: Array<{
      menuItemId: string;
      name: string;
      from: MenuItemClassification;
      to: MenuItemClassification;
    }>;
    trends: {
      stars: 'up' | 'down' | 'stable';
      puzzles: 'up' | 'down' | 'stable';
      plowhorses: 'up' | 'down' | 'stable';
      dogs: 'up' | 'down' | 'stable';
    };
  } {
    const itemsChanged: Array<{
      menuItemId: string;
      name: string;
      from: MenuItemClassification;
      to: MenuItemClassification;
    }> = [];

    // Check for classification changes
    const allCurrent = [
      ...current.stars.map(i => ({ ...i, classification: 'star' as const })),
      ...current.puzzles.map(i => ({ ...i, classification: 'puzzle' as const })),
      ...current.plowhorses.map(i => ({ ...i, classification: 'plowhorse' as const })),
      ...current.dogs.map(i => ({ ...i, classification: 'dog' as const })),
    ];

    const allPrevious = [
      ...previous.stars.map(i => ({ ...i, classification: 'star' as const })),
      ...previous.puzzles.map(i => ({ ...i, classification: 'puzzle' as const })),
      ...previous.plowhorses.map(i => ({ ...i, classification: 'plowhorse' as const })),
      ...previous.dogs.map(i => ({ ...i, classification: 'dog' as const })),
    ];

    for (const currentItem of allCurrent) {
      const previousItem = allPrevious.find(p => p.menuItemId === currentItem.menuItemId);
      if (previousItem && previousItem.classification !== currentItem.classification) {
        itemsChanged.push({
          menuItemId: currentItem.menuItemId,
          name: currentItem.name,
          from: previousItem.classification,
          to: currentItem.classification,
        });
      }
    }

    // Calculate trends
    const trends = {
      stars: this.getTrend(current.stars.length, previous.stars.length),
      puzzles: this.getTrend(current.puzzles.length, previous.puzzles.length),
      plowhorses: this.getTrend(current.plowhorses.length, previous.plowhorses.length),
      dogs: this.getTrend(current.dogs.length, previous.dogs.length),
    };

    return { itemsChanged, trends };
  }

  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  private normalizeScore(value: number, allValues: number[]): number {
    if (allValues.length === 0) return 0;
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    if (max === min) return 50;
    return ((value - min) / (max - min)) * 100;
  }

  private getTrend(current: number, previous: number): 'up' | 'down' | 'stable' {
    if (previous === 0) return current > 0 ? 'up' : 'stable';
    const change = (current - previous) / previous;
    if (change > 0.1) return 'up';
    if (change < -0.1) return 'down';
    return 'stable';
  }
}

// Helper for recommendations
let salesData: Map<string, { orders: number; revenue: number }> = new Map();

export function setSalesData(data: Map<string, { orders: number; revenue: number }>): void {
  salesData = data;
}
