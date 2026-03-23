// @ts-nocheck
// ============================================================================
// SaaS Dashboard Component Props & Helper Functions
// ============================================================================

import type { Tenant } from '../types';

// ---------------------------------------------------------------------------
// Section Component Props Interfaces
// ---------------------------------------------------------------------------

export interface MRRWaterfallProps {
  data: {
    startingMRR: number;
    newBusiness: number;
    expansion: number;
    contraction: number;
    churn: number;
    endingMRR: number;
  };
  loading?: boolean;
}

export interface TenantHealthProps {
  distribution: {
    healthy: number;
    atRisk: number;
    critical: number;
  };
  tenants: Array<{
    id: string;
    name: string;
    healthScore: number;
    plan: string;
    mrr: number;
  }>;
  loading?: boolean;
}

export interface ChurnAnalyticsProps {
  data: {
    churnRate: number;
    previousChurnRate: number;
    churnedTenants: number;
    churnedMRR: number;
    reasons: Record<string, number>;
    recentChurns: Array<{
      id: string;
      tenantName: string;
      mrr: number;
      date: string;
      reason: string;
    }>;
  };
  loading?: boolean;
}

export interface UsageTrendsProps {
  data: {
    apiCalls: number[];
    activeUsers: number[];
    storageUsed: number;
    featureAdoption: Record<string, number>;
  };
  loading?: boolean;
}

export interface RevenueMetricsProps {
  data: {
    arr: number;
    mrrGrowth: number;
    ltv: number;
    cac: number;
    paybackPeriod: number;
    netRevenueRetention: number;
    grossMargin: number;
  };
  loading?: boolean;
}

export interface AtRiskTenantsProps {
  tenants: Array<{
    id: string;
    name: string;
    healthScore: number;
    usageScore: number;
    mrr: number;
    riskFactors: string[];
  }>;
  totalAtRisk: number;
  loading?: boolean;
}

export interface ExpansionOpportunitiesProps {
  opportunities: Array<{
    id: string;
    tenantName: string;
    currentPlan: string;
    suggestedPlan: string;
    mrrIncrease: number;
    confidence: number;
  }>;
  totalOpportunities: number;
  loading?: boolean;
}

export interface TenantSegmentationProps {
  segments: Array<{
    segment: string;
    count: number;
    mrr: number;
    avgMRR: number;
    churnRate: number;
    healthScore: number;
  }>;
  loading?: boolean;
}

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

export function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export function formatPercentage(value: number): string {
  return `${Math.abs(value).toFixed(1)}%`;
}

export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
}

export function getHealthColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

export function getRiskColor(level: 'low' | 'medium' | 'high'): string {
  switch (level) {
    case 'low':
      return 'text-green-600 bg-green-50';
    case 'medium':
      return 'text-amber-600 bg-amber-50';
    case 'high':
      return 'text-red-600 bg-red-50';
  }
}

export function getPlanBadgeColor(plan: string): string {
  switch (plan) {
    case 'enterprise':
      return 'bg-purple-100 text-purple-800';
    case 'professional':
      return 'bg-blue-100 text-blue-800';
    case 'starter':
      return 'bg-green-100 text-green-800';
    case 'free':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
