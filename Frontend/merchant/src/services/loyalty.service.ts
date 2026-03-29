import { api } from '@/lib/api-client';
import type {
  LoyaltyProgram,
  CustomerLoyalty,
  LoyaltyTransaction,
  LoyaltyReward,
  LoyaltyTier,
  CreateLoyaltyProgramInput,
  UpdateLoyaltyProgramInput,
  CreateLoyaltyRewardInput,
  UpdateLoyaltyRewardInput,
  LoyaltyAnalytics,
} from "@/types/phase1-commerce";

export const LoyaltyService = {
  // ============================================================================
  // Loyalty Program Management
  // ============================================================================

  async getOrCreateProgram(storeId: string): Promise<LoyaltyProgram> {
    const response = await api.get(`/loyalty/${storeId}/program`);
    return response.data || {};
  },

  async updateProgram(
    storeId: string,
    input: UpdateLoyaltyProgramInput
  ): Promise<LoyaltyProgram> {
    const response = await api.patch(`/loyalty/${storeId}/program`, input);
    return response.data || {};
  },

  // ============================================================================
  // Customer Loyalty Management
  // ============================================================================

  async getOrCreateCustomerLoyalty(
    storeId: string,
    customerId: string
  ): Promise<CustomerLoyalty> {
    let loyalty = await db.customerLoyalty?.findUnique({
      where: { storeId_customerId: { storeId, customerId } },
    });

    if (!loyalty) {
      const program = await this.getOrCreateProgram(storeId);

      loyalty = await db.customerLoyalty?.create({
        data: {
          storeId,
          customerId,
          totalPoints: program.welcomeBonus,
          availablePoints: program.welcomeBonus,
          lifetimeEarned: program.welcomeBonus,
          currentTier: this.getTierName(program.tierSystem as unknown as LoyaltyTier[], 0),
        },
      });

      if (program.welcomeBonus > 0) {
        await db.loyaltyTransaction?.create({
          data: {
            storeId,
            customerId,
            type: "bonus",
            points: program.welcomeBonus,
            description: "Welcome bonus",
          },
        });
      }
    }

    return this.mapCustomerLoyalty(loyalty, storeId);
  },

  async getCustomerLoyalty(
    storeId: string,
    customerId: string
  ): Promise<CustomerLoyalty | null> {
    const response = await api.get(`/loyalty/${storeId}/customer/${customerId}`);
    return response.data || null;
  },

  async earnPoints(
    storeId: string,
    customerId: string,
    points: number,
    orderId?: string,
    description?: string
  ): Promise<CustomerLoyalty> {
    const response = await api.post('/loyalty/earn', {
      storeId,
      customerId,
      points,
      orderId,
      description,
    });
    return response.data || {};
  },

  async earnPointsFromOrder(
    storeId: string,
    customerId: string,
    orderAmount: number,
    orderId: string
  ): Promise<CustomerLoyalty> {
    const response = await api.post('/loyalty/earn-order', {
      storeId,
      customerId,
      orderAmount,
      orderId,
    });
    return response.data || {};
  },

  async redeemPoints(
    storeId: string,
    customerId: string,
    points: number,
    description?: string
  ): Promise<{ success: boolean; loyalty?: CustomerLoyalty; error?: string }> {
    const response = await api.post('/loyalty/redeem', {
      storeId,
      customerId,
      points,
      description,
    });
    return response.data || {};
  },

  // ============================================================================
  // Reward Management
  // ============================================================================

  async createReward(
    storeId: string,
    input: CreateLoyaltyRewardInput
  ): Promise<LoyaltyReward> {
    const response = await api.post('/loyalty/rewards', {
      storeId,
      ...input,
    });
    return response.data || {};
  },

  async updateReward(
    rewardId: string,
    input: UpdateLoyaltyRewardInput
  ): Promise<LoyaltyReward> {
    const response = await api.patch(`/loyalty/rewards/${rewardId}`, input);
    return response.data || {};
  },

  async getReward(rewardId: string): Promise<LoyaltyReward | null> {
    const response = await api.get(`/loyalty/rewards/${rewardId}`);
    return response.data || null;
  },

  async getRewards(
    storeId: string,
    options: { isActive?: boolean; limit?: number; offset?: number } = {}
  ): Promise<{ rewards: LoyaltyReward[]; total: number }> {
    const response = await api.get('/loyalty/rewards', {
      storeId,
      ...options,
    });
    return { rewards: response.data?.rewards || [], total: response.data?.total || 0 };
  },

  async redeemReward(
    storeId: string,
    customerId: string,
    rewardId: string
  ): Promise<{ success: boolean; loyalty?: CustomerLoyalty; reward?: LoyaltyReward; error?: string }> {
    const response = await api.post('/loyalty/redeem-reward', {
      storeId,
      customerId,
      rewardId,
    });
    return response.data || {};
  },

  // ============================================================================
  // Transaction History
  // ============================================================================

  async getTransactions(
    storeId: string,
    customerId: string,
    options: { limit?: number; offset?: number; type?: string } = {}
  ): Promise<{ transactions: LoyaltyTransaction[]; total: number }> {
    const response = await api.get('/loyalty/transactions', {
      storeId,
      customerId,
      ...options,
    });
    return { transactions: response.data?.transactions || [], total: response.data?.total || 0 };
  },

  // ============================================================================
  // Analytics
  // ============================================================================

  async getAnalytics(storeId: string): Promise<LoyaltyAnalytics> {
    const response = await api.get(`/loyalty/${storeId}/analytics`);
    return response.data || {};
  },

  async getTierDistribution(storeId: string): Promise<Record<string, number>> {
    const response = await api.get(`/loyalty/${storeId}/tier-distribution`);
    return response.data || {};
  },

  async getTopRewards(storeId: string): Promise<Array<{ rewardId: string; name: string; redemptionCount: number }>> {
    const response = await api.get(`/loyalty/${storeId}/top-rewards`);
    return response.data || [];
  },

  // ============================================================================
  // Helper Methods - Moved to Backend
  // ============================================================================

  getTierName(tiers: LoyaltyTier[], points: number): string {
    console.warn('This method should not be called directly - handled by backend');
    return 'Bronze';
  },

  getTierMultiplier(tiers: LoyaltyTier[], tierName: string): number {
    console.warn('This method should not be called directly - handled by backend');
    return 1;
  },
};
      id: db.id,
      storeId: db.storeId,
      customerId: db.customerId,
      type: db.type as LoyaltyTransaction["type"],
      points: db.points,
      orderId: db.orderId || undefined,
      description: db.description || undefined,
      expiresAt: db.expiresAt?.toISOString(),
      createdAt: db.createdAt?.toISOString(),
    };
  },

  mapLoyaltyReward(db: Prisma.LoyaltyRewardGetPayload<object>): LoyaltyReward {
    return {
      id: db.id,
      storeId: db.storeId,
      name: db.name,
      description: db.description || undefined,
      pointCost: db.pointCost,
      rewardType: db.rewardType as "discount" | "free_product" | "free_shipping" | "cash",
      rewardValue: db.rewardValue ? toNumber(db.rewardValue) : undefined,
      productId: db.productId || undefined,
      maxRedemptions: db.maxRedemptions || undefined,
      currentRedemptions: db.currentRedemptions,
      isActive: db.isActive,
      startDate: db.startDate?.toISOString(),
      endDate: db.endDate?.toISOString(),
      createdAt: db.createdAt?.toISOString(),
      updatedAt: db.updatedAt?.toISOString(),
    };
  },
};
