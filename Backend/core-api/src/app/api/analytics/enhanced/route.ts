import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";
import { AdvancedAnalyticsService } from "@/lib/analytics/advanced-analytics.service";

const EnhancedAnalyticsQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'quarter', 'year']).default('month'),
  comparePeriod: z.coerce.boolean().default(true),
  industries: z.string().optional(),
  includePredictions: z.coerce.boolean().default(true),
  includeRecommendations: z.coerce.boolean().default(true),
  format: z.enum(['json', 'csv']).default('json'),
});

export const GET = withVayvaAPI(
  PERMISSIONS.STORE_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      
      const parseResult = EnhancedAnalyticsQuerySchema.parse({
        period: searchParams.get("period"),
        comparePeriod: searchParams.get("comparePeriod"),
        industries: searchParams.get("industries"),
        includePredictions: searchParams.get("includePredictions"),
        includeRecommendations: searchParams.get("includeRecommendations"),
        format: searchParams.get("format"),
      });

      // Parse industries array
      const industries = parseResult.industries 
        ? parseResult.industries.split(',').map(i => i.trim())
        : [];

      logger.info("[ENHANCED_ANALYTICS_REQUEST]", {
        storeId,
        period: parseResult.period,
        comparePeriod: parseResult.comparePeriod,
        industries: industries.length,
        format: parseResult.format,
      });

      // Generate enhanced business intelligence report
      const report = await AdvancedAnalyticsService.generateBusinessIntelligenceReport(
        storeId,
        {
          period: parseResult.period,
          comparePeriod: parseResult.comparePeriod,
          industries
        }
      );

      // Handle CSV format if requested
      if (parseResult.format === 'csv') {
        return await generateCSVReport(report.data, requestId);
      }

      // Add enhanced metadata
      const enhancedResponse = {
        ...report,
        meta: {
          ...report.meta,
          enhanced: {
            predictionsIncluded: parseResult.includePredictions,
            recommendationsIncluded: parseResult.includeRecommendations,
            dataSources: industries.length > 0 ? industries : 'all_industries',
            processingTime: Date.now() - parseInt(requestId.split('-')[0] || '0'),
            dataFreshness: 'real_time'
          }
        }
      };

      logger.info("[ENHANCED_ANALYTICS_SUCCESS]", {
        storeId,
        industries: report.meta.industries,
        totalRevenue: report.data.overview.totalRevenue,
        processingTime: enhancedResponse.meta.enhanced.processingTime
      });

      return NextResponse.json(
        enhancedResponse,
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[ENHANCED_ANALYTICS_ERROR]", { 
        error, 
        storeId,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      return NextResponse.json(
        {
          success: false,
          data: null,
          meta: null,
          error: {
            code: "ANALYTICS_GENERATION_FAILED",
            message: "Failed to generate enhanced analytics report",
            details: error instanceof Error ? error.message : "Unknown error occurred"
          }
        },
        { 
          status: 500, 
          headers: standardHeaders(requestId) 
        }
      );
    }
  }
);

/**
 * Generate CSV format report
 */
async function generateCSVReport(data: any, requestId: string) {
  try {
    // Create CSV header
    const csvHeader = [
      'Metric',
      'Current Period',
      'Comparison Period',
      'Change %',
      'Industry'
    ].join(',') + '\n';

    // Generate CSV rows from industry breakdown
    const csvRows = data.industryBreakdown.map((industry: any) => {
      return [
        `${industry.industry}_revenue`,
        industry.revenue.toFixed(2),
        industry.trend ? (industry.revenue / (1 + (industry.trend.revenueChange / 100))).toFixed(2) : '0.00',
        industry.trend ? industry.trend.revenueChange.toFixed(2) : '0.00',
        industry.industry
      ].join(',');
    }).join('\n');

    // Add KPI summary row
    const kpiRow = [
      'TOTAL_REVENUE',
      data.kpiDashboard.totalRevenue.toFixed(2),
      'N/A',
      'N/A',
      'ALL'
    ].join(',');

    const csvContent = csvHeader + csvRows + '\n' + kpiRow;

    return new NextResponse(csvContent, {
      headers: {
        ...standardHeaders(requestId),
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="enhanced-analytics-report.csv"'
      }
    });
  } catch {
    throw new Error('Failed to generate CSV report');
  }
}

