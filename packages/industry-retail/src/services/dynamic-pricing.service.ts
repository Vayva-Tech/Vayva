/**
 * Dynamic Pricing AI Service
 * 
 * Provides AI-powered price optimization based on demand elasticity,
 * competition, and market conditions
 */

import { BaseAIService } from '@vayva/ai-agent';
import type { DynamicPricingResult } from '@vayva/ai-agent';

export interface DynamicPricingInput {
  /** Product identifier */
  productId: string;
  /** Current price */
  currentPrice: number;
  /** Cost basis */
  costBasis: number;
  /** Historical sales at different price points */
  priceHistory: Array<{
    price: number;
    quantitySold: number;
    period: string;
    competitorPrice?: number;
  }>;
  /** Competitor pricing */
  competitorPrices?: Array<{
    competitor: string;
    price: number;
    lastUpdated: string;
  }>;
  /** Demand indicators */
  demandIndicators?: {
    inventoryLevel: 'low' | 'normal' | 'high';
    salesVelocity: 'fast' | 'normal' | 'slow';
    seasonality: 'peak' | 'normal' | 'off_peak';
  };
  /** Pricing constraints */
  constraints?: {
    minPrice?: number;
    maxPrice?: number;
    minMargin?: number; // Minimum margin percentage
    maxDiscount?: number; // Maximum discount percentage
  };
  /** Pricing objective */
  objective?: 'maximize_revenue' | 'maximize_margin' | 'maximize_volume' | 'competitive_match';
}

export class DynamicPricingService extends BaseAIService<DynamicPricingInput, DynamicPricingResult> {
  constructor() {
    super({
      model: 'retail-analyst',
      temperature: 0.3, // Lower for precise calculations
      requireHumanValidation: true, // Price changes need approval
      confidenceThreshold: 0.8,
    });
  }

  protected async buildPrompt(input: DynamicPricingInput): Promise<string> {
    const prompt = `You are an expert pricing strategist with deep knowledge of retail economics, price elasticity, and competitive dynamics. Analyze the data and provide optimal pricing recommendations.

PRODUCT ID: ${input.productId}
CURRENT PRICE: $${input.currentPrice}
COST BASIS: $${input.costBasis}
CURRENT MARGIN: ${((input.currentPrice - input.costBasis) / input.currentPrice * 100).toFixed(1)}%
PRICING OBJECTIVE: ${input.objective || 'maximize_revenue'}

HISTORICAL PRICE PERFORMANCE:
${input.priceHistory.map(p => `- Price: $${p.price} | Sold: ${p.quantitySold} units | Period: ${p.period}${p.competitorPrice ? ` | Competitor: $${p.competitorPrice}` : ''}`).join('\n')}

COMPETITOR PRICING:
${input.competitorPrices?.length 
  ? input.competitorPrices.map(c => `- ${c.competitor}: $${c.price} (Updated: ${c.lastUpdated})`).join('\n')
  : 'No competitor data available'}

DEMAND INDICATORS:
- Inventory Level: ${input.demandIndicators?.inventoryLevel || 'normal'}
- Sales Velocity: ${input.demandIndicators?.salesVelocity || 'normal'}
- Seasonality: ${input.demandIndicators?.seasonality || 'normal'}

PRICING CONSTRAINTS:
${input.constraints?.minPrice ? `- Minimum Price: $${input.constraints.minPrice}` : ''}
${input.constraints?.maxPrice ? `- Maximum Price: $${input.constraints.maxPrice}` : ''}
${input.constraints?.minMargin ? `- Minimum Margin: ${input.constraints.minMargin}%` : ''}
${input.constraints?.maxDiscount ? `- Maximum Discount: ${input.constraints.maxDiscount}%` : ''}

Please provide a comprehensive pricing analysis including:
1. Optimal recommended price with confidence score
2. Price elasticity analysis
3. Competitive positioning assessment
4. Expected impact on revenue, volume, and margin
5. Strategic pricing recommendations

Format your response as JSON with this exact structure:
{
  "productId": "Product identifier",
  "currentPrice": current_price,
  "recommendedPrice": {
    "amount": recommended_price,
    "changePercent": percent_change,
    "confidence": 0.0-1.0
  },
  "elasticity": {
    "coefficient": price_elasticity_coefficient,
    "interpretation": "elastic|inelastic|unit_elastic",
    "priceSensitivity": "high|medium|low"
  },
  "competitivePosition": {
    "marketAverage": average_market_price,
    "position": "below_market|at_market|above_market",
    "recommendedStrategy": "undercut|match|premium"
  },
  "impact": {
    "projectedRevenueChange": percent_change,
    "projectedVolumeChange": percent_change,
    "projectedMarginChange": percent_change
  }
}

Consider:
- Price elasticity from historical data
- Competitive landscape
- Psychological pricing ($X.99 vs $X.00)
- Brand positioning implications
- Short-term vs long-term effects
- Inventory turnover objectives

Ensure recommended price respects all constraints.`;

    return prompt;
  }

