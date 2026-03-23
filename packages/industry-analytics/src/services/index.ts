// @ts-nocheck
// Analytics Services Index
// Export all analytics services

export { DataAnalyticsService } from './data-analytics.service';
export type { Metric, TrendData, AnalyticsQuery } from './data-analytics.service';

export { ReportingService } from './reporting.service';
export type { Report, ReportSchedule } from './reporting.service';

export { InsightsService } from './insights.service';
export type { KPI, Insight, Benchmark } from './insights.service';

export { PredictiveAnalyticsService } from './predictive-analytics.service';
export type { Forecast, TrendPrediction, PatternRecognition } from './predictive-analytics.service';

export { CrossIndustryBenchmarkingService } from './cross-industry-benchmarking.service';
export type { BenchmarkReport, ComparisonReport } from './cross-industry-benchmarking.service';

export { AIPredictiveAnalyticsService } from './ai-predictive-analytics.service';
export type { ForecastResult, TimeSeriesDataPoint } from './ai-predictive-analytics.service';
