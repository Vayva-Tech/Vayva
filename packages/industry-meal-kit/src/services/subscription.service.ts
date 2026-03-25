// ============================================================================
// Subscription Service
// ============================================================================

import type { MealKitSubscription } from '../../../../infra/db/src/generated/client';
import { PrismaClient } from '@vayva/db';
import { MealKitSubscriptionSchema, MealKitPlanType } from '../types';

export class SubscriptionService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new meal kit subscription
   */
  async createSubscription(data: {
    storeId: string;
    customerId: string;
    planType: MealKitPlanType;
    portionsPerMeal: number;
    mealsPerWeek: number;
    nextDelivery: Date;
    preferences?: any;
  }): Promise<MealKitSubscription> {
    // Validate input
    const validatedData = MealKitSubscriptionSchema.parse(data);

    return this.prisma.mealKitSubscription.create({
      data: {
        ...validatedData,
        status: 'active',
        skipWeeks: [],
      },
    });
  }

  /**
   * Get subscription by ID
   */
  async getSubscriptionById(id: string): Promise<MealKitSubscription | null> {
    return this.prisma.mealKitSubscription.findUnique({
      where: { id },
    });
  }

  /**
   * Get customer's active subscription
   */
  async getCustomerActiveSubscription(
    storeId: string,
    customerId: string
  ): Promise<MealKitSubscription | null> {
    return this.prisma.mealKitSubscription.findFirst({
      where: {
        storeId,
        customerId,
        status: 'active',
      },
    });
  }

  /**
   * Update subscription
   */
  async updateSubscription(
    id: string,
    data: Partial<{
      planType: MealKitPlanType;
      portionsPerMeal: number;
      mealsPerWeek: number;
      nextDelivery: Date;
      preferences: any;
    }>
  ): Promise<MealKitSubscription> {
    return this.prisma.mealKitSubscription.update({
      where: { id },
      data,
    });
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(id: string): Promise<MealKitSubscription> {
    return this.prisma.mealKitSubscription.update({
      where: { id },
      data: {
        status: 'cancelled',
      },
    });
  }

  /**
   * Skip weeks for subscription
   */
  async skipWeeks(id: string, weeks: string[]): Promise<MealKitSubscription> {
    const subscription = await this.getSubscriptionById(id);
    
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const currentSkipWeeks = subscription.skipWeeks || [];
    const newSkipWeeks = [...new Set([...currentSkipWeeks, ...weeks])];

    if (newSkipWeeks.length > 4) {
      throw new Error('Maximum 4 weeks can be skipped');
    }

    return this.prisma.mealKitSubscription.update({
      where: { id },
      data: {
        skipWeeks: newSkipWeeks,
      },
    });
  }

  /**
   * Get all subscriptions for a store
   */
  async getStoreSubscriptions(storeId: string): Promise<MealKitSubscription[]> {
    return this.prisma.mealKitSubscription.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get subscription statistics
   */
  async getSubscriptionStats(storeId: string) {
    const subscriptions = await this.getStoreSubscriptions(storeId);
    
    return {
      total: subscriptions.length,
      active: subscriptions.filter(s => s.status === 'active').length,
      cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
      paused: subscriptions.filter(s => s.status === 'paused').length,
      byPlan: subscriptions.reduce((acc, sub) => {
        acc[sub.planType] = (acc[sub.planType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