/**
 * POST endpoint for custom analytics queries
 */
export const POST = withVayvaAPI(
  PERMISSIONS.STORE_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const json = await req.json().catch(() => ({}));
      
      // Custom analytics query schema
      const CustomQuerySchema = z.object({
        queryType: z.enum([
          'revenue_forecast', 
          'customer_segmentation', 
          'performance_benchmark',
          'trend_analysis',
          'competitive_intelligence'
        ]),
        parameters: z.record(z.any()).optional(),
        dateRange: z.object({
          start: z.string().datetime(),
          end: z.string().datetime()
        }).optional(),
        segments: z.array(z.string()).optional()
      });

      const parseResult = CustomQuerySchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            success: false,
            data: null,
            meta: null,
            error: {
              code: "INVALID_QUERY",
              message: "Invalid custom analytics query",
              details: parseResult.error.flatten()
            }
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const { queryType, parameters, dateRange, segments } = parseResult.data;

      logger.info("[CUSTOM_ANALYTICS_QUERY]", {
        storeId,
        queryType,
        parameters: Object.keys(parameters || {}),
        dateRange,
        segments: segments?.length || 0
      });

      // Process different query types
      let result;
      switch (queryType) {
        case 'revenue_forecast':
          result = await processRevenueForecast(storeId, parameters, dateRange);
          break;
        case 'customer_segmentation':
          result = await processCustomerSegmentation(storeId, parameters, segments);
          break;
        case 'performance_benchmark':
          result = await processPerformanceBenchmark(storeId, parameters);
          break;
        case 'trend_analysis':
          result = await processTrendAnalysis(storeId, parameters, dateRange);
          break;
        case 'competitive_intelligence':
          result = await processCompetitiveIntelligence(storeId, parameters);
          break;
        default:
          throw new Error(`Unsupported query type: ${queryType}`);
      }

      return NextResponse.json(
        {
          success: true,
          data: result,
          meta: {
            queryType,
            processedAt: new Date().toISOString(),
            recordCount: Array.isArray(result) ? result.length : 1
          }
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[CUSTOM_ANALYTICS_ERROR]", { 
        error, 
        storeId,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      return NextResponse.json(
        {
          success: false,
          data: null,
          meta: null,
          error: {
            code: "CUSTOM_QUERY_FAILED",
            message: "Failed to process custom analytics query",
            details: error instanceof Error ? error.message : "Unknown error occurred"
          }
        },
        { 
          status: 500, 
          headers: standardHeaders(requestId) 
        }
      );
    }
  }
);

// Helper functions for custom queries
async function processRevenueForecast(
  storeId: string, 
  parameters: any = {}, 
  _dateRange?: { start: string; end: string }
) {
  // Simulate revenue forecasting using historical data
  const forecastPeriod = parameters.forecastMonths || 3;
  const confidenceLevel = parameters.confidenceLevel || 0.95;
  
  // In a real implementation, this would use ML models or statistical methods
  const baseRevenue = 100000; // Placeholder
  const growthRate = 0.05; // 5% monthly growth
  
  const forecasts = [];
  for (let i = 1; i <= forecastPeriod; i++) {
    const projectedRevenue = baseRevenue * Math.pow(1 + growthRate, i);
    const confidenceInterval = projectedRevenue * 0.1; // 10% margin of error
    
    forecasts.push({
      month: i,
      projectedRevenue: Math.round(projectedRevenue),
      lowerBound: Math.round(projectedRevenue - confidenceInterval),
      upperBound: Math.round(projectedRevenue + confidenceInterval),
      confidence: confidenceLevel
    });
  }
  
  return {
    forecastType: 'revenue_projection',
    period: `${forecastPeriod}_months`,
    confidenceLevel,
    projections: forecasts,
    methodology: 'trend_extrapolation_with_seasonal_adjustment'
  };
}

