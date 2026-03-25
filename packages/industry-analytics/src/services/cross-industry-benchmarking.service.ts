/**
 * Cross-Industry Benchmarking Service
 * 
 * Provides anonymized cross-industry benchmarking and percentile analysis
 */

import { prisma } from '@vayva/db';
import { analyticsPrisma } from './analytics-prisma';
import { z } from 'zod';

const benchmarkRequestSchema = z.object({
  businessId: z.string(),
  industry: z.string(),
  metrics: z.array(z.string()),
  timeHorizon: z.enum(['today', 'week', 'month', 'quarter', 'year']).optional(),
});

interface BenchmarkPercentile {
  percentile: number;
  value: number;
  interpretation: string;
}

export interface BenchmarkReport {
  businessId: string;
  industry: string;
  generatedAt: string;
  metrics: Array<{
    metricName: string;
    businessValue: number;
    industryAverage: number;
    topQuartile: number;
    median: number;
    bottomQuartile: number;
    percentile: number;
    performance: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
    recommendations: string[];
  }>;
  overallScore: number;
  strengths: string[];
  improvementAreas: string[];
}

export class CrossIndustryBenchmarkingService {
  async initialize() {
    console.log('[CrossIndustryBenchmarkingService] Initialized');
  }

  /**
   * Generate comprehensive benchmark report
   */
  async generateBenchmarkReport(
    businessId: string,
    industry: string,
    metrics: string[]
  ): Promise<BenchmarkReport> {
    const validation = benchmarkRequestSchema.parse({
      businessId,
      industry,
      metrics,
    });

    // Get business metrics
    const businessMetrics = await this.getBusinessMetrics(businessId, metrics);

    // Get industry benchmarks (anonymized aggregated data)
    const industryBenchmarks = await this.getIndustryBenchmarks(
      industry,
      metrics
    );

    // Calculate percentiles and performance
    const metricAnalysis = await Promise.all(
      metrics.map(async (metricName) => {
        const businessValue = businessMetrics[metricName] || 0;
        const benchmark = industryBenchmarks[metricName];

        if (!benchmark) {
          return {
            metricName,
            businessValue,
            industryAverage: 0,
            topQuartile: 0,
            median: 0,
            bottomQuartile: 0,
            percentile: 50,
            performance: 'average' as const,
            recommendations: [],
          };
        }

        const percentile = this.calculatePercentile(
          businessValue,
          benchmark.distribution
        );

        const performance = this.getPerformanceLevel(percentile);

        const recommendations = this.generateRecommendations(
          metricName,
          performance,
          businessValue,
          benchmark.median
        );

        return {
          metricName,
          businessValue,
          industryAverage: benchmark.average,
          topQuartile: benchmark.topQuartile,
          median: benchmark.median,
          bottomQuartile: benchmark.bottomQuartile,
          percentile,
          performance,
          recommendations,
        };
      })
    );

    // Calculate overall score
    const overallScore =
      metricAnalysis.reduce((sum, m) => sum + m.percentile, 0) /
      metricAnalysis.length;

    // Identify strengths and improvement areas
    const strengths = metricAnalysis
      .filter((m) => m.performance === 'excellent' || m.performance === 'good')
      .map((m) => m.metricName);

    const improvementAreas = metricAnalysis
      .filter(
        (m) =>
          m.performance === 'below_average' || m.performance === 'poor'
      )
      .map((m) => m.metricName);

    return {
      businessId,
      industry,
      generatedAt: new Date().toISOString(),
      metrics: metricAnalysis,
      overallScore,
      strengths,
      improvementAreas,
    };
  }

  /**
   * Get business metrics from database
   */
  private async getBusinessMetrics(
    businessId: string,
    metrics: string[]
  ): Promise<Record<string, number>> {
    const result: Record<string, number> = {};

    for (const metric of metrics) {
      try {
        // Query analytics data for this business
        const analyticsData = await analyticsPrisma.analyticsSnapshot.findFirst({
          where: {
            businessId,
            metricType: metric,
          },
          orderBy: {
            timestamp: 'desc',
          },
        });

        if (analyticsData) {
          result[metric] = analyticsData.value as number;
        } else {
          result[metric] = 0;
        }
      } catch (error) {
        console.error(`Error fetching metric ${metric}:`, error);
        result[metric] = 0;
      }
    }

    return result;
  }

