import { prisma } from "@vayva/db";

export interface RestockAlert {
  id: string;
  storeId: string;
  productId: string;
  variantId?: string;
  thresholdType: "fixed" | "percentage" | "velocity_based";
  thresholdValue: number;
  currentStock: number;
  status: "active" | "triggered" | "snoozed" | "disabled";
  lastTriggeredAt?: Date;
  triggerCount: number;
  autoReorder: boolean;
  reorderQuantity?: number;
  reorderSupplierId?: string;
  notifyChannels: Array<"email" | "sms" | "push" | "slack" | "webhook">;
  notifyUsers: string[]; // userIds
  createdAt: Date;
}

export interface RestockPrediction {
  productId: string;
  variantId?: string;
  currentStock: number;
  avgDailySales: number;
  daysUntilStockout: number;
  recommendedReorderPoint: number;
  recommendedReorderQuantity: number;
  confidence: number;
  seasonalityFactor: number;
  trend: "increasing" | "stable" | "decreasing";
}

export interface ReorderSuggestion {
  productId: string;
  variantId?: string;
  productName: string;
  sku: string;
  currentStock: number;
  suggestedQuantity: number;
  unitCost: number;
  totalCost: number;
  supplierId?: string;
  supplierName?: string;
  urgency: "critical" | "high" | "medium" | "low";
  reason: string;
}

export class SmartRestockService {
  private readonly DEFAULT_VELOCITY_DAYS = 30;
  private readonly SAFETY_STOCK_DAYS = 7;

  /**
   * Create restock alert for product
   */
  async createAlert(
    storeId: string,
    data: {
      productId: string;
      variantId?: string;
      thresholdType: RestockAlert["thresholdType"];
      thresholdValue: number;
      autoReorder?: boolean;
      reorderQuantity?: number;
      reorderSupplierId?: string;
      notifyChannels?: RestockAlert["notifyChannels"];
      notifyUsers?: string[];
    }
  ): Promise<RestockAlert> {
    // Get current stock
    const inventory = await this.getCurrentStock(storeId, data.productId, data.variantId);

    const alert = await prisma.restockAlert.create({
      data: {
        storeId,
        productId: data.productId,
        variantId: data.variantId,
        thresholdType: data.thresholdType,
        thresholdValue: data.thresholdValue,
        currentStock: inventory.quantity,
        status: "active",
        triggerCount: 0,
        autoReorder: data.autoReorder || false,
        reorderQuantity: data.reorderQuantity,
        reorderSupplierId: data.reorderSupplierId,
        notifyChannels: data.notifyChannels || ["email"],
        notifyUsers: data.notifyUsers || [],
      },
    });

    return this.mapAlert(alert);
  }

  /**
   * Check inventory levels and trigger alerts
   */
  async checkInventory(storeId: string): Promise<{
    alerts: RestockAlert[];
    reorders: ReorderSuggestion[];
    predictions: RestockPrediction[];
  }> {
    const alerts: RestockAlert[] = [];
    const reorders: ReorderSuggestion[] = [];
    const predictions: RestockPrediction[] = [];

    // Get all active alerts
    const activeAlerts = await prisma.restockAlert.findMany({
      where: { storeId, status: { in: ["active", "snoozed"] } },
      include: { product: true, variant: true },
    });

    for (const alert of activeAlerts) {
      // Get current stock
      const currentStock = await this.getCurrentStock(
        storeId,
        alert.productId,
        alert.variantId
      );

      // Get sales velocity
      const velocity = await this.calculateSalesVelocity(
        storeId,
        alert.productId,
        alert.variantId
      );

      // Generate prediction
      const prediction = this.generatePrediction(currentStock.quantity, velocity);
      predictions.push({
        productId: alert.productId,
        variantId: alert.variantId,
        currentStock: currentStock.quantity,
        avgDailySales: velocity.avgDailySales,
        daysUntilStockout: prediction.daysUntilStockout,
        recommendedReorderPoint: prediction.reorderPoint,
        recommendedReorderQuantity: prediction.reorderQuantity,
        confidence: prediction.confidence,
        seasonalityFactor: velocity.seasonalityFactor,
        trend: velocity.trend,
      });

      // Check if threshold breached
      const thresholdBreached = this.checkThreshold(
        currentStock.quantity,
        alert.thresholdType,
        alert.thresholdValue,
        velocity
      );

      if (thresholdBreached && alert.status !== "triggered") {
        // Update alert status
        const updated = await prisma.restockAlert.update({
          where: { id: alert.id },
          data: {
            status: "triggered",
            currentStock: currentStock.quantity,
            lastTriggeredAt: new Date(),
            triggerCount: { increment: 1 },
          },
        });

        alerts.push(this.mapAlert(updated));

        // Send notifications
        await this.sendNotifications(alert);

        // Generate reorder suggestion
        const suggestion = await this.generateReorderSuggestion(
          storeId,
          alert,
          currentStock.quantity,
          velocity
        );
        reorders.push(suggestion);

        // Auto-reorder if enabled
        if (alert.autoReorder && alert.reorderQuantity && alert.reorderSupplierId) {
          await this.createPurchaseOrder(storeId, alert, suggestion);
        }
      } else {
        // Update current stock
        await prisma.restockAlert.update({
          where: { id: alert.id },
          data: { currentStock: currentStock.quantity },
        });
      }
    }

    return { alerts, reorders, predictions };
  }