  protected async parseResponse(rawResponse: string, input: DynamicPricingInput): Promise<DynamicPricingResult> {
    try {
      // Extract JSON from response
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.recommendedPrice) {
        throw new Error('Missing recommended price');
      }

      if (!parsed.elasticity) {
        throw new Error('Missing elasticity analysis');
      }

      // Add validation rules
      this.addValidationRule({
        id: 'valid_price_recommendation',
        validate: (data) => data.recommendedPrice.amount > 0,
        errorMessage: 'Recommended price must be positive',
        isCritical: true,
      });

      this.addValidationRule({
        id: 'respects_min_constraint',
        validate: (data) => {
          if (!input.constraints?.minPrice) return true;
          return data.recommendedPrice.amount >= input.constraints.minPrice;
        },
        errorMessage: 'Recommended price below minimum constraint',
        isCritical: true,
      });

      this.addValidationRule({
        id: 'respects_max_constraint',
        validate: (data) => {
          if (!input.constraints?.maxPrice) return true;
          return data.recommendedPrice.amount <= input.constraints.maxPrice;
        },
        errorMessage: 'Recommended price above maximum constraint',
        isCritical: true,
      });

      this.addValidationRule({
        id: 'maintains_min_margin',
        validate: (data) => {
          if (!input.constraints?.minMargin) return true;
          const margin = ((data.recommendedPrice.amount - input.costBasis) / data.recommendedPrice.amount) * 100;
          return margin >= input.constraints.minMargin;
        },
        errorMessage: 'Recommended price does not maintain minimum margin',
        isCritical: true,
      });

      this.addValidationRule({
        id: 'has_elasticity_analysis',
        validate: (data) => ['elastic', 'inelastic', 'unit_elastic'].includes(data.elasticity.interpretation),
        errorMessage: 'Invalid elasticity interpretation',
        isCritical: true,
      });

      this.addValidationRule({
        id: 'has_competitive_analysis',
        validate: (data) => ['below_market', 'at_market', 'above_market'].includes(data.competitivePosition.position),
        errorMessage: 'Invalid competitive position',
        isCritical: false,
      });

      this.addValidationRule({
        id: 'reasonable_confidence',
        validate: (data) => 
          data.recommendedPrice.confidence >= 0.5 &&
          data.recommendedPrice.confidence <= 1.0,
        errorMessage: 'Confidence score must be between 0.5 and 1.0',
        isCritical: false,
      });

      return {
        productId: parsed.productId || input.productId,
        currentPrice: parsed.currentPrice || input.currentPrice,
        recommendedPrice: parsed.recommendedPrice,
        elasticity: parsed.elasticity,
        competitivePosition: parsed.competitivePosition || {
          marketAverage: input.currentPrice,
          position: 'at_market',
          recommendedStrategy: 'match',
        },
        impact: parsed.impact || {
          projectedRevenueChange: 0,
          projectedVolumeChange: 0,
          projectedMarginChange: 0,
        },
      };
    } catch (error) {
      console.error('[DynamicPricing] Failed to parse response:', error);
      throw new Error(`Failed to parse pricing recommendation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get optimal price recommendation
   */
  async getOptimalPrice(
    productId: string,
    currentPrice: number,
    costBasis: number,
    priceHistory: DynamicPricingInput['priceHistory'],
    objective?: DynamicPricingInput['objective']
  ): Promise<DynamicPricingResult> {
    await this.initialize();
    
    return this.execute({
      productId,
      currentPrice,
      costBasis,
      priceHistory,
      objective,
    });
  }

  /**
   * Calculate price elasticity from historical data
   */
  calculatePriceElasticity(
    priceHistory: Array<{ price: number; quantitySold: number }>
  ): { coefficient: number; interpretation: string } {
    if (priceHistory.length < 2) {
      return { coefficient: -1, interpretation: 'insufficient_data' };
    }

    // Simple elasticity calculation using midpoint method
    const sorted = [...priceHistory].sort((a, b) => a.price - b.price);
    const p1 = sorted[0];
    const p2 = sorted[sorted.length - 1];

    const priceChange = p2.price - p1.price;
    const avgPrice = (p1.price + p2.price) / 2;
    const quantityChange = p2.quantitySold - p1.quantitySold;
    const avgQuantity = (p1.quantitySold + p2.quantitySold) / 2;

    const priceChangePercent = priceChange / avgPrice;
    const quantityChangePercent = quantityChange / avgQuantity;

    const elasticity = quantityChangePercent / priceChangePercent;

    let interpretation = 'unit_elastic';
    if (Math.abs(elasticity) > 1) {
      interpretation = 'elastic';
    } else if (Math.abs(elasticity) < 1) {
      interpretation = 'inelastic';
    }

    return { coefficient: elasticity, interpretation };
  }

  /**
   * Competitive price matching strategy
   */
  async competitivePricingStrategy(
    currentPrice: number,
    competitorPrices: number[],
    strategy: 'undercut' | 'match' | 'premium' = 'match'
  ): Promise<{
    recommendedPrice: number;
    position: string;
    rationale: string;
  }> {
    const avgCompetitorPrice = competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length;
    const lowestCompetitorPrice = Math.min(...competitorPrices);
    
    let recommendedPrice = currentPrice;
    let position = '';
    let rationale = '';

    switch (strategy) {
      case 'undercut':
        recommendedPrice = lowestCompetitorPrice * 0.95; // 5% below lowest
        position = 'Price leader';
        rationale = 'Undercut all competitors by 5% to gain market share';
        break;
      
      case 'match':
        recommendedPrice = avgCompetitorPrice;
        position = 'Market average';
        rationale = 'Match market average to remain competitive';
        break;
      
      case 'premium':
        recommendedPrice = currentPrice > avgCompetitorPrice ? currentPrice : avgCompetitorPrice * 1.1;
        position = 'Premium positioning';
        rationale = 'Maintain or establish premium positioning above market average';
        break;
    }

    return {
      recommendedPrice: Math.round(recommendedPrice * 100) / 100,
      position,
      rationale,
    };
  }

  /**
   * Markdown optimization for clearance
   */
  async optimizeMarkdown(
    currentPrice: number,
    costBasis: number,
    inventoryAge: number, // days
    targetRecoveryRate: number = 0.7 // Target to recover 70% of cost
  ): Promise<{
    originalPrice: number;
    recommendedMarkdown: number;
    finalPrice: number;
    discountPercent: number;
    expectedRecovery: number;
    rationale: string;
  }> {
    const minPrice = costBasis * targetRecoveryRate;
    const maxDiscount = ((currentPrice - minPrice) / currentPrice) * 100;
    
    // Age-based markdown optimization
    let discountPercent = 0;
    
    if (inventoryAge > 90) {
      discountPercent = Math.min(maxDiscount, 50); // Aggressive clearance
    } else if (inventoryAge > 60) {
      discountPercent = Math.min(maxDiscount, 30); // Moderate markdown
    } else if (inventoryAge > 30) {
      discountPercent = Math.min(maxDiscount, 20); // Light promotion
    } else {
      discountPercent = Math.min(maxDiscount, 10); // Minor adjustment
    }

    const finalPrice = currentPrice * (1 - discountPercent / 100);
    const expectedRecovery = (finalPrice - costBasis) / costBasis;

    return {
      originalPrice: currentPrice,
      recommendedMarkdown: currentPrice - finalPrice,
      finalPrice: Math.round(finalPrice * 100) / 100,
      discountPercent: Math.round(discountPercent),
      expectedRecovery: Math.round(expectedRecovery * 100),
      rationale: `Inventory age (${inventoryAge} days) suggests ${discountPercent}% discount to balance recovery and velocity`,
    };
  }
}
