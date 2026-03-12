/**
 * SaaS Industry Type Definitions
 * 
 * Core types and interfaces for the SaaS industry module
 */

import type { z } from 'zod';

// ============================================================================
// Core Data Models
// ============================================================================

export interface Tenant {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'trial' | 'paused' | 'cancelled' | 'churned';
  mrr: number;
  seats: number;
  usedSeats: number;
  signupDate: Date;
  trialEndDate?: Date;
  lastActiveAt: Date;
  churnDate?: Date;
  churnReason?: string;
  healthScore: number; // 0-100
  usageScore: number; // 0-100
  satisfactionScore?: number; // 1-5
  accountManager?: string;
  tags: string[];
}

export interface Subscription {
  id: string;
  tenantId: string;
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'trialing' | 'paused' | 'cancelled' | 'past_due';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: Date;
  endedAt?: Date;
  quantity: number; // seats
  price: number;
  currency: string;
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
    durationMonths?: number;
  };
  trialStart?: Date;
  trialEnd?: Date;
}

export interface MRRMovement {
  month: string; // YYYY-MM
  startingMRR: number;
  newBusiness: number;
  expansion: number;
  contraction: number;
  churn: number;
  reactivation: number;
  endingMRR: number;
}

export interface ChurnData {
  tenantId: string;
  tenantName: string;
  mrr: number;
  churnDate: Date;
  reason: 'price' | 'features' | 'support' | 'competitor' | 'budget' | 'other';
  lifetime: number; // months
  usageScore: number;
  satisfactionScore?: number;
  feedback?: string;
}

export interface UsageMetrics {
  tenantId: string;
  period: string; // YYYY-MM
  apiCalls: number;
  storageUsed: number; // MB
  activeUsers: number;
  sessionsCount: number;
  featureUsage: Record<string, number>;
  topFeatures: string[];
  unusedFeatures: string[];
}

export interface RevenueMetrics {
  totalMRR: number;
  previousMRR: number;
  mrrGrowth: number;
  arr: number;
  newCustomers: number;
  expansions: number;
  contractions: number;
  churnedCustomers: number;
  churnRate: number;
  ltv: number;
  cac: number;
  paybackPeriod: number; // months
}

export interface CustomerSegment {
  segment: string;
  count: number;
  mrr: number;
  avgMRR: number;
  churnRate: number;
  growthRate: number;
  healthScore: number;
}

// ============================================================================
// Dashboard Aggregations
// ============================================================================

export interface SaaSDashboardOverview {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  totalMRR: number;
  mrrGrowth: number;
  churnRate: number;
  ltv: number;
  avgHealthScore: number;
  atRiskTenants: number;
  upcomingRenewals: number;
}

export interface SaaSDashboardMetrics {
  revenue: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
  };
  tenants: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
  };
  churn: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
  };
  expansion: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
  };
}

export interface SaaSDashboardData {
  overview: SaaSDashboardOverview;
  metrics: SaaSDashboardMetrics;
  tenants: Tenant[];
  subscriptions: Subscription[];
  mrrHistory: MRRMovement[];
  churnData: ChurnData[];
  usageMetrics: UsageMetrics[];
  revenueMetrics: RevenueMetrics;
  segments: CustomerSegment[];
  atRiskTenants: Tenant[];
  upcomingRenewals: Tenant[];
  expansionOpportunities: Tenant[];
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface GetSaaSDashboardRequest {
  organizationId: string;
  range?: 'month' | 'quarter' | 'year';
  includeDetails?: boolean;
}

export interface GetSaaSDashboardResponse {
  success: boolean;
  data: SaaSDashboardData;
  timestamp: string;
  cached?: boolean;
}

export interface GetTenantMetricsRequest {
  organizationId: string;
  tenantId?: string;
  plan?: 'free' | 'starter' | 'professional' | 'enterprise';
  status?: 'active' | 'trial' | 'paused' | 'cancelled' | 'churned';
}

export interface GetTenantMetricsResponse {
  success: boolean;
  data: {
    totalTenants: number;
    activeTenants: number;
    byPlan: Record<string, number>;
    byStatus: Record<string, number>;
    avgHealthScore: number;
    tenants: Tenant[];
  };
  timestamp: string;
}

export interface GetMRRAnalyticsRequest {
  organizationId: string;
  period?: 'month' | 'quarter' | 'year';
  includeBreakdown?: boolean;
}

export interface GetMRRAnalyticsResponse {
  success: boolean;
  data: {
    currentMRR: number;
    previousMRR: number;
    growth: number;
    movement: MRRMovement[];
    breakdown: {
      newBusiness: number;
      expansion: number;
      contraction: number;
      churn: number;
    };
  };
  timestamp: string;
}

export interface GetChurnAnalyticsRequest {
  organizationId: string;
  period?: 'month' | 'quarter' | 'year';
  includeReasons?: boolean;
}

export interface GetChurnAnalyticsResponse {
  success: boolean;
  data: {
    churnRate: number;
    previousChurnRate: number;
    churnedTenants: number;
    churnedMRR: number;
    reasons: Record<string, number>;
    churnedTenants: ChurnData[];
  };
  timestamp: string;
}

export interface GetUsageAnalyticsRequest {
  organizationId: string;
  tenantId?: string;
  period?: 'month' | 'quarter';
}

export interface GetUsageAnalyticsResponse {
  success: boolean;
  data: {
    totalApiCalls: number;
    avgStorageUsed: number;
    avgActiveUsers: number;
    featureAdoption: Record<string, number>;
    usageTrend: Array<{
      date: string;
      apiCalls: number;
      activeUsers: number;
    }>;
  };
  timestamp: string;
}

export interface UpgradeTenantRequest {
  organizationId: string;
  tenantId: string;
  newPlan: 'starter' | 'professional' | 'enterprise';
  newSeats?: number;
}

export interface UpgradeTenantResponse {
  success: boolean;
  data: {
    subscription: Subscription;
    newMRR: number;
    effectiveDate: Date;
  };
  message?: string;
}

export interface GenerateChurnPredictionRequest {
  organizationId: string;
  tenantId?: string;
  horizon?: '30d' | '60d' | '90d';
}

export interface GenerateChurnPredictionResponse {
  success: boolean;
  data: {
    predictions: Array<{
      tenantId: string;
      tenantName: string;
      churnProbability: number;
      riskLevel: 'low' | 'medium' | 'high';
      riskFactors: string[];
      recommendedActions: string[];
    }>;
    summary: {
      highRisk: number;
      mediumRisk: number;
      lowRisk: number;
    };
  };
  message?: string;
}

// ============================================================================
// Alert & Action Types
// ============================================================================

export interface SaaSAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'revenue' | 'churn' | 'usage' | 'renewal' | 'health';
  title: string;
  message: string;
  affectedEntity?: {
    type: 'tenant' | 'subscription';
    id: string;
    name: string;
  };
  suggestedAction?: {
    title: string;
    href: string;
    icon: string;
  };
  createdAt: Date;
}

export interface SaaSSuggestedAction {
  id: string;
  title: string;
  reason: string;
  severity: 'critical' | 'warning' | 'info';
  href: string;
  icon: string;
  estimatedImpact?: string;
}
