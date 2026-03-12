/**
 * ML Inference Client
 * Free, local ML inference - no API costs
 * Uses rule-based and statistical models (no external API calls)
 */

import { logger } from "../logger.js";
import { SentimentAnalyzer } from "./sentiment-analyzer.js";
import { SalesForecaster } from "./sales-forecaster.js";
import { RecommendationEngine } from "./recommendation-engine.js";
import { IntentClassifier } from "./intent-classifier.js";
import { SimpleEmbedding } from "./simple-embedding.js";

export interface SalesForecast {
  predictedRevenue: number;
  predictedOrders: number;
  confidence: number;
  trend: "up" | "down" | "stable";
  dailyBreakdown: Array<{ date: string; revenue: number; orders: number }>;
}

export interface IntentResult {
  intent: string;
  confidence: number;
  entities: Record<string, string>;
}

export interface SentimentResult {
  score: number; // -1 to 1
  label: "positive" | "negative" | "neutral";
  confidence: number;
}

export interface RecommendationResult {
  productId: string;
  score: number;
  reason: string;
}

export class MLInferenceClient {
  private sentimentAnalyzer: SentimentAnalyzer;
  private salesForecaster: SalesForecaster;
  private recommendationEngine: RecommendationEngine;
  private intentClassifier: IntentClassifier;
  private embedding: SimpleEmbedding;

  constructor() {
    this.sentimentAnalyzer = new SentimentAnalyzer();
    this.salesForecaster = new SalesForecaster();
    this.recommendationEngine = new RecommendationEngine();
    this.intentClassifier = new IntentClassifier();
    this.embedding = new SimpleEmbedding();
  }

  /**
   * Predict sales for a store - FREE, uses statistical models
   */
  async predictSales(
    historicalData: Array<{ date: string; revenue: number; orders: number }>,
    days: number = 7
  ): Promise<SalesForecast | null> {
    try {
      return this.salesForecaster.forecast(historicalData, days);
    } catch (error) {
      logger.error("[MLClient] Sales prediction failed", { error });
      return null;
    }
  }

  /**
   * Classify customer intent - FREE, rule-based classifier
   */
  async classifyIntent(message: string): Promise<IntentResult> {
    return this.intentClassifier.classify(message);
  }

  /**
   * Analyze sentiment - FREE, lexicon-based analysis
   */
  async analyzeSentiment(text: string): Promise<SentimentResult> {
    return this.sentimentAnalyzer.analyze(text);
  }

  /**
   * Get sentiment analyzer instance for batch operations
   */
  getSentimentAnalyzer(): SentimentAnalyzer {
    return this.sentimentAnalyzer;
  }

  /**
   * Get product recommendations - FREE, collaborative filtering
   */
  async recommendProducts(
    customerId: string,
    purchaseHistory: string[],
    allProducts: Array<{ id: string; category: string; tags: string[] }>,
    limit: number = 5
  ): Promise<RecommendationResult[]> {
    return this.recommendationEngine.recommend(
      customerId,
      purchaseHistory,
      allProducts,
      limit
    );
  }

  /**
   * Find similar products - FREE, TF-IDF based similarity
   */
  async findSimilarProducts(
    productId: string,
    products: Array<{ id: string; title: string; description: string; category: string }>,
    limit: number = 5
  ): Promise<Array<{ productId: string; similarity: number }>> {
    return this.embedding.findSimilar(productId, products, limit);
  }

  /**
   * Detect anomalies in order patterns - FREE, statistical outlier detection
   */
  async detectAnomalies(
    data: number[],
    threshold: number = 2
  ): Promise<Array<{ index: number; value: number; isAnomaly: boolean }>> {
    if (data.length < 3) return data.map((v, i) => ({ index: i, value: v, isAnomaly: false }));

    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);

    return data.map((value, index) => ({
      index,
      value,
      isAnomaly: Math.abs(value - mean) > threshold * stdDev,
    }));
  }

  /**
   * Predict customer lifetime value - FREE, simple regression
   */
  async predictCLV(
    avgOrderValue: number,
    purchaseFrequency: number, // purchases per month
    customerAgeMonths: number
  ): Promise<{ clv: number; confidence: number }> {
    // Simple CLV formula: (Avg Order Value × Purchase Frequency × Customer Lifespan)
    // Using average customer lifespan of 12 months for estimation
    const estimatedLifespan = Math.max(12 - customerAgeMonths, 3);
    const clv = avgOrderValue * purchaseFrequency * estimatedLifespan;
    
    // Confidence decreases with newer customers
    const confidence = Math.min(customerAgeMonths / 6, 1);

    return { clv, confidence };
  }

  /**
   * Price optimization suggestion - FREE, elasticity-based
   */
  async suggestPriceOptimization(
    currentPrice: number,
    salesVolume: number,
    competitorPrices: number[]
  ): Promise<{
    suggestedPrice: number;
    expectedImpact: "increase" | "decrease" | "maintain";
    reasoning: string;
  }> {
    const avgCompetitorPrice = competitorPrices.length > 0
      ? competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length
      : currentPrice;

    const priceDiff = ((currentPrice - avgCompetitorPrice) / avgCompetitorPrice) * 100;

    if (priceDiff > 15) {
      return {
        suggestedPrice: Math.round(avgCompetitorPrice * 1.1),
        expectedImpact: "increase",
        reasoning: "Price is significantly higher than competitors. Slight reduction may increase volume.",
      };
    } else if (priceDiff < -15) {
      return {
        suggestedPrice: Math.round(avgCompetitorPrice * 0.95),
        expectedImpact: "increase",
        reasoning: "Price is significantly lower than competitors. Room to increase margin.",
      };
    }

    return {
      suggestedPrice: currentPrice,
      expectedImpact: "maintain",
      reasoning: "Price is competitive with market rates.",
    };
  }
}
