import { prisma } from "@vayva/db";

export interface SubscriptionBox {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  images: string[];
  status: "draft" | "active" | "paused" | "archived";
  frequency: "weekly" | "biweekly" | "monthly" | "bimonthly" | "quarterly";
  pricing: {
    basePrice: number;
    compareAtPrice?: number;
    shippingCost: number;
    taxRate: number;
    discount3Months?: number;
    discount6Months?: number;
    discount12Months?: number;
  };
  customization: {
    allowProductSwap: boolean;
    allowSkip: boolean;
    allowPause: boolean;
    maxSwapsPerCycle: number;
    preferenceCategories: string[];
  };
  contents: SubscriptionBoxContent[];
  curation: {
    type: "curated" | "customer_choice" | "hybrid";
    maxChoices?: number;
    surpriseItems?: number;
  };
  shippingSchedule: {
    cutoffDay: number; // Day of month for cutoff
    shipDay: number; // Day of month to ship
    leadTimeDays: number;
  };
  stats: {
    totalSubscribers: number;
    activeSubscribers: number;
    monthlyRevenue: number;
    churnRate: number;
    avgLifetimeValue: number;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionBoxContent {
  id: string;
  productId?: string;
  variantId?: string;
  name: string;
  description?: string;
  image?: string;
  category: string;
  retailPrice: number;
  isDefault: boolean;
  isOptional: boolean;
  quantity: number;
  alternatives?: string[]; // productIds
  weight: number; // for sorting/selection
}

export interface Subscription {
  id: string;
  boxId: string;
  customerId: string;
  status: "active" | "paused" | "cancelled" | "expired";
  frequency: SubscriptionBox["frequency"];
  currentCycle: number;
  totalCycles?: number; // null = indefinite
  startDate: Date;
  nextBillingDate: Date;
  nextShipDate: Date;
  lastShipDate?: Date;
  preferences: Record<string, string[]>; // category -> preferences
  selectedProducts: string[]; // Currently selected productIds
  history: Array<{
    cycle: number;
    shipDate: Date;
    products: string[];
    deliveredAt?: Date;
    skipped: boolean;
  }>;
  paymentMethod: {
    type: string;
    last4?: string;
    expiryMonth?: number;
    expiryYear?: number;
  };
  billingAddress: Record<string, unknown>;
  shippingAddress: Record<string, unknown>;
  pricing: {
    basePrice: number;
    shipping: number;
    discount: number;
    total: number;
  };
  cancellation?: {
    reason: string;
    feedback?: string;
    cancelledAt: Date;
  };
  createdAt: Date;
}

export interface BoxCuration {
  subscriptionId: string;
  cycle: number;
  products: Array<{
    productId: string;
    name: string;
    image: string;
    category: string;
    reason: string;
    isSurprise: boolean;
  }>;
  preferences: Record<string, string[]>;
  generatedAt: Date;
  expiresAt: Date; // Customer can modify until this date
}

export class SubscriptionBoxService {
  private readonly DEFAULT_CUTOFF_DAYS = 3;

  /**
   * Create a new subscription box
   */
  async createBox(
    storeId: string,
    data: {
      name: string;
      description: string;
      shortDescription: string;
      images?: string[];
      frequency: SubscriptionBox["frequency"];
      pricing: SubscriptionBox["pricing"];
      customization?: Partial<SubscriptionBox["customization"]>;
      curation?: Partial<SubscriptionBox["curation"]>;
      shippingSchedule?: Partial<SubscriptionBox["shippingSchedule"]>;
      contents: Array<Omit<SubscriptionBoxContent, "id">>;
    }
  ): Promise<SubscriptionBox> {
    const slug = this.generateSlug(data.name);

    // Check slug uniqueness
    const existing = await prisma.subscriptionBox.findFirst({
      where: { storeId, slug },
    });

    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const box = await prisma.subscriptionBox.create({
      data: {
        storeId,
        name: data.name,
        slug: finalSlug,
        description: data.description,
        shortDescription: data.shortDescription,
        images: data.images || [],
        status: "draft",
        frequency: data.frequency,
        pricing: data.pricing,
        customization: {
          allowProductSwap: true,
          allowSkip: true,
          allowPause: true,
          maxSwapsPerCycle: 3,
          preferenceCategories: [],
          ...data.customization,
        },
        curation: {
          type: "curated",
          ...data.curation,
        },
        shippingSchedule: {
          cutoffDay: 25,
          shipDay: 1,
          leadTimeDays: this.DEFAULT_CUTOFF_DAYS,
          ...data.shippingSchedule,
        },
        contents: data.contents as unknown as Record<string, unknown>[],
        stats: {
          totalSubscribers: 0,
          activeSubscribers: 0,
          monthlyRevenue: 0,
          churnRate: 0,
          avgLifetimeValue: 0,
        },
      },
    });

    return this.mapBox(box);
  }

  /**
   * Subscribe customer to a box
   */
  async subscribe(
    boxId: string,
    customerId: string,
    data: {
      frequency?: SubscriptionBox["frequency"];
      totalCycles?: number;
      preferences: Record<string, string[]>;
      paymentMethod: Subscription["paymentMethod"];
      billingAddress: Record<string, unknown>;
      shippingAddress: Record<string, unknown>;
    }
  ): Promise<Subscription> {
    const box = await prisma.subscriptionBox.findUnique({ where: { id: boxId } });
    if (!box) throw new Error("Subscription box not found");
    if (box.status !== "active") throw new Error("This box is not available for subscription");

    const frequency = data.frequency || box.frequency;
    const nextDates = this.calculateNextDates(frequency, box.shippingSchedule as SubscriptionBox["shippingSchedule"]);

    // Calculate pricing
    const pricing = this.calculatePricing(box.pricing as SubscriptionBox["pricing"], data.totalCycles);

    // Initial curation
    const selectedProducts = await this.curateProducts(boxId, data.preferences, 0);

    const subscription = await prisma.subscription.create({
      data: {
        boxId,
        customerId,
        status: "active",
        frequency,
        currentCycle: 1,
        totalCycles: data.totalCycles,
        startDate: new Date(),
        nextBillingDate: nextDates.billing,
        nextShipDate: nextDates.shipping,
        preferences: data.preferences,
        selectedProducts,
        history: [],
        paymentMethod: data.paymentMethod,
        billingAddress: data.billingAddress,
        shippingAddress: data.shippingAddress,
        pricing,
      },
    });

    // Update box stats
    await this.updateBoxStats(boxId);

    return this.mapSubscription(subscription);
  }

  /**
   * Curate products for a subscription cycle
   */
  async curateProducts(
    boxId: string,
    preferences: Record<string, string[]>,
    cycle: number
  ): Promise<string[]> {
    const box = await prisma.subscriptionBox.findUnique({ where: { id: boxId } });
    if (!box) throw new Error("Box not found");

    const contents = (box.contents as SubscriptionBoxContent[]).filter((c) => c.isDefault);
    const selected: string[] = [];

    const curationType = (box.curation as { type: string })?.type || "curated";

    switch (curationType) {
      case "curated":
        // Algorithm selects based on preferences and weights
        for (const content of contents) {
          const categoryPrefs = preferences[content.category] || [];
          const matchScore = this.calculateMatchScore(content, categoryPrefs);
          
          if (matchScore > 0.5 || content.isDefault) {
            selected.push(content.productId!);
          }
        }
        break;

      case "customer_choice":
        // Customer selects from available options
        selected.push(...contents.filter((c) => c.isDefault).map((c) => c.productId!));
        break;

      case "hybrid":
        // Mix of curated and customer choice
        const curatedCount = Math.floor(contents.length * 0.7);
        const choiceCount = contents.length - curatedCount;
        
        selected.push(...contents.slice(0, curatedCount).map((c) => c.productId!));
        break;
    }

    // Add surprise items if configured
    const surpriseCount = (box.curation as { surpriseItems?: number })?.surpriseItems || 0;
    if (surpriseCount > 0) {
      const surpriseProducts = await this.selectSurpriseItems(boxId, preferences, surpriseCount);
      selected.push(...surpriseProducts);
    }

    return selected;
  }

  /**
   * Generate curation preview for customer
   */
  async generateCuration(
    subscriptionId: string,
    cycle: number
  ): Promise<BoxCuration> {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { box: true },
    });

    if (!subscription) throw new Error("Subscription not found");

    const selectedProducts = await this.curateProducts(
      subscription.boxId,
      subscription.preferences as Record<string, string[]>,
      cycle
    );

    const products: BoxCuration["products"] = [];

    for (const productId of selectedProducts) {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (product) {
        products.push({
          productId,
          name: product.name,
          image: (product.images as Array<{ url: string }>)?.[0]?.url || "",
          category: product.categoryId || "general",
          reason: "Selected based on your preferences",
          isSurprise: false,
        });
      }
    }

    const curation: BoxCuration = {
      subscriptionId,
      cycle,
      products,
      preferences: subscription.preferences as Record<string, string[]>,
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days to modify
    };

    // Store curation
    await prisma.boxCuration.create({
      data: {
        subscriptionId,
        cycle,
        products: products as unknown as Record<string, unknown>[],
        preferences: subscription.preferences as Record<string, unknown>,
        generatedAt: curation.generatedAt,
        expiresAt: curation.expiresAt,
      },
    });

    return curation;
  }

