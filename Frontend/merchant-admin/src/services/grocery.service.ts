import { prisma } from '@/lib/prisma';
import type {
  ProductFreshness,
  RecipeBundle,
  GrocerySubscription,
  FreshnessStatus,
} from '@/types/phase2-industry';

export class GroceryService {
  // ===== PRODUCT FRESHNESS =====

  async getProductFreshness(storeId: string, productId: string): Promise<ProductFreshness[]> {
    const records = await prisma.productFreshness?.findMany({
      where: { storeId, productId },
      orderBy: { expiryDate: 'asc' },
    });

    return records.map((r: any) => ({
      id: r.id,
      storeId: r.storeId,
      productId: r.productId,
      batchId: r.batchId,
      receivedDate: r.receivedDate,
      expiryDate: r.expiryDate,
      shelfLifeDays: r.shelfLifeDays,
      currentStatus: r.currentStatus as FreshnessStatus,
      discountApplied: r.discountApplied ? Number(r.discountApplied) : undefined,
      autoDiscountEnabled: r.autoDiscountEnabled,
      createdAt: r.createdAt,
    }));
  }

  async createFreshnessRecord(
    data: Omit<ProductFreshness, 'id' | 'createdAt' | 'currentStatus' | 'discountApplied'>
  ): Promise<ProductFreshness> {
    const record = await prisma.productFreshness?.create({
      data: {
        storeId: data.storeId,
        productId: data.productId,
        batchId: data.batchId,
        receivedDate: data.receivedDate,
        expiryDate: data.expiryDate,
        shelfLifeDays: data.shelfLifeDays,
        currentStatus: this.calculateFreshnessStatus(data.expiryDate, data.shelfLifeDays),
        autoDiscountEnabled: data.autoDiscountEnabled,
      },
    });

    return {
      id: record.id,
      storeId: record.storeId,
      productId: record.productId,
      batchId: record.batchId,
      receivedDate: record.receivedDate,
      expiryDate: record.expiryDate,
      shelfLifeDays: record.shelfLifeDays,
      currentStatus: record.currentStatus as FreshnessStatus,
      autoDiscountEnabled: record.autoDiscountEnabled,
      createdAt: record.createdAt,
    };
  }

  async updateFreshnessStatus(): Promise<number> {
    const now = new Date();

    // Mark expired items
    const expired = await prisma.productFreshness?.updateMany({
      where: {
        expiryDate: { lt: now },
        currentStatus: { not: 'expired' },
      },
      data: { currentStatus: 'expired' },
    });

    // Mark aging items (within 2 days of expiry)
    const agingThreshold = new Date();
    agingThreshold.setDate(agingThreshold.getDate() + 2);

    const aging = await prisma.productFreshness?.updateMany({
      where: {
        expiryDate: { lt: agingThreshold, gte: now },
        currentStatus: 'fresh',
      },
      data: { currentStatus: 'aging' },
    });

    return expired.count + aging.count;
  }

  async getAgingProducts(storeId: string): Promise<ProductFreshness[]> {
    const records = await prisma.productFreshness?.findMany({
      where: {
        storeId,
        currentStatus: 'aging',
        autoDiscountEnabled: true,
      },
    });

    return records.map((r: any) => ({
      id: r.id,
      storeId: r.storeId,
      productId: r.productId,
      batchId: r.batchId,
      receivedDate: r.receivedDate,
      expiryDate: r.expiryDate,
      shelfLifeDays: r.shelfLifeDays,
      currentStatus: r.currentStatus as FreshnessStatus,
      discountApplied: r.discountApplied ? Number(r.discountApplied) : undefined,
      autoDiscountEnabled: r.autoDiscountEnabled,
      createdAt: r.createdAt,
    }));
  }

  // ===== RECIPE BUNDLES =====

  async getRecipeBundles(storeId: string): Promise<RecipeBundle[]> {
    const bundles = await prisma.recipeBundle?.findMany({
      where: { storeId, isActive: true },
    });

    return bundles.map((b: any) => ({
      id: b.id,
      storeId: b.storeId,
      name: b.name,
      description: b.description ?? undefined,
      recipeId: b.recipeId,
      ingredients: b.ingredients as any,
      totalPrice: Number(b.totalPrice),
      bundlePrice: Number(b.bundlePrice),
      savings: Number(b.savings),
      imageUrl: b.imageUrl ?? undefined,
      isActive: b.isActive,
    }));
  }

