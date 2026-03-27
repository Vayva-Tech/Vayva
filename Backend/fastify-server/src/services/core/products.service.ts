import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

/**
 * Products Service - Backend
 * Manages product catalog, variants, and inventory
 */
export class ProductsService {
  constructor(private readonly db = prisma) {}

  /**
   * Create a new product
   */
  async createProduct(productData: any) {
    const {
      storeId,
      name,
      description,
      category,
      images,
      variants,
      ...baseData
    } = productData;

    try {
      const product = await this.db.product.create({
        data: {
          id: `prod-${Date.now()}`,
          storeId,
          name,
          description: description || null,
          category: category || null,
          images: images || [],
          ...baseData,
        },
      });

      // Create variants if provided
      if (variants && variants.length > 0) {
        await this.db.productVariant.createMany({
          data: variants.map((v: any) => ({
            id: `var-${Date.now()}-${Math.random()}`,
            productId: product.id,
            name: v.name,
            sku: v.sku,
            price: v.price,
            compareAtPrice: v.compareAtPrice,
            costPrice: v.costPrice,
            quantity: v.quantity || 0,
            options: v.options,
          })),
        });
      }

      logger.info(`[Products] Created product ${product.id}`);
      return product;
    } catch (error) {
      logger.error('[Products] Create failed:', error);
      throw new Error('Failed to create product');
    }
  }

  /**
   * Get products for a store
   */
  async getStoreProducts(
    storeId: string,
    filters?: {
      category?: string;
      search?: string;
      status?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    const where: any = { storeId };

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    const [products, total] = await Promise.all([
      this.db.product.findMany({
        where,
        include: {
          variants: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.db.product.count({ where }),
    ]);

    return { products, total, limit, offset };
  }

  /**
   * Get product by ID
   */
  async getProductById(productId: string, storeId: string) {
    return await this.db.product.findFirst({
      where: { id: productId, storeId },
      include: {
        variants: true,
        categories: true,
      },
    });
  }

  /**
   * Update product
   */
  async updateProduct(productId: string, storeId: string, updates: any) {
    const product = await this.getProductById(productId, storeId);
    
    if (!product) {
      throw new Error('Product not found');
    }

    const updated = await this.db.product.update({
      where: { id: productId },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });

    logger.info(`[Products] Updated product ${productId}`);
    return updated;
  }

  /**
   * Delete product
   */
  async deleteProduct(productId: string, storeId: string) {
    const product = await this.getProductById(productId, storeId);
    
    if (!product) {
      throw new Error('Product not found');
    }

    await this.db.product.delete({
      where: { id: productId },
    });

    logger.info(`[Products] Deleted product ${productId}`);
    return { success: true };
  }

  /**
   * Create product variant
   */
  async createVariant(productId: string, storeId: string, variantData: any) {
    const product = await this.getProductById(productId, storeId);
    
    if (!product) {
      throw new Error('Product not found');
    }

    const variant = await this.db.productVariant.create({
      data: {
        id: `var-${Date.now()}`,
        productId,
        name: variantData.name,
        sku: variantData.sku,
        price: variantData.price,
        compareAtPrice: variantData.compareAtPrice,
        costPrice: variantData.costPrice,
        quantity: variantData.quantity || 0,
        options: variantData.options,
      },
    });

    logger.info(`[Products] Created variant ${variant.id}`);
    return variant;
  }

  /**
   * Update variant
   */
  async updateVariant(variantId: string, storeId: string, updates: any) {
    const variant = await this.db.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!variant || variant.product.storeId !== storeId) {
      throw new Error('Variant not found');
    }

    const updated = await this.db.productVariant.update({
      where: { id: variantId },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });

    logger.info(`[Products] Updated variant ${variantId}`);
    return updated;
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(storeId: string, threshold = 10) {
    const variants = await this.db.productVariant.findMany({
      where: {
        product: { storeId },
        quantity: { lte: threshold },
      },
      include: {
        product: true,
      },
    });

    return variants;
  }

  /**
   * Search products
   */
  async searchProducts(storeId: string, query: string, limit = 20) {
    const products = await this.db.product.findMany({
      where: {
        storeId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } },
        ],
        status: 'ACTIVE',
      },
      include: {
        variants: true,
      },
      take: limit,
    });

    return products;
  }

  /**
   * Calendar Sync - Product Calendar Integration
   */
  async addCalendarSync(productId: string, storeId: string, syncData: any) {
    const { name, url } = syncData;

    if (!name || !url) {
      throw new Error('Name and URL are required');
    }

    if (!/^https?:\/\//i.test(url)) {
      throw new Error('Invalid URL');
    }

    const product = await this.db.product.findFirst({
      where: { id: productId, storeId },
      select: { id: true, metadata: true },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const metadata = ((product.metadata as Record<string, unknown>) || {}) as any;
    const existing = Array.isArray(metadata.calendarSyncs) ? metadata.calendarSyncs : [];

    const newSync = {
      id: `cal_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name,
      url,
      lastSyncedAt: null,
      syncStatus: 'PENDING',
      error: null,
      createdAt: new Date().toISOString(),
    };

    await this.db.product.update({
      where: { id: productId },
      data: {
        metadata: {
          ...metadata,
          calendarSyncs: [...existing, newSync],
        },
      },
    });

    logger.info(`[Products] Added calendar sync ${newSync.id} to product ${productId}`);
    return newSync;
  }

  async removeCalendarSync(productId: string, storeId: string, syncId: string) {
    const product = await this.db.product.findFirst({
      where: { id: productId, storeId },
      select: { id: true, metadata: true },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const metadata = ((product.metadata as Record<string, unknown>) || {}) as any;
    const existing = Array.isArray(metadata.calendarSyncs) ? metadata.calendarSyncs : [];

    const target = existing.find((s: any) => s?.id === syncId);
    if (!target) {
      throw new Error('Calendar sync not found');
    }

    const next = existing.filter((s: any) => s?.id !== syncId);

    await this.db.product.update({
      where: { id: productId },
      data: {
        metadata: {
          ...metadata,
          calendarSyncs: next,
        },
      },
    });

    logger.info(`[Products] Removed calendar sync ${syncId} from product ${productId}`);
    return { success: true };
  }

  async getCalendarSyncs(productId: string, storeId: string) {
    const product = await this.db.product.findFirst({
      where: { id: productId, storeId },
      select: { id: true, metadata: true },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    const metadata = ((product.metadata as Record<string, unknown>) || {}) as any;
    const calendarSyncs = Array.isArray(metadata.calendarSyncs) ? metadata.calendarSyncs : [];

    return calendarSyncs;
  }
}
