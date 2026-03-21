/// <reference lib="webworker" />

export type WorkerMessage = 
  | { type: 'CALCULATE_METRICS'; payload: MetricCalculationPayload }
  | { type: 'ANALYZE_TRENDS'; payload: TrendAnalysisPayload }
  | { type: 'PROCESS_USAGE_DATA'; payload: UsageDataPayload };

export type WorkerResponse =
  | { type: 'METRICS_CALCULATED'; payload: MetricsResult }
  | { type: 'TRENDS_ANALYZED'; payload: TrendsResult }
  | { type: 'USAGE_PROCESSED'; payload: UsageResult }
  | { type: 'ERROR'; payload: string };

interface MetricCalculationPayload {
  mrr: number;
  previousMonth: number;
  subscriptions: Array<{ amount: number; status: string }>;
}

interface MetricsResult {
  growth: number;
  arr: number;
  churnRate: number;
  ltv: number;
}

interface TrendAnalysisPayload {
  data: number[];
  periods: number;
}

interface TrendsResult {
  trend: 'up' | 'down' | 'neutral';
  percentage: number;
  forecast: number[];
}

interface UsageDataPayload {
  apiCalls: number;
  bandwidth: number;
  endpoints: Array<{ path: string; calls: number }>;
}

interface UsageResult {
  totalCalls: number;
  averageLatency: number;
  topEndpoints: Array<{ path: string; percentage: number }>;
}

// Handle messages from main thread
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;

  try {
    switch (type) {
      case 'CALCULATE_METRICS':
        handleMetricCalculation(payload);
        break;
      
      case 'ANALYZE_TRENDS':
        handleTrendAnalysis(payload);
        break;
      
      case 'PROCESS_USAGE_DATA':
        handleUsageProcessing(payload);
        break;
      
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    self.postMessage({ type: 'ERROR', payload: errorMessage } as WorkerResponse);
  }
};

/**
 * Calculate complex SaaS metrics off main thread
 */
function handleMetricCalculation(data: MetricCalculationPayload) {
  // Simulate heavy calculation
  const { mrr, previousMonth, subscriptions } = data;
  
  // Calculate growth rate
  const growth = previousMonth > 0 
    ? ((mrr - previousMonth) / previousMonth) * 100 
    : 0;
  
  // Calculate ARR
  const arr = mrr * 12;
  
  // Calculate churn rate from subscriptions
  const activeSubs = subscriptions.filter(s => s.status === 'active').length;
  const totalSubs = subscriptions.length;
  const churnRate = totalSubs > 0 
    ? ((totalSubs - activeSubs) / totalSubs) * 100 
    : 0;
  
  // Calculate LTV (simplified)
  const arpu = mrr / activeSubs || 0;
  const ltv = arpu * (100 / churnRate || 12); // Assume 12 months if no churn
  
  const result: MetricsResult = {
    growth: Math.round(growth * 10) / 10,
    arr: Math.round(arr),
    churnRate: Math.round(churnRate * 10) / 10,
    ltv: Math.round(ltv),
  };
  
  self.postMessage({ type: 'METRICS_CALCULATED', payload: result } as WorkerResponse);
}

/**
 * Analyze trends and generate forecasts
 */
function handleTrendAnalysis(data: TrendAnalysisPayload) {
  const { data: points, periods } = data;
  
  if (points.length < 2) {
    self.postMessage({ 
      type: 'ERROR', 
      payload: 'Insufficient data points' 
    } as WorkerResponse);
    return;
  }
  
  // Calculate linear regression for trend
  const n = points.length;
  const sumX = points.reduce((acc, _, i) => acc + i, 0);
  const sumY = points.reduce((acc, val) => acc + val, 0);
  const sumXY = points.reduce((acc, val, i) => acc + i * val, 0);
  const sumXX = points.reduce((acc, _, i) => acc + i * i, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Determine trend direction
  const trend: 'up' | 'down' | 'neutral' = 
    slope > 0.5 ? 'up' : slope < -0.5 ? 'down' : 'neutral';
  
  // Calculate percentage change
  const firstValue = points[0];
  const lastValue = points[points.length - 1];
  const percentage = ((lastValue - firstValue) / firstValue) * 100;
  
  // Generate forecast
  const forecast: number[] = [];
  for (let i = 0; i < periods; i++) {
    const futureIndex = n + i;
    forecast.push(Math.round((slope * futureIndex + intercept) * 10) / 10);
  }
  
  const result: TrendsResult = {
    trend,
    percentage: Math.round(percentage * 10) / 10,
    forecast,
  };
  
  self.postMessage({ type: 'TRENDS_ANALYZED', payload: result } as WorkerResponse);
}

/**
 * Process large usage analytics datasets
 */
function handleUsageProcessing(data: UsageDataPayload) {
  const { apiCalls, bandwidth, endpoints } = data;
  
  // Calculate total calls
  const totalCalls = endpoints.reduce((acc, ep) => acc + ep.calls, 0);
  
  // Calculate endpoint percentages
  const topEndpoints = endpoints
    .map(ep => ({
      path: ep.path,
      percentage: Math.round((ep.calls / totalCalls) * 1000) / 10,
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);
  
  // Simulate latency calculation (would be real in production)
  const averageLatency = Math.round(50 + Math.random() * 100);
  
  const result: UsageResult = {
    totalCalls,
    averageLatency,
    topEndpoints,
  };
  
  self.postMessage({ type: 'USAGE_PROCESSED', payload: result } as WorkerResponse);
}