  async createRecipeBundle(
    storeId: string,
    data: Omit<RecipeBundle, 'id' | 'storeId' | 'isActive'>
  ): Promise<RecipeBundle> {
    const bundle = await prisma.recipeBundle?.create({
      data: {
        storeId,
        name: data.name,
        description: data.description,
        recipeId: data.recipeId,
        ingredients: data.ingredients as any,
        totalPrice: data.totalPrice,
        bundlePrice: data.bundlePrice,
        savings: data.savings,
        imageUrl: data.imageUrl,
        isActive: true,
      },
    });

    return {
      id: bundle.id,
      storeId: bundle.storeId,
      name: bundle.name,
      description: bundle.description ?? undefined,
      recipeId: bundle.recipeId,
      ingredients: bundle.ingredients as any,
      totalPrice: Number(bundle.totalPrice),
      bundlePrice: Number(bundle.bundlePrice),
      savings: Number(bundle.savings),
      imageUrl: bundle.imageUrl ?? undefined,
      isActive: bundle.isActive,
    };
  }

  // ===== SUBSCRIPTIONS =====

  async getCustomerSubscriptions(
    storeId: string,
    customerId: string
  ): Promise<GrocerySubscription[]> {
    const subs = await prisma.grocerySubscription?.findMany({
      where: { storeId, customerId, status: 'active' },
    });

    return subs.map((s: any) => ({
      id: s.id,
      storeId: s.storeId,
      customerId: s.customerId,
      name: s.name,
      items: s.items as any,
      frequency: s.frequency as any,
      nextDelivery: s.nextDelivery,
      status: (s as any).status as any,
      totalValue: Number(s.totalValue),
    }));
  }

  async createSubscription(
    data: Omit<GrocerySubscription, 'id'>
  ): Promise<GrocerySubscription> {
    const sub = await prisma.grocerySubscription?.create({
      data: {
        storeId: data.storeId,
        customerId: data.customerId,
        name: data.name,
        items: data.items as any,
        frequency: data.frequency,
        nextDelivery: data.nextDelivery,
        status: 'active',
        totalValue: data.totalValue,
      },
    });

    return {
      id: sub.id,
      storeId: sub.storeId,
      customerId: sub.customerId,
      name: sub.name,
      items: sub.items as any,
      frequency: sub.frequency as any,
      nextDelivery: sub.nextDelivery,
      status: (sub as any).status as any,
      totalValue: Number(sub.totalValue),
    };
  }

  async pauseSubscription(id: string): Promise<GrocerySubscription> {
    const sub = await prisma.grocerySubscription?.update({
      where: { id },
      data: { status: 'paused' },
    });

    return {
      id: sub.id,
      storeId: sub.storeId,
      customerId: sub.customerId,
      name: sub.name,
      items: sub.items as any,
      frequency: sub.frequency as any,
      nextDelivery: sub.nextDelivery,
      status: (sub as any).status as any,
      totalValue: Number(sub.totalValue),
    };
  }

  async processSubscriptionDeliveries(): Promise<number> {
    const now = new Date();

    const dueSubscriptions = await prisma.grocerySubscription?.findMany({
      where: {
        status: 'active',
        nextDelivery: { lte: now },
      },
    });

    let processed = 0;
    for (const sub of dueSubscriptions) {
      // Calculate next delivery based on frequency
      const nextDelivery = new Date(sub.nextDelivery);
      switch (sub.frequency) {
        case 'weekly':
          nextDelivery.setDate(nextDelivery.getDate() + 7);
          break;
        case 'biweekly':
          nextDelivery.setDate(nextDelivery.getDate() + 14);
          break;
        case 'monthly':
          nextDelivery.setMonth(nextDelivery.getMonth() + 1);
          break;
      }

      await prisma.grocerySubscription?.update({
        where: { id: sub.id },
        data: { nextDelivery },
      });

      processed++;
    }

    return processed;
  }

  // ===== HELPERS =====

  private calculateFreshnessStatus(expiryDate: Date, shelfLifeDays: number): FreshnessStatus {
    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry <= 0) return 'expired';
    if (daysUntilExpiry <= 2) return 'aging';
    return 'fresh';
  }
}

export const groceryService = new GroceryService();
