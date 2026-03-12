// Analytics Services Index
// Export all analytics services

export { DataAnalyticsService } from './data-analytics.service.js';
export type { Metric, TrendData, AnalyticsQuery } from './data-analytics.service.js';

export { ReportingService } from './reporting.service.js';
export type { Report, ReportSchedule } from './reporting.service.js';

export { InsightsService } from './insights.service.js';
export type { KPI, Insight, Benchmark } from './insights.service.js';

export { PredictiveAnalyticsService } from './predictive-analytics.service.js';
export type { Forecast, TrendPrediction, PatternRecognition } from './predictive-analytics.service.js';

export { CrossIndustryBenchmarkingService } from './cross-industry-benchmarking.service.js';
export type { BenchmarkReport, ComparisonReport } from './cross-industry-benchmarking.service.js';

export { AIPredictiveAnalyticsService } from './ai-predictive-analytics.service.js';
export type { ForecastResult, TimeSeriesDataPoint } from './ai-predictive-analytics.service.js';
