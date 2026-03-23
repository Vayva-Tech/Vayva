// @ts-nocheck
/**
 * Inventory Prediction AI Service
 * 
 * Provides demand-based inventory forecasting and waste reduction
 * for food service operations
 */

import { BaseAIService } from '@vayva/ai-agent';

export interface InventoryPredictionInput {
  /** Ingredient identifier */
  ingredientId: string;
  /** Historical usage data */
  historicalUsage: Array<{
    date: string;
    quantityUsed: number;
    unit: string;
    covers?: number; // Number of customers served
  }>;
  /** Upcoming reservations/bookings */
  upcomingBookings?: Array<{
    date: string;
    covers: number;
    mealPeriod: 'breakfast' | 'lunch' | 'dinner';
    specialEvents?: string[];
  }>;
  /** Current inventory level */
  currentStock: number;
  /** Shelf life in days */
  shelfLifeDays?: number;
  /** Lead time for reordering */
  leadTimeDays: number;
  /** Forecast horizon */
  forecastDays: number;
}

export class InventoryPredictionService extends BaseAIService<InventoryPredictionInput, {
  ingredientId: string;
  predictedUsage: {
    totalQuantity: number;
    dailyBreakdown: Array<{ date: string; quantity: number }>;
    confidence: number;
  };
  reorderRecommendation: {
    shouldReorder: boolean;
    recommendedQuantity: number;
    orderDate: string;
    urgency: 'immediate' | 'soon' | 'routine';
  };
  wasteRisk: {
    atRisk: boolean;
    potentialWasteQuantity: number;
    mitigationStrategy: string;
  };
}> {
  constructor() {
    super({
      model: 'culinary-analyst',
      temperature: 0.3, // Analytical for precise predictions
      requireHumanValidation: false, // Predictions are advisory
      confidenceThreshold: 0.75,
    });
  }

  protected async buildPrompt(input: InventoryPredictionInput): Promise<string> {
    const avgDailyUsage = input.historicalUsage.reduce((sum, h) => sum + h.quantityUsed, 0) / input.historicalUsage.length;

    const prompt = `You are an expert inventory management specialist for food service operations. Analyze usage patterns and provide accurate demand forecasts.

INGREDIENT: ${input.ingredientId}
CURRENT STOCK: ${input.currentStock} ${input.shelfLifeDays ? `(Shelf life: ${input.shelfLifeDays} days)` : ''}
LEAD TIME: ${input.leadTimeDays} days
FORECAST PERIOD: ${input.forecastDays} days

HISTORICAL USAGE (Last ${input.historicalUsage.length} periods):
${input.historicalUsage.map(h => `- ${h.date}: ${h.quantityUsed}${h.unit}${h.covers ? ` (${h.covers} covers)` : ''}`).join('\n')}
Average Daily Usage: ${avgDailyUsage.toFixed(2)} units

UPCOMING BOOKINGS:
${input.upcomingBookings?.length 
  ? input.upcomingBookings.map(b => `- ${b.date} ${b.mealPeriod}: ${b.covers} covers${b.specialEvents?.length ? ` [${b.specialEvents.join(', ')}]` : ''}`).join('\n')
  : 'No upcoming bookings data'}

Please provide comprehensive inventory forecasting including:
1. Predicted usage for the forecast period
2. Daily breakdown of expected consumption
3. Reorder timing and quantity recommendations
4. Waste risk assessment based on shelf life

Format your response as JSON with this exact structure:
{
  "ingredientId": "Ingredient identifier",
  "predictedUsage": {
    "totalQuantity": total_predicted_units,
    "dailyBreakdown": [
      {"date": "YYYY-MM-DD", "quantity": predicted_quantity}
    ],
    "confidence": 0.0-1.0
  },
  "reorderRecommendation": {
    "shouldReorder": true/false,
    "recommendedQuantity": quantity_to_order,
    "orderDate": "YYYY-MM-DD",
    "urgency": "immediate|soon|routine"
  },
  "wasteRisk": {
    "atRisk": true/false,
    "potentialWasteQuantity": quantity_if_wasted,
    "mitigationStrategy": "How to prevent waste"
  }
}

Consider:
- Seasonal trends and day-of-week patterns
- Upcoming events and booking levels
- Perishability and shelf life constraints
- Safety stock requirements
- Supplier lead times

Balance avoiding stockouts with minimizing waste.`;

    return prompt;
  }

  protected async parseResponse(rawResponse: string, input: InventoryPredictionInput): Promise<any> {
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.predictedUsage) {
        throw new Error('Missing predicted usage');
      }

      if (!parsed.reorderRecommendation) {
        throw new Error('Missing reorder recommendation');
      }

      // Add validation rules
      this.addValidationRule({
        id: 'has_usage_prediction',
        validate: (data) => data.predictedUsage.totalQuantity > 0,
        errorMessage: 'Predicted usage must be positive',
        isCritical: true,
      });

      this.addValidationRule({
        id: 'realistic_reorder_quantity',
        validate: (data) => 
          data.reorderRecommendation.recommendedQuantity >= 0 &&
          data.reorderRecommendation.recommendedQuantity <= input.currentStock * 3,
        errorMessage: 'Reorder quantity unrealistic',
        isCritical: false,
      });

      this.addValidationRule({
        id: 'valid_urgency',
        validate: (data) => ['immediate', 'soon', 'routine'].includes(data.reorderRecommendation.urgency),
        errorMessage: 'Invalid urgency level',
        isCritical: true,
      });

      return {
        ingredientId: parsed.ingredientId || input.ingredientId,
        predictedUsage: parsed.predictedUsage,
        reorderRecommendation: parsed.reorderRecommendation,
        wasteRisk: parsed.wasteRisk || { atRisk: false, potentialWasteQuantity: 0, mitigationStrategy: '' },
      };
    } catch (error) {
      console.error('[InventoryPrediction] Failed to parse response:', error);
      throw error;
    }
  }

  /**
   * Quick inventory forecast
   */
  async forecastInventoryNeed(
    ingredientId: string,
    avgDailyUsage: number,
    forecastDays: number,
    currentStock: number
  ): Promise<{
    predictedUsage: number;
    shouldOrder: boolean;
    suggestedOrderQuantity: number;
  }> {
    const predictedUsage = avgDailyUsage * forecastDays;
    const safetyStock = avgDailyUsage * 3; // 3 days safety
    const shouldOrder = currentStock < (predictedUsage + safetyStock);
    const suggestedOrderQuantity = Math.max(0, predictedUsage + safetyStock - currentStock);

    return {
      predictedUsage,
      shouldOrder,
      suggestedOrderQuantity: Math.round(suggestedOrderQuantity),
    };
  }

  /**
   * Calculate par levels dynamically
   */
  calculateParLevels(
    avgDailyUsage: number,
    leadTimeDays: number,
    safetyStockDays: number = 3,
    orderFrequencyDays: number = 7
  ): {
    minimumPar: number;
    maximumPar: number;
    reorderPoint: number;
  } {
    const minimumPar = avgDailyUsage * (leadTimeDays + safetyStockDays);
    const maximumPar = minimumPar + (avgDailyUsage * orderFrequencyDays);
    const reorderPoint = minimumPar;

    return {
      minimumPar: Math.round(minimumPar * 10) / 10,
      maximumPar: Math.round(maximumPar * 10) / 10,
      reorderPoint: Math.round(reorderPoint * 10) / 10,
    };
  }
}
