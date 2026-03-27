import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

/**
 * Subscription Box Builder Service - Backend
 * Manages subscription box creation and customization
 */
export class SubscriptionBoxService {
  constructor(private readonly db = prisma) {}

  /**
   * Create a new subscription box
   */
  async createBox(boxData: any) {
    const {
      storeId,
      name,
      description,
      pricing,
      frequency,
      contents,
      customization,
    } = boxData;

    // Generate slug from name
    const slug = this.generateSlug(name);

    const box = await this.db.subscriptionBox.create({
      data: {
        id: `box-${Date.now()}`,
        storeId,
        name,
        slug,
        description,
        shortDescription: boxData.shortDescription || '',
        images: boxData.images || [],
        status: 'draft',
        frequency,
        basePrice: pricing.basePrice,
        compareAtPrice: pricing.compareAtPrice,
        shippingCost: pricing.shippingCost,
        taxRate: pricing.taxRate,
        allowProductSwap: customization?.allowProductSwap || false,
        allowSkip: customization?.allowSkip || true,
        allowPause: customization?.allowPause || true,
        maxSwapsPerCycle: customization?.maxSwapsPerCycle || 2,
        curationType: boxData.curationType || 'manual',
      },
    });

    // Add box contents
    if (contents && contents.length > 0) {
      await this.db.subscriptionBoxContent.createMany({
        data: contents.map((content: any) => ({
          id: `content-${Date.now()}-${Math.random()}`,
          boxId: box.id,
          productId: content.productId,
          variantId: content.variantId,
          quantity: content.quantity,
          priority: content.priority || 0,
        })),
      });
    }

    return box;
  }

  /**
   * Get subscription box by ID
   */
  async getBoxById(boxId: string, storeId: string) {
    const box = await this.db.subscriptionBox.findFirst({
      where: { id: boxId, storeId },
      include: {
        contents: true,
      },
    });

    return box;
  }

  /**
   * List all subscription boxes for a store
   */
  async listBoxes(storeId: string, filters?: { status?: string; frequency?: string }) {
    const where: any = { storeId };
    
    if (filters?.status) where.status = filters.status;
    if (filters?.frequency) where.frequency = filters.frequency;

    const boxes = await this.db.subscriptionBox.findMany({
      where,
      include: {
        contents: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return boxes;
  }

  /**
   * Update subscription box
   */
  async updateBox(boxId: string, storeId: string, updates: any) {
    const existing = await this.getBoxById(boxId, storeId);
    if (!existing) {
      throw new Error('Subscription box not found');
    }

    // Update box
    const updated = await this.db.subscriptionBox.update({
      where: { id: boxId },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });

    // Update contents if provided
    if (updates.contents) {
      // Delete existing contents
      await this.db.subscriptionBoxContent.deleteMany({
        where: { boxId },
      });

      // Create new contents
      if (updates.contents.length > 0) {
        await this.db.subscriptionBoxContent.createMany({
          data: updates.contents.map((content: any) => ({
            id: `content-${Date.now()}-${Math.random()}`,
            boxId: boxId,
            productId: content.productId,
            variantId: content.variantId,
            quantity: content.quantity,
            priority: content.priority || 0,
          })),
        });
      }
    }

    return updated;
  }

  /**
   * Activate subscription box
   */
  async activateBox(boxId: string, storeId: string) {
    return this.updateBox(boxId, storeId, { status: 'active' });
  }

  /**
   * Pause subscription box
   */
  async pauseBox(boxId: string, storeId: string) {
    return this.updateBox(boxId, storeId, { status: 'paused' });
  }

  /**
   * Archive subscription box
   */
  async archiveBox(boxId: string, storeId: string) {
    return this.updateBox(boxId, storeId, { status: 'archived' });
  }

  /**
   * Delete subscription box
   */
  async deleteBox(boxId: string, storeId: string) {
    const existing = await this.getBoxById(boxId, storeId);
    if (!existing) {
      throw new Error('Subscription box not found');
    }

    // Delete contents first
    await this.db.subscriptionBoxContent.deleteMany({
      where: { boxId },
    });

    // Delete box
    await this.db.subscriptionBox.delete({
      where: { id: boxId },
    });

    return { success: true };
  }

  /**
   * Get box recommendations for customer
   */
  async getRecommendations(customerId: string, storeId: string) {
    // Get customer's purchase history
    const purchases = await this.db.order.findMany({
      where: { customerId, storeId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Analyze preferences based on purchases
    const categoryPreferences: Record<string, number> = {};
    
    purchases.forEach((order) => {
      order.items.forEach((item) => {
        const category = item.productCategory || 'general';
        categoryPreferences[category] = (categoryPreferences[category] || 0) + 1;
      });
    });

    // Get active boxes
    const boxes = await this.db.subscriptionBox.findMany({
      where: { storeId, status: 'active' },
      include: { contents: true },
    });

    // Score boxes based on match with preferences
    const scored = boxes.map((box) => {
      let score = 0;
      
      box.contents.forEach((content) => {
        // Simplified scoring - in reality would check product categories
        score += 1;
      });

      return { ...box, score };
    });

    // Return top recommendations
    return scored.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  /**
   * Helper: Generate URL-friendly slug
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
