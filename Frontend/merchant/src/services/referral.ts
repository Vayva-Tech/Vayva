/**
 * Referral Service
 * Implementation Plan 3: Customer Experience & Marketing
 */

import { PrismaClient } from '@vayva/db';
import type {
  ReferralProgram,
  ReferralCode,
  ReferralConversion,
  ReferralPayout,
  ReferralAnalytics,
  CustomerReferralDashboard,
  ConversionStatus,
  RewardType,
  CreateReferralProgramInput,
  UpdateReferralProgramInput,
  RequestPayoutInput,
} from '@/types/referral';
import crypto from 'crypto';

// Prisma type aliases for database models
type ReferralProgramDb = {
  id: string;
  storeId: string;
  isActive: boolean;
  name: string;
  description: string | null;
  rewardType: string;
  rewardValue: Decimal;
  referrerReward: Decimal;
  referredReward: Decimal;
  minimumOrder: Decimal;
  maxRewardsPerUser: number;
  expirationDays: number;
  terms: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type ReferralCodeDb = {
  id: string;
  programId: string;
  customerId: string;
  code: string;
  uniqueLink: string;
  totalClicks: number;
  totalSignups: number;
  totalOrders: number;
  totalRevenue: Decimal;
  totalRewards: Decimal;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  customer?: {
    name: string;
    email: string;
  };
};

type ReferralConversionDb = {
  id: string;
  referralCodeId: string;
  referrerId: string;
  referredId: string;
  orderId: string | null;
  orderAmount: Decimal | null;
  referrerReward: Decimal;
  referredReward: Decimal;
  status: string;
  referrerPaidAt: Date | null;
  referredPaidAt: Date | null;
  createdAt: Date;
  confirmedAt: Date | null;
  referred?: {
    name: string;
    email: string;
  };
};

type ReferralPayoutDb = {
  id: string;
  customerId: string;
  storeId: string;
  amount: Decimal;
  conversions: string[];
  status: string;
  paymentMethod: string;
  paymentRef: string | null;
  paidAt: Date | null;
  createdAt: Date;
};

// Decimal type shim for Prisma
type Decimal = {
  toNumber(): number;
};

export class ReferralService {
  private db: PrismaClient;

  constructor() {
    this.db = new PrismaClient();
  }

  async createOrUpdateProgram(
    storeId: string,
    data: CreateReferralProgramInput | UpdateReferralProgramInput
  ): Promise<ReferralProgram> {
    const input = data as { isActive?: boolean; name?: string; description?: string | null; rewardType?: string; rewardValue?: number; referrerReward?: number; referredReward?: number; minimumOrder?: number; maxRewardsPerUser?: number; expirationDays?: number; terms?: string | null };
    const program = await this.db?.referralProgram.upsert({
      where: { storeId },
      update: {
        isActive: input.isActive as any,
        name: input.name,
        description: input.description,
        rewardType: input.rewardType,
        rewardValue: input.rewardValue,
        referrerReward: input.referrerReward,
        referredReward: input.referredReward,
        minimumOrder: input.minimumOrder,
        maxRewardsPerUser: input.maxRewardsPerUser,
        expirationDays: input.expirationDays,
        terms: input.terms,
      },
      create: {
        storeId,
        isActive: (input.isActive ?? true) as any,
        name: input.name ?? 'Refer a Friend',
        description: input.description,
        rewardType: input.rewardType ?? 'percentage',
        rewardValue: input.rewardValue ?? 10,
        referrerReward: input.referrerReward ?? 10,
        referredReward: input.referredReward ?? 10,
        minimumOrder: input.minimumOrder ?? 0,
        maxRewardsPerUser: input.maxRewardsPerUser ?? 0,
        expirationDays: input.expirationDays ?? 30,
        terms: input.terms,
      },
    });

    return this.mapProgram(program as ReferralProgramDb);
  }

  async getProgram(storeId: string): Promise<ReferralProgram | null> {
    const program = await this.db?.referralProgram.findUnique({
      where: { storeId },
    });

    if (!program) return null;
    return this.mapProgram(program as ReferralProgramDb);
  }

  async generateReferralCode(
    programId: string,
    customerId: string,
    storeSlug: string
  ): Promise<ReferralCode> {
    // Check if customer already has a code
    const existing = await this.db?.referralCode.findFirst({
      where: { programId, customerId, isActive: true },
    });

    if (existing) {
      return this.mapCode(existing as ReferralCodeDb);
    }

    // Generate unique code
    const code = this.generateUniqueCode(customerId);
    const uniqueLink = `https://${storeSlug}.vayva.ng/ref/${code}`;

    const referralCode = await this.db?.referralCode.create({
      data: {
        programId,
        customerId,
        code,
        uniqueLink,
        isActive: true,
      },
    });

    return this.mapCode(referralCode as ReferralCodeDb);
  }

  async trackReferralClick(code: string): Promise<void> {
    await this.db?.referralCode.update({
      where: { code },
      data: { totalClicks: { increment: 1 } },
    });
  }

  async trackReferralSignup(
    code: string,
    newCustomerId: string
  ): Promise<ReferralConversion | null> {
    const referralCode = await this.db?.referralCode.findUnique({
      where: { code },
      include: { program: true },
    });

    if (!referralCode || !referralCode.isActive) {
      return null;
    }

    // Check if code has expired
    if (referralCode.expiresAt && referralCode.expiresAt < new Date()) {
      return null;
    }

    // Check max rewards limit
    const program = referralCode.program as ReferralProgramDb;
    if (program.maxRewardsPerUser > 0) {
      const existingConversions = await this.db?.referralConversion.count({
        where: { referralCodeId: referralCode.id, status: { not: 'cancelled' } },
      });
      if (existingConversions >= program.maxRewardsPerUser) {
        return null;
      }
    }

    // Create conversion
    const conversion = await this.db?.referralConversion.create({
      data: {
        referralCodeId: referralCode.id,
        referrerId: referralCode.customerId,
        referredId: newCustomerId,
        referrerReward: program.referrerReward?.toNumber(),
        referredReward: program.referredReward?.toNumber(),
        status: 'pending',
      },
    });

    // Update referral code stats
    await this.db?.referralCode.update({
      where: { id: referralCode.id },
      data: { totalSignups: { increment: 1 } },
    });

    return this.mapConversion(conversion as ReferralConversionDb);
  }

  async trackReferralOrder(
    conversionId: string,
    orderId: string,
    orderAmount: number
  ): Promise<ReferralConversion | null> {
    const conversion = await this.db?.referralConversion.findUnique({
      where: { id: conversionId },
      include: { referralCode: { include: { program: true } } } as unknown as never,
    });

    if (!conversion || (conversion as any).status !== 'pending') {
      return null;
    }

    const program = ((conversion as any).referralCode as ReferralCodeDb & { program: ReferralProgramDb }).program;

    // Check minimum order requirement
    if (orderAmount < program.minimumOrder?.toNumber()) {
      return null;
    }

    // Calculate rewards based on type
    let referrerReward = program.referrerReward?.toNumber();
    let referredReward = program.referredReward?.toNumber();

    if (program.rewardType === 'percentage') {
      referrerReward = (orderAmount * referrerReward) / 100;
      referredReward = (orderAmount * referredReward) / 100;
    }

    // Update conversion
    const updated = await this.db?.referralConversion.update({
      where: { id: conversionId },
      data: {
        orderId,
        orderAmount,
        referrerReward,
        referredReward,
        status: 'confirmed',
        confirmedAt: new Date(),
      },
    });

    // Update referral code stats
    await this.db?.referralCode.update({
      where: { id: conversion.referralCodeId },
      data: {
        totalOrders: { increment: 1 },
        totalRevenue: { increment: orderAmount },
        totalRewards: { increment: referrerReward + referredReward },
      },
    });

    return this.mapConversion(updated as ReferralConversionDb);
  }

  async getReferralAnalytics(storeId: string): Promise<ReferralAnalytics> {
    const program = await this.db?.referralProgram.findUnique({
      where: { storeId },
    });

    if (!program) {
      return {
        totalReferrers: 0,
        totalConversions: 0,
        totalRevenue: 0,
        totalRewardsPending: 0,
        totalRewardsPaid: 0,
        conversionRate: 0,
        topReferrers: [],
      };
    }

    const [
      totalReferrers,
      totalConversions,
      revenueAgg,
      pendingRewards,
      paidRewards,
      topReferrers,
    ] = await Promise.all([
      this.db?.referralCode.count({
        where: { programId: program.id, isActive: true },
      }),
      this.db?.referralConversion.count({
        where: { referralCodeId: { not: null }, referrerId: { not: null } } as any,
      }),
      this.db?.referralConversion.aggregate({
        where: {
          referralCodeId: { not: null },
          orderAmount: { not: null },
        } as any,
        _sum: { orderAmount: true },
      }),
      this.db?.referralConversion.aggregate({
        where: {
          referralCodeId: { not: null },
          status: 'confirmed',
        } as any,
        _sum: { referrerReward: true, referredReward: true },
      }),
      this.db?.referralConversion.aggregate({
        where: {
          referralCodeId: { not: null },
          status: 'paid',
        } as any,
        _sum: { referrerReward: true, referredReward: true },
      }),
      this.db?.referralCode.findMany({
        where: { programId: program.id },
        orderBy: { totalRewards: 'desc' },
        take: 10,
        include: { customer: true },
      }),
    ]);

    const totalClicks = await this.db?.referralCode.aggregate({
      where: { programId: program.id },
      _sum: { totalClicks: true },
    });

    const conversionRate = totalClicks._sum?.totalClicks
      ? totalConversions / totalClicks._sum?.totalClicks
      : 0;

    return {
      totalReferrers,
      totalConversions,
      totalRevenue: (revenueAgg._sum?.orderAmount as unknown as number) ?? 0,
      totalRewardsPending:
        ((pendingRewards._sum?.referrerReward as unknown as number) ?? 0) +
        ((pendingRewards._sum?.referredReward as unknown as number) ?? 0),
      totalRewardsPaid:
        ((paidRewards._sum?.referrerReward as unknown as number) ?? 0) +
        ((paidRewards._sum?.referredReward as unknown as number) ?? 0),
      conversionRate,
      topReferrers: topReferrers.map((r) => ({
        customerId: r.customerId,
        customerName: (r.customer as any)?.name ?? 'Unknown',
        totalSignups: r.totalSignups,
        totalOrders: r.totalOrders,
        totalRewards: (r.totalRewards as unknown as number) ?? 0,
      })),
    };
  }

  async getCustomerReferralDashboard(
    programId: string,
    customerId: string
  ): Promise<CustomerReferralDashboard> {
    const program = await this.db?.referralProgram.findUnique({
      where: { id: programId },
    });

    if (!program) {
      throw new Error('Referral program not found');
    }

    const myCode = await this.db?.referralCode.findFirst({
      where: { programId, customerId },
    });

    const conversions = await this.db?.referralConversion.findMany({
      where: { referrerId: customerId },
      orderBy: { createdAt: 'desc' },
      include: { referred: true } as unknown as never,
    });

    const totalEarned = conversions
      .filter((c) => (c as any).status === 'paid')
      .reduce((sum: number, c) => sum + (c.referrerReward as unknown as number), 0);

    const pendingRewards = conversions
      .filter((c) => (c as any).status === 'confirmed')
      .reduce((sum: number, c) => sum + (c.referrerReward as unknown as number), 0);

    const availableForPayout = conversions
      .filter((c) => (c as any).status === 'confirmed' && !c.referrerPaidAt)
      .reduce((sum: number, c) => sum + (c.referrerReward as unknown as number), 0);

    return {
      myCode: myCode ? this.mapCode(myCode as ReferralCodeDb) : null,
      program: this.mapProgram(program as ReferralProgramDb),
      conversions: conversions.map((c: any) => this.mapConversion(c as ReferralConversionDb)),
      totalEarned,
      pendingRewards,
      availableForPayout,
      recentReferrals: conversions.slice(0, 5).map((c: any) => ({
        referredName: c.referred?.name ?? 'Unknown',
        status: (c as any).status as ConversionStatus,
        reward: (c.referrerReward as unknown as number) ?? 0,
        date: c.createdAt,
      })),
    };
  }

  async requestPayout(
    customerId: string,
    storeId: string,
    input: RequestPayoutInput
  ): Promise<ReferralPayout> {
    // Get all confirmed conversions that haven't been paid
    const conversions = await this.db?.referralConversion.findMany({
      where: {
        referrerId: customerId,
        status: 'confirmed',
        referrerPaidAt: null,
      },
    });

    if (conversions.length === 0) {
      throw new Error('No rewards available for payout');
    }

    const totalAmount = conversions.reduce((sum: number, c) => sum + (c.referrerReward as unknown as number),
      0
    );

    // Create payout
    const payout = await this.db?.referralPayout.create({
      data: {
        customerId,
        storeId,
        amount: totalAmount,
        conversions: conversions.map((c: any) => c.id),
        status: 'pending',
        paymentMethod: input.paymentMethod,
      },
    });

    // Mark conversions as processing
    await this.db?.referralConversion.updateMany({
      where: { id: { in: conversions.map((c: any) => c.id) } },
      data: { status: 'paid', referrerPaidAt: new Date() },
    });

    return this.mapPayout(payout as ReferralPayoutDb);
  }

  async getPayouts(customerId: string): Promise<ReferralPayout[]> {
    const payouts = await this.db?.referralPayout.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });

    return payouts.map((p: any) => this.mapPayout(p as ReferralPayoutDb));
  }

  private generateUniqueCode(customerId: string): string {
    // Generate 8-character code from customer ID hash
    const hash = crypto.createHash('md5').update(customerId).digest('hex');
    return hash.substring(0, 8).toUpperCase();
  }

  private mapProgram(program: ReferralProgramDb): ReferralProgram {
    return {
      ...program,
      rewardValue: (program.rewardValue as unknown as number) ?? 0,
      referrerReward: (program.referrerReward as unknown as number) ?? 0,
      referredReward: (program.referredReward as unknown as number) ?? 0,
      minimumOrder: (program.minimumOrder as unknown as number) ?? 0,
      createdAt: program.createdAt,
      updatedAt: program.updatedAt,
    } as unknown as ReferralProgram;
  }

  private mapCode(code: ReferralCodeDb): ReferralCode {
    return {
      ...code,
      totalRevenue: (code.totalRevenue as unknown as number) ?? 0,
      totalRewards: (code.totalRewards as unknown as number) ?? 0,
      createdAt: code.createdAt,
      expiresAt: code.expiresAt,
      customerName: code.customer?.name,
      customerEmail: code.customer?.email,
    };
  }

  private mapConversion(conversion: ReferralConversionDb): ReferralConversion {
    return {
      ...conversion,
      orderAmount: conversion.orderAmount
        ? (conversion.orderAmount as unknown as number)
        : null,
      referrerReward: (conversion.referrerReward as unknown as number) ?? 0,
      referredReward: (conversion.referredReward as unknown as number) ?? 0,
      createdAt: conversion.createdAt,
      confirmedAt: conversion.confirmedAt,
      referrerPaidAt: conversion.referrerPaidAt,
      referredPaidAt: conversion.referredPaidAt,
      referredName: conversion.referred?.name,
      referredEmail: conversion.referred?.email,
    } as unknown as ReferralConversion;
  }

  private mapPayout(payout: ReferralPayoutDb): ReferralPayout {
    return {
      ...payout,
      amount: (payout.amount as unknown as number) ?? 0,
      createdAt: payout.createdAt,
      paidAt: payout.paidAt,
    } as unknown as ReferralPayout;
  }
}

// Singleton instance
let referralService: ReferralService | null = null;

export function getReferralService(): ReferralService {
  if (!referralService) {
    referralService = new ReferralService();
  }
  return referralService;
}