  /**
   * Customer customizes their upcoming box
   */
  async customizeBox(
    subscriptionId: string,
    data: {
      swapProducts?: Array<{
        removeProductId: string;
        addProductId: string;
      }>;
      skip?: boolean;
      pause?: boolean;
      pauseUntil?: Date;
    }
  ): Promise<Subscription> {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { box: true },
    });

    if (!subscription) throw new Error("Subscription not found");

    const box = subscription.box as SubscriptionBox;
    const customization = box.customization;

    let updated = subscription;

    // Handle product swaps
    if (data.swapProducts && data.swapProducts.length > 0) {
      if (!customization.allowProductSwap) {
        throw new Error("Product swaps are not allowed for this box");
      }

      const currentSwaps = data.swapProducts.length;
      if (currentSwaps > customization.maxSwapsPerCycle) {
        throw new Error(`Maximum ${customization.maxSwapsPerCycle} swaps allowed per cycle`);
      }

      const selectedProducts = [...subscription.selectedProducts];

      for (const swap of data.swapProducts) {
        const index = selectedProducts.indexOf(swap.removeProductId);
        if (index >= 0) {
          selectedProducts[index] = swap.addProductId;
        }
      }

      updated = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: { selectedProducts },
      });
    }

    // Handle skip
    if (data.skip && customization.allowSkip) {
      // Add to history as skipped
      const history = subscription.history as Subscription["history"];
      history.push({
        cycle: subscription.currentCycle,
        shipDate: subscription.nextShipDate,
        products: [],
        skipped: true,
      });

      // Move to next cycle
      const nextDates = this.calculateNextDates(subscription.frequency, box.shippingSchedule);
      
      updated = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          currentCycle: subscription.currentCycle + 1,
          nextBillingDate: nextDates.billing,
          nextShipDate: nextDates.shipping,
          history,
        },
      });
    }

    // Handle pause
    if (data.pause && customization.allowPause) {
      updated = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: "paused",
          nextBillingDate: data.pauseUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    return this.mapSubscription(updated);
  }

  /**
   * Process billing for due subscriptions
   */
  async processBilling(cycleDate: Date): Promise<{
    processed: number;
    successful: number;
    failed: number;
    revenue: number;
  }> {
    const dueSubscriptions = await prisma.subscription.findMany({
      where: {
        status: "active",
        nextBillingDate: { lte: cycleDate },
      },
      include: { box: true },
    });

    const stats = { processed: 0, successful: 0, failed: 0, revenue: 0 };

    for (const subscription of dueSubscriptions) {
      stats.processed++;

      try {
        const pricing = subscription.pricing as Subscription["pricing"];
        
        // Process payment
        const paymentResult = await this.processPayment(
          subscription.id,
          pricing.total,
          subscription.paymentMethod
        );

        if (paymentResult.success) {
          stats.successful++;
          stats.revenue += pricing.total;

          // Create order for fulfillment
          await this.createFulfillmentOrder(subscription);

          // Update subscription
          const nextDates = this.calculateNextDates(
            subscription.frequency,
            (subscription.box as SubscriptionBox).shippingSchedule
          );

          // Add to history
          const history = subscription.history as Subscription["history"];
          history.push({
            cycle: subscription.currentCycle,
            shipDate: subscription.nextShipDate,
            products: subscription.selectedProducts,
            skipped: false,
          });

          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              currentCycle: subscription.currentCycle + 1,
              nextBillingDate: nextDates.billing,
              nextShipDate: nextDates.shipping,
              lastShipDate: subscription.nextShipDate,
              selectedProducts: await this.curateProducts(
                subscription.boxId,
                subscription.preferences as Record<string, string[]>,
                subscription.currentCycle + 1
              ),
              history,
            },
          });
        } else {
          stats.failed++;
          await this.handlePaymentFailure(subscription.id, paymentResult.error);
        }
      } catch (error) {
        stats.failed++;
        console.error(`[Subscription] Billing failed for ${subscription.id}:`, error);
      }
    }

    return stats;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    data: {
      reason: string;
      feedback?: string;
      immediate?: boolean;
    }
  ): Promise<Subscription> {
    const subscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: data.immediate ? "cancelled" : "active", // Will cancel after current cycle
        cancellation: {
          reason: data.reason,
          feedback: data.feedback,
          cancelledAt: new Date(),
        },
        totalCycles: data.immediate ? undefined : subscription.currentCycle,
      },
    });

    // Update stats
    await this.updateBoxStats(subscription.boxId);

    return this.mapSubscription(subscription);
  }

  /**
   * Get subscription analytics
   */
  async getBoxAnalytics(boxId: string): Promise<{
    subscribers: {
      total: number;
      active: number;
      paused: number;
      churned: number;
      newThisMonth: number;
    };
    revenue: {
      mrr: number;
      arr: number;
      lifetime: number;
      averageValue: number;
    };
    retention: {
      rate3Month: number;
      rate6Month: number;
      rate12Month: number;
    };
    topPreferences: Array<{ category: string; count: number }>;
  }> {
    const [
      totalSubscribers,
      activeSubscribers,
      pausedSubscribers,
      cancelledSubscribers,
      newSubscribers,
    ] = await Promise.all([
      prisma.subscription.count({ where: { boxId } }),
      prisma.subscription.count({ where: { boxId, status: "active" } }),
      prisma.subscription.count({ where: { boxId, status: "paused" } }),
      prisma.subscription.count({ where: { boxId, status: "cancelled" } }),
      prisma.subscription.count({
        where: {
          boxId,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    const revenue = await prisma.subscription.aggregate({
      where: { boxId, status: "active" },
      _sum: { "pricing.total": true },
      _avg: { "pricing.total": true },
    });

    return {
      subscribers: {
        total: totalSubscribers,
        active: activeSubscribers,
        paused: pausedSubscribers,
        churned: cancelledSubscribers,
        newThisMonth: newSubscribers,
      },
      revenue: {
        mrr: (revenue._sum as { "pricing.total": number })?.["pricing.total"] || 0,
        arr: ((revenue._sum as { "pricing.total": number })?.["pricing.total"] || 0) * 12,
        lifetime: 0, // Would need order history
        averageValue: (revenue._avg as { "pricing.total": number })?.["pricing.total"] || 0,
      },
      retention: {
        rate3Month: 0,
        rate6Month: 0,
        rate12Month: 0,
      },
      topPreferences: [],
    };
  }

  // Private methods
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 50);
  }

  private calculateNextDates(
    frequency: string,
    schedule: SubscriptionBox["shippingSchedule"]
  ): { billing: Date; shipping: Date } {
    const now = new Date();
    const billing = new Date(now);
    const shipping = new Date(now);

    switch (frequency) {
      case "weekly":
        billing.setDate(billing.getDate() + 7);
        shipping.setDate(shipping.getDate() + 7 + schedule.leadTimeDays);
        break;
      case "biweekly":
        billing.setDate(billing.getDate() + 14);
        shipping.setDate(shipping.getDate() + 14 + schedule.leadTimeDays);
        break;
      case "monthly":
        billing.setMonth(billing.getMonth() + 1);
        shipping.setMonth(shipping.getMonth() + 1);
        shipping.setDate(schedule.shipDay);
        break;
      case "bimonthly":
        billing.setMonth(billing.getMonth() + 2);
        shipping.setMonth(shipping.getMonth() + 2);
        shipping.setDate(schedule.shipDay);
        break;
      case "quarterly":
        billing.setMonth(billing.getMonth() + 3);
        shipping.setMonth(shipping.getMonth() + 3);
        shipping.setDate(schedule.shipDay);
        break;
    }

    return { billing, shipping };
  }

  private calculatePricing(
    boxPricing: SubscriptionBox["pricing"],
    totalCycles?: number
  ): Subscription["pricing"] {
    let discount = 0;

    if (totalCycles) {
      if (totalCycles >= 12 && boxPricing.discount12Months) {
        discount = boxPricing.discount12Months;
      } else if (totalCycles >= 6 && boxPricing.discount6Months) {
        discount = boxPricing.discount6Months;
      } else if (totalCycles >= 3 && boxPricing.discount3Months) {
        discount = boxPricing.discount3Months;
      }
    }

    const basePrice = boxPricing.basePrice;
    const discountAmount = Math.round(basePrice * (discount / 100));
    const shipping = boxPricing.shippingCost;

    return {
      basePrice,
      shipping,
      discount: discountAmount,
      total: basePrice - discountAmount + shipping,
    };
  }

  private calculateMatchScore(content: SubscriptionBoxContent, preferences: string[]): number {
    let score = 0;
    
    // Check if any preference keywords match
    for (const pref of preferences) {
      if (content.name.toLowerCase().includes(pref.toLowerCase())) {
        score += 0.3;
      }
      if (content.description?.toLowerCase().includes(pref.toLowerCase())) {
        score += 0.2;
      }
    }

    // Add weight from content
    score += content.weight * 0.5;

    return Math.min(1, score);
  }

  private async selectSurpriseItems(
    boxId: string,
    preferences: Record<string, string[]>,
    count: number
  ): Promise<string[]> {
    const box = await prisma.subscriptionBox.findUnique({ where: { id: boxId } });
    if (!box) return [];

    const contents = (box.contents as SubscriptionBoxContent[]).filter((c) => !c.isDefault);
    
    // Random selection for surprise
    const shuffled = contents.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map((c) => c.productId!);
  }

  private async processPayment(
    subscriptionId: string,
    amount: number,
    paymentMethod: Subscription["paymentMethod"]
  ): Promise<{ success: boolean; error?: string; transactionId?: string }> {
    // Integrate with payment provider
    console.log(`[Subscription] Processing payment for ${subscriptionId}: ₦${amount / 100}`);
    return { success: true, transactionId: `txn_${Date.now()}` };
  }

  private async createFulfillmentOrder(subscription: Record<string, unknown>): Promise<void> {
    // Create order for warehouse fulfillment
    console.log(`[Subscription] Creating fulfillment order for ${subscription.id}`);
  }

  private async handlePaymentFailure(subscriptionId: string, error?: string): Promise<void> {
    // Retry logic, notification, etc
    console.log(`[Subscription] Payment failed for ${subscriptionId}: ${error}`);
  }

  private async updateBoxStats(boxId: string): Promise<void> {
    const [activeCount, totalRevenue] = await Promise.all([
      prisma.subscription.count({ where: { boxId, status: "active" } }),
      prisma.subscription.aggregate({
        where: { boxId, status: "active" },
        _sum: { "pricing.total": true },
      }),
    ]);

    await prisma.subscriptionBox.update({
      where: { id: boxId },
      data: {
        stats: {
          activeSubscribers: activeCount,
          monthlyRevenue: (totalRevenue._sum as { "pricing.total": number })?.["pricing.total"] || 0,
        },
      },
    });
  }

  private mapBox(data: Record<string, unknown>): SubscriptionBox {
    return {
      id: String(data.id),
      storeId: String(data.storeId),
      name: String(data.name),
      slug: String(data.slug),
      description: String(data.description),
      shortDescription: String(data.shortDescription),
      images: (data.images as string[]) || [],
      status: data.status as SubscriptionBox["status"],
      frequency: data.frequency as SubscriptionBox["frequency"],
      pricing: data.pricing as SubscriptionBox["pricing"],
      customization: data.customization as SubscriptionBox["customization"],
      contents: (data.contents as SubscriptionBoxContent[]) || [],
      curation: data.curation as SubscriptionBox["curation"],
      shippingSchedule: data.shippingSchedule as SubscriptionBox["shippingSchedule"],
      stats: data.stats as SubscriptionBox["stats"],
      seo: data.seo as SubscriptionBox["seo"],
      createdAt: data.createdAt as Date,
      updatedAt: data.updatedAt as Date,
    };
  }

  private mapSubscription(data: Record<string, unknown>): Subscription {
    return {
      id: String(data.id),
      boxId: String(data.boxId),
      customerId: String(data.customerId),
      status: data.status as Subscription["status"],
      frequency: data.frequency as Subscription["frequency"],
      currentCycle: Number(data.currentCycle),
      totalCycles: data.totalCycles ? Number(data.totalCycles) : undefined,
      startDate: data.startDate as Date,
      nextBillingDate: data.nextBillingDate as Date,
      nextShipDate: data.nextShipDate as Date,
      lastShipDate: data.lastShipDate as Date,
      preferences: (data.preferences as Record<string, string[]>) || {},
      selectedProducts: (data.selectedProducts as string[]) || [],
      history: (data.history as Subscription["history"]) || [],
      paymentMethod: data.paymentMethod as Subscription["paymentMethod"],
      billingAddress: (data.billingAddress as Record<string, unknown>) || {},
      shippingAddress: (data.shippingAddress as Record<string, unknown>) || {},
      pricing: data.pricing as Subscription["pricing"],
      cancellation: data.cancellation as Subscription["cancellation"],
      createdAt: data.createdAt as Date,
    };
  }
}

// Export singleton instance
export const subscriptionBoxService = new SubscriptionBoxService();
