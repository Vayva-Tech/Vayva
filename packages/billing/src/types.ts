/**
 * Billing Types - Usage-based billing and dunning management
 */

export interface UsageRecord {
  storeId: string;
  metric: UsageMetric;
  quantity: number;
  metadata?: Record<string, unknown>;
}

export type UsageMetric = 
  | 'AI_TOKENS' 
  | 'WHATSAPP_MESSAGES' 
  | 'WHATSAPP_MEDIA' 
  | 'STORAGE_GB' 
  | 'API_CALLS' 
  | 'BANDWIDTH_GB';

export interface UsageLimits {
  aiTokens: number;
  whatsappMessages: number;
  storageGB: number;
  apiCalls: number;
}

export interface UsageStats {
  metric: UsageMetric;
  used: number;
  limit: number;
  percentage: number;
  projected: number;
  overage: number;
  overageCost: number; // in kobo
}

export interface LineItem {
  description: string;
  quantity: number;
  unitCost: number; // in kobo
  amount: number; // in kobo
}

export interface UsageInvoice {
  id: string;
  storeId: string;
  invoiceNumber: string;
  periodStart: Date;
  periodEnd: Date;
  baseAmount: number; // in kobo
  overageAmount: number; // in kobo
  totalAmount: number; // in kobo
  lineItems: LineItem[];
  status: 'draft' | 'pending' | 'paid' | 'failed' | 'cancelled';
  paidAt?: Date;
}

export interface DunningSchedule {
  days: number;
  action: 'notify' | 'retry' | 'final_notice' | 'suspend';
}

export interface FailedPayment {
  subscriptionId: string;
  storeId: string;
  amount: number; // in kobo
  currency: string;
  failureReason: string;
  failedAt: Date;
}

export interface ThresholdConfig {
  metric: UsageMetric;
  thresholds: number[]; // percentages like [80, 100]
}

// Overage pricing (in kobo per unit)
export const OVERAGE_RATES: Record<UsageMetric, number> = {
  AI_TOKENS: 0.005, // ₦0.005 per token
  WHATSAPP_MESSAGES: 290, // ₦2.90 per message
  WHATSAPP_MEDIA: 500, // ₦5.00 per media message
  STORAGE_GB: 10000, // ₦100 per GB
  API_CALLS: 1, // ₦0.01 per call
  BANDWIDTH_GB: 5000, // ₦50 per GB
};

// Plan limits by tier
export const PLAN_LIMITS: Record<string, UsageLimits> = {
  STARTER: {
    aiTokens: 10000,
    whatsappMessages: 100,
    storageGB: 1,
    apiCalls: 1000,
  },
  GROWTH: {
    aiTokens: 50000,
    whatsappMessages: 1000,
    storageGB: 10,
    apiCalls: 10000,
  },
  PRO: {
    aiTokens: 200000,
    whatsappMessages: 5000,
    storageGB: 50,
    apiCalls: 100000,
  },
};

// Dunning retry schedule (days after failure)
export const DUNNING_SCHEDULE: DunningSchedule[] = [
  { days: 0, action: 'notify' },
  { days: 3, action: 'retry' },
  { days: 7, action: 'retry' },
  { days: 14, action: 'retry' },
  { days: 21, action: 'final_notice' },
  { days: 30, action: 'suspend' },
];
