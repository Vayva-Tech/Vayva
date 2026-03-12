import { prisma } from '@vayva/prisma';
import { SizeCurveData } from '../services/size-curve-service';

// ============================================================================
// Size Curve Optimization Types
// ============================================================================

export interface SizeCurveOptimizationInput {
  storeId: string;
  productIds?: string[];
  categoryId?: string;
  includeReturnData?: boolean;
}

export interface SizeCurveOptimizationResult {
  productId: string;
  productName: string;
  category?: string;
  currentCurve: SizeCurveData[];
  optimizedCurve: OptimizedSizeCurve[];
  buyingRecommendations: BuyingRecommendation[];
  potentialImpact: SizeCurveImpact;
  benchmarkComparison?: BenchmarkComparison;
}

export interface OptimizedSizeCurve {
  size: string;
  currentStock: number;
  currentPercent: number;
  recommendedPercent: number;
  recommendedStock: number;
  deltaUnits: number;
  action: 'increase' | 'decrease' | 'maintain';
  priority: 'urgent' | 'recommended' | 'optional';
}

export interface BuyingRecommendation {
  size: string;
  currentStock: number;
  recommendedBuyUnits: number;
  estimatedSellThrough: number;
  expectedRevenue: number;
  returnRisk: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface SizeCurveImpact {
  estimatedRevenueLift: number; // percentage
  estimatedReturnReduction: number; // percentage
  estimatedStockoutReduction: number; // percentage
  overallScore: number; // 0-100, current curve health
}

export interface BenchmarkComparison {
  industryAvgCurve: Record<string, number>; // size -> % of total
  yourCurve: Record<string, number>;
  deviations: Array<{
    size: string;
    yourPct: number;
    benchmarkPct: number;
    deviation: number;
    recommendation: string;
  }>;
}

export interface SizeCurveReport {
  storeId: string;
  generatedAt: string;
  period: { start: string; end: string };
  summary: {
    totalProducts: number;
    productsWithIssues: number;
    totalRevenueLiftOpportunity: number;
    topIssues: string[];
  };
  products: SizeCurveOptimizationResult[];
}

// ============================================================================
// Industry Benchmark Data
// ============================================================================

const INDUSTRY_BENCHMARKS: Record<string, Record<string, number>> = {
  tops: { XS: 5, S: 20, M: 30, L: 25, XL: 15, XXL: 5 },
  bottoms: { XS: 5, S: 18, M: 28, L: 26, XL: 16, XXL: 7 },
  dresses: { XS: 6, S: 22, M: 30, L: 24, XL: 13, XXL: 5 },
  outerwear: { XS: 4, S: 18, M: 32, L: 26, XL: 14, XXL: 6 },
  numeric: { '0': 4, '2': 8, '4': 14, '6': 20, '8': 20, '10': 16, '12': 10, '14': 8 },
};

// ============================================================================
// Size Curve Optimizer Service
// ============================================================================

export class SizeCurveOptimizer {
  /**
   * Generate size curve optimization for a store
   */
  async optimizeStore(
    input: SizeCurveOptimizationInput
  ): Promise<SizeCurveReport> {
    const where: {
      storeId: string;
      id?: { in: string[] };
      categoryId?: string;
    } = { storeId: input.storeId };

    if (input.productIds?.length) {
      where.id = { in: input.productIds };
    }
    if (input.categoryId) {
      where.categoryId = input.categoryId;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        sizeCurves: true,
        productVariants: {
          select: {
            size: true,
            inventoryQuantity: true,
            price: true,
          },
        },
        category: { select: { name: true } },
      },
      take: 100,
    });

    const results: SizeCurveOptimizationResult[] = [];
    let totalRevenueLiftOpportunity = 0;
    const topIssues: Map<string, number> = new Map();

