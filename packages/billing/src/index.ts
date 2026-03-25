/**
 * Vayva Billing Package
 * 
 * Usage-based billing, dunning management, and revenue recognition for Vayva platform.
 */

// Usage-based billing
export { UsageBillingService } from './usage-billing';

// Dunning management
export { DunningManager } from './dunning';

// Revenue Recognition (ASC 606)
export {
  RevenueRecognitionEngine,
  initializeRevenueRecognition,
  getRevenueRecognitionEngine,
  defaultConfig,
} from './revenue-recognition';

// Types
export type {
  UsageRecord,
  UsageMetric,
  UsageLimits,
  UsageStats,
  LineItem,
  UsageInvoice,
  DunningSchedule,
  FailedPayment,
  ThresholdConfig,
} from './types';

export type {
  RevenueRecognitionConfig,
  PerformanceObligation,
  RevenueAllocation,
  RecognitionEntry,
  RevenueReport,
  Contract,
} from './revenue-recognition';

// Constants
export {
  OVERAGE_RATES,
  PLAN_LIMITS,
  DUNNING_SCHEDULE,
} from './types';

export { pricingPolicyAgent } from './pricing-policy-agent';
export type {
  Subscription as PricingPolicySubscription,
} from './pricing-policy-agent';
export { coercePlanTier, type PlanTier } from './tier-limits';
