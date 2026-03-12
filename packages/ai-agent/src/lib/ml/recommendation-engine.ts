/**
 * Free Recommendation Engine
 * Uses collaborative filtering and content-based filtering
 * No external APIs, no training costs
 */

import { logger } from "../logger.js";

export interface RecommendationResult {
  productId: string;
  score: number;
  reason: string;
}

export interface Product {
  id: string;
  category: string;
  tags: string[];
  price?: number;
  popularity?: number; // view count or purchase count
}

export interface UserInteraction {
  userId: string;
  productId: string;
  action: "view" | "cart" | "purchase";
  timestamp: Date;
}

export class RecommendationEngine {
  private userItemMatrix: Map<string, Map<string, number>> = new Map();
  private itemSimilarity: Map<string, Map<string, number>> = new Map();
  private productCatalog: Map<string, Product> = new Map();

  /**
   * Build recommendation model from interaction data
   * Call this periodically to refresh recommendations
   */
  buildModel(
    interactions: UserInteraction[],
    products: Product[]
  ): void {
    // Build product catalog
    this.productCatalog.clear();
    for (const product of products) {
      this.productCatalog.set(product.id, product);
    }

    // Build user-item matrix with weighted actions
    this.userItemMatrix.clear();
    for (const interaction of interactions) {
      if (!this.userItemMatrix.has(interaction.userId)) {
        this.userItemMatrix.set(interaction.userId, new Map());
      }
      const userMap = this.userItemMatrix.get(interaction.userId)!;
      
      // Weight different actions
      const weight = interaction.action === "purchase" ? 5 :
                     interaction.action === "cart" ? 3 : 1;
      
      const current = userMap.get(interaction.productId) || 0;
      userMap.set(interaction.productId, current + weight);
    }

    // Pre-compute item similarities
    this.computeItemSimilarities();

    logger.info("[RecommendationEngine] Model built", {
      users: this.userItemMatrix.size,
      products: this.productCatalog.size,
    });
  }

  /**
   * Get recommendations for a user
   */
  recommend(
    userId: string,
    purchaseHistory: string[],
    allProducts: Product[],
    limit: number = 5
  ): RecommendationResult[] {
    // If we have interaction data, use collaborative filtering
    if (this.userItemMatrix.has(userId) && this.userItemMatrix.size > 10) {
      return this.collaborativeFilteringRecommend(userId, limit);
    }

    // Fallback to content-based filtering
    return this.contentBasedRecommend(purchaseHistory, allProducts, limit);
  }

  /**
   * Collaborative filtering recommendations
   */
  private collaborativeFilteringRecommend(
    userId: string,
    limit: number
  ): RecommendationResult[] {
    const userRatings = this.userItemMatrix.get(userId);
    if (!userRatings) return [];

    const scores: Map<string, { score: number; reasons: string[] }> = new Map();

    // Find similar users
    const similarUsers = this.findSimilarUsers(userId);

    for (const [similarUserId, similarity] of similarUsers) {
      const similarUserRatings = this.userItemMatrix.get(similarUserId);
      if (!similarUserRatings) continue;

      for (const [productId, rating] of similarUserRatings) {
        // Skip items user already has
        if (userRatings.has(productId)) continue;

        const weightedScore = rating * similarity;
        const existing = scores.get(productId);
        
        if (existing) {
          existing.score += weightedScore;
          existing.reasons.push(`Similar users liked this`);
        } else {
          scores.set(productId, {
            score: weightedScore,
            reasons: ["Similar users liked this"],
          });
        }
      }
    }

    // Also use item-based collaborative filtering
    for (const [productId, rating] of userRatings) {
      const similarItems = this.itemSimilarity.get(productId);
      if (!similarItems) continue;

      for (const [similarItemId, similarity] of similarItems) {
        if (userRatings.has(similarItemId)) continue;

        const weightedScore = rating * similarity;
        const existing = scores.get(similarItemId);

        if (existing) {
          existing.score += weightedScore;
          existing.reasons.push("Similar to items you viewed");
        } else {
          scores.set(similarItemId, {
            score: weightedScore,
            reasons: ["Similar to items you viewed"],
          });
        }
      }
    }

    // Sort and return top recommendations
    return this.sortAndFormatRecommendations(scores, limit);
  }

