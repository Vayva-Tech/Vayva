import { logger } from "../logger";
import { prisma } from "@vayva/db";
import { MerchantBrainService } from "./merchant-brain.service";

export interface VisualMatch {
  productId: string;
  productName: string;
  productDescription: string;
  price: number;
  imageUrl: string;
  similarityScore: number;
  inStock: boolean;
}

export interface VisualSearchResult {
  matches: VisualMatch[];
  queryImageDescription?: string;
  totalProductsSearched: number;
}

export interface VisualSearchError {
  error: string;
  code: string;
}

/**
 * VisualSearchService - Enables AI to find products by image similarity
 *
 * Features:
 * - Generate image descriptions using Vision AI
 * - Search products by visual similarity
 * - Match customer images to merchant catalog
 * - Return ranked results with confidence scores
 *
 * Note: Full embedding-based visual search requires pgvector and CLIP model.
 * This implementation uses hybrid approach: vision description + text search.
 */
export class VisualSearchService {
  /**
   * Search products visually similar to the provided image
   *
   * Hybrid approach (current):
   * 1. Describe the image using OpenAI Vision
   * 2. Extract keywords from description
   * 3. Search products using text-based matching
   * 4. Return products with similarity scoring
   *
   * Future: Full embedding-based similarity with pgvector
   *
   * @param storeId - Merchant store ID
   * @param imageUrl - Customer uploaded image URL
   * @param limit - Maximum results to return
   * @returns Visual matches or error
   */
  static async searchByImage(
    storeId: string,
    imageUrl: string,
    limit: number = 5,
  ): Promise<VisualSearchResult | VisualSearchError> {
    const startTime = Date.now();

    try {
      logger.info("[VISUAL_SEARCH_START]", {
        storeId,
        imageUrl: imageUrl?.substring(0, 100),
        limit,
      });

      // Step 1: Get image description using MerchantBrainService
      const descriptionResult = await MerchantBrainService.describeImage(storeId, imageUrl);

      if (!descriptionResult.ok) {
        logger.error("[VISUAL_SEARCH_DESCRIBE_FAILED]", {
          storeId,
          error: descriptionResult.error,
        });
        return {
          error: descriptionResult.error || "Failed to analyze image",
          code: "DESCRIPTION_FAILED",
        };
      }

      const description = descriptionResult.description;

      // Step 2: Extract keywords from description
      const searchQuery = description || "";

      // Extract keywords from description (simple word extraction)
      const keywords = searchQuery
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3 && !["this", "that", "with", "from", "they"].includes(w));

      // Step 3: Search products using text-based search
      const products = await this.searchProductsByText(storeId, searchQuery, limit * 2);

      // Step 4: Score and rank results
      const scoredMatches = await this.scoreVisualMatches(
        products,
        description || "",
        keywords || [],
        imageUrl,
      );

      // Take top matches
      const topMatches = scoredMatches.slice(0, limit);

      const duration = Date.now() - startTime;

      logger.info("[VISUAL_SEARCH_COMPLETE]", {
        storeId,
        duration,
        totalProducts: products.length,
        matchesFound: topMatches.length,
        topScore: topMatches[0]?.similarityScore,
      });

      return {
        matches: topMatches,
        queryImageDescription: description,
        totalProductsSearched: products.length,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("[VISUAL_SEARCH_ERROR]", {
        storeId,
        error: errorMessage,
      });
      return {
        error: errorMessage,
        code: "SEARCH_FAILED",
      };
    }
  }

  /**
   * Search products by text (name, description, tags)
   */
  private static async searchProductsByText(
    storeId: string,
    query: string,
    take: number,
  ): Promise<
    Array<{
      id: string;
      title: string;
      description: string | null;
      price: number;
      status: string;
      tags: string[];
      productImages: Array<{ url: string }>;
    }>
  > {
    const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);

