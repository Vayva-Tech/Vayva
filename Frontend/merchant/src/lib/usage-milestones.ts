/**
 * Usage Milestones Detection Library
 * 
 * Provides utilities for detecting when merchants reach significant usage milestones.
 * Used by milestone tracker worker and real-time dashboard notifications.
 */

import { prisma } from "@vayva/db";

export interface MilestoneConfig {
  type: MilestoneType;
  threshold: number;
  label: string;
  celebrationMessage: string;
}

export type MilestoneType = 
  | "first_order"
  | "revenue_50k"
  | "revenue_100k"
  | "revenue_500k"
  | "revenue_1m"
  | "products_10"
  | "products_50"
  | "products_100"
  | "customers_10"
  | "customers_50"
  | "customers_100"
  | "orders_10"
  | "orders_50"
  | "orders_100";

/**
 * All milestone configurations
 */
export const MILESTONE_CONFIGS: Record<MilestoneType, MilestoneConfig> = {
  first_order: {
    type: "first_order",
    threshold: 1,
    label: "First Order",
    celebrationMessage: "🎉 Your first AI-powered order!",
  },
  revenue_50k: {
    type: "revenue_50k",
    threshold: 50000,
    label: "₦50K Revenue",
    celebrationMessage: "🎊 You've crossed ₦50,000 in revenue!",
  },
  revenue_100k: {
    type: "revenue_100k",
    threshold: 100000,
    label: "₦100K Revenue",
    celebrationMessage: "🚀 Amazing! ₦100,000 in revenue!",
  },
  revenue_500k: {
    type: "revenue_500k",
    threshold: 500000,
    label: "₦500K Revenue",
    celebrationMessage: "💰 Incredible! Half a million naira!",
  },
  revenue_1m: {
    type: "revenue_1m",
    threshold: 1000000,
    label: "₦1M Revenue",
    celebrationMessage: "🏆 LEGENDARY! One million naira!",
  },
  products_10: {
    type: "products_10",
    threshold: 10,
    label: "10 Products",
    celebrationMessage: "📦 Catalog growing! 10 products added.",
  },
  products_50: {
    type: "products_50",
    threshold: 50,
    label: "50 Products",
    celebrationMessage: "🛍️ Impressive catalog! 50 products.",
  },
  products_100: {
    type: "products_100",
    threshold: 100,
    label: "100 Products",
    celebrationMessage: "🏪 Mega store! 100 products listed.",
  },
  customers_10: {
    type: "customers_10",
    threshold: 10,
    label: "10 Customers",
    celebrationMessage: "👥 10 happy customers served!",
  },
  customers_50: {
    type: "customers_50",
    threshold: 50,
    label: "50 Customers",
    celebrationMessage: "🎯 50 customers and counting!",
  },
  customers_100: {
    type: "customers_100",
    threshold: 100,
    label: "100 Customers",
    celebrationMessage: "⭐ Century! 100 customers served!",
  },
  orders_10: {
    type: "orders_10",
    threshold: 10,
    label: "10 Orders",
    celebrationMessage: "📈 10 orders processed!",
  },
  orders_50: {
    type: "orders_50",
    threshold: 50,
    label: "50 Orders",
    celebrationMessage: "🚀 50 orders completed!",
  },
  orders_100: {
    type: "orders_100",
    threshold: 100,
    label: "100 Orders",
    celebrationMessage: "💪 100 orders milestone!",
  },
};

/**
 * Check if merchant has reached any new milestones
 */
export async function checkNewMilestones(storeId: string): Promise<MilestoneConfig[]> {
  const newMilestones: MilestoneConfig[] = [];

  try {
    // Get all stats in parallel
    const [
      orderCount,
      productCount,
      customerCount,
      revenueStats,
    ] = await Promise.all([
      getOrderCount(storeId),
      getProductCount(storeId),
      getCustomerCount(storeId),
      getRevenueStats(storeId),
    ]);

    // Check order milestones
    checkThreshold(
      "orders",
      orderCount,
      ["orders_10", "orders_50", "orders_100"],
      storeId,
      newMilestones
    );

    // Check product milestones
    checkThreshold(
      "products",
      productCount,
      ["products_10", "products_50", "products_100"],
      storeId,
      newMilestones
    );

    // Check customer milestones
    checkThreshold(
      "customers",
      customerCount,
      ["customers_10", "customers_50", "customers_100"],
      storeId,
      newMilestones
    );

    // Check revenue milestones
    if (revenueStats >= 50000) {
      await checkRevenueMilestone(revenueStats, storeId, newMilestones);
    }

    // Check first order
    if (orderCount >= 1) {
      await checkFirstOrder(storeId, newMilestones);
    }
  } catch (error) {
    console.error("[USAGE_MILESTONES] Error checking milestones:", error);
  }

  return newMilestones;
}

