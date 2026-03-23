// @ts-nocheck
/**
 * Recipe Costing Service
 * Calculates menu item costs, margins, and provides menu engineering insights
 */

import {
  type RecipeCostConfig,
  type RecipeCost,
  type Recipe,
  type Ingredient,
  type IngredientCost,
  type RecipeMarginAlert,
} from '../../types/recipe.js';

export interface CostCalculationInput {
  recipe: Recipe;
  ingredients: Map<string, Ingredient>;
  currentPrice: number;
  overheadRate: number; // percentage
}

export interface PriceSuggestion {
  menuItemId: string;
  currentPrice: number;
  suggestedPrice: number;
  targetFoodCostPercentage: number;
  reasoning: string;
}

export class RecipeCostingService {
  private config: RecipeCostConfig;
  private recipes: Map<string, Recipe> = new Map();
  private ingredients: Map<string, Ingredient> = new Map();
  private costCache: Map<string, RecipeCost> = new Map();
  private listeners: Set<(alert: RecipeMarginAlert) => void> = new Set();

  constructor(config: RecipeCostConfig) {
    this.config = config;
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    // Load recipes and ingredients from database
    // This would typically be done via @vayva/db
  }

  /**
   * Register a recipe
   */
  registerRecipe(recipe: Recipe): void {
    this.recipes.set(recipe.menuItemId, recipe);
    this.invalidateCache(recipe.menuItemId);
  }

  /**
   * Register an ingredient
   */
  registerIngredient(ingredient: Ingredient): void {
    this.ingredients.set(ingredient.id, ingredient);
    // Invalidate all recipes using this ingredient
    for (const [menuItemId, recipe] of this.recipes) {
      if (recipe.ingredients.some(i => i.ingredientId === ingredient.id)) {
        this.invalidateCache(menuItemId);
      }
    }
  }