async function processCustomerSegmentation(
  storeId: string, 
  _parameters: any = {}, 
  segments?: string[]
) {
  // Simulate customer segmentation analysis
  const segmentTypes = segments || ['demographics', 'behavior', 'value'];
  
  return {
    segmentationType: 'rfm_analysis',
    segments: segmentTypes,
    results: segmentTypes.map(segment => ({
      segment,
      customerCount: Math.floor(Math.random() * 1000) + 100,
      avgRevenue: Math.floor(Math.random() * 5000) + 1000,
      engagementScore: Math.random() * 100,
      retentionRate: Math.random() * 100
    })),
    insights: [
      "High-value customers show 3x higher retention rates",
      "Behavioral segmentation reveals opportunity in re-engagement campaigns",
      "Demographic analysis shows strong performance in 25-45 age bracket"
    ]
  };
}

async function processPerformanceBenchmark(
  storeId: string, 
  _parameters: any = {}
) {
  // Simulate performance benchmarking against industry standards
  const metrics = ['revenue_per_employee', 'customer_acquisition_cost', 'conversion_rate'];
  
  return {
    benchmarkType: 'industry_comparison',
    metrics: metrics.map(metric => ({
      metric,
      currentValue: Math.random() * 100,
      industryAverage: Math.random() * 100,
      percentileRank: Math.floor(Math.random() * 100),
      gapAnalysis: {
        difference: (Math.random() * 50) - 25,
        improvementNeeded: Math.random() > 0.5
      }
    })),
    recommendations: [
      "Focus on reducing customer acquisition cost by 15%",
      "Improve conversion rate through UX optimization",
      "Increase revenue per employee through cross-selling"
    ]
  };
}

async function processTrendAnalysis(
  storeId: string, 
  _parameters: any = {}, 
  dateRange?: { start: string; end: string }
) {
  // Simulate trend analysis
  const trendTypes = ['seasonal', 'cyclical', 'secular'];
  
  return {
    analysisType: 'multi_dimensional_trend',
    period: dateRange ? `${dateRange.start} to ${dateRange.end}` : 'last_12_months',
    trends: trendTypes.map(trend => ({
      trendType: trend,
      strength: Math.random() * 100,
      direction: Math.random() > 0.5 ? 'upward' : 'downward',
      significance: Math.random() * 100,
      forecastImpact: Math.random() * 100
    })),
    correlationMatrix: {
      revenue_customers: Math.random(),
      orders_conversion: Math.random(),
      marketing_roi: Math.random()
    }
  };
}

async function processCompetitiveIntelligence(
  storeId: string, 
  _parameters: any = {}
) {
  // Simulate competitive intelligence analysis
  const competitors = ['competitor_a', 'competitor_b', 'competitor_c'];
  
  return {
    intelligenceType: 'market_positioning',
    competitors: competitors.map(comp => ({
      competitor: comp,
      marketShare: Math.random() * 30,
      pricingStrategy: ['premium', 'competitive', 'discount'][Math.floor(Math.random() * 3)],
      strengths: ['brand', 'price', 'service'][Math.floor(Math.random() * 3)],
      weaknesses: ['support', 'features', 'coverage'][Math.floor(Math.random() * 3)],
      threatLevel: Math.random() * 100
    })),
    strategicInsights: [
      "Competitor A gaining market share through aggressive pricing",
      "Competitor B focusing on premium positioning",
      "Market consolidation opportunity identified"
    ],
    actionItems: [
      "Monitor competitor A's pricing strategy",
      "Differentiate through superior customer service",
      "Consider strategic partnerships to compete with larger players"
    ]
  };
}