/**
 * Helper to check thresholds for count-based milestones
 */
function checkThreshold(
  prefix: string,
  count: number,
  milestoneTypes: MilestoneType[],
  storeId: string,
  newMilestones: MilestoneConfig[]
) {
  for (const milestoneType of milestoneTypes) {
    const config = MILESTONE_CONFIGS[milestoneType];
    if (count >= config.threshold) {
      newMilestones.push(config);
    }
  }
}

/**
 * Check revenue milestone specifically
 */
async function checkRevenueMilestone(
  revenue: number,
  storeId: string,
  newMilestones: MilestoneConfig[]
) {
  const revenueMilestones: MilestoneType[] = [
    "revenue_50k",
    "revenue_100k",
    "revenue_500k",
    "revenue_1m",
  ];

  for (const milestoneType of revenueMilestones) {
    const config = MILESTONE_CONFIGS[milestoneType];
    if (revenue >= config.threshold) {
      // Check if already recorded
      const exists = await prisma.milestoneRecord.findFirst({
        where: {
          storeId,
          milestoneType,
        },
      });

      if (!exists) {
        newMilestones.push(config);
      }
    }
  }
}

/**
 * Check first order milestone
 */
async function checkFirstOrder(
  storeId: string,
  newMilestones: MilestoneConfig[]
) {
  const exists = await prisma.milestoneRecord.findFirst({
    where: {
      storeId,
      milestoneType: "first_order",
    },
  });

  if (!exists) {
    newMilestones.push(MILESTONE_CONFIGS.first_order);
  }
}

/**
 * Get total order count for store
 */
async function getOrderCount(storeId: string): Promise<number> {
  return prisma.order.count({
    where: { storeId },
  });
}

/**
 * Get total product count for store
 */
async function getProductCount(storeId: string): Promise<number> {
  return prisma.product.count({
    where: { storeId },
  });
}

/**
 * Get unique customer count for store
 */
async function getCustomerCount(storeId: string): Promise<number> {
  const customers = await prisma.order.groupBy({
    by: ["customerEmail"],
    where: { storeId },
  });
  return customers.length;
}

/**
 * Get total revenue for store
 */
async function getRevenueStats(storeId: string): Promise<number> {
  const stats = await prisma.order.aggregate({
    where: { storeId },
    _sum: { total: true },
  });
  return Number(stats._sum.total || 0);
}

/**
 * Get progress to next milestone
 */
export async function getNextMilestoneProgress(
  storeId: string
): Promise<{
  currentMilestone: MilestoneConfig | null;
  nextMilestone: MilestoneConfig | null;
  progress: number;
}> {
  const [orderCount, productCount, customerCount, revenue] = await Promise.all([
    getOrderCount(storeId),
    getProductCount(storeId),
    getCustomerCount(storeId),
    getRevenueStats(storeId),
  ]);

  // Find highest achieved milestone in each category
  let highestProgress = 0;
  let currentMilestone: MilestoneConfig | null = null;
  let nextMilestone: MilestoneConfig | null = null;

  const categories = [
    { type: "orders", value: orderCount, prefixes: ["orders_10", "orders_50", "orders_100"] },
    { type: "products", value: productCount, prefixes: ["products_10", "products_50", "products_100"] },
    { type: "customers", value: customerCount, prefixes: ["customers_10", "customers_50", "customers_100"] },
  ];

  for (const category of categories) {
    const milestones = category.prefixes as MilestoneType[];
    let achievedIndex = -1;

    for (let i = 0; i < milestones.length; i++) {
      const config = MILESTONE_CONFIGS[milestones[i]];
      if (category.value >= config.threshold) {
        achievedIndex = i;
      }
    }

    if (achievedIndex >= 0 && achievedIndex < milestones.length - 1) {
      const current = MILESTONE_CONFIGS[milestones[achievedIndex]];
      const next = MILESTONE_CONFIGS[milestones[achievedIndex + 1]];
      const progress = (category.value / next.threshold) * 100;

      if (progress > highestProgress) {
        highestProgress = progress;
        currentMilestone = current;
        nextMilestone = next;
      }
    }
  }

  return {
    currentMilestone,
    nextMilestone,
    progress: Math.min(highestProgress, 100),
  };
}
