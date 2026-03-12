/**
 * Referral & Affiliate System Types
 * Implementation Plan 3: Customer Experience & Marketing
 */

export type RewardType = 'percentage' | 'fixed' | 'credit';
export type ConversionStatus = 'pending' | 'confirmed' | 'paid' | 'cancelled';
export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed';

export interface ReferralProgram {
  id: string;
  storeId: string;
  isActive: boolean;
  name: string;
  description: string | null;
  rewardType: RewardType;
  rewardValue: number;
  referrerReward: number;
  referredReward: number;
  minimumOrder: number;
  maxRewardsPerUser: number;
  expirationDays: number;
  terms: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReferralCode {
  id: string;
  programId: string;
  customerId: string;
  code: string;
  uniqueLink: string;
  totalClicks: number;
  totalSignups: number;
  totalOrders: number;
  totalRevenue: number;
  totalRewards: number;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  // Joined fields
  customerName?: string;
  customerEmail?: string;
}

export interface ReferralConversion {
  id: string;
  referralCodeId: string;
  referrerId: string;
  referredId: string;
  orderId: string | null;
  orderAmount: number | null;
  referrerReward: number;
  referredReward: number;
  status: ConversionStatus;
  referrerPaidAt: Date | null;
  referredPaidAt: Date | null;
  createdAt: Date;
  confirmedAt: Date | null;
  // Joined fields
  referrerName?: string;
  referredName?: string;
  referredEmail?: string;
}

export interface ReferralPayout {
  id: string;
  customerId: string;
  storeId: string;
  amount: number;
  conversions: string[];
  status: PayoutStatus;
  paymentMethod: string;
  paymentRef: string | null;
  paidAt: Date | null;
  createdAt: Date;
}

export interface ReferralAnalytics {
  totalReferrers: number;
  totalConversions: number;
  totalRevenue: number;
  totalRewardsPending: number;
  totalRewardsPaid: number;
  conversionRate: number; // signups / clicks
  topReferrers: Array<{
    customerId: string;
    customerName: string;
    totalSignups: number;
    totalOrders: number;
    totalRewards: number;
  }>;
}

export interface CustomerReferralDashboard {
  myCode: ReferralCode | null;
  program: ReferralProgram | null;
  conversions: ReferralConversion[];
  totalEarned: number;
  pendingRewards: number;
  availableForPayout: number;
  recentReferrals: Array<{
    referredName: string;
    status: ConversionStatus;
    reward: number;
    date: Date;
  }>;
}

// Input types for API routes
export interface CreateReferralProgramInput {
  name?: string;
  description?: string;
  rewardType: RewardType;
  rewardValue: number;
  referrerReward: number;
  referredReward: number;
  minimumOrder?: number;
  maxRewardsPerUser?: number;
  expirationDays?: number;
  terms?: string;
}

export interface UpdateReferralProgramInput extends Partial<CreateReferralProgramInput> {
  isActive?: boolean;
}

export interface RequestPayoutInput {
  paymentMethod: 'wallet' | 'bank_transfer';
}