  /**
   * Calculate sales velocity for product
   */
  async calculateSalesVelocity(
    storeId: string,
    productId: string,
    variantId?: string,
    days = this.DEFAULT_VELOCITY_DAYS
  ): Promise<{
    avgDailySales: number;
    totalSales: number;
    daysWithSales: number;
    seasonalityFactor: number;
    trend: "increasing" | "stable" | "decreasing";
  }> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get order items for product
    const orderItems = await prisma.orderItem.findMany({
      where: {
        storeId,
        productId,
        variantId: variantId || null,
        order: {
          status: { notIn: ["cancelled", "refunded"] },
          createdAt: { gte: startDate },
        },
      },
      include: { order: true },
    });

    const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const avgDailySales = totalQuantity / days;

    // Calculate days with sales
    const salesDays = new Set(orderItems.map((item) => item.order.createdAt.toDateString()));

    // Detect trend (compare first half vs second half)
    const midpoint = new Date(startDate.getTime() + (days / 2) * 24 * 60 * 60 * 1000);
    const firstHalf = orderItems.filter((i) => i.order.createdAt < midpoint);
    const secondHalf = orderItems.filter((i) => i.order.createdAt >= midpoint);

    const firstHalfAvg = firstHalf.reduce((s, i) => s + i.quantity, 0) / (days / 2);
    const secondHalfAvg = secondHalf.reduce((s, i) => s + i.quantity, 0) / (days / 2);

    let trend: "increasing" | "stable" | "decreasing" = "stable";
    if (secondHalfAvg > firstHalfAvg * 1.2) trend = "increasing";
    else if (secondHalfAvg < firstHalfAvg * 0.8) trend = "decreasing";

    // Simple seasonality (weekday vs weekend)
    const weekdaySales = orderItems.filter(
      (i) => ![0, 6].includes(i.order.createdAt.getDay())
    );
    const weekendSales = orderItems.filter((i) => [0, 6].includes(i.order.createdAt.getDay()));

    const seasonalityFactor =
      weekendSales.length > 0
        ? (weekdaySales.length / 5) / (weekendSales.length / 2)
        : 1;

