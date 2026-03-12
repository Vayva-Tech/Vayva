import { logger } from "../logger";
import { prisma } from "@vayva/db";
import { MerchantBrainService } from "./merchant-brain.service";

export interface ImageIndexingJobData {
  storeId: string;
  productId: string;
  imageUrl: string;
  imageId: string;
  priority?: "high" | "normal" | "low";
}

export interface IndexedImageResult {
  imageId: string;
  productId: string;
  description: string;
  keywords: string[];
  indexedAt: Date;
  success: boolean;
  error?: string;
}

/**
 * ProductImageIndexer - Background job worker for indexing product images
 *
 * Features:
 * - Generates AI descriptions for product images
 * - Extracts searchable keywords
 * - Stores embeddings for visual search (future: with pgvector)
 * - Batch processing support
 *
 * Note: Full CLIP-based embeddings require pgvector extension.
 * This implementation uses text descriptions for searchability.
 */
export class ProductImageIndexer {
  /**
   * Process a single image indexing job
   *
   * @param data - Job data containing storeId, productId, imageUrl
   * @returns Indexing result
   */
  static async processImage(data: ImageIndexingJobData): Promise<IndexedImageResult> {
    const startTime = Date.now();

    try {
      logger.info("[IMAGE_INDEX_START]", {
        storeId: data.storeId,
        productId: data.productId,
        imageId: data.imageId,
      });

      // Step 1: Get AI description of the image
      const descriptionResult = await MerchantBrainService.describeImage(
        data.storeId,
        data.imageUrl,
      );

      if (!descriptionResult.ok || !descriptionResult.description) {
        const error = descriptionResult.error || "Failed to generate description";
        logger.error("[IMAGE_INDEX_DESCRIBE_FAILED]", {
          storeId: data.storeId,
          productId: data.productId,
          imageId: data.imageId,
          error,
        });
        return {
          imageId: data.imageId,
          productId: data.productId,
          description: "",
          keywords: [],
          indexedAt: new Date(),
          success: false,
          error,
        };
      }

      const description = descriptionResult.description;

      // Step 2: Extract keywords from description
      const keywords = this.extractKeywords(description);

      // Step 3: Update ProductImage with AI description as altText
      await prisma.productImage.update({
        where: { id: data.imageId },
        data: {
          alt: description.substring(0, 200), // Use description as alt text
        },
      });

      // Step 4: Create or update knowledge embedding for searchability
      // This makes the product discoverable via semantic search
      await this.createKnowledgeEmbedding(data.storeId, data.productId, description, keywords);

      const duration = Date.now() - startTime;

      logger.info("[IMAGE_INDEX_COMPLETE]", {
        storeId: data.storeId,
        productId: data.productId,
        imageId: data.imageId,
        duration,
        keywordCount: keywords.length,
      });

      return {
        imageId: data.imageId,
        productId: data.productId,
        description,
        keywords,
        indexedAt: new Date(),
        success: true,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("[IMAGE_INDEX_ERROR]", {
        storeId: data.storeId,
        productId: data.productId,
        imageId: data.imageId,
        error: errorMessage,
      });
      return {
        imageId: data.imageId,
        productId: data.productId,
        description: "",
        keywords: [],
        indexedAt: new Date(),
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Batch index all images for a store's products
   *
   * @param storeId - Store ID to index
   * @param options - Indexing options
   * @returns Summary of indexing results
   */
  static async indexStoreCatalog(
    storeId: string,
    options: {
      productIds?: string[]; // Specific products to index
      limit?: number; // Max images to process
      priority?: "high" | "normal" | "low";
    } = {},
  ): Promise<{
    total: number;
    successful: number;
    failed: number;
    results: IndexedImageResult[];
  }> {
    try {
      logger.info("[CATALOG_INDEX_START]", { storeId, ...options });

      // Fetch products with images
      const products = await prisma.product.findMany({
        where: {
          storeId,
          status: "ACTIVE",
          ...(options.productIds?.length ? { id: { in: options.productIds } } : {}),
        },
        select: {
          id: true,
        },
        take: options.limit || 100,
      });

      // Fetch images for these products separately
      const productImages = await prisma.productImage.findMany({
        where: {
          productId: { in: products.map((p) => p.id) },
        },
        select: {
          id: true,
          url: true,
          productId: true,
          alt: true,
        },
      });

      // Flatten to image jobs
      const imageJobs: ImageIndexingJobData[] = productImages.map((img) => ({
        storeId,
        productId: img.productId,
        imageId: img.id,
        imageUrl: img.url,
        priority: options.priority || "normal",
      }));

      // Process all images
      const results: IndexedImageResult[] = [];
      for (const job of imageJobs) {
        // Skip if already indexed (check altText)
        if (job.imageId) {
          const existing = await prisma.productImage.findUnique({
            where: { id: job.imageId },
            select: { alt: true },
          });

          if (existing?.alt && !options.productIds) {
            // Skip already indexed images unless specific products requested
            continue;
          }
        }

        const result = await this.processImage(job);
        results.push(result);

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const successful = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;

      logger.info("[CATALOG_INDEX_COMPLETE]", {
        storeId,
        total: results.length,
        successful,
        failed,
      });

      return {
        total: results.length,
        successful,
        failed,
        results,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("[CATALOG_INDEX_ERROR]", { storeId, error: errorMessage });
      return {
        total: 0,
        successful: 0,
        failed: 0,
        results: [],
      };
    }
  }

  /**
   * Reindex a single product's images
   *
   * @param storeId - Store ID
   * @param productId - Product ID to reindex
   * @returns Indexing results for the product
   */
  static async reindexProduct(
    storeId: string,
    productId: string,
  ): Promise<IndexedImageResult[]> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId, storeId },
        select: {
          productImages: {
            select: {
              id: true,
              url: true,
            },
          },
        },
      });

      if (!product) {
        logger.error("[REINDEX_PRODUCT_NOT_FOUND]", { storeId, productId });
        return [];
      }

      const jobs: ImageIndexingJobData[] = product.productImages.map((img) => ({
        storeId,
        productId,
        imageId: img.id,
        imageUrl: img.url,
        priority: "high",
      }));

      const results: IndexedImageResult[] = [];
      for (const job of jobs) {
        const result = await this.processImage(job);
        results.push(result);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      return results;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("[REINDEX_PRODUCT_ERROR]", { storeId, productId, error: errorMessage });
      return [];
    }
  }

  /**
   * Extract keywords from image description
   */
  private static extractKeywords(description: string): string[] {
    return description
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .filter((w) => !["this", "that", "with", "from", "they", "have", "been"].includes(w))
      .slice(0, 20); // Limit to top 20 keywords
  }

  /**
   * Create knowledge embedding for semantic search
   */
  private static async createKnowledgeEmbedding(
    storeId: string,
    productId: string,
    description: string,
    keywords: string[],
  ): Promise<void> {
    try {
      // Check if embedding already exists
      const existing = await prisma.knowledgeEmbedding.findFirst({
        where: {
          storeId,
          sourceType: "PRODUCT_IMAGE",
          sourceId: productId,
        },
      });

      const content = `${description}\n\nKeywords: ${keywords.join(", ")}`;
      // Generate simple content hash
      const contentHash = Buffer.from(content).toString("base64").slice(0, 64);

      if (existing) {
        // Update existing
        await prisma.knowledgeEmbedding.update({
          where: { id: existing.id },
          data: {
            content,
            contentHash,
            metadata: {
              keywords,
              lastIndexedAt: new Date().toISOString(),
            },
          },
        });
      } else {
        // Create new
        await prisma.knowledgeEmbedding.create({
          data: {
            storeId,
            sourceType: "PRODUCT_IMAGE",
            sourceId: productId,
            content,
            contentHash,
            metadata: {
              keywords,
              indexedAt: new Date().toISOString(),
            },
          },
        });
      }
    } catch (error: unknown) {
      logger.error("[CREATE_EMBEDDING_ERROR]", { storeId, productId, error });
      // Don't throw - embedding failure shouldn't stop indexing
    }
  }

  /**
   * Get indexed image stats for a store
   */
  static async getIndexingStats(storeId: string): Promise<{
    totalImages: number;
    indexedImages: number;
    pendingImages: number;
    lastIndexedAt?: Date;
  }> {
    try {
      // Get products for this store first
      const products = await prisma.product.findMany({
        where: { storeId },
        select: { id: true },
      });

      const productIds = products.map((p) => p.id);

      // Fetch product images for these products
      const productImages = await prisma.productImage.findMany({
        where: { productId: { in: productIds } },
        select: {
          id: true,
          alt: true,
        },
      });

      const allImages = productImages;
      const indexedImages = allImages.filter((img) => img.alt && img.alt.length > 0);

      // Find last indexed date (use altText existence as proxy)
      const lastIndexed = undefined;

      return {
        totalImages: allImages.length,
        indexedImages: indexedImages.length,
        pendingImages: allImages.length - indexedImages.length,
        lastIndexedAt: lastIndexed,
      };
    } catch (error: unknown) {
      logger.error("[INDEXING_STATS_ERROR]", { storeId, error });
      return {
        totalImages: 0,
        indexedImages: 0,
        pendingImages: 0,
      };
    }
  }
}
