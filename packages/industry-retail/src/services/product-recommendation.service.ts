/**
 * Product Recommendation AI Service
 * 
 * Provides personalized product recommendations using collaborative filtering
 * and content-based algorithms
 */

import { BaseAIService } from "../lib/base-ai-service";

export interface ProductRecommendationItem {
  productId: string;
  productName: string;
  relevanceScore: number;
  reason: string;
  alternativeProducts?: string[];
  crossSellOpportunity?: boolean;
  upSellOpportunity?: boolean;
}

export interface ProductRecommendationResult {
  userId: string;
  recommendations: ProductRecommendationItem[];
  strategy: "collaborative" | "content-based" | "hybrid" | "trending";
  personalizationFactors: string[];
}

export interface RecommendationInput {
  /** User/customer identifier */
  userId: string;
  /** User's purchase history */
  purchaseHistory?: Array<{
    productId: string;
    productName: string;
    category: string;
    price: number;
    purchaseDate: string;
    rating?: number;
  }>;
  /** User's browsing history */
  browsingHistory?: Array<{
    productId: string;
    productName: string;
    category: string;
    viewedAt: string;
    duration?: number; // seconds
  }>;
  /** Available products to recommend from */
  availableProducts: Array<{
    productId: string;
    productName: string;
    category: string;
    price: number;
    tags?: string[];
    averageRating?: number;
    reviewCount?: number;
  }>;
  /** Context */
  context?: {
    season?: string;
    occasion?: string;
    giftPurpose?: boolean;
    budgetRange?: 'low' | 'medium' | 'high' | 'luxury';
  };
  /** Recommendation strategy preference */
  strategy?: 'collaborative' | 'content-based' | 'hybrid' | 'trending';
}

export class ProductRecommendationService extends BaseAIService<RecommendationInput, ProductRecommendationResult> {
  constructor() {
    super({
      model: 'retail-analyst',
      temperature: 0.5, // Higher for creative recommendations
      requireHumanValidation: false, // Recommendations are advisory
      confidenceThreshold: 0.7,
    });
  }

  protected async buildPrompt(input: RecommendationInput): Promise<string> {
    const prompt = `You are an expert e-commerce personalization specialist. Generate highly relevant product recommendations for this customer.

CUSTOMER ID: ${input.userId}
RECOMMENDATION STRATEGY: ${input.strategy || 'hybrid'}
${input.context?.season ? `SEASON: ${input.context.season}` : ''}
${input.context?.occasion ? `OCCASION: ${input.context.occasion}` : ''}
${input.context?.giftPurpose ? 'PURPOSE: Gift shopping' : ''}
${input.context?.budgetRange ? `BUDGET: ${input.context.budgetRange}` : ''}

PURCHASE HISTORY:
${input.purchaseHistory?.length 
  ? input.purchaseHistory.map(p => `- ${p.productName} (${p.category}) - $${p.price}${p.rating ? ` [Rating: ${p.rating}/5]` : ''}`).join('\n')
  : 'No purchase history'}

BROWSING HISTORY:
${input.browsingHistory?.length
  ? input.browsingHistory.map(b => `- ${b.productName} (${b.category})${b.duration ? ` (Viewed: ${Math.round(b.duration)}s)` : ''}`).join('\n')
  : 'No browsing history'}

AVAILABLE PRODUCTS TO RECOMMEND:
${input.availableProducts.slice(0, 20).map(p => `- ${p.productName} (${p.category}) - $${p.price}${p.averageRating ? ` [Rating: ${p.averageRating}/5 ⭐ ${p.reviewCount} reviews]` : ''}${p.tags?.length ? ` Tags: ${p.tags.join(', ')}` : ''}`).join('\n')}
${input.availableProducts.length > 20 ? `\n... and ${input.availableProducts.length - 20} more products` : ''}

Please provide personalized product recommendations including:
1. Top recommended products with relevance scores
2. Reasoning for each recommendation
3. Cross-sell and up-sell opportunities
4. Personalization factors considered

Format your response as JSON with this exact structure:
{
  "userId": "Customer identifier",
  "recommendations": [
    {
      "productId": "Product ID",
      "productName": "Product name",
      "relevanceScore": 0.0-1.0,
      "reason": "Why this is recommended",
      "alternativeProducts": ["Alternative 1", "Alternative 2"],
      "crossSellOpportunity": true/false,
      "upSellOpportunity": true/false
    }
  ],
  "strategy": "collaborative|content-based|hybrid|trending",
  "personalizationFactors": ["Factor 1", "Factor 2"]
}

Consider:
- Purchase patterns and preferences
- Price sensitivity
- Category affinities
- Seasonal relevance
- Social proof (ratings/reviews)
- Complementary products (cross-sell)
- Premium alternatives (up-sell)

Provide 5-10 high-quality recommendations rather than many weak ones.`;

    return prompt;
  }

