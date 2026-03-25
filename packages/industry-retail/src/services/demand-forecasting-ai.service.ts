/**
 * Demand Forecasting AI Service
 * 
 * Provides ML-powered demand prediction and inventory optimization
 * for retail operations
 */

import { BaseAIService } from "../lib/base-ai-service";

export interface DemandForecastResult {
  productId: string;
  period: { start: string; end: string };
  predictedDemand: {
    quantity: number;
    confidenceInterval: {
      lower: number;
      upper: number;
      confidence: number;
    };
  };
  seasonalityFactors: Array<{
    factor: string;
    impact: number;
    duration: string;
  }>;
  trend: "increasing" | "decreasing" | "stable";
  recommendations: Array<{
    action: string;
    quantity?: number;
    rationale: string;
    priority: string;
  }>;
}

export interface DemandForecastInput {
  /** Product identifier */
  productId: string;
  /** Historical sales data (units per period) */
  historicalSales: Array<{
    date: string;
    quantity: number;
    price?: number;
    promotions?: string[];
  }>;
  /** Forecast horizon */
  forecastPeriod: {
    start: string;
    end: string;
  };
  /** Seasonality factors */
  seasonalityFactors?: string[];
  /** Upcoming promotions/events */
  upcomingEvents?: Array<{
    name: string;
    date: string;
    expectedImpact: 'low' | 'medium' | 'high';
  }>;
  /** Market trends */
  marketTrends?: 'increasing' | 'decreasing' | 'stable';
}

export class DemandForecastingService extends BaseAIService<DemandForecastInput, DemandForecastResult> {
  constructor() {
    super({
      model: 'retail-analyst',
      temperature: 0.4, // Balanced for analytical tasks
      requireHumanValidation: false, // Forecasts are advisory
      confidenceThreshold: 0.75,
    });
  }

  protected async buildPrompt(input: DemandForecastInput): Promise<string> {
    const prompt = `You are an expert retail data analyst specializing in demand forecasting. Analyze the historical sales data and generate an accurate demand forecast.

PRODUCT ID: ${input.productId}
FORECAST PERIOD: ${input.forecastPeriod.start} to ${input.forecastPeriod.end}
MARKET TREND: ${input.marketTrends || 'Not specified'}
SEASONALITY FACTORS: ${input.seasonalityFactors?.join(', ') || 'None specified'}

HISTORICAL SALES DATA:
${input.historicalSales.map(s => `- ${s.date}: ${s.quantity} units${s.price ? ` @ $${s.price}` : ''}${s.promotions?.length ? ` (${s.promotions.join(', ')})` : ''}`).join('\n')}

UPCOMING EVENTS/PROMOTIONS:
${input.upcomingEvents?.length ? input.upcomingEvents.map(e => `- ${e.name} on ${e.date} (Expected impact: ${e.expectedImpact})`).join('\n') : 'None'}

Please provide a comprehensive demand forecast including:
1. Predicted demand quantity with confidence intervals
2. Seasonality analysis and factors
3. Trend identification (increasing/decreasing/stable)
4. Recommended inventory actions
5. Risk factors that could affect accuracy

Format your response as JSON with this exact structure:
{
  "productId": "Product identifier",
  "period": {
    "start": "Start date",
    "end": "End date"
  },
  "predictedDemand": {
    "quantity": predicted_units,
    "confidenceInterval": {
      "lower": lower_bound,
      "upper": upper_bound,
      "confidence": 0.0-1.0
    }
  },
  "seasonalityFactors": [
    {
      "factor": "Factor name",
      "impact": impact_multiplier,
      "duration": "Duration description"
    }
  ],
  "trend": "increasing|decreasing|stable",
  "recommendations": [
    {
      "action": "order_more|reduce_stock|maintain|promote",
      "quantity": quantity_if_applicable,
      "rationale": "Why this action is recommended",
      "priority": "high|medium|low"
    }
  ]
}

Use statistical reasoning and consider all provided factors. Be conservative in estimates to avoid overstocking.`;

    return prompt;
  }

  protected async parseResponse(rawResponse: string, input: DemandForecastInput): Promise<DemandForecastResult> {
    try {
      // Extract JSON from response
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.predictedDemand) {
        throw new Error('Missing predicted demand');
      }

      if (!parsed.period) {
        throw new Error('Missing forecast period');
      }

      return {
        productId: parsed.productId || input.productId,
        period: parsed.period,
        predictedDemand: parsed.predictedDemand,
        seasonalityFactors: parsed.seasonalityFactors || [],
        trend: parsed.trend,
        recommendations: parsed.recommendations || [],
      };
    } catch (error) {
      console.error('[DemandForecasting] Failed to parse response:', error);
      throw new Error(`Failed to parse demand forecast: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Quick demand forecast for single product
   */
  async forecastDemand(
    productId: string,
    historicalSales: DemandForecastInput['historicalSales'],
    forecastDays: number = 30
  ): Promise<DemandForecastResult> {
    await this.initialize();
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + forecastDays);
    
    return this.execute({
      productId,
      historicalSales,
      forecastPeriod: {
        start: new Date().toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      },
    });
  }

  /**
   * Comprehensive forecast with all factors
   */
  async comprehensiveForecast(input: DemandForecastInput): Promise<DemandForecastResult> {
    await this.initialize();
    return this.execute(input);
  }

  /**
   * Generate reorder recommendation
   */
  async generateReorderRecommendation(
    currentStock: number,
    forecastedDemand: number,
    leadTimeDays: number,
    safetyStockDays: number = 7
  ): Promise<{
    shouldReorder: boolean;
    recommendedQuantity: number;
    urgency: 'immediate' | 'soon' | 'routine' | 'not_needed';
    rationale: string;
  }> {
    const dailyDemand = forecastedDemand / 30; // Average daily demand
    const totalCoverageNeeded = dailyDemand * (leadTimeDays + safetyStockDays);
    
    const shouldReorder = currentStock < totalCoverageNeeded;
    const recommendedQuantity = Math.max(0, totalCoverageNeeded - currentStock + forecastedDemand);
    
    let urgency: 'immediate' | 'soon' | 'routine' | 'not_needed' = 'not_needed';
    let rationale = '';
    
    if (currentStock < dailyDemand * leadTimeDays) {
      urgency = 'immediate';
      rationale = 'Stock will run out before reorder arrives';
    } else if (currentStock < totalCoverageNeeded) {
      urgency = 'soon';
      rationale = 'Stock approaching safety threshold';
    } else if (shouldReorder) {
      urgency = 'routine';
      rationale = 'Optimal time to reorder based on forecast';
    } else {
      rationale = 'Current stock adequate for forecasted demand';
    }
    
    return {
      shouldReorder,
      recommendedQuantity: Math.round(recommendedQuantity),
      urgency,
      rationale,
    };
  }
}
