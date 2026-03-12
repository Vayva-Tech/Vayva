/**
 * Recipe Costing Engine
 * 
 * Manages recipe costs, margins, and pricing optimization:
 * - Ingredient cost tracking
 * - Portion cost calculation
 * - Margin analysis
 * - Price optimization suggestions
 */

import { Recipe, MenuItem } from '../types';

export class RecipeCostingService {
  private recipes: Map<string, Recipe>;
  private ingredients: Map<string, { id: string; name: string; costPerUnit: number; unit: string }>;

  constructor() {
    this.recipes = new Map();
    this.ingredients = new Map();
  }

  // ============================================================================
  // INGREDIENT MANAGEMENT
  // ============================================================================

  /**
   * Update ingredient costs
   */
  updateIngredientCost(ingredientId: string, costPerUnit: number): void {
    const ingredient = this.ingredients.get(ingredientId);
    if (!ingredient) return;

    ingredient.costPerUnit = costPerUnit;
    this.ingredients.set(ingredientId, ingredient);

    // Recalculate all recipes using this ingredient
    this.recalculateRecipesWithIngredient(ingredientId);
  }

  /**
   * Set ingredient inventory
   */
  setIngredients(ingredients: Array<{ id: string; name: string; costPerUnit: number; unit: string }>): void {
    ingredients.forEach((ing) => {
      this.ingredients.set(ing.id, ing);
    });
  }

  // ============================================================================
  // RECIPE MANAGEMENT
  // ============================================================================

  /**
   * Create or update recipe
   */
  setRecipe(recipe: Recipe): void {
    this.recipes.set(recipe.id, recipe);
  }

  /**
   * Get recipe by ID
   */
  getRecipe(recipeId: string): Recipe | undefined {
    return this.recipes.get(recipeId);
  }

  /**
   * Get all recipes
   */
  getAllRecipes(): Recipe[] {
    return Array.from(this.recipes.values());
  }

  // ============================================================================
  // COST CALCULATION
  // ============================================================================

  /**
   * Calculate recipe cost
   */
  calculateRecipeCost(recipe: Recipe): {
    totalCost: number;
    costPerPortion: number;
    breakdown: Array<{ name: string; cost: number; percentage: number }>;
  } {
    const ingredientCosts = recipe.ingredients.map((ing) => {
      const ingredientData = this.ingredients.get(ing.itemId);
      const cost = ingredientData ? ing.quantity * ingredientData.costPerUnit : ing.cost;
      
      return {
        name: ing.name,
        cost,
      };
    });

    const totalCost = ingredientCosts.reduce((sum, ic) => sum + ic.cost, 0);
    const costPerPortion = recipe.yield > 0 ? totalCost / recipe.yield : 0;

    const breakdown = ingredientCosts.map((ic) => ({
      ...ic,
      percentage: totalCost > 0 ? (ic.cost / totalCost) * 100 : 0,
    }));

    return {
      totalCost: Math.round(totalCost * 100) / 100,
      costPerPortion: Math.round(costPerPortion * 100) / 100,
      breakdown,
    };
  }

  /**
   * Update recipe costs based on current ingredient prices
   */
  recalculateRecipesWithIngredient(ingredientId: string): void {
    this.recipes.forEach((recipe) => {
      const usesIngredient = recipe.ingredients.some((ing) => ing.itemId === ingredientId);
      if (!usesIngredient) return;

      // Recalculate total cost
      const { totalCost, costPerPortion } = this.calculateRecipeCost(recipe);
      recipe.totalCost = totalCost;
      recipe.costPerPortion = costPerPortion;

      // Update suggested price
      recipe.suggestedPrice = this.calculateSuggestedPrice(
        costPerPortion,
        recipe.targetFoodCostPercentage
      );

      this.recipes.set(recipe.id, recipe);
    });
  }

  // ============================================================================
  // MARGIN ANALYSIS
  // ============================================================================

