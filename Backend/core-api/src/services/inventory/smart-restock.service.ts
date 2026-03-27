import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

/**
 * Smart Restock Service - Backend
 * AI-powered inventory restocking predictions and alerts
 */
export class SmartRestockService {
  constructor(private readonly db = prisma) {}

  /**
   * Generate restock predictions for all products in a store
   */
  async generateRestockPredictions(storeId: string) {
    // Get all inventory items for store
    const items = await this.db.inventoryItem.findMany({
      where: { inventoryLocation: { storeId } },
      include: {
        product: true,
        variant: true,
      },
    });

    const predictions = [];

    for (const item of items) {
      const prediction = await this.calculateRestockPrediction(item, storeId);
      if (prediction.daysUntilStockout <= 30) {
        predictions.push(prediction);
      }
    }

    return predictions.sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);
  }

  /**
   * Calculate restock prediction for a single item
   */
  private async calculateRestockPrediction(item: any, storeId: string) {
    const currentStock = item.onHand || 0;

    // Calculate average daily sales (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const orderItems = await this.db.orderItem.findMany({
      where: {
        variantId: item.variantId,
        order: {
          storeId,
          createdAt: { gte: thirtyDaysAgo },
          status: 'completed',
        },
      },
      include: { order: true },
    });

    const totalSold = orderItems.reduce((sum, oi) => sum + oi.quantity, 0);
    const avgDailySales = totalSold / 30;

    // Calculate days until stockout
    const daysUntilStockout = avgDailySales > 0 ? Math.ceil(currentStock / avgDailySales) : 999;

    // Calculate recommended reorder point (lead time + safety stock)
    const leadTimeDays = 7; // Default supplier lead time
    const safetyStock = avgDailySales * 7; // 7 days safety stock
    const recommendedReorderPoint = Math.ceil((avgDailySales * leadTimeDays) + safetyStock);

    // Calculate recommended reorder quantity (EOQ simplified)
    const recommendedReorderQuantity = Math.ceil(avgDailySales * 30); // 30-day supply

    // Calculate confidence score
    let confidence = 0.5;
    if (orderItems.length > 10) confidence += 0.3;
    if (avgDailySales > 0) confidence += 0.2;
    confidence = Math.min(confidence, 1.0);

    return {
      productId: item.productId,
      variantId: item.variantId,
      currentStock,
      avgDailySales: parseFloat(avgDailySales.toFixed(2)),
      daysUntilStockout,
      recommendedReorderPoint,
      recommendedReorderQuantity,
      confidence: parseFloat(confidence.toFixed(2)),
      shouldReorderSoon: daysUntilStockout <= 14,
      isUrgent: daysUntilStockout <= 7,
    };
  }

  /**
   * Create or update restock alert
   */
  async createRestockAlert(alertData: any) {
    const {
      storeId,
      productId,
      variantId,
      thresholdType,
      thresholdValue,
      autoReorder,
      reorderQuantity,
    } = alertData;

    // Check if alert already exists
    const existing = await this.db.restockAlert.findFirst({
      where: {
        storeId,
        productId,
        variantId: variantId || null,
      },
    });

    if (existing) {
      return await this.db.restockAlert.update({
        where: { id: existing.id },
        data: {
          thresholdType,
          thresholdValue,
          autoReorder,
          reorderQuantity,
          status: 'active',
        },
      });
    }

    return await this.db.restockAlert.create({
      data: {
        id: `restock-${Date.now()}`,
        storeId,
        productId,
        variantId: variantId || null,
        thresholdType,
        thresholdValue,
        currentStock: 0,
        status: 'active',
        triggerCount: 0,
        autoReorder,
        reorderQuantity,
        notifyChannels: ['email'],
        notifyUsers: [],
      },
    });
  }

  /**
   * Check and trigger restock alerts
   */
  async checkAndTriggerAlerts(storeId: string) {
    const alerts = await this.db.restockAlert.findMany({
      where: {
        storeId,
        status: { in: ['active', 'triggered'] },
        autoReorder: false, // Only manual alerts for now
      },
    });

    const triggered = [];

    for (const alert of alerts) {
      const item = await this.db.inventoryItem.findFirst({
        where: {
          variantId: alert.variantId || undefined,
          inventoryLocation: { storeId },
        },
      });

      if (!item) continue;

      const currentStock = item.onHand || 0;
      
      let shouldTrigger = false;
      if (alert.thresholdType === 'fixed' && currentStock <= alert.thresholdValue) {
        shouldTrigger = true;
      } else if (alert.thresholdType === 'percentage' && currentStock <= (alert.thresholdValue / 100) * 100) {
        shouldTrigger = true;
      }

      if (shouldTrigger) {
        await this.db.restockAlert.update({
          where: { id: alert.id },
          data: {
            status: 'triggered',
            lastTriggeredAt: new Date(),
            triggerCount: alert.triggerCount + 1,
            currentStock,
          },
        });

        triggered.push({
          alertId: alert.id,
          productId: alert.productId,
          variantId: alert.variantId,
          currentStock,
          thresholdValue: alert.thresholdValue,
        });
      }
    }

    return triggered;
  }

  /**
   * Get restock alerts for a store
   */
  async getStoreAlerts(storeId: string, filters?: { status?: string }) {
    const where: any = { storeId };
    
    if (filters?.status) where.status = filters.status;

    return await this.db.restockAlert.findMany({
      where,
      orderBy: { lastTriggeredAt: 'desc' },
    });
  }

  /**
   * Snooze a restock alert
   */
  async snoozeAlert(alertId: string, storeId: string, days = 7) {
    const alert = await this.db.restockAlert.findFirst({
      where: { id: alertId, storeId },
    });

    if (!alert) {
      throw new Error('Alert not found');
    }

    const snoozedUntil = new Date();
    snoozedUntil.setDate(snoozedUntil.getDate() + days);

    await this.db.restockAlert.update({
      where: { id: alertId },
      data: {
        status: 'snoozed',
      },
    });

    return { success: true, snoozedUntil };
  }

  /**
   * Disable a restock alert
   */
  async disableAlert(alertId: string, storeId: string) {
    const alert = await this.db.restockAlert.findFirst({
      where: { id: alertId, storeId },
    });

    if (!alert) {
      throw new Error('Alert not found');
    }

    await this.db.restockAlert.update({
      where: { id: alertId },
      data: { status: 'disabled' },
    });

    return { success: true };
  }
}
