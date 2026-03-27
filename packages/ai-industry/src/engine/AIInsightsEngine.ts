/**
 * Vayva AI Insights Engine
 * Industry-agnostic predictive analytics and recommendation system
 * 
 * Features:
 * - Predictive analytics (demand forecasting, churn prediction, LTV calculation)
 * - Anomaly detection (fraud, irregularities, outliers)
 * - Smart recommendations (actionable insights with confidence scores)
 * - Natural language query processing
 * 
 * @package @vayva/ai-industry
 */

import type { IndustrySlug } from '@vayva/domain';

// ============================================================================
// Type Definitions
// ============================================================================

export type AIInsightType = 
  | 'opportunity'
  | 'warning'
  | 'info'
  | 'prediction'
  | 'recommendation'
  | 'anomaly';

export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical';

export type InsightCategory = 
  | 'revenue'
  | 'inventory'
  | 'customer'
  | 'operations'
  | 'marketing'
  | 'financial'
  | 'compliance';

export type PredictionType = 
  | 'demand'
  | 'churn'
  | 'ltv'
  | 'conversion'
  | 'revenue'
  | 'inventory_need';

export interface AIInsight {
  id: string;
  type: AIInsightType;
  title: string;
  description: string;
  confidence: number; // 0-1
  impact: ImpactLevel;
  category: InsightCategory;
  details?: string;
  recommendation?: string;
  predictedImpact?: string;
  actions?: Array<{
    label: string;
    action: () => void;
    icon?: React.ReactNode;
  }>;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
  industry?: IndustrySlug;
  createdAt: Date;
}

export interface PredictiveForecast {
  metric: string;
  currentValue: number;
  predictedValue: number;
  changePercent: number;
  confidenceInterval: { low: number; high: number };
  timeframe: string;
  factors: string[];
  accuracy?: number;
  lastUpdated: Date;
}

export interface PredictionModel {
  id: string;
  name: string;
  type: PredictionType;
  status: 'active' | 'training' | 'paused' | 'error';
  accuracy: number; // percentage
  lastTrained: Date;
  nextTraining: Date;
  predictions: Array<{
    date: Date;
    predicted: number;
    actual?: number;
    confidence: number;
  }>;
  industry: IndustrySlug;
}

export interface AnomalyDetectionResult {
  id: string;
  type: 'fraud' | 'irregularity' | 'outlier' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
  metric: string;
  expectedValue: number;
  actualValue: number;
  deviation: number; // percentage
  description: string;
  recommendedAction: string;
  affectedEntities: string[];
}

export interface NaturalLanguageQuery {
  query: string;
  parsedIntent: {
    action: 'show' | 'compare' | 'predict' | 'analyze' | 'explain';
    metrics: string[];
    filters: Record<string, unknown>;
    timeframe?: string;
    groupBy?: string;
  };
  response: {
    answer: string;
    data: unknown;
    visualization?: 'chart' | 'table' | 'metric' | 'list';
  };
}

// ============================================================================
// Industry-Specific Configurations
// ============================================================================

export interface IndustryAIConfig {
  industry: IndustrySlug;
  enabledModels: PredictionType[];
  customMetrics: string[];
  anomalyThresholds: {
    revenue: number; // percentage deviation
    inventory: number;
    customers: number;
    orders: number;
  };
  recommendationRules: Array<{
    id: string;
    condition: (data: Record<string, unknown>) => boolean;
    insight: (data: Record<string, unknown>) => AIInsight;
  }>;
}

// ============================================================================
// Core AI Engine Class
// ============================================================================

export class AIInsightsEngine {
  private config: Map<IndustrySlug, IndustryAIConfig>;
  private models: Map<string, PredictionModel>;
  private insightsCache: Map<string, { insights: AIInsight[]; timestamp: Date }>;