  /**
   * Analyze menu item margins
   */
  analyzeMenuItemMargin(menuItem: MenuItem): {
    revenue: number;
    cost: number;
    margin: number;
    marginPercentage: number;
    foodCostPercentage: number;
    isProfitable: boolean;
    targetMet: boolean;
  } {
    const recipe = this.recipes.get(menuItem.id);
    const cost = recipe ? recipe.costPerPortion : menuItem.cost;
    const revenue = menuItem.price;
    const margin = revenue - cost;
    const marginPercentage = revenue > 0 ? (margin / revenue) * 100 : 0;
    const foodCostPercentage = revenue > 0 ? (cost / revenue) * 100 : 0;

    return {
      revenue,
      cost,
      margin: Math.round(margin * 100) / 100,
      marginPercentage: Math.round(marginPercentage * 10) / 10,
      foodCostPercentage: Math.round(foodCostPercentage * 10) / 10,
      isProfitable: margin > 0,
      targetMet: foodCostPercentage <= 35, // Typical target
    };
  }

  /**
   * Get low margin items
   */
  getLowMarginItems(items: MenuItem[], thresholdPercentage: number = 30): Array<{
    item: MenuItem;
    marginAnalysis: ReturnType<typeof this.analyzeMenuItemMargin>;
    suggestion: string;
  }> {
    return items
      .map((item) => {
        const analysis = this.analyzeMenuItemMargin(item);
        return { item, marginAnalysis: analysis };
      })
      .filter(({ marginAnalysis }) => marginAnalysis.foodCostPercentage > thresholdPercentage)
      .map(({ item, marginAnalysis }) => ({
        item,
        marginAnalysis,
        suggestion: this.generatePricingSuggestion(item, marginAnalysis),
      }));
  }

  // ============================================================================
  // PRICE OPTIMIZATION
  // ============================================================================

  /**
   * Calculate suggested price based on target food cost
   */
  calculateSuggestedPrice(costPerPortion: number, targetFoodCostPercentage: number): number {
    if (targetFoodCostPercentage <= 0 || targetFoodCostPercentage > 100) {
      targetFoodCostPercentage = 30; // Default target
    }

    const suggestedPrice = costPerPortion / (targetFoodCostPercentage / 100);
    return Math.round(suggestedPrice * 100) / 100;
  }

  /**
   * Generate pricing suggestions for menu items
   */
  generatePricingSuggestion(
    menuItem: MenuItem,
    marginAnalysis: ReturnType<typeof this.analyzeMenuItemMargin>
  ): string {
    const { foodCostPercentage, margin } = marginAnalysis;

    if (foodCostPercentage > 40) {
      const suggestedPrice = this.calculateSuggestedPrice(menuItem.cost, 30);
      const increase = suggestedPrice - menuItem.price;
      return `Increase price to $${suggestedPrice.toFixed(2)} (+${increase.toFixed(2)}) to achieve 30% food cost`;
    } else if (foodCostPercentage > 35) {
      const suggestedPrice = this.calculateSuggestedPrice(menuItem.cost, 30);
      const increase = suggestedPrice - menuItem.price;
      return `Consider increasing price to $${suggestedPrice.toFixed(2)} (+${increase.toFixed(2)})`;
    } else if (margin < 5) {
      return `Low margin item. Review portion sizes or negotiate better ingredient costs`;
    } else {
      return 'Pricing is healthy';
    }
  }

  /**
   * Optimize menu pricing across all items
   */
  optimizeMenuPricing(items: MenuItem[], targetFoodCostPercentage: number = 30): Array<{
    itemId: string;
    name: string;
    currentPrice: number;
    suggestedPrice: number;
    impact: string;
  }> {
    return items.map((item) => {
      const recipe = this.recipes.get(item.id);
      const cost = recipe ? recipe.costPerPortion : item.cost;
      const suggestedPrice = this.calculateSuggestedPrice(cost, targetFoodCostPercentage);
      const difference = suggestedPrice - item.price;
      const percentageChange = item.price > 0 ? (difference / item.price) * 100 : 0;

      return {
        itemId: item.id,
        name: item.name,
        currentPrice: item.price,
        suggestedPrice,
        impact: `${difference >= 0 ? '+' : ''}${percentageChange.toFixed(1)}%`,
      };
    });
  }

