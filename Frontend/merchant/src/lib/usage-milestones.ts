/**
 * Usage Milestones Detection Library
 * 
 * Provides utilities for detecting when merchants reach significant usage milestones.
 * Used by milestone tracker worker and real-time dashboard notifications.
 * 
 * MIGRATED: Now calls backend API instead of direct Prisma queries
 */

import { logger } from "@vayva/shared";

const BACKEND_URL = process.env.BACKEND_API_URL || '';

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

export interface MilestoneProgress {
  currentMilestone: MilestoneConfig | null;
  nextMilestone: MilestoneConfig | null;
  progress: number;
}

interface CheckMilestonesResult {
  newMilestones: MilestoneConfig[];
  count: number;
}

/**
 * Check if merchant has reached any new milestones
 */
export async function checkNewMilestones(storeId: string): Promise<MilestoneConfig[]> {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/usage/milestones/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ storeId }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: { message: 'Failed to check milestones' } }));
      logger.error('[UsageMilestones] Failed to check milestones', error);
      return [];
    }

    const data = await res.json();
    return data.data.newMilestones || [];
  } catch (error) {
    logger.error('[UsageMilestones] Error checking milestones', error);
    return [];
  }
}

/**
 * Get progress to next milestone
 */
export async function getNextMilestoneProgress(storeId: string): Promise<MilestoneProgress> {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/usage/milestones/progress`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch milestone progress');
    }

    const data = await res.json();
    return data;
  } catch (error) {
    logger.error('[UsageMilestones] Error fetching progress', error);
    return {
      currentMilestone: null,
      nextMilestone: null,
      progress: 0,
    };
  }
}

/**
 * Get achieved milestones history
 */
export async function getMilestoneHistory(storeId: string): Promise<{
  milestoneType: MilestoneType;
  label: string;
  celebrationMessage: string;
  achievedAt: Date;
}[]> {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/usage/milestones/history`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch milestone history');
    }

    const data = await res.json();
    return data.data;
  } catch (error) {
    logger.error('[UsageMilestones] Error fetching history', error);
    return [];
  }
}

/**
 * Get list of achieved milestone types
 */
export async function getAchievedMilestones(storeId: string): Promise<MilestoneType[]> {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/usage/milestones/list`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch achieved milestones');
    }

    const data = await res.json();
    return data.data.achieved || [];
  } catch (error) {
    logger.error('[UsageMilestones] Error fetching achieved milestones', error);
    return [];
  }
}

/**
 * Get all milestone configurations
 */
export async function getMilestoneConfigurations(): Promise<Record<MilestoneType, MilestoneConfig>> {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/usage/milestones/config`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch milestone configurations');
    }

    const data = await res.json();
    return data.data;
  } catch (error) {
    logger.error('[UsageMilestones] Error fetching configurations', error);
    return MILESTONE_CONFIGS;
  }
}

/**
 * Get auth token from cookies
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    return cookieStore.get('auth_token')?.value || null;
  } catch {
    return null;
  }
}
