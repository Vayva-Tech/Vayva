/**
 * Food/Grocery Industry Engine
 */

import { DashboardEngine, type DashboardEngineConfig } from '@vayva/industry-core';
import { FOOD_GROCERY_DASHBOARD_CONFIG } from './dashboard/index.js';
import { RecipeOptimizationService, type RecipeOptimizationInput } from './services/recipe-optimization.service.js';
import { AIMenuEngineeringService, type MenuEngineeringInput } from './services/menu-engineering-ai.service.js';
import { InventoryPredictionService, type InventoryPredictionInput } from './services/inventory-prediction.service.js';

export interface FoodGroceryEngineConfig {
  inventory?: boolean;
  expirationTracking?: boolean;
  supplierManagement?: boolean;
  nutritionInfo?: boolean;
  aiRecipeOptimization?: boolean;
  aiMenuEngineering?: boolean;
  aiInventoryPrediction?: boolean;
}

export type FoodGroceryFeatureId = 'inventory' | 'expiration-tracking' | 'supplier-management' | 'nutrition-info' | 'ai-recipe-optimization' | 'ai-menu-engineering' | 'ai-inventory-prediction';

export class FoodGroceryEngine {
  private dashboardEngine: DashboardEngine;
  private config: FoodGroceryEngineConfig;
  private status: { initialized: boolean; activeFeatures: FoodGroceryFeatureId[]; dashboardReady: boolean; servicesReady: boolean };
  
  // AI Services
  private recipeOptimizationService: RecipeOptimizationService | null = null;
  private menuEngineeringService: AIMenuEngineeringService | null = null;
  private inventoryPredictionService: InventoryPredictionService | null = null;

  constructor(config: FoodGroceryEngineConfig = {}) {
    this.config = { 
      inventory: true, 
      expirationTracking: true, 
      supplierManagement: true, 
      nutritionInfo: true,
      aiRecipeOptimization: false,
      aiMenuEngineering: false,
      aiInventoryPrediction: false,
      ...config 
    };
    this.dashboardEngine = new DashboardEngine();
    this.dashboardEngine.setConfig(FOOD_GROCERY_DASHBOARD_CONFIG);
    this.status = { initialized: false, activeFeatures: [], dashboardReady: false, servicesReady: false };
  }

  async initialize(): Promise<void> {
    Object.entries(this.config).forEach(([key, value]) => { 
      if (value) this.status.activeFeatures.push(key as FoodGroceryFeatureId); 
    });
    
    // Initialize AI services if enabled
    await this.initializeAIServices();
    
    this.status.servicesReady = true; 
    this.status.initialized = true; 
    this.status.dashboardReady = true;
    this.registerDataResolvers();
    console.log(`[FOOD_GROCERY_ENGINE] Initialized with ${this.status.activeFeatures.length} features`);
  }
  
  private async initializeAIServices(): Promise<void> {
    if (this.config.aiRecipeOptimization) {
      this.recipeOptimizationService = new RecipeOptimizationService();
      await this.recipeOptimizationService.initialize();
      console.log('[FOOD_GROCERY_ENGINE] AI Recipe Optimization service initialized');
    }
    
    if (this.config.aiMenuEngineering) {
      this.menuEngineeringService = new AIMenuEngineeringService();
      await this.menuEngineeringService.initialize();
      console.log('[FOOD_GROCERY_ENGINE] AI Menu Engineering service initialized');
    }
    
    if (this.config.aiInventoryPrediction) {
      this.inventoryPredictionService = new InventoryPredictionService();
      await this.inventoryPredictionService.initialize();
      console.log('[FOOD_GROCERY_ENGINE] AI Inventory Prediction service initialized');
    }
  }

  getDashboardEngine(): DashboardEngine { return this.dashboardEngine; }
  getStatus() { return { ...this.status }; }
  getActiveFeatures(): FoodGroceryFeatureId[] { return [...this.status.activeFeatures]; }
  isFeatureAvailable(featureId: FoodGroceryFeatureId): boolean { return this.status.activeFeatures.includes(featureId); }
  
  // AI Service Accessors
  getRecipeOptimizationService(): RecipeOptimizationService | null { 
    if (!this.recipeOptimizationService) {
      console.warn('[FOOD_GROCERY_ENGINE] AI Recipe Optimization not enabled. Enable aiRecipeOptimization in config.');
    }
    return this.recipeOptimizationService; 
  }
  
  getMenuEngineeringService(): AIMenuEngineeringService | null { 
    if (!this.menuEngineeringService) {
      console.warn('[FOOD_GROCERY_ENGINE] AI Menu Engineering not enabled. Enable aiMenuEngineering in config.');
    }
    return this.menuEngineeringService; 
  }
  
  getInventoryPredictionService(): InventoryPredictionService | null { 
    if (!this.inventoryPredictionService) {
      console.warn('[FOOD_GROCERY_ENGINE] AI Inventory Prediction not enabled. Enable aiInventoryPrediction in config.');
    }
    return this.inventoryPredictionService; 
  }
  
  async dispose(): Promise<void> {
    // Cleanup AI services if needed
    this.recipeOptimizationService = null;
    this.menuEngineeringService = null;
    this.inventoryPredictionService = null;
  }

  private registerDataResolvers(): void {
    this.dashboardEngine.registerDataResolver('static', { resolve: async (c, ctx) => ({ widgetId: c.query || 'static', data: c.params || {}, cachedAt: new Date() }) });
    this.dashboardEngine.registerDataResolver('entity', { resolve: async (c, ctx) => ({ widgetId: c.entity || 'entity', data: { entity: c.entity, filter: c.filter, storeId: ctx.storeId }, cachedAt: new Date() }) });
    this.dashboardEngine.registerDataResolver('analytics', { resolve: async (c, ctx) => ({ widgetId: c.query || 'analytics', data: { query: c.query, params: c.params, storeId: ctx.storeId }, cachedAt: new Date() }) });
    this.dashboardEngine.registerDataResolver('realtime', { resolve: async (c, ctx) => ({ widgetId: c.channel || 'realtime', data: { channel: c.channel, storeId: ctx.storeId }, cachedAt: new Date() }) });
  }
}

export class FoodGroceryEngineFactory {
  static create(config?: FoodGroceryEngineConfig): FoodGroceryEngine { return new FoodGroceryEngine(config); }
  static createDefault(): FoodGroceryEngine { return new FoodGroceryEngine({ inventory: true, expirationTracking: true, supplierManagement: true, nutritionInfo: true }); }
}

export function createDefaultFoodGroceryConfig(): FoodGroceryEngineConfig {
  return { inventory: true, expirationTracking: true, supplierManagement: true, nutritionInfo: true };
}
