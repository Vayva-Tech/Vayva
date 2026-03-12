// ============================================================================
// Phase 1: Universal Commerce Foundation - Type Definitions
// Loyalty Points System
// ============================================================================

export interface LoyaltyTier {
  name: string;
  minPoints: number;
  multiplier: number;
  benefits: string[];
  color?: string;
  icon?: string;
}

export interface LoyaltyProgram {
  id: string;
  storeId: string;
  isActive: boolean;
  pointCurrency: string;
  earnRate: number; // points per currency unit spent
  minRedeemPoints: number;
  pointValue: number; // currency value per point
  welcomeBonus: number;
  referralBonus: number;
  expiryDays: number;
  tierSystem: LoyaltyTier[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerLoyalty {
  id: string;
  storeId: string;
  customerId: string;
  totalPoints: number;
  availablePoints: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  currentTier: string;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
  tier?: LoyaltyTier;
  progressToNextTier?: {
    current: number;
    required: number;
    percentage: number;
  };
}

export type LoyaltyTransactionType =
  | 'earn'
  | 'redeem'
  | 'bonus'
  | 'expire'
  | 'adjust'
  | 'referral';

export interface LoyaltyTransaction {
  id: string;
  storeId: string;
  customerId: string;
  type: LoyaltyTransactionType;
  points: number;
  orderId?: string;
  description?: string;
  expiresAt?: string;
  createdAt: string;
}

export type RewardType = 'discount' | 'free_product' | 'free_shipping' | 'cash';

export interface LoyaltyReward {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  pointCost: number;
  rewardType: RewardType;
  rewardValue?: number;
  productId?: string;
  maxRedemptions?: number;
  currentRedemptions: number;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RedeemedReward {
  id: string;
  rewardId: string;
  customerId: string;
  storeId: string;
  pointsUsed: number;
  rewardValue: number;
  rewardType: RewardType;
  status: 'active' | 'used' | 'expired';
  usedAt?: string;
  expiresAt?: string;
  redeemedAt: string;
}

// Input types
export interface CreateLoyaltyProgramInput {
  pointCurrency?: string;
  earnRate?: number;
  minRedeemPoints?: number;
  pointValue?: number;
  welcomeBonus?: number;
  referralBonus?: number;
  expiryDays?: number;
  tierSystem?: LoyaltyTier[];
}

export interface UpdateLoyaltyProgramInput {
  isActive?: boolean;
  pointCurrency?: string;
  earnRate?: number;
  minRedeemPoints?: number;
  pointValue?: number;
  welcomeBonus?: number;
  referralBonus?: number;
  expiryDays?: number;
  tierSystem?: LoyaltyTier[];
}

export interface CreateLoyaltyRewardInput {
  name: string;
  description?: string;
  pointCost: number;
  rewardType: RewardType;
  rewardValue?: number;
  productId?: string;
  maxRedemptions?: number;
  startDate?: string;
  endDate?: string;
}

export interface UpdateLoyaltyRewardInput {
  name?: string;
  description?: string;
  pointCost?: number;
  rewardType?: RewardType;
  rewardValue?: number;
  productId?: string;
  maxRedemptions?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface RedeemRewardInput {
  rewardId: string;
  customerId: string;
}

// Response types
export interface LoyaltyProgramResponse {
  success: boolean;
  data?: LoyaltyProgram;
  error?: string;
}

export interface CustomerLoyaltyResponse {
  success: boolean;
  data?: CustomerLoyalty;
  error?: string;
}

export interface LoyaltyTransactionsResponse {
  success: boolean;
  data?: {
    transactions: LoyaltyTransaction[];
    totalCount: number;
  };
  error?: string;
}

export interface LoyaltyRewardsResponse {
  success: boolean;
  data?: {
    rewards: LoyaltyReward[];
    totalCount: number;
  };
  error?: string;
}

// Analytics types
export interface LoyaltyAnalytics {
  totalMembers: number;
  activeMembers: number;
  pointsIssued: number;
  pointsRedeemed: number;
  rewardsRedeemed: number;
  averagePointsPerCustomer: number;
  tierDistribution: Record<string, number>;
  topRewards: Array<{
    rewardId: string;
    name: string;
    redemptionCount: number;
  }>;
  pointsExpiryForecast: number;
}

// ============================================================================
// Return/Exchange Management System
// ============================================================================

export type ReturnReasonCode =
  | 'DEFECTIVE'
  | 'WRONG_ITEM'
  | 'NOT_AS_DESCRIBED'
  | 'CHANGED_MIND'
  | 'ARRIVED_LATE'
  | 'OTHER';

export type ResolutionType = 'REFUND' | 'EXCHANGE' | 'STORE_CREDIT' | 'REPAIR';

export type ReturnStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'IN_TRANSIT'
  | 'RECEIVED'
  | 'INSPECTED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ReturnPolicy {
  id: string;
  storeId: string;
  allowReturns: boolean;
  windowDays: number;
  allowExchanges: boolean;
  allowStoreCredit: boolean;
  restockingFeePercent: number;
  freeReturnsThreshold?: number;
  nonReturnableCategories: string[];
  finalSaleTags: string[];
  requireOriginalPackaging: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReturnItem {
  id: string;
  returnId: string;
  orderItemId: string;
  productId: string;
  quantity: number;
  reasonCode: ReturnReasonCode;
  condition: string;
  refundPrice: number;
  isResellable: boolean;
  restockingFee: number;
}

export interface ReturnRequest {
  id: string;
  storeId: string;
  merchantId: string;
  orderId: string;
  customerId: string;
  reasonCode: ReturnReasonCode;
  reasonText?: string;
  resolutionType: ResolutionType;
  status: ReturnStatus;
  shippingLabel?: string;
  trackingNumber?: string;
  approvedBy?: string;
  approvedAt?: string;
  receivedAt?: string;
  inspectedAt?: string;
  inspectedBy?: string;
  inspectionNotes?: string;
  refundAmount?: number;
  refundMethod?: string;
  refundIssuedAt?: string;
  exchangeOrderId?: string;
  returnShippingCost: number;
  restockingFee: number;
  createdAt: string;
  updatedAt: string;
  items: ReturnItem[];
}

// Input types
export interface CreateReturnPolicyInput {
  allowReturns?: boolean;
  windowDays?: number;
  allowExchanges?: boolean;
  allowStoreCredit?: boolean;
  restockingFeePercent?: number;
  freeReturnsThreshold?: number;
  nonReturnableCategories?: string[];
  finalSaleTags?: string[];
  requireOriginalPackaging?: boolean;
}

export interface CreateReturnRequestInput {
  orderId: string;
  customerId: string;
  reasonCode: ReturnReasonCode;
  reasonText?: string;
  resolutionType: ResolutionType;
  items: Array<{
    orderItemId: string;
    productId: string;
    quantity: number;
    reasonCode: ReturnReasonCode;
    refundPrice: number;
  }>;
}

export interface UpdateReturnStatusInput {
  status: ReturnStatus;
  shippingLabel?: string;
  trackingNumber?: string;
  inspectionNotes?: string;
  refundAmount?: number;
  refundMethod?: string;
  exchangeOrderId?: string;
  restockingFee?: number;
  returnShippingCost?: number;
}

// ============================================================================
// Dynamic Pricing Engine
// ============================================================================

export type PricingRuleType =
  | 'demand_based'
  | 'time_based'
  | 'inventory_based'
  | 'competitor_based';

export type PricingConditionType =
  | 'inventory_level'
  | 'time_of_day'
  | 'day_of_week'
  | 'date_range'
  | 'customer_segment'
  | 'demand_index';

export type AdjustmentType = 'percentage' | 'fixed_amount' | 'multiplier';

export interface PricingCondition {
  type: PricingConditionType;
  operator: '>' | '<' | '>=' | '<=' | '=' | '!=' | 'between';
  value: number | string | [number, number];
}

export interface PricingAdjustment {
  type: AdjustmentType;
  value: number;
  direction: 'increase' | 'decrease';
}

export interface PricingRule {
  id: string;
  storeId: string;
  name: string;
  appliesTo: 'product' | 'category' | 'accommodation' | 'event';
  targetId?: string;
  targetCategoryId?: string;
  ruleType: PricingRuleType;
  conditions: PricingCondition[];
  adjustments: PricingAdjustment[];
  minPrice?: number;
  maxPrice?: number;
  priority: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PriceHistory {
  id: string;
  storeId: string;
  productId?: string;
  accommodationId?: string;
  eventId?: string;
  oldPrice: number;
  newPrice: number;
  reason: string;
  ruleId?: string;
  triggeredAt: string;
}

export interface DynamicPriceSnapshot {
  id: string;
  storeId: string;
  date: string;
  demandIndex: number;
  recommendedAdjustment: number;
  appliedAdjustment?: number;
}

// Input types
export type PricingAppliesTo = 'product' | 'category' | 'accommodation' | 'event' | 'all';

export interface CreatePricingRuleInput {
  name: string;
  appliesTo: PricingAppliesTo;
  targetId?: string;
  targetCategoryId?: string;
  ruleType: PricingRuleType;
  conditions: PricingCondition[];
  adjustments: PricingAdjustment[];
  minPrice?: number;
  maxPrice?: number;
  priority?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface UpdatePricingRuleInput {
  name?: string;
  appliesTo?: PricingAppliesTo;
  targetId?: string;
  targetCategoryId?: string;
  ruleType?: PricingRuleType;
  conditions?: PricingCondition[];
  adjustments?: PricingAdjustment[];
  minPrice?: number;
  maxPrice?: number;
  priority?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface CalculatePriceInput {
  basePrice: number;
  productId?: string;
  categoryId?: string;
  customerSegment?: string;
  currentInventory?: number;
  demandIndex?: number;
}

export interface PriceCalculationResult {
  originalPrice: number;
  adjustedPrice: number;
  adjustmentAmount: number;
  adjustmentPercentage: number;
  appliedRules: Array<{
    ruleId: string;
    ruleName: string;
    adjustment: number;
  }>;
}