  /**
   * Update ingredient price
   */
  updateIngredientPrice(
    ingredientId: string,
    newPrice: number,
    vendorId?: string
  ): void {
    const ingredient = this.ingredients.get(ingredientId);
    if (!ingredient) return;

    const oldPrice = ingredient.currentCost;
    ingredient.currentCost = newPrice;
    ingredient.priceHistory.push({
      date: new Date(),
      price: newPrice,
      vendorId,
    });

    // Determine price trend
    if (newPrice > oldPrice * 1.05) {
      // price trend is tracked in Ingredient but we don't store it separately
    }

    // Invalidate affected recipes and check for margin alerts
    for (const [menuItemId, recipe] of this.recipes) {
      if (recipe.ingredients.some(i => i.ingredientId === ingredientId)) {
        this.invalidateCache(menuItemId);
        this.checkMarginAlert(menuItemId);
      }
    }

    // Emit price change alert
    if (this.config.marginAlerts && newPrice > oldPrice) {
      this.emitAlert({
        type: 'price-increase',
        menuItemId: '', // Will be set per affected item
        message: `Ingredient ${ingredient.name} price increased from ${oldPrice} to ${newPrice}`,
        currentValue: newPrice,
        threshold: oldPrice,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Calculate recipe cost
   */
  calculateCost(menuItemId: string, currentPrice: number): RecipeCost | undefined {
    // Check cache
    const cached = this.costCache.get(menuItemId);
    if (cached && cached.currentPrice === currentPrice) {
      return cached;
    }

    const recipe = this.recipes.get(menuItemId);
    if (!recipe) return undefined;

    const ingredientCosts: IngredientCost[] = [];
    let ingredientsTotal = 0;

    for (const recipeIngredient of recipe.ingredients) {
      const ingredient = this.ingredients.get(recipeIngredient.ingredientId);
      if (!ingredient) continue;

      const unitCost = ingredient.currentCost;
      const totalCost = unitCost * recipeIngredient.quantity;

      ingredientCosts.push({
        ingredientId: ingredient.id,
        name: ingredient.name,
        quantity: recipeIngredient.quantity,
        unit: recipeIngredient.unit,
        unitCost,
        totalCost,
        vendorId: ingredient.vendorId,
        vendorName: ingredient.vendorName,
        lastPriceUpdate: ingredient.priceHistory[ingredient.priceHistory.length - 1]?.date || new Date(),
        priceTrend: this.calculatePriceTrend(ingredient),
      });

      ingredientsTotal += totalCost;
    }

    // Calculate yield-adjusted cost
    const yieldAdjustedCost = ingredientsTotal / recipe.yield;

    // Calculate labor cost
    const totalTimeMinutes = recipe.prepTimeMinutes + recipe.cookTimeMinutes;
    const laborCost = (totalTimeMinutes / 60) * this.config.laborCostPerHour;

    // Calculate overhead
    const overheadAllocation = yieldAdjustedCost * (this.config.targetFoodCostPercentage / 100);

    // Total cost
    const totalCost = yieldAdjustedCost + laborCost + overheadAllocation;

    // Calculate margins
    const margin = currentPrice - totalCost;
    const marginPercentage = (margin / currentPrice) * 100;
    const foodCostPercentage = (yieldAdjustedCost / currentPrice) * 100;

    // Calculate suggested price based on target food cost
    const suggestedPrice = yieldAdjustedCost / (this.config.targetFoodCostPercentage / 100);

    const recipeCost: RecipeCost = {
      menuItemId,
      name: recipe.name,
      ingredients: ingredientCosts,
      laborCost,
      overheadAllocation,
      totalCost,
      suggestedPrice,
      currentPrice,
      margin,
      marginPercentage,
      foodCostPercentage,
      classification: 'dog', // Will be set by menu engineering
      popularityScore: 0,
      profitabilityScore: 0,
    };

    // Cache the result
    this.costCache.set(menuItemId, recipeCost);

    return recipeCost;
  }

  /**
   * Get price suggestion for a menu item
   */
  getPriceSuggestion(menuItemId: string): PriceSuggestion | undefined {
    const recipe = this.recipes.get(menuItemId);
    if (!recipe) return undefined;

    // Get current price from external source (would be passed in or fetched)
    const currentPrice = 0; // Placeholder

    const cost = this.calculateCost(menuItemId, currentPrice);
    if (!cost) return undefined;

    const ingredientCost = cost.ingredients.reduce((sum, i) => sum + i.totalCost, 0) / recipe.yield;
    const suggestedPrice = ingredientCost / (this.config.targetFoodCostPercentage / 100);

    let reasoning = '';
    if (suggestedPrice > currentPrice * 1.1) {
      reasoning = `Price should increase by ${Math.round((suggestedPrice / currentPrice - 1) * 100)}% to achieve target food cost of ${this.config.targetFoodCostPercentage}%`;
    } else if (suggestedPrice < currentPrice * 0.9) {
      reasoning = `Price could decrease while maintaining healthy margins`;
    } else {
      reasoning = `Current price is within optimal range`;
    }

    return {
      menuItemId,
      currentPrice,
      suggestedPrice,
      targetFoodCostPercentage: this.config.targetFoodCostPercentage,
      reasoning,
    };
  }

  /**
   * Get all recipe costs
   */
  getAllRecipeCosts(currentPrices: Map<string, number>): RecipeCost[] {
    const costs: RecipeCost[] = [];

    for (const menuItemId of this.recipes.keys()) {
      const currentPrice = currentPrices.get(menuItemId) || 0;
      const cost = this.calculateCost(menuItemId, currentPrice);
      if (cost) {
        costs.push(cost);
      }
    }

    return costs;
  }

  /**
   * Get recipes by classification
   */
  getRecipesByClassification(
    classification: 'star' | 'puzzle' | 'plowhorse' | 'dog',
    currentPrices: Map<string, number>
  ): RecipeCost[] {
    return this.getAllRecipeCosts(currentPrices).filter(
      cost => cost.classification === classification
    );
  }

  /**
   * Get high food cost alerts
   */
  getHighFoodCostAlerts(threshold?: number): RecipeMarginAlert[] {
    const alerts: RecipeMarginAlert[] = [];
    const limit = threshold || this.config.targetFoodCostPercentage * 1.2;

    for (const [menuItemId, cached] of this.costCache) {
      if (cached.foodCostPercentage > limit) {
        alerts.push({
          type: 'high-food-cost',
          menuItemId,
          message: `${cached.name} has food cost of ${cached.foodCostPercentage.toFixed(1)}%, above threshold of ${limit}%`,
          currentValue: cached.foodCostPercentage,
          threshold: limit,
          timestamp: new Date(),
        });
      }

      if (cached.margin < 0) {
        alerts.push({
          type: 'negative-margin',
          menuItemId,
          message: `${cached.name} has negative margin of ${cached.margin.toFixed(2)}`,
          currentValue: cached.margin,
          threshold: 0,
          timestamp: new Date(),
        });
      }
    }

    return alerts;
  }

  /**
   * Get ingredient price trends
   */
  getIngredientPriceTrends(days: number = 30): Array<{
    ingredientId: string;
    name: string;
    priceChange: number;
    priceChangePercent: number;
    trend: 'up' | 'down' | 'stable';
  }> {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const trends = [];

    for (const [id, ingredient] of this.ingredients) {
      const recentHistory = ingredient.priceHistory.filter(p => p.date >= cutoff);
      if (recentHistory.length < 2) continue;

      const oldest = recentHistory[0].price;
      const newest = recentHistory[recentHistory.length - 1].price;
      const change = newest - oldest;
      const changePercent = (change / oldest) * 100;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (changePercent > 5) trend = 'up';
      else if (changePercent < -5) trend = 'down';

      trends.push({
        ingredientId: id,
        name: ingredient.name,
        priceChange: change,
        priceChangePercent: changePercent,
        trend,
      });
    }

    return trends.sort((a, b) => Math.abs(b.priceChangePercent) - Math.abs(a.priceChangePercent));
  }

  /**
   * Subscribe to margin alerts
   */
  subscribeToAlerts(listener: (alert: RecipeMarginAlert) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Batch update recipe costs
   */
  batchUpdateCosts(currentPrices: Map<string, number>): Map<string, RecipeCost> {
    const results = new Map<string, RecipeCost>();

    for (const menuItemId of this.recipes.keys()) {
      const currentPrice = currentPrices.get(menuItemId) || 0;
      const cost = this.calculateCost(menuItemId, currentPrice);
      if (cost) {
        results.set(menuItemId, cost);
      }
    }

    return results;
  }

  private invalidateCache(menuItemId: string): void {
    this.costCache.delete(menuItemId);
  }

  private calculatePriceTrend(ingredient: Ingredient): 'up' | 'down' | 'stable' {
    const history = ingredient.priceHistory;
    if (history.length < 2) return 'stable';

    const recent = history.slice(-3);
    const avgRecent = recent.reduce((sum, p) => sum + p.price, 0) / recent.length;
    const older = history.slice(0, Math.max(1, history.length - 3));
    const avgOlder = older.reduce((sum, p) => sum + p.price, 0) / older.length;

    const change = (avgRecent - avgOlder) / avgOlder;
    if (change > 0.05) return 'up';
    if (change < -0.05) return 'down';
    return 'stable';
  }

  private checkMarginAlert(menuItemId: string): void {
    if (!this.config.marginAlerts) return;

    const cached = this.costCache.get(menuItemId);
    if (!cached) return;

    if (cached.foodCostPercentage > this.config.targetFoodCostPercentage * 1.2) {
      this.emitAlert({
        type: 'high-food-cost',
        menuItemId,
        message: `${cached.name} food cost is ${cached.foodCostPercentage.toFixed(1)}%`,
        currentValue: cached.foodCostPercentage,
        threshold: this.config.targetFoodCostPercentage * 1.2,
        timestamp: new Date(),
      });
    }

    if (cached.margin < 0) {
      this.emitAlert({
        type: 'negative-margin',
        menuItemId,
        message: `${cached.name} has negative margin`,
        currentValue: cached.margin,
        threshold: 0,
        timestamp: new Date(),
      });
    }
  }

  private emitAlert(alert: RecipeMarginAlert): void {
    for (const listener of this.listeners) {
      try {
        listener(alert);
      } catch (error) {
        console.error('Error in recipe alert listener:', error);
      }
    }
  }
}
