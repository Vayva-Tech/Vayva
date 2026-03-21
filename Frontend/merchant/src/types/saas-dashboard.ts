/**
 * SaaS Dashboard API Types
 * Type definitions for all API responses and data structures
 */

// Aggregate Metrics
export interface AggregateMetrics {
  mrr: {
    current: number;
    previousMonth: number;
    growth: number;
  };
  arr: {
    current: number;
    growth: number;
  };
  churnRate: {
    current: number;
    previousMonth: number;
    trend: 'up' | 'down';
  };
  activeSubscriptions: number;
  activeTenants: number;
  ltv: {
    average: number;
    growth: number;
  };
  platformStats: {
    uptime: number;
    supportTickets: number;
    newTrialsToday: number;
    conversionsToday: number;
  };
}

// Subscription Metrics
export interface SubscriptionMetrics {
  total: number;
  byStatus: {
    active: number;
    trialing: number;
    cancelled: number;
  };
  byPlan: Array<{
    planId: string;
    planName: string;
    count: number;
    mrr: number;
  }>;
  byBillingCycle: {
    monthly: number;
    yearly: number;
  };
  mrrBreakdown: {
    total: number;
    byTier: Array<{
      tier: string;
      amount: number;
      percentage: number;
      subscribers: number;
    }>;
    addOns: number;
    expansion: number;
    contraction: number;
  };
}

// Tenant Growth
export interface TenantGrowthMetrics {
  current: number;
  previousMonth: number;
  growth: number;
  trend: Array<{
    month: string;
    tenants: number;
    new: number;
    churned: number;
  }>;
  cohortRetention: Array<{
    month: number;
    retentionRate: number;
    status: 'good' | 'warning';
  }>;
  monthlyStats: {
    new: number;
    churned: number;
    net: number;
  };
}

// Churn Risk
export interface ChurnRiskScore {
  tenantId: string;
  tenantName: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  lastLoginDaysAgo: number;
  usageChangePercent: number;
  mrrImpact: number;
  recommendedActions: Array<{
    action: string;
    method: 'email' | 'call' | 'intervene';
  }>;
}

export interface ChurnRiskResponse {
  atRiskCount: number;
  highRisk: ChurnRiskScore[];
  mediumRisk: ChurnRiskScore[];
  predictionAccuracy: number;
}

// Feature Flags
export interface FeatureFlag {
  id: string;
  name: string;
  version: string;
  description?: string;
  rolloutPercentage: number;
  status: 'stable' | 'monitoring' | 'testing' | 'deprecated';
  enabledTenants: number;
  totalTenants: number;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface FeatureFlagsResponse {
  features: FeatureFlag[];
  total: number;
  activeReleases: number;
  upcomingReleases: Array<{
    name: string;
    version: string;
    scheduledDate: string;
    description?: string;
  }>;
}

// Usage Analytics
export interface UsageMetric {
  metricType: 'api_calls' | 'bandwidth' | 'storage' | 'compute';
  periodType: 'hourly' | 'daily' | 'monthly';
  periodStart: string;
  periodEnd: string;
  metricValue: number;
  unit: string;
  tenantId?: string;
  metadata?: Record<string, any>;
}

export interface UsageAnalytics {
  totalApiCalls: number;
  totalBandwidth: number;
  byEndpoint: Array<{
    endpoint: string;
    calls: number;
    percentage: number;
    avgResponseTime: number;
  }>;
  topConsumers: Array<{
    tenantId: string;
    tenantName: string;
    apiCalls: number;
    bandwidth: number;
    period: string;
  }>;
  trends: Array<{
    period: string;
    apiCalls: number;
    bandwidth: number;
    activeTenants: number;
  }>;
}

// KPI Data for UI Components
export interface KPIData {
  label: string;
  value: string | number;
  trend: 'up' | 'down' | 'neutral';
  trendValue: number;
  sparklineData: number[];
  icon?: string;
}

// API Response Wrappers
export interface ApiResponse<T> {
  metrics?: T;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  page?: number;
  limit?: number;
  total?: number;
}
