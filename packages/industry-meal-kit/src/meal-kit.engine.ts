// @ts-nocheck
// ============================================================================
// Meal Kit Engine - Core Business Logic
// ============================================================================

import { PrismaClient } from '@prisma/client';

export interface MealKitConfig {
  defaultPortionsPerMeal: number;
  defaultMealsPerWeek: number;
  maxSkipWeeks: number;
  deliveryDays: string[];
  planPricing: Record<string, { basePrice: number; perMealPrice: number }>;
}

export class MealKitEngine {
  private prisma: PrismaClient;
  private config: MealKitConfig;

  constructor(prisma: PrismaClient, config?: Partial<MealKitConfig>) {
    this.prisma = prisma;
    this.config = {
      defaultPortionsPerMeal: 4,
      defaultMealsPerWeek: 3,
      maxSkipWeeks: 4,
      deliveryDays: ['Monday', 'Wednesday', 'Friday'],
      planPricing: {
        BASIC: { basePrice: 5000, perMealPrice: 2500 },
        PREMIUM: { basePrice: 8000, perMealPrice: 3500 },
        FAMILY: { basePrice: 12000, perMealPrice: 4500 },
        VEGAN: { basePrice: 7000, perMealPrice: 3000 },
        KETO: { basePrice: 9000, perMealPrice: 4000 },
        LOW_CARB: { basePrice: 8500, perMealPrice: 3800 },
      },
      ...config,
    };
  }

  /**
   * Calculate subscription price based on plan and selections
   */
  calculateSubscriptionPrice(
    planType: string,
    portionsPerMeal: number,
    mealsPerWeek: number
  ): number {
    const pricing = this.config.planPricing[planType] || this.config.planPricing.BASIC;
    const portionMultiplier = portionsPerMeal / this.config.defaultPortionsPerMeal;
    
    return Math.round(
      (pricing.basePrice + (pricing.perMealPrice * mealsPerWeek)) * portionMultiplier
    );
  }

  /**
   * Get available recipes for a specific week
   */
  async getWeeklyRecipes(storeId: string, weekStartDate: Date) {
    const weekMenu = await this.prisma.weeklyMenu.findFirst({
      where: {
        storeId,
        weekStartDate,
        isActive: true,
      },
      include: {
        // Add recipe details if relation exists
      },
    });

    return weekMenu?.recipes || [];
  }

  /**
   * Create or update weekly menu
   */
  async upsertWeeklyMenu(
    storeId: string,
    weekStartDate: Date,
    weekEndDate: Date,
    recipes: any[]
  ) {
    return this.prisma.weeklyMenu.upsert({
      where: {
        storeId_weekStartDate: {
          storeId,
          weekStartDate,
        },
      },
      update: {
        weekEndDate,
        recipes,
      },
      create: {
        storeId,
        weekStartDate,
        weekEndDate,
        recipes,
      },
    });
  }

  /**
   * Check delivery slot availability
   */
  async checkDeliverySlotAvailability(
    storeId: string,
    date: Date,
    zipCode: string
  ): Promise<{ available: boolean; slots?: any[] }> {
    const slots = await this.prisma.deliverySlot.findMany({
      where: {
        storeId,
        date,
        isAvailable: true,
        zipCodes: {
          has: zipCode,
        },
      },
    });

    const availableSlots = slots.filter(slot => slot.bookedCount < slot.maxCapacity);

    return {
      available: availableSlots.length > 0,
      slots: availableSlots,
    };
  }

  /**
   * Book a delivery slot
   */
  async bookDeliverySlot(slotId: string): Promise<boolean> {
    const slot = await this.prisma.deliverySlot.findUnique({
      where: { id: slotId },
    });

    if (!slot || !slot.isAvailable || slot.bookedCount >= slot.maxCapacity) {
      return false;
    }

    await this.prisma.deliverySlot.update({
      where: { id: slotId },
      data: {
        bookedCount: { increment: 1 },
      },
    });

    return true;
  }

  /**
   * Get customer meal preferences
   */
  async getCustomerPreferences(storeId: string, customerId: string) {
    return this.prisma.customerMealPreference.findFirst({
      where: {
        storeId,
        customerId,
      },
    });
  }

  /**
   * Update customer meal preferences
   */
  async updateCustomerPreferences(
    storeId: string,
    customerId: string,
    preferences: {
      dislikes?: string[];
      allergies?: string[];
      dietaryType?: string;
      spiceLevel?: string;
      notes?: string;
    }
  ) {
    return this.prisma.customerMealPreference.upsert({
      where: {
        storeId_customerId: {
          storeId,
          customerId,
        },
      },
      update: preferences,
      create: {
        storeId,
        customerId,
        ...preferences,
      },
    });
  }

  /**
   * Get subscription by customer
   */
  async getCustomerSubscription(storeId: string, customerId: string) {
    return this.prisma.mealKitSubscription.findFirst({
      where: {
        storeId,
        customerId,
      },
    });
  }

  /**
   * Create new subscription
   */
  async createSubscription(data: {
    storeId: string;
    customerId: string;
    planType: string;
    portionsPerMeal: number;
    mealsPerWeek: number;
    nextDelivery: Date;
    preferences?: any;
  }) {
    const totalPrice = this.calculateSubscriptionPrice(
      data.planType,
      data.portionsPerMeal,
      data.mealsPerWeek
    );

    return this.prisma.mealKitSubscription.create({
      data: {
        ...data,
        status: 'active',
        skipWeeks: [],
      },
    });
  }

  /**
   * Skip weeks for subscription
   */
  async skipWeeks(subscriptionId: string, weeksToSkip: string[]) {
    const subscription = await this.prisma.mealKitSubscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const currentSkipWeeks = subscription.skipWeeks || [];
    const newSkipWeeks = [...new Set([...currentSkipWeeks, ...weeksToSkip])];

    if (newSkipWeeks.length > this.config.maxSkipWeeks) {
      throw new Error(`Maximum ${this.config.maxSkipWeeks} weeks can be skipped`);
    }

    return this.prisma.mealKitSubscription.update({
      where: { id: subscriptionId },
      data: {
        skipWeeks: newSkipWeeks,
      },
    });
  }

  getConfig() {
    return { ...this.config };
  }
}

// Singleton instance (to be initialized with Prisma client)
let mealKitEngineInstance: MealKitEngine | null = null;

export function getMealKitEngine(prisma: PrismaClient, config?: Partial<MealKitConfig>): MealKitEngine {
  if (!mealKitEngineInstance) {
    mealKitEngineInstance = new MealKitEngine(prisma, config);
  }
  return mealKitEngineInstance;
}