    const products = await prisma.product.findMany({
      where: {
        storeId,
        status: "ACTIVE",
        OR: [
          // Search in title
          {
            title: {
              contains: searchTerms[0] || "",
              mode: "insensitive",
            },
          },
          // Search in description
          {
            description: {
              contains: searchTerms[0] || "",
              mode: "insensitive",
            },
          },
          // Search in tags
          {
            tags: {
              hasSome: searchTerms,
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        status: true,
        tags: true,
        productImages: {
          take: 1,
          select: { url: true },
        },
      },
      take,
    });

    return products.map((p) => ({
      ...p,
      price: Number(p.price),
    }));
  }

  /**
   * Score products based on visual similarity
   *
   * Uses multiple signals:
   * - Keyword overlap between image description and product
   * - Tag matching
   * - Title/description similarity
   */
  private static async scoreVisualMatches(
    products: Array<{
      id: string;
      title: string;
      description: string | null;
      price: number;
      status: string;
      tags: string[];
      productImages: Array<{ url: string }>;
    }>,
    imageDescription: string,
    imageKeywords: string[],
    _queryImageUrl: string,
  ): Promise<VisualMatch[]> {
    const scored = products.map((product) => {
      const productText = `${product.title} ${product.description || ""}`.toLowerCase();
      const productWords = productText.split(/\s+/);

      // Calculate keyword overlap score
      const keywordMatches = imageKeywords.filter((kw) =>
        productText.includes(kw.toLowerCase()),
      );
      const keywordScore = keywordMatches.length / Math.max(imageKeywords.length, 1);

      // Calculate tag overlap score
      const tagMatches = product.tags.filter((tag) =>
        imageDescription.toLowerCase().includes(tag.toLowerCase()),
      );
      const tagScore = tagMatches.length / Math.max(product.tags.length || 1, 1);

      // Calculate word overlap score
      const wordMatches = imageKeywords.filter((kw) =>
        productWords.some((pw) => pw.includes(kw.toLowerCase())),
      );
      const wordScore = wordMatches.length / Math.max(productWords.length, 1);

      // Weighted combination
      const similarityScore = Math.min(
        keywordScore * 0.4 + tagScore * 0.3 + wordScore * 0.3,
        1,
      );

      return {
        productId: product.id,
        productName: product.title,
        productDescription: product.description || "",
        price: product.price,
        imageUrl: product.productImages[0]?.url || "",
        similarityScore: Math.round(similarityScore * 100) / 100,
        inStock: product.status === "ACTIVE",
      };
    });

    // Sort by similarity score descending
    return scored.sort((a, b) => b.similarityScore - a.similarityScore);
  }

  /**
   * Explain why a product matches the query image
   *
   * @param productId - Product to explain
   * @param queryImageDescription - Description of customer's image
   * @returns Human-readable explanation
   */
  static async explainMatch(
    productId: string,
    queryImageDescription: string,
  ): Promise<string> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          title: true,
          description: true,
          tags: true,
        },
      });

      if (!product) {
        return "Product not found.";
      }

      // Simple explanation based on keyword overlap
      const queryWords = queryImageDescription.toLowerCase().split(/\s+/);
      const productText = `${product.title} ${product.description || ""}`.toLowerCase();
      const matchingWords = queryWords.filter((w) => productText.includes(w));

      if (matchingWords.length === 0) {
        return `This ${product.title} might be similar based on visual characteristics.`;
      }

      return `This ${product.title} matches because it has: ${matchingWords.slice(0, 3).join(", ")}.`;
    } catch (error) {
      logger.error("[EXPLAIN_MATCH_ERROR]", { productId, error });
      return "This product appears visually similar to your image.";
    }
  }

  /**
   * Find complementary products to a matched product
   *
   * @param storeId - Merchant store ID
   * @param productId - Base product ID
   * @param limit - Max results
   * @returns Complementary products
   */
  static async findComplementaryProducts(
    storeId: string,
    productId: string,
    limit: number = 3,
  ): Promise<VisualMatch[]> {
    try {
      // Get the base product
      const baseProduct = await prisma.product.findUnique({
        where: { id: productId },
        select: {
          tags: true,
          productType: true,
        },
      });

      if (!baseProduct) {
        return [];
      }

      // Find products with related tags but not the same product
      const related = await prisma.product.findMany({
        where: {
          storeId,
          status: "ACTIVE",
          id: { not: productId },
          OR: [
            { tags: { hasSome: baseProduct.tags } },
            { productType: baseProduct.productType },
          ],
        },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          status: true,
          productImages: {
            take: 1,
            select: { url: true },
          },
        },
        take: limit,
      });

      return related.map((p) => ({
        productId: p.id,
        productName: p.title,
        productDescription: p.description || "",
        price: Number(p.price),
        imageUrl: p.productImages[0]?.url || "",
        similarityScore: 0.5, // Default score for complementary items
        inStock: p.status === "ACTIVE",
      }));
    } catch (error) {
      logger.error("[FIND_COMPLEMENTARY_ERROR]", { storeId, productId, error });
      return [];
    }
  }
}
