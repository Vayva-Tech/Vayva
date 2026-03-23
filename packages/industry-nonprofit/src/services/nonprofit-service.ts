// @ts-nocheck
/**
 * Nonprofit Industry Service
 * 
 * Provides nonprofit-specific dashboard data fetching and business logic
 */

import type { 
  NonprofitDashboardData,
  Donation,
  Campaign,
  Donor,
  Grant,
  Program,
  Volunteer,
  ImpactMetrics,
  NonprofitAlert,
  NonprofitSuggestedAction
} from '../types';

// ---------------------------------------------------------------------------
// Service Configuration
// ---------------------------------------------------------------------------

const API_BASE = '/api/nonprofit';

// ---------------------------------------------------------------------------
// Nonprofit Dashboard Service
// ---------------------------------------------------------------------------

export class NonprofitDashboardService {
  private organizationId: string;
  
  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }
  
  /**
   * Get comprehensive dashboard data
   */
  async getDashboardData(
    range: 'today' | 'week' | 'month' | 'quarter' | 'year' = 'month',
    includeDetails = true
  ): Promise<NonprofitDashboardData> {
    const response = await fetch(`${API_BASE}/dashboard?organizationId=${this.organizationId}&range=${range}&includeDetails=${includeDetails}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch nonprofit dashboard data: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data as NonprofitDashboardData;
  }
  
  /**
   * Get donation statistics
   */
  async getDonationStats(
    campaignId?: string,
    donorId?: string
  ): Promise<{
    total: number;
    count: number;
    averageGift: number;
    donations: Donation[];
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const params = new URLSearchParams({ organizationId: this.organizationId });
    if (campaignId) params.append('campaignId', campaignId);
    if (donorId) params.append('donorId', donorId);
    
    const response = await fetch(`${API_BASE}/donations/stats?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch donation stats: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data;
  }
  
  /**
   * Get campaign performance
   */
  async getCampaignPerformance(status?: 'active' | 'completed' | 'paused' | 'draft'): Promise<{
    totalCampaigns: number;
    activeCampaigns: number;
    totalRaised: number;
    averageProgress: number;
    campaigns: Campaign[];
  }> {
    const params = new URLSearchParams({ organizationId: this.organizationId });
    if (status) params.append('status', status);
    
    const response = await fetch(`${API_BASE}/campaigns/performance?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch campaign performance: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data;
  }
  
  /**
   * Get donor segments
   */
  async getDonorSegments(
    segmentType?: 'individual' | 'foundation' | 'corporate' | 'government',
    minDonations?: number,
    isMajorDonor?: boolean
  ): Promise<{
    totalDonors: number;
    byType: Record<string, number>;
    majorDonors: number;
    recurringDonors: number;
    segments: Array<{
      type: string;
      percentage: number;
      count: number;
      totalValue: number;
    }>;
  }> {
    const params = new URLSearchParams({ organizationId: this.organizationId });
    if (segmentType) params.append('segmentType', segmentType);
    if (minDonations) params.append('minDonations', minDonations.toString());
    if (isMajorDonor !== undefined) params.append('isMajorDonor', isMajorDonor.toString());
    
    const response = await fetch(`${API_BASE}/donors/segments?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch donor segments: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data;
  }
  
  /**
   * Get grant pipeline
   */
  async getGrantPipeline(status?: 'planning' | 'in_progress' | 'submitted' | 'awarded' | 'rejected'): Promise<{
    totalGrants: number;
    awarded: number;
    pending: number;
    upcomingDeadlines: Grant[];
    grants: Grant[];
  }> {
    const params = new URLSearchParams({ organizationId: this.organizationId });
    if (status) params.append('status', status);
    
    const response = await fetch(`${API_BASE}/grants/pipeline?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch grant pipeline: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data;
  }
  
  /**
   * Get program impact metrics
   */
  async getProgramImpact(): Promise<{
    programs: Program[];
    impact: ImpactMetrics;
    fundingAllocation: Record<string, number>;
  }> {
    const response = await fetch(`${API_BASE}/programs/impact?organizationId=${this.organizationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch program impact: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data;
  }
  
  /**
   * Process a donation
   */
  async processDonation(
    donorId: string,
    amount: number,
    currency: string,
    type: 'one_time' | 'recurring' | 'major_gift' | 'campaign',
    campaignId?: string,
    paymentMethod: 'credit_card' | 'bank_transfer' | 'check' | 'cash' = 'credit_card',
    isRecurring?: boolean,
    recurringFrequency?: 'monthly' | 'quarterly' | 'annually'
  ): Promise<{
    donation: Donation;
    receiptUrl: string;
  }> {
    const response = await fetch(`${API_BASE}/donations/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organizationId: this.organizationId,
        donorId,
        amount,
        currency,
        type,
        campaignId,
        paymentMethod,
        isRecurring,
        recurringFrequency,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to process donation: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data;
  }
  
  /**
   * Generate impact report
   */
  async generateImpactReport(
    period: 'month' | 'quarter' | 'year',
    includePrograms = true,
    includeFinancials = true,
    includeStories = false
  ): Promise<{
    reportUrl: string;
    summary: {
      totalRaised: number;
      peopleServed: number;
      programsActive: number;
      volunteerHours: number;
    };
  }> {
    const response = await fetch(`${API_BASE}/reports/impact/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        organizationId: this.organizationId,
        period,
        includePrograms,
        includeFinancials,
        includeStories,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate impact report: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.data;
  }
  
  /**
   * Generate alerts based on nonprofit data
   */
  generateAlerts(data: NonprofitDashboardData): NonprofitAlert[] {
    const alerts: NonprofitAlert[] = [];
    
    // Low donation alert
    if (data.metrics.revenue.change < -10) {
      alerts.push({
        id: 'low_donations',
        type: 'critical',
        category: 'donation',
        title: 'Declining Donations',
        message: `Donations down ${Math.abs(data.metrics.revenue.change)}% this period`,
        suggestedAction: {
          title: 'Review Campaign Strategy',
          href: '/dashboard/campaigns',
          icon: 'TrendingDown',
        },
        createdAt: new Date(),
      });
    }
    
    // Campaign needs attention
    const strugglingCampaigns = data.campaigns.filter(c => c.raised / c.goal < 0.5);
    if (strugglingCampaigns.length > 0) {
      alerts.push({
        id: 'campaign_attention',
        type: 'warning',
        category: 'campaign',
        title: 'Campaigns Needing Attention',
        message: `${strugglingCampaigns.length} campaigns below 50% of goal`,
        affectedEntity: {
          type: 'campaign',
          id: strugglingCampaigns[0].id,
          name: strugglingCampaigns[0].name,
        },
        suggestedAction: {
          title: 'Boost Campaign',
          href: `/dashboard/campaigns/${strugglingCampaigns[0].id}`,
          icon: 'Rocket',
        },
        createdAt: new Date(),
      });
    }
    
    // Grant deadline approaching
    const upcomingDeadlines = data.grants.filter(g => {
      const daysUntilDeadline = (new Date(g.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return daysUntilDeadline <= 14 && g.status === 'in_progress';
    });
    
    if (upcomingDeadlines.length > 0) {
      alerts.push({
        id: 'grant_deadline',
        type: 'warning',
        category: 'grant',
        title: 'Grant Deadline Approaching',
        message: `${upcomingDeadlines.length} grant(s) due within 2 weeks`,
        affectedEntity: {
          type: 'grant',
          id: upcomingDeadlines[0].id,
          name: upcomingDeadlines[0].title,
        },
        suggestedAction: {
          title: 'Complete Application',
          href: `/dashboard/grants/${upcomingDeadlines[0].id}`,
          icon: 'Clock',
        },
        createdAt: new Date(),
      });
    }
    
    return alerts;
  }
  
  /**
   * Generate suggested actions based on nonprofit data
   */
  generateSuggestedActions(data: NonprofitDashboardData): NonprofitSuggestedAction[] {
    const actions: NonprofitSuggestedAction[] = [];
    
    // Engage major donors
    if (data.majorDonors.length > 0 && data.majorDonors.some(d => !d.lastDonationAt || (Date.now() - d.lastDonationAt.getTime()) > 90 * 24 * 60 * 60 * 1000)) {
      actions.push({
        id: 'engage_major_donors',
        title: 'Reach out to major donors',
        reason: 'Some major donors haven\'t donated recently',
        severity: 'warning',
        href: '/dashboard/donors?filter=major&sort=last_donation',
        icon: 'Users',
        estimatedImpact: 'Increase major gift revenue by 15-20%',
      });
    }
    
    // Boost struggling campaigns
    const strugglingCampaigns = data.campaigns.filter(c => c.raised / c.goal < 0.5);
    if (strugglingCampaigns.length > 0) {
      actions.push({
        id: 'boost_campaigns',
        title: 'Boost underperforming campaigns',
        reason: 'Campaigns below 50% of goal need additional promotion',
        severity: 'info',
        href: '/dashboard/campaigns?filter=underperforming',
        icon: 'Megaphone',
        estimatedImpact: 'Improve campaign success rate by 25%',
      });
    }
    
    // Recognize top donors
    const topDonors = data.donors.slice(0, 10);
    if (topDonors.length > 0) {
      actions.push({
        id: 'recognize_donors',
        title: 'Recognize top donors',
        reason: 'Show appreciation to your biggest supporters',
        severity: 'info',
        href: '/dashboard/donors/recognition',
        icon: 'Award',
        estimatedImpact: 'Improve donor retention and satisfaction',
      });
    }
    
    return actions;
  }
}
