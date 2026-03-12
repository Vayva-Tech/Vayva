/**
 * Collection Analytics Service
 * Track and analyze fashion collection performance, seasonality, and trends
 */

import { z } from 'zod';

// Schema definitions
export const FashionCollectionSchema = z.object({
  collectionId: z.string(),
  name: z.string(),
  season: z.enum(['spring', 'summer', 'fall', 'winter', 'resort']),
  year: z.number(),
  launchDate: z.date(),
  endDate: z.date().optional(),
  status: z.enum(['planning', 'active', 'clearance', 'archived']),
  designer: z.string(),
  totalProducts: z.number(),
  totalRevenue: z.number(),
  totalUnits: z.number(),
  averagePrice: z.number(),
  sellThroughRate: z.number(), // percentage
});

export type FashionCollection = z.infer<typeof FashionCollectionSchema>;

export const CollectionProductSchema = z.object({
  productId: z.string(),
  collectionId: z.string(),
  sku: z.string(),
  name: z.string(),
  category: z.string(),
  subcategory: z.string(),
  price: z.number(),
  cost: z.number(),
  margin: z.number(),
  unitsProduced: z.number(),
  unitsSold: z.number(),
  unitsRemaining: z.number(),
  sellThroughRate: z.number(),
  performanceRating: z.enum(['star', 'plowhorse', 'puzzle', 'dog']),
});

export type CollectionProduct = z.infer<typeof CollectionProductSchema>;

export interface CollectionAnalyticsConfig {
  enableRealTimeTracking?: boolean;
  enablePredictiveAnalytics?: boolean;
  refreshIntervalMs?: number;
}

export interface CollectionPerformanceMetrics {
  collectionId: string;
  totalRevenue: number;
  totalUnitsSold: number;
  averageSellThrough: number;
  topPerformers: CollectionProduct[];
  underperformers: CollectionProduct[];
  profitMargin: number;
  daysInMarket: number;
  projectedTotalRevenue: number;
}

/**
 * Collection Analytics Service
 * Provides deep analytics for fashion collections
 */
export class CollectionAnalyticsService {
  private config: CollectionAnalyticsConfig;
  private collections: Map<string, FashionCollection>;
  private products: Map<string, CollectionProduct>;

  constructor(config: CollectionAnalyticsConfig = {}) {
    this.config = {
      enableRealTimeTracking: true,
      enablePredictiveAnalytics: true,
      refreshIntervalMs: 60000, // 1 minute
      ...config,
    };
    this.collections = new Map();
    this.products = new Map();
  }

  async initialize(): Promise<void> {
    console.log('[COLLECTION_ANALYTICS_SERVICE] Initializing...');
    // Initialize database connections
    // Set up real-time tracking if enabled
  }

  /**
   * Register a new collection
   */
  async registerCollection(collectionData: Omit<FashionCollection, 'totalProducts' | 'totalRevenue' | 'totalUnits' | 'averagePrice' | 'sellThroughRate'>): Promise<FashionCollection> {
    const collection: FashionCollection = {
      ...collectionData,
      totalProducts: 0,
      totalRevenue: 0,
      totalUnits: 0,
      averagePrice: 0,
      sellThroughRate: 0,
    };

    this.collections.set(collection.collectionId, collection);
    console.log(`[COLLECTION_ANALYTICS_SERVICE] Registered collection: ${collection.name}`);
    return collection;
  }

  /**
   * Add product to collection
   */
  async addProduct(productData: CollectionProduct): Promise<void> {
    this.products.set(productData.productId, productData);
    
    // Update collection metrics
    const collection = this.collections.get(productData.collectionId);
    if (collection) {
      collection.totalProducts++;
      collection.totalUnits += productData.unitsProduced;
      this.updateCollectionMetrics(collection);
    }
  }

  /**
   * Get collection performance metrics
   */
  getCollectionPerformance(collectionId: string): CollectionPerformanceMetrics {
    const collection = this.collections.get(collectionId);
    if (!collection) {
      throw new Error(`Collection ${collectionId} not found`);
    }

    const collectionProducts = Array.from(this.products.values())
      .filter(p => p.collectionId === collectionId);

    const totalRevenue = collectionProducts.reduce((sum, p) => sum + (p.price * p.unitsSold), 0);
    const totalUnitsSold = collectionProducts.reduce((sum, p) => sum + p.unitsSold, 0);
    const averageSellThrough = collectionProducts.length > 0
      ? collectionProducts.reduce((sum, p) => sum + p.sellThroughRate, 0) / collectionProducts.length
      : 0;

    const topPerformers = collectionProducts
      .filter(p => p.performanceRating === 'star')
      .sort((a, b) => b.sellThroughRate - a.sellThroughRate)
      .slice(0, 5);

    const underperformers = collectionProducts
      .filter(p => p.performanceRating === 'dog')
      .sort((a, b) => a.sellThroughRate - b.sellThroughRate)
      .slice(0, 5);

    const totalCost = collectionProducts.reduce((sum, p) => sum + (p.cost * p.unitsProduced), 0);
    const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;

    const daysInMarket = this.calculateDaysInMarket(collection);
    const projectedTotalRevenue = this.projectCollectionRevenue(collection, daysInMarket);

    return {
      collectionId,
      totalRevenue,
      totalUnitsSold,
      averageSellThrough,
      topPerformers,
      underperformers,
      profitMargin,
      daysInMarket,
      projectedTotalRevenue,
    };
  }