  /**
   * Content-based filtering recommendations
   */
  private contentBasedRecommend(
    purchaseHistory: string[],
    allProducts: Product[],
    limit: number
  ): RecommendationResult[] {
    if (purchaseHistory.length === 0) {
      // Return popular items from different categories
      return this.getPopularRecommendations(allProducts, limit);
    }

    const scores: Map<string, { score: number; reasons: string[] }> = new Map();

    // Build user profile from purchase history
    const userProfile = this.buildUserProfile(purchaseHistory);

    for (const product of allProducts) {
      if (purchaseHistory.includes(product.id)) continue;

      let score = 0;
      const reasons: string[] = [];

      // Category match
      if (userProfile.categories.has(product.category)) {
        score += userProfile.categories.get(product.category)! * 2;
        reasons.push(`More ${product.category}`);
      }

      // Tag overlap
      const tagOverlap = product.tags.filter(tag => 
        userProfile.tags.has(tag)
      ).length;
      if (tagOverlap > 0) {
        score += tagOverlap;
        reasons.push("Matches your interests");
      }

      // Price similarity (if within 20% of average)
      if (userProfile.avgPrice > 0 && product.price) {
        const priceDiff = Math.abs(product.price - userProfile.avgPrice) / userProfile.avgPrice;
        if (priceDiff < 0.2) {
          score += 1;
          reasons.push("In your price range");
        }
      }

      // Popularity boost
      if (product.popularity && product.popularity > 100) {
        score += 0.5;
      }

      if (score > 0) {
        scores.set(product.id, { score, reasons });
      }
    }

    return this.sortAndFormatRecommendations(scores, limit);
  }