  // ============================================================================
  // MENU ENGINEERING
  // ============================================================================

  /**
   * Classify menu items using menu engineering matrix
   */
  engineerMenu(items: MenuItem[]): Array<{
    item: MenuItem;
    classification: 'star' | 'plowhorse' | 'puzzle' | 'dog';
    action: string;
  }> {
    // Calculate averages
    const avgPopularity = items.reduce((sum, item) => sum + (item.popularity || 0), 0) / items.length;
    const avgMargin = items.reduce((sum, item) => {
      const analysis = this.analyzeMenuItemMargin(item);
      return sum + analysis.margin;
    }, 0) / items.length;

    return items.map((item) => {
      const analysis = this.analyzeMenuItemMargin(item);
      const popularity = item.popularity || 50; // Default if not set

      let classification: 'star' | 'plowhorse' | 'puzzle' | 'dog';
      let action: string;

      if (popularity >= avgPopularity && analysis.margin >= avgMargin) {
        classification = 'star';
        action = 'Maintain quality and prominence';
      } else if (popularity >= avgPopularity && analysis.margin < avgMargin) {
        classification = 'plowhorse';
        action = 'Increase price gradually or reduce portion size';
      } else if (popularity < avgPopularity && analysis.margin >= avgMargin) {
        classification = 'puzzle';
        action = 'Promote more prominently or rename for appeal';
      } else {
        classification = 'dog';
        action = 'Consider removing or reengineering recipe';
      }

      return { item, classification, action };
    });
  }

  // ============================================================================
  // COST TREND ANALYSIS
  // ============================================================================

  /**
   * Track cost changes over time
   */
  trackCostChanges(recipeId: string, historicalCosts: Array<{ date: Date; cost: number }>): {
    trend: 'increasing' | 'decreasing' | 'stable';
    percentageChange: number;
    projectedCost: number;
  } {
    if (historicalCosts.length < 2) {
      return { trend: 'stable', percentageChange: 0, projectedCost: 0 };
    }

    const oldest = historicalCosts[0].cost;
    const newest = historicalCosts[historicalCosts.length - 1].cost;
    const change = ((newest - oldest) / oldest) * 100;

    let trend: 'increasing' | 'decreasing' | 'stable';
    if (change > 5) trend = 'increasing';
    else if (change < -5) trend = 'decreasing';
    else trend = 'stable';

    // Simple linear projection
    const avgChange = change / historicalCosts.length;
    const projectedCost = newest * (1 + avgChange / 100);

    return {
      trend,
      percentageChange: Math.round(change * 10) / 10,
      projectedCost: Math.round(projectedCost * 100) / 100,
    };
  }

  /**
   * Identify recipes at risk due to ingredient cost increases
   */
  identifyAtRiskRecipes(thresholdPercentage: number = 10): Array<{
    recipe: Recipe;
    currentCost: number;
    projectedCost: number;
    impact: string;
  }> {
    const atRisk: Array<{
      recipe: Recipe;
      currentCost: number;
      projectedCost: number;
      impact: string;
    }> = [];

    this.recipes.forEach((recipe) => {
      // Check each ingredient for cost increases
      recipe.ingredients.forEach((ing) => {
        const ingredientData = this.ingredients.get(ing.itemId);
        if (!ingredientData) return;

        // Simulated check (would use historical data)
        const projectedCost = ingredientData.costPerUnit * 1.1; // 10% increase
        const costIncrease = (projectedCost - ingredientData.costPerUnit) * ing.quantity;

        if ((costIncrease / recipe.totalCost) * 100 > thresholdPercentage) {
          atRisk.push({
            recipe,
            currentCost: recipe.totalCost,
            projectedCost: recipe.totalCost + costIncrease,
            impact: `${ingredientData.name} cost increase will raise recipe cost by $${costIncrease.toFixed(2)}`,
          });
        }
      });
    });

    return atRisk;
  }
}

// Export singleton instance
export const recipeCostingService = new RecipeCostingService();