    for (const product of products as Array<{
      id: string;
      title: string;
      category?: { name: string } | null;
      sizeCurves: Array<{ size: string; salesCount: number; returnCount: number; stockLevel: number }>;
      productVariants: Array<{ size: string | null; inventoryQuantity: number; price: unknown }>;
    }>) {
      if (product.sizeCurves.length === 0 && product.productVariants.filter(v => v.size).length === 0) {
        continue;
      }

      const result = await this.optimizeProduct(
        product.id,
        product.title,
        product.category?.name,
        product.sizeCurves.map(c => ({
          size: c.size,
          salesCount: c.salesCount,
          returnCount: c.returnCount,
          stockLevel: c.stockLevel,
          sellThroughRate: c.salesCount / (c.salesCount + c.stockLevel + 1),
          returnRate: c.salesCount > 0 ? c.returnCount / c.salesCount : 0,
        })),
        product.productVariants,
      );

      if (result) {
        results.push(result);
        totalRevenueLiftOpportunity += result.potentialImpact.estimatedRevenueLift;

        // Aggregate issues
        for (const rec of result.buyingRecommendations) {
          if (rec.recommendedBuyUnits > 0) {
            const issue = `Size ${rec.size} understocked`;
            topIssues.set(issue, (topIssues.get(issue) || 0) + 1);
          }
        }
      }
    }

    const productsWithIssues = results.filter(
      r => r.optimizedCurve.some(o => o.action !== 'maintain')
    ).length;

    // Sort issues by frequency
    const sortedIssues = Array.from(topIssues.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([issue]) => issue);

