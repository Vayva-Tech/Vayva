// @ts-nocheck
/**
 * SaaS Industry Service
 * 
 * Provides SaaS-specific dashboard data fetching and business logic
 */

import type { 
  SaaSDashboardData,
  Tenant,
  Subscription,
  MRRMovement,
  ChurnData,
  UsageMetrics,
  RevenueMetrics,
  CustomerSegment,
  SaaSAlert,
  SaaSSuggestedAction
} from '../types';

// ---------------------------------------------------------------------------
// Service Configuration
// ---------------------------------------------------------------------------

const API_BASE = '/api/saas';

// ---------------------------------------------------------------------------
// SaaS Dashboard Service
// ---------------------------------------------------------------------------

export class SaaSDashboardService {
  private organizationId: string;
  
  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }
  
  /**
   * Get comprehensive dashboard data
   */
  async getDashboardData(
    range: 'month' | 'quarter' | 'year' = 'month',
    includeDetails = true
  ): Promise<SaaSDashboardData> {
    const response = await fetch(`${API_BASE}/dashboard?organizationId=${this.organizationId}&range=${range}&includeDetails=${includeDetails}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch SaaS dashboard data: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data as SaaSDashboardData;
  }
  
  /**
   * Get tenant metrics
   */
  async getTenantMetrics(
    plan?: 'free' | 'starter' | 'professional' | 'enterprise',
    status?: 'active' | 'trial' | 'paused' | 'cancelled' | 'churned'
  ): Promise<{
    totalTenants: number;
    activeTenants: number;
    byPlan: Record<string, number>;
    byStatus: Record<string, number>;
    avgHealthScore: number;
    tenants: Tenant[];
  }> {
    const params = new URLSearchParams({ organizationId: this.organizationId });
    if (plan) params.append('plan', plan);
    if (status) params.append('status', status);
    
    const response = await fetch(`${API_BASE}/tenants/metrics?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tenant metrics: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data;
  }
  
  /**
   * Get MRR analytics
   */
  async getMRRAnalytics(
    period: 'month' | 'quarter' | 'year' = 'month',
    includeBreakdown = true
  ): Promise<{
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
  }> {
    const params = new URLSearchParams({ 
      organizationId: this.organizationId,
      period,
      includeBreakdown: includeBreakdown.toString()
    });
    
    const response = await fetch(`${API_BASE}/analytics/mrr?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch MRR analytics: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data;
  }
  
  /**
   * Get churn analytics
   */
  async getChurnAnalytics(
    period: 'month' | 'quarter' | 'year' = 'month',
    includeReasons = true
  ): Promise<{
    churnRate: number;
    previousChurnRate: number;
    churnedTenants: number;
    churnedMRR: number;
    reasons: Record<string, number>;
    churnedTenants: ChurnData[];
  }> {
    const params = new URLSearchParams({ 
      organizationId: this.organizationId,
      period,
      includeReasons: includeReasons.toString()
    });
    
    const response = await fetch(`${API_BASE}/analytics/churn?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch churn analytics: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data;
  }
  
  /**
   * Get usage analytics
   */
  async getUsageAnalytics(
    tenantId?: string,
    period: 'month' | 'quarter' = 'month'
  ): Promise<{
    totalApiCalls: number;
    avgStorageUsed: number;
    avgActiveUsers: number;
    featureAdoption: Record<string, number>;
    usageTrend: Array<{
      date: string;
      apiCalls: number;
      activeUsers: number;
    }>;
  }> {
    const params = new URLSearchParams({ 
      organizationId: this.organizationId,
      period
    });
    if (tenantId) params.append('tenantId', tenantId);
    
    const response = await fetch(`${API_BASE}/analytics/usage?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch usage analytics: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data;
  }
  
  /**
   * Upgrade tenant plan
   */
  async upgradeTenant(
    tenantId: string,
    newPlan: 'starter' | 'professional' | 'enterprise',
    newSeats?: number
  ): Promise<{
    subscription: Subscription;
    newMRR: number;
    effectiveDate: Date;
  }> {
    const response = await fetch(`${API_BASE}/tenants/upgrade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organizationId: this.organizationId,
        tenantId,
        newPlan,
        newSeats,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to upgrade tenant: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data;
  }
  
  /**
   * Generate churn prediction
   */
  async generateChurnPrediction(
    horizon: '30d' | '60d' | '90d' = '90d'
  ): Promise<{
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
  }> {
    const response = await fetch(`${API_BASE}/predictions/churn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organizationId: this.organizationId,
        horizon,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate churn prediction: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data;
  }
  
  /**
   * Generate alerts based on SaaS data
   */
  generateAlerts(data: SaaSDashboardData): SaaSAlert[] {
    const alerts: SaaSAlert[] = [];
    
    // High churn rate alert
    if (data.metrics.churn.value > 5 && data.metrics.churn.change > 10) {
      alerts.push({
        id: 'high_churn',
        type: 'critical',
        category: 'churn',
        title: 'High Churn Rate Alert',
        message: `Churn rate is ${data.metrics.churn.value.toFixed(1)}%, up ${data.metrics.churn.change.toFixed(1)}%`,
        suggestedAction: {
          title: 'Review Churned Tenants',
          href: '/dashboard/tenants?filter=churned',
          icon: 'UserMinus',
        },
        createdAt: new Date(),
      });
    }
    
    // MRR decline alert
    if (data.metrics.revenue.change < -5) {
      alerts.push({
        id: 'mrr_decline',
        type: 'critical',
        category: 'revenue',
        title: 'MRR Declining',
        message: `MRR down ${Math.abs(data.metrics.revenue.change.toFixed(1))}% this period`,
        suggestedAction: {
          title: 'Review Revenue Metrics',
          href: '/dashboard/revenue',
          icon: 'TrendingDown',
        },
        createdAt: new Date(),
      });
    }
    
    // At-risk tenants alert
    if (data.atRiskTenants.length > 5) {
      alerts.push({
        id: 'at_risk_tenants',
        type: 'warning',
        category: 'health',
        title: 'Multiple At-Risk Tenants',
        message: `${data.atRiskTenants.length} tenants showing churn signals`,
        affectedEntity: {
          type: 'tenant',
          id: data.atRiskTenants[0].id,
          name: data.atRiskTenants[0].name,
        },
        suggestedAction: {
          title: 'View At-Risk List',
          href: '/dashboard/tenants?filter=at-risk',
          icon: 'AlertTriangle',
        },
        createdAt: new Date(),
      });
    }
    
    // Upcoming renewals alert
    const renewalsThisWeek = data.upcomingRenewals.filter(t => {
      const renewalDate = t.trialEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const daysUntil = (renewalDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return daysUntil <= 7;
    });
    
    if (renewalsThisWeek.length > 0) {
      alerts.push({
        id: 'upcoming_renewals',
        type: 'info',
        category: 'renewal',
        title: 'Renewals This Week',
        message: `${renewalsThisWeek.length} tenant(s) renewing this week`,
        suggestedAction: {
          title: 'Prepare Renewals',
          href: '/dashboard/renewals',
          icon: 'RefreshCw',
        },
        createdAt: new Date(),
      });
    }
    
    return alerts;
  }
  
  /**
   * Generate suggested actions based on SaaS data
   */
  generateSuggestedActions(data: SaaSDashboardData): SaaSSuggestedAction[] {
    const actions: SaaSSuggestedAction[] = [];
    
    // Intervene with at-risk tenants
    if (data.atRiskTenants.length > 0) {
      actions.push({
        id: 'intervene_at_risk',
        title: 'Intervene with at-risk tenants',
        reason: 'Tenants showing churn signals need attention',
        severity: 'critical',
        href: '/dashboard/tenants?filter=at-risk',
        icon: 'HeartHandshake',
        estimatedImpact: 'Reduce churn by 15-20%',
      });
    }
    
    // Pursue expansion opportunities
    if (data.expansionOpportunities.length > 0) {
      actions.push({
        id: 'pursue_expansion',
        title: 'Pursue expansion opportunities',
        reason: 'High-usage tenants ready for upgrade',
        severity: 'info',
        href: '/dashboard/expansions',
        icon: 'TrendingUp',
        estimatedImpact: 'Increase MRR by 10-15%',
      });
    }
    
    // Engage trial tenants
    const trialTenants = data.tenants.filter(t => t.status === 'trial');
    if (trialTenants.length > 0) {
      actions.push({
        id: 'engage_trials',
        title: 'Engage trial tenants',
        reason: 'Help trial users see value before trial ends',
        severity: 'warning',
        href: '/dashboard/tenants?filter=trial',
        icon: 'GraduationCap',
        estimatedImpact: 'Improve trial-to-paid conversion by 20%',
      });
    }
    
    // Review low usage tenants
    const lowUsageTenants = data.tenants.filter(t => t.usageScore < 40);
    if (lowUsageTenants.length > 0) {
      actions.push({
        id: 'review_low_usage',
        title: 'Review low usage tenants',
        reason: 'Tenants not using product are at risk',
        severity: 'warning',
        href: '/dashboard/tenants?sort=usage&order=asc',
        icon: 'Activity',
        estimatedImpact: 'Improve retention through adoption',
      });
    }
    
    return actions;
  }
}
