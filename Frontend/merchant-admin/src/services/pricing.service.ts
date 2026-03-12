import { db } from "@/lib/db";
import { Prisma } from "@vayva/db";
import type {
  PricingRule,
  PriceHistory,
  DynamicPriceSnapshot,
  CreatePricingRuleInput,
  UpdatePricingRuleInput,
  PricingRuleType,
} from "@/types/phase1-commerce";

function toNumber(d: Prisma.Decimal | number): number {
  return typeof d === "number" ? d : d.toNumber();
}

export const PricingService = {
  // ============================================================================
  // Pricing Rules Management
  // ============================================================================

  async createRule(storeId: string, input: CreatePricingRuleInput): Promise<PricingRule> {
    const rule = await db.pricingRule?.create({
      data: {
        storeId,
        name: input.name,
        appliesTo: input.appliesTo,
        targetId: input.targetId,
        targetCategoryId: input.targetCategoryId,
        ruleType: input.ruleType,
        conditions: input.conditions as unknown as Prisma.InputJsonValue,
        adjustments: input.adjustments as unknown as Prisma.InputJsonValue,
        minPrice: input.minPrice,
        maxPrice: input.maxPrice,
        priority: input.priority ?? 1,
        isActive: input.isActive ?? true,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
      },
    });

    return this.mapPricingRule(rule);
  },

  async updateRule(ruleId: string, input: UpdatePricingRuleInput): Promise<PricingRule> {
    const rule = await db.pricingRule?.update({
      where: { id: ruleId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.appliesTo !== undefined && { appliesTo: input.appliesTo }),
        ...(input.targetId !== undefined && { targetId: input.targetId }),
        ...(input.targetCategoryId !== undefined && { targetCategoryId: input.targetCategoryId }),
        ...(input.ruleType !== undefined && { ruleType: input.ruleType }),
        ...(input.conditions !== undefined && { conditions: input.conditions as unknown as Prisma.InputJsonValue }),
        ...(input.adjustments !== undefined && { adjustments: input.adjustments as unknown as Prisma.InputJsonValue }),
        ...(input.minPrice !== undefined && { minPrice: input.minPrice }),
        ...(input.maxPrice !== undefined && { maxPrice: input.maxPrice }),
        ...(input.priority !== undefined && { priority: input.priority }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.startDate !== undefined && { startDate: input.startDate ? new Date(input.startDate) : null }),
        ...(input.endDate !== undefined && { endDate: input.endDate ? new Date(input.endDate) : null }),
      },
    });

    return this.mapPricingRule(rule);
  },

  async getRule(ruleId: string): Promise<PricingRule | null> {
    const rule = await db.pricingRule?.findUnique({
      where: { id: ruleId },
    });

    if (!rule) return null;
    return this.mapPricingRule(rule);
  },

  async getRules(
    storeId: string,
    options: { isActive?: boolean; appliesTo?: PricingRule["appliesTo"]; limit?: number; offset?: number } = {}
  ): Promise<{ rules: PricingRule[]; total: number }> {
    const where: Prisma.PricingRuleWhereInput = { storeId };
    if (options.isActive !== undefined) {
      where.isActive = options.isActive;
    }
    if (options.appliesTo) {
      where.appliesTo = options.appliesTo;
    }

    const [rules, total] = await Promise.all([
      db.pricingRule?.findMany({
        where,
        take: options.limit || 50,
        skip: options.offset || 0,
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      }),
      db.pricingRule?.count({ where }),
    ]);

    return { rules: rules.map((r: unknown) => this.mapPricingRule(r as any)), total };
  },

  async deleteRule(ruleId: string): Promise<void> {
    await db.pricingRule?.delete({
      where: { id: ruleId },
    });
  },

  // ============================================================================
  // Price Calculation
  // ============================================================================

  async calculatePrice(
    storeId: string,
    productId: string,
    basePrice: number,
    context: {
      quantity?: number;
      customerId?: string;
      timeOfDay?: number;
      dayOfWeek?: number;
      inventoryLevel?: number;
    } = {}
  ): Promise<{
    calculatedPrice: number;
    appliedRules: PricingRule[];
    priceAdjustment: number;
    adjustmentPercentage: number;
  }> {
    const now = new Date();

    // Get active rules for this store and product
    const rules = await db.pricingRule?.findMany({
      where: {
        storeId,
        isActive: true,
        AND: [
          {
            OR: [
              { appliesTo: "product", targetId: productId },
              { appliesTo: "all" },
            ],
          },
          {
            OR: [
              { startDate: { lte: now } },
              { startDate: null },
            ],
          },
          {
            OR: [
              { endDate: { gte: now } },
              { endDate: null },
            ],
          },
        ],
      },
      orderBy: { priority: "desc" },
    });

    let currentPrice = basePrice;
    const appliedRules: PricingRule[] = [];
    let totalAdjustment = 0;

    for (const rule of rules) {
      const shouldApply = await this.evaluateRule(rule, context);

      if (shouldApply) {
        const adjustment = this.calculateAdjustment(currentPrice, rule);
        totalAdjustment += adjustment;
        currentPrice += adjustment;
        appliedRules.push(this.mapPricingRule(rule));

        // Check price bounds
        if (rule.minPrice && currentPrice < toNumber(rule.minPrice)) {
          currentPrice = toNumber(rule.minPrice);
        }
        if (rule.maxPrice && currentPrice > toNumber(rule.maxPrice)) {
          currentPrice = toNumber(rule.maxPrice);
        }
      }
    }

    const adjustmentPercentage = basePrice > 0 ? (totalAdjustment / basePrice) * 100 : 0;

    return {
      calculatedPrice: Math.max(0, currentPrice),
      appliedRules,
      priceAdjustment: totalAdjustment,
      adjustmentPercentage,
    };
  },

  async evaluateRule(
    rule: Prisma.PricingRuleGetPayload<object>,
    context: {
      quantity?: number;
      customerId?: string;
      timeOfDay?: number;
      dayOfWeek?: number;
      inventoryLevel?: number;
    }
  ): Promise<boolean> {
    const conditions = rule.conditions as unknown as Array<{ type: string; min?: number; max?: number }> | null;

    if (!conditions || conditions.length === 0) {
      return true;
    }

    return conditions.every(condition => {
      switch (condition.type) {
        case "quantity":
          return context.quantity !== undefined &&
            context.quantity >= (condition.min ?? 0) &&
            context.quantity <= (condition.max ?? Infinity);
        case "time_of_day":
          return context.timeOfDay !== undefined &&
            context.timeOfDay >= (condition.min ?? 0) &&
            context.timeOfDay <= (condition.max ?? 24);
        case "day_of_week":
          return context.dayOfWeek !== undefined &&
            context.dayOfWeek >= (condition.min ?? 0) &&
            context.dayOfWeek <= (condition.max ?? 6);
        case "inventory_level":
          return context.inventoryLevel !== undefined &&
            context.inventoryLevel <= (condition.max ?? Infinity);
        default:
          return true;
      }
    });
  },

  calculateAdjustment(currentPrice: number, rule: Prisma.PricingRuleGetPayload<object>): number {
    const adjustments = rule.adjustments as unknown as Array<{
      type: "fixed_increase" | "fixed_decrease" | "percentage_increase" | "percentage_decrease" | "fixed_price";
      value: number;
    }> | null;

    if (!adjustments || adjustments.length === 0) {
      return 0;
    }

    let totalAdjustment = 0;

    for (const adj of adjustments) {
      switch (adj.type) {
        case "fixed_increase":
          totalAdjustment += adj.value;
          break;
        case "fixed_decrease":
          totalAdjustment -= adj.value;
          break;
        case "percentage_increase":
          totalAdjustment += currentPrice * (adj.value / 100);
          break;
        case "percentage_decrease":
          totalAdjustment -= currentPrice * (adj.value / 100);
          break;
        case "fixed_price":
          totalAdjustment = adj.value - currentPrice;
          break;
      }
    }

    return totalAdjustment;
  },

  // ============================================================================
  // Price History
  // ============================================================================

  async recordPriceChange(
    storeId: string,
    productId: string,
    oldPrice: number,
    newPrice: number,
    reason: string,
    ruleId?: string
  ): Promise<PriceHistory> {
    const history = await db.priceHistory?.create({
      data: {
        storeId,
        productId,
        oldPrice,
        newPrice,
        reason,
        ruleId,
      },
    });

    return this.mapPriceHistory(history);
  },

  async getPriceHistory(
    storeId: string,
    productId: string,
    options: { limit?: number; offset?: number; startDate?: Date; endDate?: Date } = {}
  ): Promise<{ history: PriceHistory[]; total: number }> {
    const where: Prisma.PriceHistoryWhereInput = { storeId, productId };

    if (options.startDate) {
      where.triggeredAt = { gte: options.startDate };
    }
    if (options.endDate) {
      where.triggeredAt = { ...(where.triggeredAt as object), lte: options.endDate };
    }

    const [history, total] = await Promise.all([
      db.priceHistory?.findMany({
        where,
        take: options.limit || 50,
        skip: options.offset || 0,
        orderBy: { triggeredAt: "desc" },
      }),
      db.priceHistory?.count({ where }),
    ]);

    return { history: history.map((h: unknown) => this.mapPriceHistory(h as any)), total };
  },

  // ============================================================================
  // Dynamic Price Snapshots (Demand-Based)
  // ============================================================================

  async createDemandSnapshot(
    storeId: string,
    date: Date,
    demandIndex: number,
    recommendedAdjustment: number,
    appliedAdjustment?: number
  ): Promise<DynamicPriceSnapshot> {
    const snapshot = await db.dynamicPriceSnapshot?.create({
      data: {
        storeId,
        date,
        demandIndex,
        recommendedAdjustment,
        appliedAdjustment,
      },
    });

    return this.mapDynamicPriceSnapshot(snapshot);
  },

  async getDemandSnapshots(
    storeId: string,
    options: { startDate?: Date; endDate?: Date; limit?: number; offset?: number } = {}
  ): Promise<{ snapshots: DynamicPriceSnapshot[]; total: number }> {
    const where: Prisma.DynamicPriceSnapshotWhereInput = { storeId };

    if (options.startDate) {
      where.date = { gte: options.startDate };
    }
    if (options.endDate) {
      where.date = { ...(where.date as object), lte: options.endDate };
    }

    const [snapshots, total] = await Promise.all([
      db.dynamicPriceSnapshot?.findMany({
        where,
        take: options.limit || 50,
        skip: options.offset || 0,
        orderBy: { date: "desc" },
      }),
      db.dynamicPriceSnapshot?.count({ where }),
    ]);

    return { snapshots: snapshots.map((s: unknown) => this.mapDynamicPriceSnapshot(s as any)), total };
  },

  async getLatestDemandSnapshot(storeId: string): Promise<DynamicPriceSnapshot | null> {
    const snapshot = await db.dynamicPriceSnapshot?.findFirst({
      where: { storeId },
      orderBy: { date: "desc" },
    });

    if (!snapshot) return null;
    return this.mapDynamicPriceSnapshot(snapshot);
  },

  // ============================================================================
  // Bulk Operations
  // ============================================================================

  async applyRulesToProducts(
    storeId: string,
    ruleIds: string[],
    productIds: string[]
  ): Promise<{
    success: boolean;
    updated: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let updated = 0;

    const rules = await db.pricingRule?.findMany({
      where: { id: { in: ruleIds }, storeId, isActive: true },
    });

    for (const productId of productIds) {
      try {
        const product = await db.product?.findUnique({
          where: { id: productId },
        });

        if (!product) {
          errors.push(`Product ${productId} not found`);
          continue;
        }

        const basePrice = toNumber(product.price);

        // Calculate new price with all rules
        let currentPrice = basePrice;
        for (const rule of rules) {
          const adjustment = this.calculateAdjustment(currentPrice, rule);
          currentPrice += adjustment;

          if (rule.minPrice && currentPrice < toNumber(rule.minPrice)) {
            currentPrice = toNumber(rule.minPrice);
          }
          if (rule.maxPrice && currentPrice > toNumber(rule.maxPrice)) {
            currentPrice = toNumber(rule.maxPrice);
          }
        }

        // Update product price
        await db.product?.update({
          where: { id: productId },
          data: { price: new Prisma.Decimal(Math.max(0, currentPrice)) },
        });

        // Record in history
        await this.recordPriceChange(
          storeId,
          productId,
          basePrice,
          Math.max(0, currentPrice),
          `Bulk pricing rule application: ${ruleIds.join(", ")}`
        );

        updated++;
      } catch (error: any) {
        errors.push(`Failed to update product ${productId}: ${error}`);
      }
    }

    return { success: errors.length === 0, updated, errors };
  },

  // ============================================================================
  // Analytics
  // ============================================================================

  async getRulePerformance(storeId: string, ruleId: string): Promise<{
    totalApplications: number;
    totalRevenueImpact: number;
    averageAdjustment: number;
    lastApplied: string | null;
  }> {
    const history = await db.priceHistory?.findMany({
      where: { storeId, ruleId },
      orderBy: { triggeredAt: "desc" },
    });

    const totalApplications = history.length;
    let totalRevenueImpact = 0;

    for (const entry of history) {
      totalRevenueImpact += toNumber(entry.newPrice) - toNumber(entry.oldPrice);
    }

    const averageAdjustment = totalApplications > 0
      ? totalRevenueImpact / totalApplications
      : 0;

    return {
      totalApplications,
      totalRevenueImpact,
      averageAdjustment,
      lastApplied: history[0]?.triggeredAt.toISOString() || null,
    };
  },

  // ============================================================================
  // Helper Methods
  // ============================================================================

  mapPricingRule(db: Prisma.PricingRuleGetPayload<object>): PricingRule {
    return {
      id: db.id,
      storeId: db.storeId,
      name: db.name,
      appliesTo: db.appliesTo as PricingRule["appliesTo"],
      targetId: db.targetId || undefined,
      targetCategoryId: db.targetCategoryId || undefined,
      ruleType: db.ruleType as PricingRuleType,
      conditions: db.conditions as unknown as PricingRule["conditions"],
      adjustments: db.adjustments as unknown as PricingRule["adjustments"],
      minPrice: db.minPrice ? toNumber(db.minPrice) : undefined,
      maxPrice: db.maxPrice ? toNumber(db.maxPrice) : undefined,
      priority: db.priority,
      isActive: db.isActive,
      startDate: db.startDate?.toISOString(),
      endDate: db.endDate?.toISOString(),
      createdAt: db.createdAt?.toISOString(),
      updatedAt: db.updatedAt?.toISOString(),
    };
  },

  mapPriceHistory(db: Prisma.PriceHistoryGetPayload<object>): PriceHistory {
    return {
      id: db.id,
      storeId: db.storeId,
      productId: db.productId || undefined,
      accommodationId: db.accommodationId || undefined,
      eventId: db.eventId || undefined,
      oldPrice: toNumber(db.oldPrice),
      newPrice: toNumber(db.newPrice),
      reason: db.reason,
      ruleId: db.ruleId || undefined,
      triggeredAt: db.triggeredAt?.toISOString(),
    };
  },

  mapDynamicPriceSnapshot(db: Prisma.DynamicPriceSnapshotGetPayload<object>): DynamicPriceSnapshot {
    return {
      id: db.id,
      storeId: db.storeId,
      date: db.date?.toISOString(),
      demandIndex: db.demandIndex,
      recommendedAdjustment: toNumber(db.recommendedAdjustment),
      appliedAdjustment: db.appliedAdjustment ? toNumber(db.appliedAdjustment) : undefined,
    };
  },
};
