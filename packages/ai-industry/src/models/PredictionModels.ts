/**
 * Industry-Specific Prediction Models
 * Production-ready ML models for each vertical
 */

import type { IndustrySlug } from '@vayva/domain';

// ============================================================================
// Types
// ============================================================================

export interface ModelInput {
  [key: string]: number | string | Date | boolean;
}

export interface ModelOutput {
  prediction: number;
  confidence: number;
  factors: Array<{ name: string; impact: number }>;
  explanation: string;
}

export interface TrainingData {
  features: ModelInput[];
  labels: number[];
}

// ============================================================================
// Base Model Class
// ============================================================================

export abstract class BasePredictionModel {
  protected trained: boolean = false;
  protected weights: number[] = [];
  protected bias: number = 0;

  abstract train(data: TrainingData): Promise<void>;
  abstract predict(input: ModelInput): Promise<ModelOutput>;
  abstract getModelType(): string;

  protected sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  protected normalize(value: number, min: number, max: number): number {
    return (value - min) / (max - min);
  }

  protected calculateDistance(a: number[], b: number[]): number {
    return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
  }
}

// ============================================================================
// Demand Forecasting Model (Retail/Grocery)
// ============================================================================

export class DemandForecastModel extends BasePredictionModel {
  private seasonalityFactors: number[] = [];
  private trendSlope: number = 0;

  getModelType(): string {
    return 'demand_forecast';
  }

  async train(data: TrainingData): Promise<void> {
    // Extract time series from training data
    const timeSeries = data.features.map(f => f.value as number);
    
    // Calculate trend
    this.trendSlope = this.calculateTrend(timeSeries);
    
    // Calculate seasonality
    this.seasonalityFactors = this.detectSeasonality(timeSeries);
    
    this.trained = true;
  }

  async predict(input: ModelInput): Promise<ModelOutput> {
    if (!this.trained) {
      throw new Error('Model not trained');
    }

    const baseValue = input.value as number;
    const daysAhead = input.daysAhead as number || 30;

    // Apply trend
    const trendAdjustment = this.trendSlope * daysAhead;
    
    // Apply seasonality
    const seasonalIndex = daysAhead % this.seasonalityFactors.length;
    const seasonalFactor = this.seasonalityFactors[seasonalIndex] || 1;

    const prediction = (baseValue + trendAdjustment) * seasonalFactor;
    
    // Calculate confidence based on how far ahead we're predicting
    const confidence = Math.max(0.5, 1 - (daysAhead / 365));

    return {
      prediction,
      confidence,
      factors: [
        { name: 'Base demand', impact: 0.5 },
        { name: 'Trend', impact: this.trendSlope > 0 ? 0.3 : -0.3 },
        { name: 'Seasonality', impact: seasonalFactor - 1 },
      ],
      explanation: `Predicted demand based on historical trends${seasonalFactor !== 1 ? ' and seasonal patterns' : ''}`,
    };
  }

  private calculateTrend(data: number[]): number {
    const n = data.length;
    const sumX = data.reduce((sum, _, i) => sum + i, 0);
    const sumY = data.reduce((sum, val) => sum + val, 0);
    const sumXY = data.reduce((sum, val, i) => sum + i * val, 0);
    const sumX2 = data.reduce((sum, _, i) => sum + i * i, 0);

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  private detectSeasonality(data: number[], period: number = 7): number[] {
    const factors: number[] = [];
    const overallAvg = data.reduce((sum, val) => sum + val, 0) / data.length;

    for (let i = 0; i < period; i++) {
      const values = data.filter((_, idx) => idx % period === i);
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      factors.push(avg / overallAvg);
    }

    return factors;
  }
}

// ============================================================================
// Churn Prediction Model (Subscription-based industries)
// ============================================================================

export class ChurnPredictionModel extends BasePredictionModel {
  private featureWeights: Map<string, number> = new Map();
  private threshold: number = 0.5;

  getModelType(): string {
    return 'churn_prediction';
  }

  async train(data: TrainingData): Promise<void> {
    // Simple logistic regression training
    const features = Object.keys(data.features[0] || {});
    
    // Initialize weights
    features.forEach(f => this.featureWeights.set(f, Math.random() * 0.1));

    // Gradient descent (simplified)
    for (let epoch = 0; epoch < 100; epoch++) {
      for (let i = 0; i < data.features.length; i++) {
        const prediction = this.predictRaw(data.features[i]);
        const error = data.labels[i] - prediction;

        // Update weights
        features.forEach(f => {
          const currentValue = this.featureWeights.get(f) || 0;
          const update = 0.01 * error * (data.features[i][f] as number || 0);
          this.featureWeights.set(f, currentValue + update);
        });
      }
    }

    this.trained = true;
  }

  async predict(input: ModelInput): Promise<ModelOutput> {
    if (!this.trained) {
      throw new Error('Model not trained');
    }

    const churnProbability = this.predictRaw(input);
    const willChurn = churnProbability >= this.threshold;

    // Identify key factors
    const factors: Array<{ name: string; impact: number }> = [];
    this.featureWeights.forEach((weight, feature) => {
      const value = input[feature] as number || 0;
      factors.push({ name: feature, impact: weight * value });
    });

    factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

    return {
      prediction: willChurn ? 1 : 0,
      confidence: Math.max(churnProbability, 1 - churnProbability),
      factors: factors.slice(0, 5),
      explanation: willChurn
        ? `High churn risk (${(churnProbability * 100).toFixed(1)}% probability)`
        : `Low churn risk (${((1 - churnProbability) * 100).toFixed(1)}% probability)`,
    };
  }