  constructor() {
    this.config = new Map();
    this.models = new Map();
    this.insightsCache = new Map();
    this.initializeIndustryConfigs();
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  private initializeIndustryConfigs(): void {
    // Retail Configuration
    this.config.set('retail', {
      industry: 'retail',
      enabledModels: ['demand', 'churn', 'ltv', 'conversion'],
      customMetrics: ['sell_through_rate', 'inventory_turnover', 'basket_size'],
      anomalyThresholds: {
        revenue: 20,
        inventory: 30,
        customers: 25,
        orders: 25,
      },
      recommendationRules: [],
    });

    // Fashion Configuration
    this.config.set('fashion', {
      industry: 'fashion',
      enabledModels: ['demand', 'conversion'],
      customMetrics: ['seasonal_performance', 'trend_velocity', 'size_distribution'],
      anomalyThresholds: {
        revenue: 25,
        inventory: 35,
        customers: 20,
        orders: 30,
      },
      recommendationRules: [],
    });

    // Grocery Configuration
    this.config.set('grocery', {
      industry: 'grocery',
      enabledModels: ['demand', 'inventory_need'],
      customMetrics: ['waste_percentage', 'freshness_score', 'promotion_lift'],
      anomalyThresholds: {
        revenue: 15,
        inventory: 40,
        customers: 20,
        orders: 20,
      },
      recommendationRules: [],
    });

    // Healthcare Configuration
    this.config.set('healthcare-services', {
      industry: 'healthcare-services',
      enabledModels: ['churn', 'conversion'],
      customMetrics: ['patient_satisfaction', 'no_show_rate', 'claim_approval_rate'],
      anomalyThresholds: {
        revenue: 20,
        inventory: 25,
        customers: 15,
        orders: 30,
      },
      recommendationRules: [],
    });

    // Add configs for all 26 industries...
    // (Continuing pattern for remaining industries)
  }

  // ============================================================================
  // Predictive Analytics
  // ============================================================================

  /**
   * Generate demand forecast for a given metric
   */
  async forecastDemand(params: {
    industry: IndustrySlug;
    metric: string;
    historicalData: Array<{ date: Date; value: number }>;
    timeframe: string; // '7d' | '30d' | '90d' | '1y'
  }): Promise<PredictiveForecast> {
    const { historicalData, metric, timeframe } = params;
    
    if (historicalData.length < 7) {
      throw new Error('Insufficient historical data for forecasting');
    }

    // Calculate trend using linear regression
    const trend = this.calculateTrend(historicalData);
    
    // Apply seasonal adjustment
    const seasonality = this.detectSeasonality(historicalData, timeframe);
    
    // Generate forecast
    const forecastPeriod = this.getTimeframeDays(timeframe);
    const predictions: Array<{ date: Date; value: number }> = [];
    
    for (let i = 1; i <= forecastPeriod; i++) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + i);
      
      const basePrediction = trend.slope * i + trend.intercept;
      const seasonalFactor = seasonality[i % seasonality.length] || 1;
      const predictedValue = basePrediction * seasonalFactor;
      
      predictions.push({ date: futureDate, value: predictedValue });
    }

    const currentValue = historicalData[historicalData.length - 1].value;
    const avgPredictedValue = predictions.reduce((sum, p) => sum + p.value, 0) / predictions.length;
    
    // Calculate confidence interval using standard error
    const stdError = this.calculateStandardError(historicalData);
    const confidenceInterval = {
      low: avgPredictedValue - (1.96 * stdError),
      high: avgPredictedValue + (1.96 * stdError),
    };

    const changePercent = ((avgPredictedValue - currentValue) / currentValue) * 100;

