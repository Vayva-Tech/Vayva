// @ts-nocheck
export interface ROASData {
  campaignId: string;
  campaignName: string;
  channel: 'facebook' | 'instagram' | 'google' | 'tiktok' | 'email' | 'influencer' | 'linkedin' | 'twitter' | 'pinterest';
  spend: number;
  revenue: number;
  roas: number;
  orders: number;
  cpa: number;
  ctr: number;
  conversionRate: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
  refundRate: number;
  mrr?: number; // Monthly Recurring Revenue (for SaaS)
  arr?: number; // Annual Recurring Revenue (for SaaS)
  churnRate?: number; // For subscription businesses
}

export interface RevenueBreakdown {
  category: string;
  amount: number;
  percentage: number;
  growth: number;
}

export interface EmailCampaign {
  id: string;
  name: string;
  type: 'newsletter' | 'promotional' | 'abandoned-cart' | 'welcome-series' | 're-engagement' | 'drip' | 'transactional';
  status: 'draft' | 'scheduled' | 'sending' | 'completed';
  sentCount: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  revenue: number;
  scheduledAt?: Date;
}

export interface CustomerSegment {
  id: string;
  name: string;
  description: string;
  size: number;
  value: number;
  growthRate: number;
  engagementScore: number;
  criteria: {
    minPurchases?: number;
    minSpend?: number;
    lastPurchaseDays?: number;
    tags?: string[];
    industry?: string;
    companySize?: string; // For B2B
  };
}

export interface CohortData {
  cohort: string; // e.g., "2024-01", "2024-02"
  size: number;
  retentionRates: number[]; // [month1, month2, month3, ...]
  revenue: number;
  avgOrderValue: number;
}

export interface ABTest {
  id: string;
  name: string;
  variant: 'A' | 'B';
  traffic: number; // percentage
  conversions: number;
  conversionRate: number;
  revenue: number;
  winner?: boolean;
  confidence?: number;
}

export interface CustomerBehavior {
  metric: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}
