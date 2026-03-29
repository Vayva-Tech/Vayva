import { api } from '@/lib/api-client';
import type {
  PricingRule,
  PriceHistory,
  DynamicPriceSnapshot,
  CreatePricingRuleInput,
  UpdatePricingRuleInput,
} from "@/types/phase1-commerce";

export const PricingService = {
  // ============================================================================
  // Pricing Rules Management
  // ============================================================================

  async createRule(storeId: string, input: CreatePricingRuleInput): Promise<PricingRule> {
    const response = await api.post('/pricing/rules', {
      storeId,
      ...input,
    });
    return response.data || {};
  },

  async updateRule(ruleId: string, input: UpdatePricingRuleInput): Promise<PricingRule> {
    const response = await api.patch(`/pricing/rules/${ruleId}`, input);
    return response.data || {};
  },

  async getRule(ruleId: string): Promise<PricingRule | null> {
    const response = await api.get(`/pricing/rules/${ruleId}`);
    return response.data || null;
  },

  async getRules(
    storeId: string,
    options: { isActive?: boolean; appliesTo?: string; limit?: number; offset?: number } = {}
  ): Promise<{ rules: PricingRule[]; total: number }> {
    const response = await api.get('/pricing/rules', {
      storeId,
      ...options,
    });
    return { rules: response.data?.rules || [], total: response.data?.total || 0 };
  },

  async deleteRule(ruleId: string): Promise<void> {
    await api.delete(`/pricing/rules/${ruleId}`);
  },

  // ============================================================================
  // Price Calculation
  // ============================================================================

  async calculatePrice(
    storeId: string,
    productId: string,
    basePrice: number,
    context: {
      quantity?: number;
      customerId?: string;
      timeOfDay?: number;
      dayOfWeek?: number;
      inventoryLevel?: number;
    } = {}
  ): Promise<{
    calculatedPrice: number;
    appliedRules: PricingRule[];
    priceAdjustment: number;
    adjustmentPercentage: number;
  }> {
    const response = await api.post('/pricing/calculate', {
      storeId,
      productId,
      basePrice,
      context,
    });
    return response.data || {};
  },

  async evaluateRule(
    rule: any,
    context: {
      quantity?: number;
      customerId?: string;
      timeOfDay?: number;
      dayOfWeek?: number;
      inventoryLevel?: number;
    }
  ): Promise<boolean> {
    // Backend handles rule evaluation
    const response = await api.post('/pricing/evaluate-rule', { rule, context });
    return response.data?.shouldApply || false;
  },

  calculateAdjustment(currentPrice: number, rule: any): number {
    // This is now handled by backend - frontend stub returns 0
    console.warn('calculateAdjustment should not be called directly - use calculatePrice API');
    return 0;
  },

  // ============================================================================
  // Price History
  // ============================================================================

  async recordPriceChange(
    storeId: string,
    productId: string,
    oldPrice: number,
    newPrice: number,
    reason: string,
    ruleId?: string
  ): Promise<PriceHistory> {
    const response = await api.post('/pricing/history', {
      storeId,
      productId,
      oldPrice,
      newPrice,
      reason,
      ruleId,
    });
    return response.data || {};
  },

  async getPriceHistory(
    storeId: string,
    productId: string,
    options: { limit?: number; offset?: number; startDate?: Date; endDate?: Date } = {}
  ): Promise<{ history: PriceHistory[]; total: number }> {
    const response = await api.get('/pricing/history', {
      storeId,
      productId,
      ...options,
    });
    return { history: response.data?.history || [], total: response.data?.total || 0 };
  },

  // ============================================================================
  // Dynamic Price Snapshots (Demand-Based)
  // ============================================================================

  async createDemandSnapshot(
    storeId: string,
    date: Date,
    demandIndex: number,
    recommendedAdjustment: number,
    appliedAdjustment?: number
  ): Promise<DynamicPriceSnapshot> {
    const response = await api.post('/pricing/snapshots', {
      storeId,
      date,
      demandIndex,
      recommendedAdjustment,
      appliedAdjustment,
    });
    return response.data || {};
  },

  async getDemandSnapshots(
    storeId: string,
    options: { startDate?: Date; endDate?: Date; limit?: number; offset?: number } = {}
  ): Promise<{ snapshots: DynamicPriceSnapshot[]; total: number }> {
    const response = await api.get('/pricing/snapshots', {
      storeId,
      ...options,
    });
    return { snapshots: response.data?.snapshots || [], total: response.data?.total || 0 };
  },

  async getLatestDemandSnapshot(storeId: string): Promise<DynamicPriceSnapshot | null> {
    const response = await api.get(`/pricing/snapshots/${storeId}/latest`);
    return response.data || null;
  },

  // ============================================================================
  // Bulk Operations
  // ============================================================================

  async applyRulesToProducts(
    storeId: string,
    ruleIds: string[],
    productIds: string[]
  ): Promise<{
    success: boolean;
    updated: number;
    errors: string[];
  }> {
    const response = await api.post('/pricing/apply-bulk', {
      storeId,
      ruleIds,
      productIds,
    });
    return response.data || {};
  },

  // ============================================================================
  // Analytics
  // ============================================================================

  async getRulePerformance(storeId: string, ruleId: string): Promise<{
    totalApplications: number;
    totalRevenueImpact: number;
    averageAdjustment: number;
    lastApplied: string | null;
  }> {
    const response = await api.get(`/pricing/rules/${ruleId}/performance`, {
      storeId,
    });
    return response.data || {};
  },

};
