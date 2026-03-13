/**
 * Advanced Analytics Platform - Cross-Industry Intelligence Engine
 * 
 * Provides unified analytics capabilities across all industries:
 * - Predictive Analytics & Forecasting
 * - Customer Behavior Analysis
 * - Revenue Optimization
 * - Operational Efficiency Metrics
 * - Competitive Benchmarking
 */

import { BaseAIService } from '@vayva/ai-agent';

export interface PredictiveInsightInput {
  /** Industry context */
  industry: string;
  /** Historical data points */
  historicalData: Array<{
    date: string;
    metric: string;
    value: number;
  }>;
  /** Prediction horizon (days) */
  forecastDays: number;
  /** Confidence threshold */
  confidenceThreshold?: number;
}

export class PredictiveAnalyticsService extends BaseAIService<PredictiveInsightInput, {
  industry: string;
  predictions: Array<{
    date: string;
    metric: string;
    predictedValue: number;
    confidenceInterval: {
      lower: number;
      upper: number;
    };
    confidence: number;
  }>;
  trends: Array<{
    direction: 'up' | 'down' | 'stable';
    strength: number; // 0-1
    description: string;
  }>;
  anomalies: Array<{
    date: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    impact: number;
  }>;
  recommendations: Array<{
    action: string;
    expectedImpact: string;
    priority: 'high' | 'medium' | 'low';
    confidence: number;
  }>;
}> {
  constructor() {
    super({
      model: 'analytics-predictive',
      temperature: 0.3, // Analytical precision
      requireHumanValidation: false, // Insights are advisory
      confidenceThreshold: 0.75,
    });
  }

  protected async buildPrompt(input: PredictiveInsightInput): Promise<string> {
    const prompt = `You are an expert data scientist specializing in predictive analytics and business forecasting. Analyze the historical data and provide accurate predictions with actionable insights.

INDUSTRY: ${input.industry}
FORECAST PERIOD: ${input.forecastDays} days
DATA POINTS: ${input.historicalData.length}

HISTORICAL DATA:
${input.historicalData.map(d => `- ${d.date}: ${d.metric} = ${d.value}`).join('\n')}

Please provide comprehensive predictive analytics including:
1. Time-series forecasts for the forecast period
2. Trend analysis (direction, strength, interpretation)
3. Anomaly detection in historical data
4. Actionable recommendations based on predictions

Format your response as JSON with this exact structure:
{
  "industry": "${input.industry}",
  "predictions": [
    {
      "date": "YYYY-MM-DD",
      "metric": "metric_name",
      "predictedValue": value,
      "confidenceInterval": {
        "lower": lower_bound,
        "upper": upper_bound
      },
      "confidence": 0.0-1.0
    }
  ],
  "trends": [
    {
      "direction": "up|down|stable",
      "strength": 0.0-1.0,
      "description": "Trend interpretation"
    }
  ],
  "anomalies": [
    {
      "date": "YYYY-MM-DD",
      "severity": "low|medium|high",
      "description": "What happened",
      "impact": percentage_impact
    }
  ],
  "recommendations": [
    {
      "action": "What to do",
      "expectedImpact": "Expected outcome",
      "priority": "high|medium|low",
      "confidence": 0.0-1.0
    }
  ]
}

Use statistical forecasting methods and consider:
- Seasonal patterns
- Growth trajectories
- Volatility indicators
- External factors specific to ${input.industry}

Provide realistic, data-driven predictions with appropriate confidence intervals.`;

    return prompt;
  }

  protected async parseResponse(rawResponse: string, input: PredictiveInsightInput): Promise<any> {
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.predictions || !Array.isArray(parsed.predictions)) {
        throw new Error('Missing predictions array');
      }

      if (!parsed.trends || !Array.isArray(parsed.trends)) {
        throw new Error('Missing trends array');
      }

      // Add validation rules
      this.addValidationRule({
        id: 'has_predictions',
        validate: (data) => data.predictions.length > 0,
        errorMessage: 'No predictions provided',
        isCritical: true,
      });

      this.addValidationRule({
        id: 'valid_confidence_intervals',
        validate: (data) => 
          data.predictions.every(p => 
            p.confidenceInterval.lower <= p.predictedValue &&
            p.confidenceInterval.upper >= p.predictedValue
          ),
        errorMessage: 'Invalid confidence intervals',
        isCritical: true,
      });

      this.addValidationRule({
        id: 'realistic_trends',
        validate: (data) => 
          data.trends.every(t => 
            t.strength >= 0 && t.strength <= 1
          ),
        errorMessage: 'Trend strength must be between 0-1',
        isCritical: false,
      });

      return {
        industry: parsed.industry || input.industry,
        predictions: parsed.predictions,
        trends: parsed.trends,
        anomalies: parsed.anomalies || [],
        recommendations: parsed.recommendations || [],
      };
    } catch (error) {
      console.error('[PredictiveAnalytics] Failed to parse response:', error);
      throw error;
    }
  }

  /**
   * Quick trend analysis
   */
  analyzeTrend(
    dataPoints: number[]
  ): {
    direction: 'up' | 'down' | 'stable';
    slope: number;
    rSquared: number;
    interpretation: string;
  } {
    const n = dataPoints.length;
    if (n < 2) {
      return {
        direction: 'stable',
        slope: 0,
        rSquared: 0,
        interpretation: 'Insufficient data for trend analysis',
      };
    }

    // Simple linear regression
    const xMean = (n - 1) / 2;
    const yMean = dataPoints.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denominator = 0;
    let ssTot = 0;
    let ssRes = 0;

    const slope = dataPoints.reduce((sum, y, x) => {
      numerator += (x - xMean) * (y - yMean);
      denominator += (x - xMean) ** 2;
      return numerator / denominator || 0;
    }, 0);

    const intercept = yMean - slope * xMean;

    // Calculate R²
    const predicted = dataPoints.map((_, i) => slope * i + intercept);
    dataPoints.forEach((y, i) => {
      ssTot += (y - yMean) ** 2;
      ssRes += (y - predicted[i]) ** 2;
    });

    const rSquared = 1 - (ssRes / ssTot) || 0;

    // Determine direction
    const direction = Math.abs(slope) < 0.05 ? 'stable' : slope > 0 ? 'up' : 'down';

    // Interpretation
    const strength = Math.abs(rSquared);
    let interpretation = '';
    
    if (direction === 'stable') {
      interpretation = 'No significant trend detected';
    } else if (strength > 0.7) {
      interpretation = `Strong ${directionward} trend with high predictability`;
    } else if (strength > 0.4) {
      interpretation = `Moderate ${directionward} trend with moderate predictability`;
    } else {
      interpretation = `Weak ${directionward} trend with low predictability`;
    }

    return {
      direction,
      slope: Math.round(slope * 1000) / 1000,
      rSquared: Math.round(rSquared * 1000) / 1000,
      interpretation,
    };
  }

  /**
   * Calculate moving average
   */
  calculateMovingAverage(
    dataPoints: number[],
    windowSize: number = 7
  ): number[] {
    if (dataPoints.length < windowSize) {
      return dataPoints;
    }

    const movingAvg: number[] = [];
    
    for (let i = windowSize - 1; i < dataPoints.length; i++) {
      const sum = dataPoints.slice(i - windowSize + 1, i + 1).reduce((a, b) => a + b, 0);
      movingAvg.push(sum / windowSize);
    }

    return movingAvg;
  }

  /**
   * Detect anomalies using Z-score
   */
  detectAnomalies(
    dataPoints: number[],
    threshold: number = 2
  ): Array<{
    index: number;
    value: number;
    zScore: number;
    severity: 'low' | 'medium' | 'high';
  }> {
    const mean = dataPoints.reduce((a, b) => a + b, 0) / dataPoints.length;
    const variance = dataPoints.reduce((sum, val) => sum + (val - mean) ** 2, 0) / dataPoints.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return [];

    return dataPoints
      .map((value, index) => {
        const zScore = Math.abs((value - mean) / stdDev);
        
        if (zScore < threshold) return null;

        let severity: 'low' | 'medium' | 'high' = 'low';
        if (zScore >= threshold + 1) severity = 'medium';
        if (zScore >= threshold + 2) severity = 'high';

        return {
          index,
          value,
          zScore: Math.round(zScore * 100) / 100,
          severity,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }
}