  /**
   * Get industry benchmarks (anonymized)
   */
  private async getIndustryBenchmarks(
    industry: string,
    metrics: string[]
  ): Promise<
    Record<
      string,
      {
        average: number;
        median: number;
        topQuartile: number;
        bottomQuartile: number;
        distribution: number[];
      }
    >
  > {
    const result: Record<
      string,
      {
        average: number;
        median: number;
        topQuartile: number;
        bottomQuartile: number;
        distribution: number[];
      }
    > = {};

    for (const metric of metrics) {
      try {
        // Aggregate anonymized data across similar businesses
        const aggregatedData = await prisma.$queryRaw`
          SELECT 
            AVG(value) as average,
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value) as median,
            PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY value) as top_quartile,
            PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY value) as bottom_quartile,
            ARRAY_AGG(value) as distribution
          FROM "AnalyticsSnapshot" a
          JOIN "Business" b ON a.business_id = b.id
          WHERE b.industry = ${industry}
            AND a.metric_type = ${metric}
            AND a.timestamp > NOW() - INTERVAL '30 days'
        `;

        const rows = aggregatedData as Array<{
          average: unknown;
          median: unknown;
          top_quartile: unknown;
          bottom_quartile: unknown;
          distribution: unknown;
        }>;
        const data = rows[0];
        if (!data) {
          result[metric] = {
            average: 0,
            median: 0,
            topQuartile: 0,
            bottomQuartile: 0,
            distribution: [],
          };
          continue;
        }

        result[metric] = {
          average: parseFloat(String(data.average)) || 0,
          median: parseFloat(String(data.median)) || 0,
          topQuartile: parseFloat(String(data.top_quartile)) || 0,
          bottomQuartile: parseFloat(String(data.bottom_quartile)) || 0,
          distribution: Array.isArray(data.distribution)
            ? (data.distribution as number[])
            : [],
        };
      } catch (error) {
        console.error(`Error calculating benchmark for ${metric}:`, error);
        result[metric] = {
          average: 0,
          median: 0,
          topQuartile: 0,
          bottomQuartile: 0,
          distribution: [],
        };
      }
    }

    return result;
  }

  /**
   * Calculate percentile rank
   */
  private calculatePercentile(value: number, distribution: number[]): number {
    if (distribution.length === 0) return 50;

    const sorted = [...distribution].sort((a, b) => a - b);
    const position = sorted.findIndex((v) => v >= value);

    if (position === -1) return 100;
    if (position === 0) return 0;

    return Math.round((position / sorted.length) * 100);
  }

  /**
   * Get performance level from percentile
   */
  private getPerformanceLevel(percentile: number): BenchmarkReport['metrics'][0]['performance'] {
    if (percentile >= 90) return 'excellent';
    if (percentile >= 70) return 'good';
    if (percentile >= 40) return 'average';
    if (percentile >= 20) return 'below_average';
    return 'poor';
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    metricName: string,
    performance: string,
    businessValue: number,
    industryMedian: number
  ): string[] {
    const recommendations: string[] = [];

    if (performance === 'excellent' || performance === 'good') {
      recommendations.push('Maintain current performance levels');
      recommendations.push('Consider sharing best practices across teams');
    } else if (performance === 'average') {
      recommendations.push('Monitor trends and identify improvement opportunities');
      recommendations.push(`Aim to reach top quartile (${industryMedian * 1.2})`);
    } else {
      recommendations.push('Develop action plan to address performance gap');
      recommendations.push(`Target: Reach industry median (${industryMedian})`);
      recommendations.push('Consider root cause analysis');
    }

    return recommendations;
  }

  /**
   * Compare multiple businesses
   */
  async compareBusinesses(
    businessIds: string[],
    metrics: string[]
  ): Promise<ComparisonReport> {
    const comparisons = await Promise.all(
      businessIds.map(async (businessId) => {
        const businessMetrics = await this.getBusinessMetrics(
          businessId,
          metrics
        );

        return {
          businessId,
          metrics: businessMetrics,
        };
      })
    );

    return {
      businesses: comparisons,
      metrics,
      generatedAt: new Date().toISOString(),
    };
  }
}

export interface ComparisonReport {
  businesses: Array<{
    businessId: string;
    metrics: Record<string, number>;
  }>;
  metrics: string[];
  generatedAt: string;
}
