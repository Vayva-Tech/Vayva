/**
 * Recipe Optimization AI Service
 * 
 * Provides AI-powered recipe cost optimization, menu engineering analysis,
 * and profitability recommendations
 */

import { BaseAIService } from '@vayva/ai-agent';
import type { RecipeOptimizationResult } from '@vayva/ai-agent';

export interface RecipeOptimizationInput {
  /** Recipe identifier */
  recipeId: string;
  /** Recipe name */
  recipeName: string;
  /** Current ingredients with costs */
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
    costPerUnit: number;
    supplier?: string;
  }>;
  /** Selling price */
  sellingPrice: number;
  /** Portion size */
  portions: number;
  /** Category */
  category: 'appetizer' | 'main' | 'dessert' | 'beverage' | 'side';
  /** Sales data */
  salesData?: {
    averageDailySales: number;
    popularityRank?: number;
    customerRating?: number;
  };
  /** Optimization goals */
  goals?: {
    targetFoodCostPercent?: number;
    targetMarginPercent?: number;
    costReductionPriority?: 'ingredients' | 'supplier' | 'portion';
  };
}

export class RecipeOptimizationService extends BaseAIService<RecipeOptimizationInput, RecipeOptimizationResult> {
  constructor() {
    super({
      model: 'culinary-analyst',
      temperature: 0.5, // Moderate for creative optimization
      requireHumanValidation: true, // Recipe changes need chef approval
      confidenceThreshold: 0.75,
    });
  }

  protected async buildPrompt(input: RecipeOptimizationInput): Promise<string> {
    const totalIngredientCost = input.ingredients.reduce(
      (sum, ing) => sum + (ing.quantity * ing.costPerUnit),
      0
    );
    const costPerPortion = totalIngredientCost / input.portions;
    const currentFoodCostPercent = (costPerPortion / input.sellingPrice) * 100;
    const currentMarginPercent = ((input.sellingPrice - costPerPortion) / input.sellingPrice) * 100;

    const prompt = `You are an expert culinary consultant specializing in recipe cost optimization and menu engineering. Analyze this recipe and provide actionable optimization recommendations.

RECIPE INFORMATION:
- Name: ${input.recipeName}
- Category: ${input.category}
- Portions: ${input.portions}
- Selling Price: $${input.sellingPrice}

CURRENT COST BREAKDOWN:
${input.ingredients.map(ing => `- ${ing.name}: ${ing.quantity}${ing.unit} @ $${ing.costPerUnit}/${ing.unit} = $${(ing.quantity * ing.costPerUnit).toFixed(2)}`).join('\n')}

COST ANALYSIS:
- Total Ingredient Cost: $${totalIngredientCost.toFixed(2)}
- Cost Per Portion: $${costPerPortion.toFixed(2)}
- Current Food Cost: ${currentFoodCostPercent.toFixed(1)}%
- Current Margin: ${currentMarginPercent.toFixed(1)}%
${input.salesData ? `\nSALES PERFORMANCE:\n- Average Daily Sales: ${input.salesData.averageDailySales}\n${input.salesData.popularityRank ? `- Popularity Rank: #${input.salesData.popularityRank}` : ''}\n${input.salesData.customerRating ? `- Customer Rating: ${input.salesData.customerRating}/5` : ''}` : ''}
${input.goals?.targetFoodCostPercent ? `\nOPTIMIZATION TARGETS:\n- Target Food Cost: ${input.goals.targetFoodCostPercent}%\n- Target Margin: ${input.goals.targetMarginPercent || (100 - input.goals.targetFoodCostPercent)}%` : ''}

Please provide comprehensive recipe optimization including:
1. Detailed cost breakdown by ingredient
2. Optimization opportunities (substitutions, portion adjustments, supplier changes)
3. Menu engineering classification (star/plowhorse/puzzle/dog)
4. Profitability improvement recommendations

Format your response as JSON with this exact structure:
{
  "recipeId": "Recipe identifier",
  "currentCost": {
    "totalCost": total_cost,
    "costPerServing": cost_per_serving,
    "ingredientCosts": [
      {"ingredient": "name", "cost": cost}
    ]
  },
  "optimizations": [
    {
      "type": "ingredient_substitution|portion_adjustment|supplier_change",
      "description": "What to change",
      "costSavings": savings_amount,
      "qualityImpact": "positive|neutral|negative",
      "implementationDifficulty": "easy|moderate|difficult"
    }
  ],
  "marginAnalysis": {
    "currentMargin": current_margin_percent,
    "optimizedMargin": optimized_margin_percent,
    "targetMargin": target_margin_percent
  },
  "menuEngineering": {
    "category": "star|plowhorse|puzzle|dog",
    "popularity": popularity_score,
    "profitability": profitability_score,
    "recommendations": ["Recommendation 1", "Recommendation 2"]
  }
}

Consider:
- Ingredient quality and customer satisfaction impact
- Seasonal availability and pricing
- Preparation time and labor costs
- Cross-utilization with other menu items
- Dietary trends and preferences

Provide practical, implementable suggestions that maintain or improve quality.`;

    return prompt;
  }