    return {
      metric,
      currentValue,
      predictedValue: avgPredictedValue,
      changePercent,
      confidenceInterval,
      timeframe,
      factors: this.identifyForecastFactors(trend, seasonality),
      accuracy: this.calculateModelAccuracy(metric),
      lastUpdated: new Date(),
    };
  }

  /**
   * Predict customer churn probability
   */
  async predictChurn(params: {
    industry: IndustrySlug;
    customerId: string;
    behaviorData: {
      lastPurchaseDate: Date;
      purchaseFrequency: number;
      averageOrderValue: number;
      engagementScore: number;
      supportTickets: number;
    };
  }): Promise<{ probability: number; factors: string[]; recommendations: string[] }> {
    const { behaviorData } = params;
    
    // Calculate recency score
    const daysSinceLastPurchase = this.daysBetween(behaviorData.lastPurchaseDate, new Date());
    const recencyScore = Math.min(daysSinceLastPurchase / 90, 1); // Normalize to 0-1
    
    // Calculate frequency score
    const expectedFrequency = this.getIndustryAverageFrequency(params.industry);
    const frequencyScore = 1 - Math.min(behaviorData.purchaseFrequency / expectedFrequency, 1);
    
    // Calculate engagement score (inverted - lower engagement = higher churn risk)
    const engagementRisk = 1 - behaviorData.engagementScore;
    
    // Weighted churn probability
    const probability = (
      recencyScore * 0.4 +
      frequencyScore * 0.3 +
      engagementRisk * 0.2 +
      Math.min(behaviorData.supportTickets / 10, 1) * 0.1
    );

    // Identify risk factors
    const factors: string[] = [];
    if (recencyScore > 0.7) factors.push('Long time since last purchase');
    if (frequencyScore > 0.6) factors.push('Declining purchase frequency');
    if (engagementRisk > 0.7) factors.push('Low engagement with platform');
    if (behaviorData.supportTickets > 5) factors.push('High support ticket volume');

    // Generate recommendations
    const recommendations: string[] = [];
    if (probability > 0.7) {
      recommendations.push('Send personalized re-engagement email with special offer');
      recommendations.push('Schedule proactive customer success check-in');
    } else if (probability > 0.5) {
      recommendations.push('Share relevant product recommendations based on purchase history');
      recommendations.push('Invite to loyalty program if not already enrolled');
    }

    return {
      probability,
      factors,
      recommendations,
    };
  }

  /**
   * Calculate Customer Lifetime Value (LTV)
   */
  async calculateLTV(params: {
    industry: IndustrySlug;
    customerId: string;
    historicalOrders: Array<{
      date: Date;
      total: number;
      profitMargin: number;
    }>;
  }): Promise<{
    currentLTV: number;
    predictedLTV: number;
    timeframe: string;
    confidence: number;
  }> {
    const { historicalOrders, industry } = params;
    
    // Calculate average order value
    const totalRevenue = historicalOrders.reduce((sum, order) => sum + order.total, 0);
    const totalProfit = historicalOrders.reduce(
      (sum, order) => sum + (order.total * order.profitMargin),
      0
    );
    
    const avgOrderValue = totalRevenue / historicalOrders.length;
    const avgProfitMargin = totalProfit / totalRevenue;
    
    // Calculate purchase frequency
    const customerTenure = this.daysBetween(
      historicalOrders[0]?.date || new Date(),
      new Date()
    );
    const purchaseFrequency = 365 / (customerTenure / historicalOrders.length);
    
    // Get industry-specific customer lifespan
    const avgCustomerLifespan = this.getIndustryAvgLifespan(industry);
    
    // Calculate LTV
    const currentLTV = avgOrderValue * purchaseFrequency * avgCustomerLifespan * avgProfitMargin;
    
    // Predict future LTV with growth factor
    const growthRate = this.calculateCustomerGrowthRate(historicalOrders);
    const predictedLTV = currentLTV * (1 + growthRate);
    
    return {
      currentLTV,
      predictedLTV,
      timeframe: `${avgCustomerLifespan} years`,
      confidence: Math.min(0.6 + (historicalOrders.length * 0.05), 0.95),
    };
  }

  // ============================================================================
  // Anomaly Detection
  // ============================================================================

  /**
   * Detect anomalies in time series data
   */
  detectAnomalies(params: {
    metric: string;
    data: Array<{ date: Date; value: number }>;
    threshold?: number;
  }): AnomalyDetectionResult[] {
    const { metric, data, threshold = 2.5 } = params;
    
    if (data.length < 10) {
      return []; // Insufficient data
    }

    // Calculate moving average and standard deviation
    const windowSize = Math.min(7, data.length);
    const anomalies: AnomalyDetectionResult[] = [];

    for (let i = windowSize; i < data.length; i++) {
      const window = data.slice(i - windowSize, i);
      const mean = window.reduce((sum, d) => sum + d.value, 0) / windowSize;
      const stdDev = Math.sqrt(
        window.reduce((sum, d) => sum + Math.pow(d.value - mean, 2), 0) / windowSize
      );
      
      const zScore = Math.abs((data[i].value - mean) / stdDev);
      
      if (zScore > threshold) {
        const deviation = ((data[i].value - mean) / mean) * 100;
        
        let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
        if (zScore > 4) severity = 'critical';
        else if (zScore > 3.5) severity = 'high';
        else if (zScore > 3) severity = 'medium';

        const anomalyType: AnomalyDetectionResult['type'] = 
          deviation > 50 ? 'fraud' : 
          deviation > 30 ? 'irregularity' : 'outlier';

        anomalies.push({
          id: `anomaly_${metric}_${i}`,
          type: anomalyType,
          severity,
          detectedAt: data[i].date,
          metric,
          expectedValue: mean,
          actualValue: data[i].value,
          deviation,
          description: `${metric} ${deviation > 0 ? 'spiked' : 'dropped'} by ${Math.abs(deviation).toFixed(1)}%`,
          recommendedAction: this.getAnomalyRecommendation(anomalyType, metric),
          affectedEntities: [],
        });
      }
    }

    return anomalies;
  }

  // ============================================================================
  // Natural Language Processing
  // ============================================================================

  /**
   * Parse natural language query into structured intent
   */
  parseNaturalLanguageQuery(query: string): NaturalLanguageQuery {
    const lowercaseQuery = query.toLowerCase();
    
    // Intent detection
    let action: NaturalLanguageQuery['parsedIntent']['action'] = 'show';
    if (lowercaseQuery.includes('compare')) action = 'compare';
    else if (lowercaseQuery.includes('predict') || lowercaseQuery.includes('forecast')) action = 'predict';
    else if (lowercaseQuery.includes('analyze') || lowercaseQuery.includes('why')) action = 'analyze';
    else if (lowercaseQuery.includes('explain')) action = 'explain';

    // Extract metrics
    const metrics: string[] = [];
    if (lowercaseQuery.match(/revenue|sales/)) metrics.push('revenue');
    if (lowercaseQuery.match(/customer|clients?/)) metrics.push('customers');
    if (lowercaseQuery.match(/order|purchase/)) metrics.push('orders');
    if (lowercaseQuery.match(/profit|margin/)) metrics.push('profit');
    if (lowercaseQuery.match(/product|item/)) metrics.push('products');

    // Extract timeframe
    let timeframe: string | undefined;
    if (lowercaseQuery.match(/today/)) timeframe = 'today';
    else if (lowercaseQuery.match(/last week|past week/)) timeframe = '7d';
    else if (lowercaseQuery.match(/last month|past month/)) timeframe = '30d';
    else if (lowercaseQuery.match(/last quarter|past quarter/)) timeframe = '90d';
    else if (lowercaseQuery.match(/last year|past year/)) timeframe = '1y';

    // Generate response
    const response = this.generateNLResponse(action, metrics, timeframe);

    return {
      query,
      parsedIntent: {
        action,
        metrics,
        filters: {},
        timeframe,
      },
      response,
    };
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  private calculateTrend(data: Array<{ date: Date; value: number }>): { slope: number; intercept: number } {
    const n = data.length;
    const sumX = data.reduce((sum, _, i) => sum + i, 0);
    const sumY = data.reduce((sum, d) => sum + d.value, 0);
    const sumXY = data.reduce((sum, d, i) => sum + i * d.value, 0);
    const sumX2 = data.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  private detectSeasonality(
    data: Array<{ date: Date; value: number }>,
    timeframe: string
  ): number[] {
    // Simplified seasonality detection
    // In production, use Fourier transform or STL decomposition
    const period = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 12;
    const seasonalFactors: number[] = [];

    for (let i = 0; i < period; i++) {
      const values = data.filter((_, idx) => idx % period === i).map(d => d.value);
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
      const overallAvg = data.reduce((sum, d) => sum + d.value, 0) / data.length;
      seasonalFactors.push(avg / overallAvg);
    }

    return seasonalFactors;
  }

  private getTimeframeDays(timeframe: string): number {
    switch (timeframe) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 30;
    }
  }

  private calculateStandardError(data: Array<{ date: Date; value: number }>): number {
    const mean = data.reduce((sum, d) => sum + d.value, 0) / data.length;
    const variance = data.reduce((sum, d) => Math.pow(d.value - mean, 2), 0) / (data.length - 1);
    return Math.sqrt(variance / data.length);
  }

  private identifyForecastFactors(trend: { slope: number; intercept: number }, seasonality: number[]): string[] {
    const factors: string[] = [];
    
    if (trend.slope > 0) {
      factors.push('Positive growth trend');
    } else if (trend.slope < 0) {
      factors.push('Declining trend');
    } else {
      factors.push('Stable trend');
    }

    const seasonalityRange = Math.max(...seasonality) - Math.min(...seasonality);
    if (seasonalityRange > 0.3) {
      factors.push('Strong seasonal patterns detected');
    }

    return factors;
  }

  private calculateModelAccuracy(metric: string): number {
    // In production, this would use cross-validation on historical predictions
    // For now, return industry-standard baseline accuracies
    const baselineAccuracies: Record<string, number> = {
      'revenue': 85,
      'demand': 82,
      'churn': 78,
      'ltv': 75,
      'conversion': 80,
    };
    return baselineAccuracies[metric] || 80;
  }

  private getIndustryAverageFrequency(industry: IndustrySlug): number {
    const frequencies: Record<IndustrySlug, number> = {
      'retail': 12,
      'fashion': 6,
      'grocery': 52,
      'healthcare-services': 4,
      'default': 10,
    };
    return frequencies[industry] || frequencies.default;
  }

  private getIndustryAvgLifespan(industry: IndustrySlug): number {
    const lifespans: Record<IndustrySlug, number> = {
      'retail': 3,
      'fashion': 2,
      'grocery': 5,
      'healthcare-services': 7,
      'default': 3,
    };
    return lifespans[industry] || lifespans.default;
  }

  private calculateCustomerGrowthRate(
    orders: Array<{ date: Date; total: number }>
  ): number {
    if (orders.length < 2) return 0;

    const sortedOrders = [...orders].sort((a, b) => a.date.getTime() - b.date.getTime());
    const firstHalf = sortedOrders.slice(0, Math.floor(sortedOrders.length / 2));
    const secondHalf = sortedOrders.slice(Math.floor(sortedOrders.length / 2));

    const firstHalfAvg = firstHalf.reduce((sum, o) => sum + o.total, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, o) => sum + o.total, 0) / secondHalf.length;

    return (secondHalfAvg - firstHalfAvg) / firstHalfAvg;
  }

  private getAnomalyRecommendation(type: AnomalyDetectionResult['type'], metric: string): string {
    if (type === 'fraud') {
      return 'Immediately investigate potential fraud. Freeze affected accounts and review transaction logs.';
    } else if (type === 'irregularity') {
      return `Review ${metric} data for data quality issues or operational changes.`;
    } else {
      return `Monitor ${metric} closely. Consider investigating if pattern continues.`;
    }
  }

  private generateNLResponse(
    action: NaturalLanguageQuery['parsedIntent']['action'],
    metrics: string[],
    timeframe?: string
  ): NaturalLanguageQuery['response'] {
    const metricStr = metrics.join(', ') || 'key metrics';
    const period = timeframe || 'recent period';

    let answer = '';
    let visualization: 'chart' | 'table' | 'metric' | 'list' = 'chart';

    switch (action) {
      case 'show':
        answer = `Here's your ${metricStr} for ${period}`;
        visualization = 'chart';
        break;
      case 'compare':
        answer = `Comparing ${metricStr} across different periods`;
        visualization = 'chart';
        break;
      case 'predict':
        answer = `Forecasting ${metricStr} based on historical trends`;
        visualization = 'chart';
        break;
      case 'analyze':
        answer = `Analysis of factors affecting ${metricStr}`;
        visualization = 'list';
        break;
      case 'explain':
        answer = `Explanation of trends in ${metricStr}`;
        visualization = 'list';
        break;
    }

    return {
      answer,
      data: { metrics, timeframe: period },
      visualization,
    };
  }

  private daysBetween(date1: Date, date2: Date): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date2.getTime() - date1.getTime()) / msPerDay));
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const aiInsightsEngine = new AIInsightsEngine();

export default AIInsightsEngine;
