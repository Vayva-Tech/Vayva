import { fashionPrisma as prisma } from '../lib/prisma-fashion';

export interface VisualSearchConfig {
  model: 'vayva-fashion-v1' | 'vayva-fashion-v2';
  indexType: 'product' | 'lookbook' | 'both';
  similarityThreshold: number;
}

export interface VisualSearchResult {
  product: {
    id: string;
    name: string;
    images: string[];
    price: number;
  };
  similarityScore: number;
  matchingAttributes: {
    color: number;
    pattern: number;
    style: number;
    silhouette: number;
  };
  alternatives: Array<{
    id: string;
    name: string;
    similarityScore: number;
  }>;
}

export interface VisualFeatures {
  color: string[];
  pattern?: string;
  style: string[];
  silhouette?: string;
  embedding: number[];
}

export class VisualSearchService {
  private readonly similarityThreshold: number;

  constructor(config: VisualSearchConfig) {
    this.similarityThreshold = config.similarityThreshold;
  }

  /**
   * Extract visual features from an image using AI
   * Uses OpenAI CLIP or similar multimodal model via @vayva/ai-agent
   */
  async extractVisualFeatures(imageUrl: string): Promise<VisualFeatures> {
    // Implementation will use AI agent to extract features
    // This is a placeholder for the actual ML integration
    // TODO: Integrate with actual AI agent when available
    console.log(`Extracting features from: ${imageUrl}`);
    
    // Return mock features for now
    return {
      color: ['black', 'white', 'red'],
      pattern: 'solid',
      style: ['casual', 'modern'],
      silhouette: 'fitted',
      embedding: Array(512).fill(0).map(() => Math.random()),
    };
  }

  /**
   * Index a product for visual search
   */
  async indexProduct(productId: string, storeId: string): Promise<void> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { productImages: true },
    });

    if (!product || product.productImages.length === 0) {
      throw new Error('Product not found or has no images');
    }

    const features = await this.extractVisualFeatures(product.productImages[0].url);

    await prisma.visualSearchIndex.upsert({
      where: { productId },
      create: {
        productId,
        storeId,
        embedding: features.embedding,
        color: features.color,
        pattern: features.pattern,
        style: features.style,
        silhouette: features.silhouette,
      },
      update: {
        embedding: features.embedding,
        color: features.color,
        pattern: features.pattern,
        style: features.style,
        silhouette: features.silhouette,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Search for similar products using an image
   */
  async searchByImage(
    imageUrl: string,
    storeId: string,
    limit: number = 10
  ): Promise<VisualSearchResult[]> {
    const features = await this.extractVisualFeatures(imageUrl);

    // For now, use a simple attribute-based search
    // In production, this would use pgvector for vector similarity
    const indexes = await prisma.visualSearchIndex.findMany({
      where: {
        storeId,
        OR: [
          { color: { hasSome: features.color } },
          { style: { hasSome: features.style } },
        ],
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            productImages: true,
            price: true,
          },
        },
      },
      take: limit,
    });

    // Calculate similarity scores
    return indexes.map((idx: {
      color: string[];
      style: string[];
      pattern?: string;
      silhouette?: string;
      product: {
        id: string;
        title: string;
        productImages: Array<{ url: string }>;
        price: number;
      };
    }) => {
      const colorMatch = idx.color.filter((c: string) => features.color.includes(c)).length;
      const styleMatch = idx.style.filter((s: string) => features.style.includes(s)).length;
      const similarity = (colorMatch + styleMatch) / (features.color.length + features.style.length + 1);

      return {
        product: {
          id: idx.product.id,
          name: idx.product.title,
          images: idx.product.productImages.map((img: { url: string }) => img.url),
          price: Number(idx.product.price),
        },
        similarityScore: similarity,
        matchingAttributes: {
          color: colorMatch / (features.color.length || 1),
          pattern: idx.pattern === features.pattern ? 1 : 0,
          style: styleMatch / (features.style.length || 1),
          silhouette: idx.silhouette === features.silhouette ? 1 : 0,
        },
        alternatives: [],
      };
    }).sort((a: { similarityScore: number }, b: { similarityScore: number }) => b.similarityScore - a.similarityScore);
  }

  /**
   * Search for similar products using a product ID
   */
  async searchByProductId(
    productId: string,
    storeId: string,
    limit: number = 10
  ): Promise<VisualSearchResult[]> {
    const index = await prisma.visualSearchIndex.findUnique({
      where: { productId },
    });

    if (!index) {
      throw new Error('Product not indexed for visual search');
    }

    // Find similar products by attributes
    const indexes = await prisma.visualSearchIndex.findMany({
      where: {
        storeId,
        productId: { not: productId },
        OR: [
          { color: { hasSome: index.color } },
          { style: { hasSome: index.style } },
        ],
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            productImages: true,
            price: true,
          },
        },
      },
      take: limit,
    });

    return indexes.map((idx: {
      color: string[];
      style: string[];
      pattern?: string;
      silhouette?: string;
      product: {
        id: string;
        title: string;
        productImages: Array<{ url: string }>;
        price: number;
      };
    }) => {
      const colorMatch = idx.color.filter((c: string) => index.color.includes(c)).length;
      const styleMatch = idx.style.filter((s: string) => index.style.includes(s)).length;
      const similarity = (colorMatch + styleMatch) / (index.color.length + index.style.length + 1);

      return {
        product: {
          id: idx.product.id,
          name: idx.product.title,
          images: idx.product.productImages.map((img: { url: string }) => img.url),
          price: Number(idx.product.price),
        },
        similarityScore: similarity,
        matchingAttributes: {
          color: colorMatch / (index.color.length || 1),
          pattern: idx.pattern === index.pattern ? 1 : 0,
          style: styleMatch / (index.style.length || 1),
          silhouette: idx.silhouette === index.silhouette ? 1 : 0,
        },
        alternatives: [],
      };
    }).sort((a: { similarityScore: number }, b: { similarityScore: number }) => b.similarityScore - a.similarityScore);
  }
}

export const visualSearch = new VisualSearchService({
  model: 'vayva-fashion-v1',
  indexType: 'both',
  similarityThreshold: 0.7,
});
