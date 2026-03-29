/**
 * Subscription & Billing Types
 */

export type SubscriptionTier = 'STARTER' | 'PRO' | 'PRO_PLUS';
export type SubscriptionStatus = 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'INACTIVE';
export type BillingCycle = 'monthly' | 'quarterly';

export interface Subscription {
  id: string;
  storeId: string;
  planKey: SubscriptionTier;
  status: SubscriptionStatus;
  provider: 'PAYSTACK' | 'MANUAL';
  providerSubscriptionId?: string;
  providerCustomerId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEndsAt?: Date | null;
  cancelAtPeriodEnd: boolean;
  cancellationReason?: string;
  startedAt: Date;
  createdAt: Date;
}

export interface SubscriptionFeatures {
  planKey: SubscriptionTier;
  status: SubscriptionStatus;
  features: string[];
}

export interface UsageMetrics {
  planKey: SubscriptionTier;
  usage: {
    products: { current: number; limit: number };
    orders: { current: number; limit: number };
    teamMembers: { current: number; limit: number };
  };
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export interface PortalSession {
  url: string;
}

export interface CreateCheckoutParams {
  planKey: SubscriptionTier;
  billingCycle: BillingCycle;
  successUrl: string;
  cancelUrl: string;
}

export interface CreatePortalParams {
  returnUrl?: string;
}

export interface UpgradePlanParams {
  targetPlanKey: SubscriptionTier;
  paymentMethodId?: string;
}

export interface CancelSubscriptionParams {
  cancellationReason?: string;
}

// API Response types
export interface SubscriptionResponse {
  success: boolean;
  data?: Subscription;
  error?: string;
}

export interface SubscriptionsListResponse {
  success: boolean;
  data?: {
    subscriptions: Subscription[];
    totalCount: number;
    hasMore: boolean;
  };
  error?: string;
}

export interface FeaturesResponse {
  success: boolean;
  data?: SubscriptionFeatures;
  error?: string;
}

export interface UsageResponse {
  success: boolean;
  data?: UsageMetrics;
  error?: string;
}

export interface CheckoutResponse {
  success: boolean;
  data?: CheckoutSession;
  error?: string;
}

export interface PortalResponse {
  success: boolean;
  data?: PortalSession;
  error?: string;
}

// Feature gating types
export interface FeatureAccessResult {
  hasAccess: boolean;
  currentTier: SubscriptionTier;
  requiredTier: SubscriptionTier;
  isTrialing: boolean;
  expiresAt?: Date | null;
  upgradeUrl?: string;
}

export interface PlanFeature {
  key: string;
  name: string;
  description: string;
  availableInTiers: SubscriptionTier[];
}