    return {
      avgDailySales,
      totalSales: totalQuantity,
      daysWithSales: salesDays.size,
      seasonalityFactor,
      trend,
    };
  }

  /**
   * Get restock suggestions for store
   */
  async getRestockSuggestions(storeId: string): Promise<ReorderSuggestion[]> {
    const suggestions: ReorderSuggestion[] = [];

    // Get all products with inventory
    const products = await prisma.product.findMany({
      where: { storeId },
      include: { variants: true, inventory: true, supplierProducts: { include: { supplier: true } } },
    });

    for (const product of products) {
      // Check base product
      if (!product.hasVariants) {
        const velocity = await this.calculateSalesVelocity(storeId, product.id);
        const currentStock = product.inventory?.quantity || 0;
        const prediction = this.generatePrediction(currentStock, velocity);

        if (prediction.daysUntilStockout <= this.SAFETY_STOCK_DAYS) {
          suggestions.push(
            await this.buildReorderSuggestion(
              storeId,
              product,
              undefined,
              currentStock,
              prediction,
              velocity
            )
          );
        }
      } else {
        // Check variants
        for (const variant of product.variants) {
          const velocity = await this.calculateSalesVelocity(storeId, product.id, variant.id);
          const currentStock = variant.inventory?.quantity || 0;
          const prediction = this.generatePrediction(currentStock, velocity);

          if (prediction.daysUntilStockout <= this.SAFETY_STOCK_DAYS) {
            suggestions.push(
              await this.buildReorderSuggestion(
                storeId,
                product,
                variant,
                currentStock,
                prediction,
                velocity
              )
            );
          }
        }
      }
    }

    // Sort by urgency
    return suggestions.sort((a, b) => this.urgencyWeight(b.urgency) - this.urgencyWeight(a.urgency));
  }

  /**
   * Snooze alert
   */
  async snoozeAlert(alertId: string, hours = 24): Promise<RestockAlert> {
    const alert = await prisma.restockAlert.update({
      where: { id: alertId },
      data: { status: "snoozed", snoozeUntil: new Date(Date.now() + hours * 60 * 60 * 1000) },
    });

    return this.mapAlert(alert);
  }

  /**
   * Disable alert
   */
  async disableAlert(alertId: string): Promise<RestockAlert> {
    const alert = await prisma.restockAlert.update({
      where: { id: alertId },
      data: { status: "disabled" },
    });

    return this.mapAlert(alert);
  }

  /**
   * Enable alert
   */
  async enableAlert(alertId: string): Promise<RestockAlert> {
    const alert = await prisma.restockAlert.update({
      where: { id: alertId },
      data: { status: "active" },
    });

    return this.mapAlert(alert);
  }

  // Private methods
  private async getCurrentStock(
    storeId: string,
    productId: string,
    variantId?: string
  ): Promise<{ quantity: number; reserved: number; available: number }> {
    if (variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: variantId },
        include: { inventory: true },
      });
      return {
        quantity: variant?.inventory?.quantity || 0,
        reserved: variant?.inventory?.reserved || 0,
        available: (variant?.inventory?.quantity || 0) - (variant?.inventory?.reserved || 0),
      };
    }

    const inventory = await prisma.inventory.findUnique({
      where: { productId },
    });
    return {
      quantity: inventory?.quantity || 0,
      reserved: inventory?.reserved || 0,
      available: (inventory?.quantity || 0) - (inventory?.reserved || 0),
    };
  }

  private checkThreshold(
    currentStock: number,
    thresholdType: string,
    thresholdValue: number,
    velocity: { avgDailySales: number }
  ): boolean {
    switch (thresholdType) {
      case "fixed":
        return currentStock <= thresholdValue;
      case "percentage":
        // Would need max stock for this calculation
        return currentStock <= thresholdValue;
      case "velocity_based": {
        const daysOfStock = velocity.avgDailySales > 0 ? currentStock / velocity.avgDailySales : 0;
        return daysOfStock <= thresholdValue;
      }
      default:
        return false;
    }
  }

  private generatePrediction(
    currentStock: number,
    velocity: { avgDailySales: number }
  ): {
    daysUntilStockout: number;
    reorderPoint: number;
    reorderQuantity: number;
    confidence: number;
  } {
    const daysUntilStockout = velocity.avgDailySales > 0 ? currentStock / velocity.avgDailySales : 999;
    const reorderPoint = velocity.avgDailySales * this.SAFETY_STOCK_DAYS;
    const reorderQuantity = Math.ceil(velocity.avgDailySales * 30); // 30 days supply

    // Confidence based on data quality
    const confidence = velocity.avgDailySales > 0 ? Math.min(0.95, 0.5 + velocity.daysWithSales / 30) : 0.3;

    return {
      daysUntilStockout,
      reorderPoint,
      reorderQuantity,
      confidence,
    };
  }

  private async generateReorderSuggestion(
    storeId: string,
    alert: Record<string, unknown>,
    currentStock: number,
    velocity: { avgDailySales: number; trend: string }
  ): Promise<ReorderSuggestion> {
    const product = alert.product as { name: string; sku: string; id: string };
    const variant = alert.variant as { name: string; sku: string; id: string };

    const prediction = this.generatePrediction(currentStock, velocity);

    let urgency: ReorderSuggestion["urgency"] = "low";
    if (prediction.daysUntilStockout <= 3) urgency = "critical";
    else if (prediction.daysUntilStockout <= 7) urgency = "high";
    else if (prediction.daysUntilStockout <= 14) urgency = "medium";

    const baseQuantity = alert.reorderQuantity || prediction.reorderQuantity;
    // Adjust for trend
    const trendMultiplier = velocity.trend === "increasing" ? 1.3 : velocity.trend === "decreasing" ? 0.7 : 1;
    const suggestedQuantity = Math.ceil(baseQuantity * trendMultiplier);

    // Get supplier info
    const supplierProduct = await prisma.supplierProduct.findFirst({
      where: { productId: product.id },
      include: { supplier: true },
    });

    const unitCost = supplierProduct?.unitCost || 0;

    return {
      productId: product.id,
      variantId: variant?.id,
      productName: variant ? `${product.name} - ${variant.name}` : product.name,
      sku: variant?.sku || product.sku,
      currentStock,
      suggestedQuantity,
      unitCost,
      totalCost: unitCost * suggestedQuantity,
      supplierId: supplierProduct?.supplierId,
      supplierName: supplierProduct?.supplier?.name,
      urgency,
      reason: `Stock will last ${prediction.daysUntilStockout.toFixed(1)} days at current sales velocity`,
    };
  }

  private async buildReorderSuggestion(
    storeId: string,
    product: Record<string, unknown>,
    variant: Record<string, unknown> | undefined,
    currentStock: number,
    prediction: { daysUntilStockout: number; reorderQuantity: number },
    velocity: { avgDailySales: number; trend: string }
  ): Promise<ReorderSuggestion> {
    const baseQuantity = prediction.reorderQuantity;
    const trendMultiplier = velocity.trend === "increasing" ? 1.3 : velocity.trend === "decreasing" ? 0.7 : 1;
    const suggestedQuantity = Math.ceil(baseQuantity * trendMultiplier);

    const supplierProduct = await prisma.supplierProduct.findFirst({
      where: { productId: String(product.id) },
      include: { supplier: true },
    });

    let urgency: ReorderSuggestion["urgency"] = "low";
    if (prediction.daysUntilStockout <= 3) urgency = "critical";
    else if (prediction.daysUntilStockout <= 7) urgency = "high";
    else if (prediction.daysUntilStockout <= 14) urgency = "medium";

    const unitCost = supplierProduct?.unitCost || 0;
    const productName = variant 
      ? `${String(product.name)} - ${String((variant as { name: string }).name)}` 
      : String(product.name);

    return {
      productId: String(product.id),
      variantId: variant ? String((variant as { id: string }).id) : undefined,
      productName,
      sku: variant ? String((variant as { sku: string }).sku || "") : String(product.sku || ""),
      currentStock,
      suggestedQuantity,
      unitCost,
      totalCost: unitCost * suggestedQuantity,
      supplierId: supplierProduct?.supplierId,
      supplierName: supplierProduct?.supplier?.name,
      urgency,
      reason: `Stock will last ${prediction.daysUntilStockout.toFixed(1)} days. Trend: ${velocity.trend}`,
    };
  }

  private async sendNotifications(alert: Record<string, unknown>): Promise<void> {
    const channels = (alert.notifyChannels as string[]) || [];
    const _notifyUsers = (alert.notifyUsers as string[]) || [];

    for (const channel of channels) {
      switch (channel) {
        case "email":
          // Queue email notification
          console.warn(`[Restock] Sending email for alert ${alert.id}`);
          break;
        case "slack":
          // Send Slack webhook
          console.warn(`[Restock] Sending Slack for alert ${alert.id}`);
          break;
        case "webhook":
          // Send to configured webhook
          console.warn(`[Restock] Sending webhook for alert ${alert.id}`);
          break;
      }
    }
  }

  private async createPurchaseOrder(
    storeId: string,
    alert: Record<string, unknown>,
    suggestion: ReorderSuggestion
  ): Promise<void> {
    if (!suggestion.supplierId || !alert.reorderQuantity) return;

    await prisma.purchaseOrder.create({
      data: {
        storeId,
        supplierId: suggestion.supplierId,
        status: "draft",
        items: {
          create: {
            productId: suggestion.productId,
            variantId: suggestion.variantId,
            quantity: alert.reorderQuantity as number,
            unitCost: suggestion.unitCost,
            totalCost: suggestion.totalCost,
          },
        },
        notes: `Auto-generated from restock alert ${alert.id}`,
      },
    });

    console.warn(`[Restock] Created auto purchase order for ${suggestion.productName}`);
  }

  private urgencyWeight(urgency: string): number {
    const weights: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    return weights[urgency] || 0;
  }

  private mapAlert(data: Record<string, unknown>): RestockAlert {
    return {
      id: String(data.id),
      storeId: String(data.storeId),
      productId: String(data.productId),
      variantId: data.variantId ? String(data.variantId) : undefined,
      thresholdType: data.thresholdType as RestockAlert["thresholdType"],
      thresholdValue: Number(data.thresholdValue),
      currentStock: Number(data.currentStock),
      status: data.status as RestockAlert["status"],
      lastTriggeredAt: data.lastTriggeredAt as Date,
      triggerCount: Number(data.triggerCount),
      autoReorder: Boolean(data.autoReorder),
      reorderQuantity: data.reorderQuantity ? Number(data.reorderQuantity) : undefined,
      reorderSupplierId: data.reorderSupplierId ? String(data.reorderSupplierId) : undefined,
      notifyChannels: (data.notifyChannels as RestockAlert["notifyChannels"]) || [],
      notifyUsers: (data.notifyUsers as string[]) || [],
      createdAt: data.createdAt as Date,
    };
  }
}

// Export singleton instance
export const smartRestockService = new SmartRestockService();