    const now = new Date();
    const periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      storeId: input.storeId,
      generatedAt: now.toISOString(),
      period: {
        start: periodStart.toISOString(),
        end: now.toISOString(),
      },
      summary: {
        totalProducts: results.length,
        productsWithIssues,
        totalRevenueLiftOpportunity: Math.round(totalRevenueLiftOpportunity),
        topIssues: sortedIssues,
      },
      products: results,
    };
  }

  /**
   * Optimize size curve for a single product
   */
  async optimizeProduct(
    productId: string,
    productName: string,
    category: string | null | undefined,
    currentCurveData: SizeCurveData[],
    variants: Array<{ size: string | null; inventoryQuantity: number; price: unknown }>
  ): Promise<SizeCurveOptimizationResult | null> {
    if (currentCurveData.length === 0 && variants.filter(v => v.size).length === 0) {
      return null;
    }

    // Build current curve from variants if no size curve data
    const curve: SizeCurveData[] = currentCurveData.length > 0
      ? currentCurveData
      : variants
          .filter(v => v.size)
          .map(v => ({
            size: v.size!,
            salesCount: 0,
            returnCount: 0,
            stockLevel: v.inventoryQuantity,
            sellThroughRate: 0,
            returnRate: 0,
          }));

    const totalStock = curve.reduce((sum, c) => sum + c.stockLevel, 0);
    const totalSales = curve.reduce((sum, c) => sum + c.salesCount, 0);

    if (totalStock === 0) return null;

    // Determine benchmark category
    const benchmarkKey = this.detectBenchmarkCategory(curve.map(c => c.size));
    const benchmark = INDUSTRY_BENCHMARKS[benchmarkKey] ?? INDUSTRY_BENCHMARKS.tops;

    // Calculate optimized curve
    const optimizedCurve: OptimizedSizeCurve[] = curve.map(c => {
      const currentPercent = totalStock > 0 ? (c.stockLevel / totalStock) * 100 : 0;
      const recommendedPercent = benchmark[c.size] ?? (100 / curve.length);
      const recommendedStock = Math.round((recommendedPercent / 100) * totalStock);
      const deltaUnits = recommendedStock - c.stockLevel;

      let action: OptimizedSizeCurve['action'] = 'maintain';
      if (deltaUnits > 2) action = 'increase';
      else if (deltaUnits < -2) action = 'decrease';

      let priority: OptimizedSizeCurve['priority'] = 'optional';
      if (Math.abs(deltaUnits) > 10) priority = 'urgent';
      else if (Math.abs(deltaUnits) > 5) priority = 'recommended';

      return {
        size: c.size,
        currentStock: c.stockLevel,
        currentPercent: Math.round(currentPercent * 10) / 10,
        recommendedPercent,
        recommendedStock,
        deltaUnits,
        action,
        priority,
      };
    });

    // Generate buying recommendations
    const avgPrice = variants.reduce((sum, v) => sum + Number(v.price || 0), 0) / Math.max(variants.length, 1);
    const buyingRecommendations: BuyingRecommendation[] = optimizedCurve
      .filter(o => o.action === 'increase')
      .map(o => {
        const sizeData = curve.find(c => c.size === o.size);
        const sellThroughRate = sizeData
          ? sizeData.salesCount / (sizeData.salesCount + sizeData.stockLevel + 1)
          : 0.6;

        return {
          size: o.size,
          currentStock: o.currentStock,
          recommendedBuyUnits: o.deltaUnits,
          estimatedSellThrough: sellThroughRate,
          expectedRevenue: o.deltaUnits * avgPrice * sellThroughRate,
          returnRisk: (sizeData?.returnRate ?? 0) > 0.2 ? 'high' : (sizeData?.returnRate ?? 0) > 0.1 ? 'medium' : 'low',
          notes: o.priority === 'urgent' ? 'Critical: High stockout risk' : undefined,
        };
      });

    // Benchmark comparison
    const benchmarkComparison: BenchmarkComparison = {
      industryAvgCurve: benchmark,
      yourCurve: Object.fromEntries(
        optimizedCurve.map(o => [o.size, o.currentPercent])
      ),
      deviations: optimizedCurve.map(o => {
        const benchmarkPct = benchmark[o.size] ?? 0;
        const deviation = o.currentPercent - benchmarkPct;
        let recommendation = 'On track';
        if (deviation < -5) recommendation = `Increase ${o.size} allocation by ${Math.abs(Math.round(deviation))}%`;
        else if (deviation > 5) recommendation = `Reduce ${o.size} allocation by ${Math.round(deviation)}%`;

        return {
          size: o.size,
          yourPct: o.currentPercent,
          benchmarkPct,
          deviation: Math.round(deviation * 10) / 10,
          recommendation,
        };
      }),
    };

    // Calculate potential impact
    const misalignedCount = optimizedCurve.filter(o => o.action !== 'maintain').length;
    const totalMisalignedDelta = optimizedCurve.reduce((sum, o) => sum + Math.abs(o.deltaUnits), 0);
    const overallScore = Math.max(0, 100 - misalignedCount * 10 - (totalMisalignedDelta / Math.max(totalStock, 1)) * 50);

    const potentialImpact: SizeCurveImpact = {
      estimatedRevenueLift: misalignedCount * 2.5,
      estimatedReturnReduction: misalignedCount * 1.5,
      estimatedStockoutReduction: optimizedCurve.filter(o => o.action === 'increase').length * 8,
      overallScore: Math.round(overallScore),
    };

    return {
      productId,
      productName,
      category: category ?? undefined,
      currentCurve: curve,
      optimizedCurve,
      buyingRecommendations,
      potentialImpact,
      benchmarkComparison,
    };
  }

  /**
   * Get store-wide size health score
   */
  async getStoreSizeHealthScore(storeId: string): Promise<{
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    details: string;
    recommendations: string[];
  }> {
    const report = await this.optimizeStore({ storeId });

    const avgScore = report.products.length > 0
      ? report.products.reduce((sum, p) => sum + p.potentialImpact.overallScore, 0) / report.products.length
      : 75;

    const grade = avgScore >= 90 ? 'A'
      : avgScore >= 80 ? 'B'
      : avgScore >= 70 ? 'C'
      : avgScore >= 60 ? 'D'
      : 'F';

    const recommendations: string[] = [];
    if (report.summary.productsWithIssues > 0) {
      recommendations.push(
        `${report.summary.productsWithIssues} products need size curve adjustment`
      );
    }
    for (const issue of report.summary.topIssues.slice(0, 3)) {
      recommendations.push(issue);
    }

    return {
      score: Math.round(avgScore),
      grade,
      details: `${report.summary.totalProducts} products analyzed, ${report.summary.productsWithIssues} need attention`,
      recommendations,
    };
  }

  // ============================================================================
  // Private Helpers
  // ============================================================================

  private detectBenchmarkCategory(sizes: string[]): string {
    // Check if numeric sizing (0, 2, 4, 6...)
    const numericSizes = sizes.filter(s => !isNaN(Number(s)));
    if (numericSizes.length > sizes.length / 2) return 'numeric';

    // Default to tops benchmark
    return 'tops';
  }
}

export const sizeCurveOptimizer = new SizeCurveOptimizer();