  /**
   * Get popular recommendations for new users
   */
  private getPopularRecommendations(
    products: Product[],
    limit: number
  ): RecommendationResult[] {
    const scored = products
      .filter(p => p.popularity && p.popularity > 10)
      .map(p => ({
        productId: p.id,
        score: p.popularity || 0,
        reason: "Popular right now",
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored;
  }

  /**
   * Find similar users based on purchase overlap
   */
  private findSimilarUsers(userId: string): Map<string, number> {
    const targetUser = this.userItemMatrix.get(userId);
    if (!targetUser) return new Map();

    const similarities: Map<string, number> = new Map();

    for (const [otherUserId, otherRatings] of this.userItemMatrix) {
      if (otherUserId === userId) continue;

      const similarity = this.cosineSimilarity(targetUser, otherRatings);
      if (similarity > 0.1) {
        similarities.set(otherUserId, similarity);
      }
    }

    // Sort by similarity and take top 20
    return new Map(
      Array.from(similarities.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
    );
  }

  /**
   * Compute item-to-item similarities
   */
  private computeItemSimilarities(): void {
    this.itemSimilarity.clear();

    const items = Array.from(this.productCatalog.keys());

    for (let i = 0; i < items.length; i++) {
      const item1 = items[i];
      const similarities: Map<string, number> = new Map();

      for (let j = 0; j < items.length; j++) {
        if (i === j) continue;
        const item2 = items[j];

        const similarity = this.calculateItemSimilarity(item1, item2);
        if (similarity > 0.2) {
          similarities.set(item2, similarity);
        }
      }

      // Keep only top 10 similar items
      this.itemSimilarity.set(
        item1,
        new Map(
          Array.from(similarities.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
        )
      );
    }
  }

  /**
   * Calculate similarity between two items
   */
  private calculateItemSimilarity(item1: string, item2: string): number {
    const product1 = this.productCatalog.get(item1);
    const product2 = this.productCatalog.get(item2);

    if (!product1 || !product2) return 0;

    let score = 0;

    // Same category
    if (product1.category === product2.category) {
      score += 0.5;
    }

    // Tag overlap
    const commonTags = product1.tags.filter(tag => product2.tags.includes(tag));
    score += commonTags.length * 0.3;

    // User co-occurrence (users who bought item1 also bought item2)
    let coOccurrence = 0;
    for (const [, ratings] of this.userItemMatrix) {
      if (ratings.has(item1) && ratings.has(item2)) {
        coOccurrence++;
      }
    }
    score += Math.min(coOccurrence * 0.1, 0.5);

    return Math.min(score, 1);
  }

  /**
   * Build user profile from purchase history
   */
  private buildUserProfile(purchaseHistory: string[]): {
    categories: Map<string, number>;
    tags: Set<string>;
    avgPrice: number;
  } {
    const categories = new Map<string, number>();
    const tags = new Set<string>();
    let totalPrice = 0;
    let priceCount = 0;

    for (const productId of purchaseHistory) {
      const product = this.productCatalog.get(productId);
      if (!product) continue;

      // Count categories
      const catCount = categories.get(product.category) || 0;
      categories.set(product.category, catCount + 1);

      // Collect tags
      for (const tag of product.tags) {
        tags.add(tag);
      }

      // Track price
      if (product.price) {
        totalPrice += product.price;
        priceCount++;
      }
    }

    return {
      categories,
      tags,
      avgPrice: priceCount > 0 ? totalPrice / priceCount : 0,
    };
  }

  /**
   * Cosine similarity between two user rating vectors
   */
  private cosineSimilarity(
    vec1: Map<string, number>,
    vec2: Map<string, number>
  ): number {
    const items = new Set([...vec1.keys(), ...vec2.keys()]);
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (const item of items) {
      const val1 = vec1.get(item) || 0;
      const val2 = vec2.get(item) || 0;

      dotProduct += val1 * val2;
      norm1 += val1 * val1;
      norm2 += val2 * val2;
    }

    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Sort and format recommendations
   */
  private sortAndFormatRecommendations(
    scores: Map<string, { score: number; reasons: string[] }>,
    limit: number
  ): RecommendationResult[] {
    return Array.from(scores.entries())
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, limit)
      .map(([productId, data]) => ({
        productId,
        score: Math.round(data.score * 100) / 100,
        reason: data.reasons[0] || "Recommended for you",
      }));
  }

  /**
   * Get "frequently bought together" recommendations
   */
  frequentlyBoughtTogether(
    productId: string,
    limit: number = 3
  ): RecommendationResult[] {
    const scores: Map<string, number> = new Map();

    for (const [, ratings] of this.userItemMatrix) {
      if (!ratings.has(productId)) continue;

      for (const [otherId, rating] of ratings) {
        if (otherId === productId) continue;

        const current = scores.get(otherId) || 0;
        scores.set(otherId, current + rating);
      }
    }

    return Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([pid, score]) => ({
        productId: pid,
        score: Math.round(score * 100) / 100,
        reason: "Frequently bought together",
      }));
  }

  /**
   * Get trending products (recent popularity surge)
   */
  getTrending(
    interactions: UserInteraction[],
    days: number = 7,
    limit: number = 5
  ): RecommendationResult[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const recentScores: Map<string, number> = new Map();

    for (const interaction of interactions) {
      if (interaction.timestamp < cutoff) continue;

      const weight = interaction.action === "purchase" ? 3 :
                     interaction.action === "cart" ? 2 : 1;

      const current = recentScores.get(interaction.productId) || 0;
      recentScores.set(interaction.productId, current + weight);
    }

    return Array.from(recentScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([productId, score]) => ({
        productId,
        score: Math.round(score * 100) / 100,
        reason: "Trending now",
      }));
  }
}