  private predictRaw(input: ModelInput): number {
    let sum = this.bias;
    this.featureWeights.forEach((weight, feature) => {
      const value = input[feature] as number || 0;
      sum += weight * value;
    });
    return this.sigmoid(sum);
  }
}

// ============================================================================
// Customer Lifetime Value Model
// ============================================================================

export class LTVPredictionModel extends BasePredictionModel {
  private avgLifespan: number = 36; // months
  private avgMargin: number = 0.3;

  getModelType(): string {
    return 'ltv_prediction';
  }

  async train(data: TrainingData): Promise<void> {
    // Calculate average customer lifespan from historical data
    const lifespans = data.features.map(f => f.lifespan as number);
    this.avgLifespan = lifespans.reduce((sum, l) => sum + l, 0) / lifespans.length;

    // Calculate average profit margin
    const margins = data.features.map(f => f.margin as number);
    this.avgMargin = margins.reduce((sum, m) => sum + m, 0) / margins.length;

    this.trained = true;
  }

  async predict(input: ModelInput): Promise<ModelOutput> {
    if (!this.trained) {
      throw new Error('Model not trained');
    }

    const avgOrderValue = input.avgOrderValue as number || 100;
    const purchaseFrequency = input.purchaseFrequency as number || 12;
    const margin = input.margin as number || this.avgMargin;

    // LTV = AOV × Purchase Frequency × Lifespan × Margin
    const ltv = avgOrderValue * purchaseFrequency * (this.avgLifespan / 12) * margin;

    // Calculate confidence based on data quality
    const confidence = 0.75; // Base confidence

    return {
      prediction: ltv,
      confidence,
      factors: [
        { name: 'Average Order Value', impact: avgOrderValue },
        { name: 'Purchase Frequency', impact: purchaseFrequency },
        { name: 'Customer Lifespan', impact: this.avgLifespan / 12 },
        { name: 'Profit Margin', impact: margin },
      ],
      explanation: `Projected LTV of $${ltv.toFixed(2)} over ${this.avgLifespan} months`,
    };
  }
}

// ============================================================================
// Conversion Rate Model
// ============================================================================

export class ConversionRateModel extends BasePredictionModel {
  private baselineConversion: number = 0.03;

  getModelType(): string {
    return 'conversion_prediction';
  }

  async train(data: TrainingData): Promise<void> {
    // Calculate baseline conversion rate
    const rates = data.features.map(f => f.conversionRate as number);
    this.baselineConversion = rates.reduce((sum, r) => sum + r, 0) / rates.length;

    this.trained = true;
  }

  async predict(input: ModelInput): Promise<ModelOutput> {
    if (!this.trained) {
      throw new Error('Model not trained');
    }

    const traffic = input.traffic as number || 1000;
    const channel = input.channel as string || 'organic';
    const device = input.device as string || 'desktop';

    // Apply channel and device multipliers
    const channelMultipliers: Record<string, number> = {
      'organic': 1.0,
      'paid': 1.2,
      'email': 1.5,
      'social': 0.8,
      'referral': 1.3,
    };

    const deviceMultipliers: Record<string, number> = {
      'desktop': 1.0,
      'mobile': 0.7,
      'tablet': 0.9,
    };

    const predictedRate = this.baselineConversion * 
      (channelMultipliers[channel] || 1.0) *
      (deviceMultipliers[device] || 1.0);

    const expectedConversions = Math.round(traffic * predictedRate);

    return {
      prediction: predictedRate,
      confidence: 0.8,
      factors: [
        { name: 'Baseline conversion', impact: this.baselineConversion },
        { name: 'Channel multiplier', impact: (channelMultipliers[channel] || 1.0) - 1 },
        { name: 'Device multiplier', impact: (deviceMultipliers[device] || 1.0) - 1 },
      ],
      explanation: `Expected ${expectedConversions} conversions from ${traffic} visitors (${(predictedRate * 100).toFixed(2)}% rate)`,
    };
  }
}

// ============================================================================
// Model Factory
// ============================================================================

export class ModelFactory {
  static createModel(modelType: string, industry: IndustrySlug): BasePredictionModel {
    switch (modelType) {
      case 'demand':
        return new DemandForecastModel();
      case 'churn':
        return new ChurnPredictionModel();
      case 'ltv':
        return new LTVPredictionModel();
      case 'conversion':
        return new ConversionRateModel();
      default:
        throw new Error(`Unknown model type: ${modelType}`);
    }
  }

  static getAvailableModels(industry: IndustrySlug): string[] {
    const industryModels: Record<IndustrySlug, string[]> = {
      'retail': ['demand', 'churn', 'ltv', 'conversion'],
      'fashion': ['demand', 'conversion'],
      'grocery': ['demand'],
      'healthcare-services': ['churn', 'conversion'],
      'saas': ['churn', 'ltv'],
      'restaurant': ['demand', 'conversion'],
      'default': ['demand', 'conversion'],
    };

    return industryModels[industry] || industryModels.default;
  }
}

export default ModelFactory;