  protected async parseResponse(rawResponse: string, input: RecommendationInput): Promise<ProductRecommendationResult> {
    try {
      // Extract JSON from response
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
        throw new Error('Missing recommendations array');
      }

      const strategyRaw = String(parsed.strategy ?? "hybrid");
      const strategies: ProductRecommendationResult["strategy"][] = [
        "collaborative",
        "content-based",
        "hybrid",
        "trending",
      ];
      const strategy: ProductRecommendationResult["strategy"] = strategies.includes(
        strategyRaw as ProductRecommendationResult["strategy"],
      )
        ? (strategyRaw as ProductRecommendationResult["strategy"])
        : "hybrid";

      return {
        userId: parsed.userId || input.userId,
        recommendations: parsed.recommendations as ProductRecommendationItem[],
        strategy,
        personalizationFactors: (parsed.personalizationFactors ?? []) as string[],
      };
    } catch (error) {
      console.error('[ProductRecommendation] Failed to parse response:', error);
      throw new Error(`Failed to parse recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get personalized recommendations for a user
   */
  async getPersonalizedRecommendations(
    userId: string,
    availableProducts: RecommendationInput['availableProducts'],
    limit: number = 10
  ): Promise<ProductRecommendationResult> {
    await this.initialize();
    
    const result = await this.execute({
      userId,
      availableProducts,
      strategy: 'hybrid',
    });

    // Limit results
    result.recommendations = result.recommendations.slice(0, limit);
    
    return result;
  }

  /**
   * Get trending products
   */
  async getTrendingProducts(
    availableProducts: RecommendationInput['availableProducts'],
    category?: string,
    limit: number = 10
  ): Promise<ProductRecommendationResult> {
    await this.initialize();
    
    const filteredProducts = category
      ? availableProducts.filter(p => p.category === category)
      : availableProducts;
    
    // Sort by rating and review count as proxy for trending
    const trending = [...filteredProducts].sort((a, b) => {
      const scoreA = (a.averageRating || 0) * (a.reviewCount || 0);
      const scoreB = (b.averageRating || 0) * (b.reviewCount || 0);
      return scoreB - scoreA;
    }).slice(0, limit);
    
    const result = await this.execute({
      userId: 'trending',
      availableProducts: trending,
      strategy: 'trending',
    });
    
    return result;
  }

  /**
   * Get complementary products (cross-sell)
   */
  async getComplementaryProducts(
    baseProductId: string,
    availableProducts: RecommendationInput['availableProducts'],
    limit: number = 5
  ): Promise<Array<{
    productId: string;
    productName: string;
    complementScore: number;
    reason: string;
  }>> {
    const baseProduct = availableProducts.find(p => p.productId === baseProductId);
    
    if (!baseProduct) {
      throw new Error('Base product not found');
    }
    
    // Find complementary products based on category and tags
    const complements = availableProducts
      .filter(p => p.productId !== baseProductId)
      .filter(p => {
        // Different but related category
        return p.category !== baseProduct.category || 
               p.tags?.some(tag => baseProduct.tags?.includes(tag));
      })
      .slice(0, limit * 2);
    
    const result = await this.execute({
      userId: `complement-${baseProductId}`,
      availableProducts: complements,
      strategy: 'content-based',
      context: {
        occasion: `Complement for ${baseProduct.productName}`,
      },
    });
    
    return result.recommendations.slice(0, limit).map((r: ProductRecommendationItem) => ({
      productId: r.productId,
      productName: r.productName,
      complementScore: r.relevanceScore,
      reason: r.reason,
    }));
  }

  /**
   * Get premium alternatives (up-sell)
   */
  async getPremiumAlternatives(
    baseProductId: string,
    availableProducts: RecommendationInput['availableProducts'],
    priceMultiplier: number = 1.5,
    limit: number = 3
  ): Promise<Array<{
    productId: string;
    productName: string;
    price: number;
    upgradeScore: number;
    benefits: string[];
  }>> {
    const baseProduct = availableProducts.find(p => p.productId === baseProductId);
    
    if (!baseProduct) {
      throw new Error('Base product not found');
    }
    
    const maxPrice = baseProduct.price * priceMultiplier;
    
    // Find higher-priced alternatives in same or related categories
    const alternatives = availableProducts
      .filter(p => p.productId !== baseProductId)
      .filter(p => p.price > baseProduct.price && p.price <= maxPrice)
      .filter(p => 
        p.category === baseProduct.category ||
        p.tags?.some(tag => baseProduct.tags?.includes(tag))
      )
      .sort((a, b) => b.price - a.price)
      .slice(0, limit);
    
    return alternatives.map(a => ({
      productId: a.productId,
      productName: a.productName,
      price: a.price,
      upgradeScore: (a.averageRating || 3) / 5,
      benefits: [
        `Higher quality tier`,
        a.averageRating && a.averageRating > (baseProduct.averageRating || 0) 
          ? `Better customer ratings (${a.averageRating}/5)` 
          : '',
        a.reviewCount && a.reviewCount > 50 
          ? `More reviews (${a.reviewCount} verified buyers)` 
          : '',
      ].filter(Boolean),
    }));
  }
}