  protected async parseResponse(rawResponse: string, input: RecipeOptimizationInput): Promise<RecipeOptimizationResult> {
    try {
      // Extract JSON from response
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.currentCost) {
        throw new Error('Missing current cost breakdown');
      }

      if (!parsed.menuEngineering) {
        throw new Error('Missing menu engineering analysis');
      }

      // Add validation rules
      this.addValidationRule({
        id: 'has_cost_breakdown',
        validate: (data) => data.currentCost.ingredientCosts.length > 0,
        errorMessage: 'No ingredient cost breakdown provided',
        isCritical: true,
      });

      this.addValidationRule({
        id: 'has_optimizations',
        validate: (data) => data.optimizations.length > 0,
        errorMessage: 'No optimization recommendations provided',
        isCritical: false,
      });

      this.addValidationRule({
        id: 'valid_menu_category',
        validate: (data) => ['star', 'plowhorse', 'puzzle', 'dog'].includes(data.menuEngineering.category),
        errorMessage: 'Invalid menu engineering category',
        isCritical: true,
      });

      this.addValidationRule({
        id: 'realistic_savings',
        validate: (data) => 
          data.optimizations.every(opt => 
            opt.costSavings >= 0 && 
            opt.costSavings <= data.currentCost.totalCost * 0.5
          ),
        errorMessage: 'Cost savings estimates unrealistic',
        isCritical: false,
      });

      return {
        recipeId: parsed.recipeId || input.recipeId,
        currentCost: parsed.currentCost,
        optimizations: parsed.optimizations || [],
        marginAnalysis: parsed.marginAnalysis || {
          currentMargin: 0,
          optimizedMargin: 0,
          targetMargin: input.goals?.targetMarginPercent || 0,
        },
        menuEngineering: parsed.menuEngineering,
      };
    } catch (error) {
      console.error('[RecipeOptimization] Failed to parse response:', error);
      throw new Error(`Failed to parse recipe optimization: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Quick recipe cost analysis
   */
  async analyzeRecipeCost(
    recipeId: string,
    ingredients: RecipeOptimizationInput['ingredients'],
    sellingPrice: number,
    portions: number
  ): Promise<{
    totalCost: number;
    costPerPortion: number;
    foodCostPercent: number;
    marginPercent: number;
    recommendedPrice?: number;
  }> {
    const totalCost = ingredients.reduce(
      (sum, ing) => sum + (ing.quantity * ing.costPerUnit),
      0
    );
    const costPerPortion = totalCost / portions;
    const foodCostPercent = (costPerPortion / sellingPrice) * 100;
    const marginPercent = 100 - foodCostPercent;

    // Recommend price if food cost is too high (>35%)
    let recommendedPrice: number | undefined;
    if (foodCostPercent > 35) {
      const targetFoodCost = 30; // Target 30% food cost
      recommendedPrice = (costPerPortion / targetFoodCost) * 100;
    }

    return {
      totalCost,
      costPerPortion,
      foodCostPercent,
      marginPercent,
      recommendedPrice,
    };
  }

  /**
   * Menu engineering matrix placement
   */
  classifyMenuItem(
    popularity: number, // 1-10 scale
    profitability: number, // 1-10 scale
    category?: string
  ): {
    category: 'star' | 'plowhorse' | 'puzzle' | 'dog';
    characteristics: string;
    strategy: string;
  } {
    const avgPopularity = 5;
    const avgProfitability = 5;

    let categoryResult: 'star' | 'plowhorse' | 'puzzle' | 'dog';
    let characteristics = '';
    let strategy = '';

    if (popularity >= avgPopularity && profitability >= avgProfitability) {
      categoryResult = 'star';
      characteristics = 'High popularity, high profitability';
      strategy = 'Maintain quality, promote heavily, protect from competition';
    } else if (popularity >= avgPopularity && profitability < avgProfitability) {
      categoryResult = 'plowhorse';
      characteristics = 'High popularity, low profitability';
      strategy = 'Increase price carefully, reduce portion, or reposition';
    } else if (popularity < avgPopularity && profitability >= avgProfitability) {
      categoryResult = 'puzzle';
      characteristics = 'Low popularity, high profitability';
      strategy = 'Promote more, rename, reposition, or feature on menu';
    } else {
      categoryResult = 'dog';
      characteristics = 'Low popularity, low profitability';
      strategy = 'Remove from menu, reengineer recipe, or replace';
    }

    return {
      category: categoryResult,
      characteristics,
      strategy,
    };
  }

  /**
   * Ingredient substitution recommender
   */
  async recommendSubstitutions(
    ingredient: string,
    currentCost: number,
    constraints?: {
      mustBeGlutenFree?: boolean;
      mustBeVegan?: boolean;
      mustBeLocal?: boolean;
      maxCostIncrease?: number; // percentage
    }
  ): Promise<Array<{
    substitute: string;
    costDifference: number;
    qualityImpact: 'positive' | 'neutral' | 'negative';
    notes: string;
  }>> {
    // This would integrate with ingredient databases in production
    // For now, provides structured guidance
    
    const substitutions: Array<{
      substitute: string;
      costDifference: number;
      qualityImpact: 'positive' | 'neutral' | 'negative';
      notes: string;
    }> = [];

    // Example logic (would be enhanced with actual ingredient database)
    if (ingredient.toLowerCase().includes('cream')) {
      substitutions.push({
        substitute: 'Coconut cream (vegan alternative)',
        costDifference: currentCost * 0.1, // 10% increase
        qualityImpact: 'neutral',
        notes: 'Suitable for vegan menus, slight coconut flavor',
      });
    }

    if (ingredient.toLowerCase().includes('beef') && !constraints?.mustBeVegan) {
      substitutions.push({
        substitute: 'Alternative cut or supplier',
        costDifference: currentCost * -0.15, // 15% savings
        qualityImpact: 'neutral',
        notes: 'Source from different supplier or use alternative cut',
      });
    }

    return substitutions;
  }
}