  /**
   * Compare multiple collections
   */
  compareCollections(collectionIds: string[]): {
    collectionId: string;
    name: string;
    revenue: number;
    sellThrough: number;
    margin: number;
  }[] {
    return collectionIds.map(id => {
      const performance = this.getCollectionPerformance(id);
      const collection = this.collections.get(id)!;
      return {
        collectionId: id,
        name: collection.name,
        revenue: performance.totalRevenue,
        sellThrough: performance.averageSellThrough,
        margin: performance.profitMargin,
      };
    });
  }

  /**
   * Get collection analytics dashboard data
   */
  getDashboardData(collectionId: string): {
    overview: CollectionPerformanceMetrics;
    trendData: { date: string; revenue: number; units: number }[];
    categoryBreakdown: { category: string; revenue: number; percentage: number }[];
    recommendations: string[];
  } {
    const overview = this.getCollectionPerformance(collectionId);
    
    // Generate trend data (simulated)
    const trendData = this.generateTrendData(collectionId);
    
    // Category breakdown
    const collectionProducts = Array.from(this.products.values())
      .filter(p => p.collectionId === collectionId);
    
    const categoryRevenue = new Map<string, number>();
    collectionProducts.forEach(p => {
      const current = categoryRevenue.get(p.category) || 0;
      categoryRevenue.set(p.category, current + (p.price * p.unitsSold));
    });

    const totalRevenue = overview.totalRevenue;
    const categoryBreakdown = Array.from(categoryRevenue.entries()).map(([category, revenue]) => ({
      category,
      revenue,
      percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
    }));

    // Generate AI-powered recommendations
    const recommendations = this.generateRecommendations(overview, categoryBreakdown);

    return {
      overview,
      trendData,
      categoryBreakdown,
      recommendations,
    };
  }

  /**
   * Update product sales data
   */
  updateProductSales(productId: string, unitsSold: number): void {
    const product = this.products.get(productId);
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }

    product.unitsSold = unitsSold;
    product.unitsRemaining = product.unitsProduced - unitsSold;
    product.sellThroughRate = (unitsSold / product.unitsProduced) * 100;
    
    // Update performance rating
    product.performanceRating = this.calculatePerformanceRating(product.sellThroughRate);
    
    // Update collection metrics
    const collection = this.collections.get(product.collectionId);
    if (collection) {
      this.updateCollectionMetrics(collection);
    }
  }

  /**
   * Dispose of service resources
   */
  async dispose(): Promise<void> {
    console.log('[COLLECTION_ANALYTICS_SERVICE] Disposing...');
    this.collections.clear();
    this.products.clear();
  }

  private updateCollectionMetrics(collection: FashionCollection): void {
    const collectionProducts = Array.from(this.products.values())
      .filter(p => p.collectionId === collection.collectionId);

    collection.totalRevenue = collectionProducts.reduce((sum, p) => sum + (p.price * p.unitsSold), 0);
    collection.totalUnits = collectionProducts.reduce((sum, p) => sum + p.unitsProduced, 0);
    collection.averagePrice = collectionProducts.length > 0
      ? collectionProducts.reduce((sum, p) => sum + p.price, 0) / collectionProducts.length
      : 0;
    collection.sellThroughRate = collectionProducts.length > 0
      ? collectionProducts.reduce((sum, p) => sum + p.sellThroughRate, 0) / collectionProducts.length
      : 0;
  }

  private calculateDaysInMarket(collection: FashionCollection): number {
    const now = new Date();
    const launchDate = collection.launchDate;
    const endDate = collection.endDate || now;
    return Math.floor((endDate.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  private projectCollectionRevenue(collection: FashionCollection, daysInMarket: number): number {
    if (!this.config.enablePredictiveAnalytics) {
      return collection.totalRevenue;
    }

    // Simple projection based on current performance
    const dailyAverage = collection.totalRevenue / Math.max(daysInMarket, 1);
    const remainingDays = collection.endDate 
      ? Math.floor((collection.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 30;
    
    return collection.totalRevenue + (dailyAverage * Math.max(remainingDays, 0));
  }

  private generateTrendData(collectionId: string): { date: string; revenue: number; units: number }[] {
    // Simulated trend data - in production, this would come from database
    const trendData: { date: string; revenue: number; units: number }[] = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      trendData.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.random() * 10000 + 5000,
        units: Math.floor(Math.random() * 100 + 50),
      });
    }
    
    return trendData;
  }

  private calculatePerformanceRating(sellThroughRate: number): CollectionProduct['performanceRating'] {
    if (sellThroughRate >= 80) return 'star';
    if (sellThroughRate >= 50) return 'plowhorse';
    if (sellThroughRate >= 30) return 'puzzle';
    return 'dog';
  }

  private generateRecommendations(
    overview: CollectionPerformanceMetrics,
    categoryBreakdown: { category: string; revenue: number; percentage: number }[]
  ): string[] {
    const recommendations: string[] = [];

    if (overview.averageSellThrough < 50) {
      recommendations.push('Consider promotional activities to boost slow-moving items');
    }

    if (overview.profitMargin < 40) {
      recommendations.push('Review pricing strategy or negotiate better production costs');
    }

    const topCategory = categoryBreakdown.sort((a, b) => b.percentage - a.percentage)[0];
    if (topCategory && topCategory.percentage > 50) {
      recommendations.push(`Strong performance in ${topCategory.category} - consider expanding this line`);
    }

    if (overview.underperformers.length > 5) {
      recommendations.push('Multiple underperforming products detected - consider clearance strategy');
    }

    return recommendations;
  }
}
