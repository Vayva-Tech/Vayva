import { db } from "@/lib/db";
import { Prisma } from "@vayva/db";
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

function toNumber(d: Prisma.Decimal | number): number {
  return typeof d === "number" ? d : d.toNumber();
}

export const LoyaltyService = {
  // ============================================================================
  // Loyalty Program Management
  // ============================================================================

  async getOrCreateProgram(storeId: string): Promise<LoyaltyProgram> {
    let program = await db.loyaltyProgram?.findUnique({
      where: { storeId },
    });

    if (!program) {
      program = await db.loyaltyProgram?.create({
        data: {
          storeId,
          isActive: true,
          pointCurrency: "points",
          earnRate: 1,
          minRedeemPoints: 100,
          pointValue: 0.01,
          welcomeBonus: 0,
          referralBonus: 0,
          expiryDays: 365,
          tierSystem: [
            { name: "Bronze", minPoints: 0, multiplier: 1, benefits: [] },
            { name: "Silver", minPoints: 500, multiplier: 1.25, benefits: ["Early access to sales"] },
            { name: "Gold", minPoints: 2000, multiplier: 1.5, benefits: ["Free shipping", "Priority support"] },
          ],
        },
      });
    }

    return this.mapLoyaltyProgram(program);
  },

  async updateProgram(
    storeId: string,
    input: UpdateLoyaltyProgramInput
  ): Promise<LoyaltyProgram> {
    const program = await db.loyaltyProgram?.update({
      where: { storeId },
      data: {
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.pointCurrency !== undefined && { pointCurrency: input.pointCurrency }),
        ...(input.earnRate !== undefined && { earnRate: input.earnRate }),
        ...(input.minRedeemPoints !== undefined && { minRedeemPoints: input.minRedeemPoints }),
        ...(input.pointValue !== undefined && { pointValue: input.pointValue }),
        ...(input.welcomeBonus !== undefined && { welcomeBonus: input.welcomeBonus }),
        ...(input.referralBonus !== undefined && { referralBonus: input.referralBonus }),
        ...(input.expiryDays !== undefined && { expiryDays: input.expiryDays }),
        ...(input.tierSystem !== undefined && { tierSystem: input.tierSystem as unknown as Prisma.InputJsonValue }),
      },
    });

    return this.mapLoyaltyProgram(program);
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
    const loyalty = await db.customerLoyalty?.findUnique({
      where: { storeId_customerId: { storeId, customerId } },
    });

    if (!loyalty) return null;

    return this.mapCustomerLoyalty(loyalty, storeId);
  },

  async earnPoints(
    storeId: string,
    customerId: string,
    points: number,
    orderId?: string,
    description?: string
  ): Promise<CustomerLoyalty> {
    const program = await this.getOrCreateProgram(storeId);
    const loyalty = await this.getOrCreateCustomerLoyalty(storeId, customerId);

    const tierMultiplier = this.getTierMultiplier(program.tierSystem as unknown as LoyaltyTier[], loyalty.currentTier);
    const earnedPoints = Math.floor(points * tierMultiplier);

    const expiresAt = program.expiryDays > 0
      ? new Date(Date.now() + program.expiryDays * 24 * 60 * 60 * 1000)
      : null;

    const [updatedLoyalty] = await db.$transaction([
      db.customerLoyalty?.update({
        where: { id: loyalty.id },
        data: {
          totalPoints: { increment: earnedPoints },
          availablePoints: { increment: earnedPoints },
          lifetimeEarned: { increment: earnedPoints },
          currentTier: this.getTierName(
            program.tierSystem as unknown as LoyaltyTier[],
            loyalty.totalPoints + earnedPoints
          ),
          lastActivity: new Date(),
        },
      }),
      db.loyaltyTransaction?.create({
        data: {
          storeId,
          customerId,
          type: "earn",
          points: earnedPoints,
          orderId,
          description: description || `Earned ${earnedPoints} points`,
          expiresAt,
        },
      }),
    ]);

    return this.mapCustomerLoyalty(updatedLoyalty, storeId);
  },

  async earnPointsFromOrder(
    storeId: string,
    customerId: string,
    orderAmount: number,
    orderId: string
  ): Promise<CustomerLoyalty> {
    const program = await this.getOrCreateProgram(storeId);
    const points = Math.floor(orderAmount * toNumber(program.earnRate));

    return this.earnPoints(storeId, customerId, points, orderId, `Earned from order #${orderId}`);
  },

  async redeemPoints(
    storeId: string,
    customerId: string,
    points: number,
    description?: string
  ): Promise<{ success: boolean; loyalty?: CustomerLoyalty; error?: string }> {
    const program = await this.getOrCreateProgram(storeId);
    const loyalty = await this.getOrCreateCustomerLoyalty(storeId, customerId);

    if (loyalty.availablePoints < points) {
      return { success: false, error: "Insufficient points" };
    }

    if (points < program.minRedeemPoints) {
      return { success: false, error: `Minimum ${program.minRedeemPoints} points required` };
    }

    const [updatedLoyalty] = await db.$transaction([
      db.customerLoyalty?.update({
        where: { id: loyalty.id },
        data: {
          availablePoints: { decrement: points },
          lifetimeRedeemed: { increment: points },
          lastActivity: new Date(),
        },
      }),
      db.loyaltyTransaction?.create({
        data: {
          storeId,
          customerId,
          type: "redeem",
          points: -points,
          description: description || `Redeemed ${points} points`,
        },
      }),
    ]);

    return { success: true, loyalty: this.mapCustomerLoyalty(updatedLoyalty, storeId) };
  },

  // ============================================================================
  // Reward Management
  // ============================================================================

  async createReward(
    storeId: string,
    input: CreateLoyaltyRewardInput
  ): Promise<LoyaltyReward> {
    const reward = await db.loyaltyReward?.create({
      data: {
        storeId,
        name: input.name,
        description: input.description,
        pointCost: input.pointCost,
        rewardType: input.rewardType,
        rewardValue: input.rewardValue,
        productId: input.productId,
        maxRedemptions: input.maxRedemptions,
        startDate: input.startDate ? new Date(input.startDate) : new Date(),
        endDate: input.endDate ? new Date(input.endDate) : null,
      },
    });

    return this.mapLoyaltyReward(reward);
  },

  async updateReward(
    rewardId: string,
    input: UpdateLoyaltyRewardInput
  ): Promise<LoyaltyReward> {
    const reward = await db.loyaltyReward?.update({
      where: { id: rewardId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.pointCost !== undefined && { pointCost: input.pointCost }),
        ...(input.rewardType !== undefined && { rewardType: input.rewardType }),
        ...(input.rewardValue !== undefined && { rewardValue: input.rewardValue }),
        ...(input.productId !== undefined && { productId: input.productId }),
        ...(input.maxRedemptions !== undefined && { maxRedemptions: input.maxRedemptions }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.startDate !== undefined && { startDate: new Date(input.startDate) }),
        ...(input.endDate !== undefined && { endDate: input.endDate ? new Date(input.endDate) : null }),
      },
    });

    return this.mapLoyaltyReward(reward);
  },

  async getReward(rewardId: string): Promise<LoyaltyReward | null> {
    const reward = await db.loyaltyReward?.findUnique({
      where: { id: rewardId },
    });

    if (!reward) return null;
    return this.mapLoyaltyReward(reward);
  },

  async getRewards(
    storeId: string,
    options: { isActive?: boolean; limit?: number; offset?: number } = {}
  ): Promise<{ rewards: LoyaltyReward[]; total: number }> {
    const where: Prisma.LoyaltyRewardWhereInput = { storeId };
    if (options.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    const [rewards, total] = await Promise.all([
      db.loyaltyReward?.findMany({
        where,
        take: options.limit || 50,
        skip: options.offset || 0,
        orderBy: { createdAt: "desc" },
      }),
      db.loyaltyReward?.count({ where }),
    ]);

    return { rewards: rewards.map((r: any) => this.mapLoyaltyReward(r as any)), total };
  },

  async redeemReward(
    storeId: string,
    customerId: string,
    rewardId: string
  ): Promise<{ success: boolean; loyalty?: CustomerLoyalty; reward?: LoyaltyReward; error?: string }> {
    const reward = await db.loyaltyReward?.findUnique({
      where: { id: rewardId },
    });

    if (!reward || !reward.isActive) {
      return { success: false, error: "Reward not found or inactive" };
    }

    if (reward.endDate && reward.endDate < new Date()) {
      return { success: false, error: "Reward has expired" };
    }

    if (reward.maxRedemptions && reward.currentRedemptions >= reward.maxRedemptions) {
      return { success: false, error: "Reward limit reached" };
    }

    const result = await this.redeemPoints(storeId, customerId, reward.pointCost, `Redeemed for: ${reward.name}`);

    if (!result.success) {
      return result;
    }

    await db.loyaltyReward?.update({
      where: { id: rewardId },
      data: { currentRedemptions: { increment: 1 } },
    });

    return {
      success: true,
      loyalty: result.loyalty,
      reward: this.mapLoyaltyReward(reward),
    };
  },

  // ============================================================================
  // Transaction History
  // ============================================================================

  async getTransactions(
    storeId: string,
    customerId: string,
    options: { limit?: number; offset?: number; type?: string } = {}
  ): Promise<{ transactions: LoyaltyTransaction[]; total: number }> {
    const where: Prisma.LoyaltyTransactionWhereInput = { storeId, customerId };
    if (options.type) {
      where.type = options.type;
    }

    const [transactions, total] = await Promise.all([
      db.loyaltyTransaction?.findMany({
        where,
        take: options.limit || 50,
        skip: options.offset || 0,
        orderBy: { createdAt: "desc" },
      }),
      db.loyaltyTransaction?.count({ where }),
    ]);

    return { transactions: transactions.map((t: any) => this.mapLoyaltyTransaction(t as any)), total };
  },

  // ============================================================================
  // Analytics
  // ============================================================================

  async getAnalytics(storeId: string): Promise<LoyaltyAnalytics> {
    const [
      totalMembers,
      activeMembers,
      pointsIssuedAgg,
      pointsRedeemedAgg,
      rewardsRedeemedAgg,
      tierDistribution,
      topRewards,
    ] = await Promise.all([
      db.customerLoyalty?.count({ where: { storeId } }),
      db.customerLoyalty?.count({
        where: { storeId, lastActivity: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } },
      }),
      db.loyaltyTransaction?.aggregate({
        where: { storeId, type: "earn" },
        _sum: { points: true },
      }),
      db.loyaltyTransaction?.aggregate({
        where: { storeId, type: "redeem" },
        _sum: { points: true },
      }),
      db.loyaltyReward?.aggregate({
        where: { storeId },
        _sum: { currentRedemptions: true },
      }),
      this.getTierDistribution(storeId),
      this.getTopRewards(storeId),
    ]);

    const pointsIssued = pointsIssuedAgg._sum?.points || 0;
    const pointsRedeemed = Math.abs(pointsRedeemedAgg._sum?.points || 0);
    const rewardsRedeemed = rewardsRedeemedAgg._sum?.currentRedemptions || 0;
    const avgPoints = totalMembers > 0 ? pointsIssued / totalMembers : 0;

    const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const pointsExpiryForecastAgg = await db.loyaltyTransaction?.aggregate({
      where: {
        storeId,
        expiresAt: { lte: expiryDate, gt: new Date() },
        type: "earn",
      },
      _sum: { points: true },
    });

    return {
      totalMembers,
      activeMembers,
      pointsIssued,
      pointsRedeemed,
      rewardsRedeemed,
      averagePointsPerCustomer: avgPoints,
      tierDistribution,
      topRewards,
      pointsExpiryForecast: pointsExpiryForecastAgg._sum?.points || 0,
    };
  },

  async getTierDistribution(storeId: string): Promise<Record<string, number>> {
    const tiers = await db.customerLoyalty?.groupBy({
      by: ["currentTier"],
      where: { storeId },
      _count: { id: true },
    });

    return tiers.reduce((acc: Record<string, number>, tier: any) => {
      acc[tier.currentTier] = tier._count?.id;
      return acc;
    }, {} as Record<string, number>);
  },

  async getTopRewards(storeId: string): Promise<Array<{ rewardId: string; name: string; redemptionCount: number }>> {
    const rewards = await db.loyaltyReward?.findMany({
      where: { storeId },
      orderBy: { currentRedemptions: "desc" },
      take: 5,
    });

    return rewards.map((r: any) => ({
      rewardId: r.id,
      name: r.name,
      redemptionCount: r.currentRedemptions,
    }));
  },

  // ============================================================================
  // Helper Methods
  // ============================================================================

  getTierName(tiers: LoyaltyTier[], points: number): string {
    if (!tiers || tiers.length === 0) return "Bronze";

    const sorted = [...tiers].sort((a: any, b: any) => b.minPoints - a.minPoints);
    const tier = sorted.find((t: any) => points >= t.minPoints);
    return tier?.name || "Bronze";
  },

  getTierMultiplier(tiers: LoyaltyTier[], tierName: string): number {
    if (!tiers || !Array.isArray(tiers)) return 1;
    const tier = tiers.find((t: LoyaltyTier) => t.name === tierName);
    return tier?.multiplier || 1;
  },

  mapLoyaltyProgram(db: Prisma.LoyaltyProgramGetPayload<object>): LoyaltyProgram {
    return {
      id: db.id,
      storeId: db.storeId,
      isActive: db.isActive,
      pointCurrency: db.pointCurrency,
      earnRate: toNumber(db.earnRate),
      minRedeemPoints: db.minRedeemPoints,
      pointValue: toNumber(db.pointValue),
      welcomeBonus: db.welcomeBonus,
      referralBonus: db.referralBonus,
      expiryDays: db.expiryDays,
      tierSystem: (db.tierSystem as unknown as LoyaltyTier[]) || [],
      createdAt: db.createdAt?.toISOString(),
      updatedAt: db.updatedAt?.toISOString(),
    };
  },

  mapCustomerLoyalty(db: Prisma.CustomerLoyaltyGetPayload<object>, storeId: string): CustomerLoyalty {
    return {
      id: db.id,
      storeId,
      customerId: db.customerId,
      totalPoints: db.totalPoints,
      availablePoints: db.availablePoints,
      lifetimeEarned: db.lifetimeEarned,
      lifetimeRedeemed: db.lifetimeRedeemed,
      currentTier: db.currentTier,
      lastActivity: db.lastActivity?.toISOString(),
      createdAt: db.createdAt?.toISOString(),
      updatedAt: db.updatedAt?.toISOString(),
    };
  },

  mapLoyaltyTransaction(db: Prisma.LoyaltyTransactionGetPayload<object>): LoyaltyTransaction {
    return {
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
