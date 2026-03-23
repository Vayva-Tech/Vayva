// @ts-nocheck
/**
 * Nonprofit Industry Type Definitions
 * 
 * Core types and interfaces for the nonprofit industry module
 */

import type { z } from 'zod';

// ============================================================================
// Core Data Models
// ============================================================================

export interface Donation {
  id: string;
  donorId: string;
  donorName?: string;
  amount: number;
  currency: string;
  type: 'one_time' | 'recurring' | 'major_gift' | 'campaign';
  campaignId?: string;
  paymentMethod: 'credit_card' | 'bank_transfer' | 'check' | 'cash';
  isRecurring: boolean;
  recurringFrequency?: 'monthly' | 'quarterly' | 'annually';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  notes?: string;
  createdAt: Date;
  processedAt?: Date;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  goal: number;
  raised: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'paused' | 'draft';
  category: 'annual_fund' | 'capital' | 'program' | 'emergency';
  donorCount: number;
  averageGift: number;
  marketingChannels: string[];
  teamMembers: string[];
}

export interface Donor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type: 'individual' | 'foundation' | 'corporate' | 'government';
  totalDonations: number;
  donationCount: number;
  firstDonationAt: Date;
  lastDonationAt?: Date;
  averageGift: number;
  isMajorDonor: boolean;
  isRecurring: boolean;
  communicationPreferences: {
    email: boolean;
    phone: boolean;
    mail: boolean;
  };
  tags: string[];
  notes?: string;
}

export interface Grant {
  id: string;
  funder: string;
  funderType: 'foundation' | 'government' | 'corporate';
  title: string;
  description?: string;
  amount: number;
  deadline: Date;
  status: 'planning' | 'in_progress' | 'submitted' | 'awarded' | 'rejected';
  submittedAt?: Date;
  awardedAt?: Date;
  reportDueDate?: Date;
  programArea?: string;
  contactPerson?: {
    name: string;
    email: string;
    phone?: string;
  };
  requirements: string[];
  attachments?: string[];
}

export interface Program {
  id: string;
  name: string;
  description?: string;
  category: 'education' | 'healthcare' | 'community' | 'research' | 'advocacy';
  budget: number;
  actualSpending: number;
  beneficiariesServed: number;
  targetBeneficiaries: number;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'planned';
  outcomes: Array<{
    metric: string;
    target: number;
    actual: number;
    unit: string;
  }>;
  teamMembers: string[];
}

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  availability: string[];
  totalHours: number;
  hoursThisMonth: number;
  lastActivityAt: Date;
  status: 'active' | 'inactive' | 'pending';
  backgroundCheckCompleted?: boolean;
  backgroundCheckDate?: Date;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface ImpactMetrics {
  peopleServed: number;
  communities: number;
  volunteerHours: number;
  outcomesAchieved: number;
  programsActive: number;
  partnershipsFormed: number;
  mediaMentions: number;
  socialMediaReach: number;
}

// ============================================================================
// Dashboard Aggregations
// ============================================================================

export interface NonprofitDashboardOverview {
  totalRaisedYTD: number;
  activeDonors: number;
  campaignsLive: number;
  yoyGrowth: number;
  newDonorsThisMonth: number;
  campaignsLaunchingSoon: number;
  grantsAwarded: number;
  grantsPending: number;
  volunteersActive: number;
  programsActive: number;
}

export interface NonprofitDashboardMetrics {
  revenue: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
  };
  donors: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
  };
  campaigns: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
  };
  retention: {
    value: number;
    change: number;
    trend: 'up' | 'down' | 'neutral';
  };
}

export interface NonprofitDashboardData {
  overview: NonprofitDashboardOverview;
  metrics: NonprofitDashboardMetrics;
  donations: Donation[];
  campaigns: Campaign[];
  donors: Donor[];
  grants: Grant[];
  programs: Program[];
  volunteers: Volunteer[];
  impactMetrics: ImpactMetrics;
  majorDonors: Donor[];
  upcomingDeadlines: Grant[];
  topCampaigns: Campaign[];
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface GetNonprofitDashboardRequest {
  organizationId: string;
  range?: 'today' | 'week' | 'month' | 'quarter' | 'year';
  includeDetails?: boolean;
}

export interface GetNonprofitDashboardResponse {
  success: boolean;
  data: NonprofitDashboardData;
  timestamp: string;
  cached?: boolean;
}

export interface GetDonationsRequest {
  organizationId: string;
  campaignId?: string;
  donorId?: string;
  type?: 'one_time' | 'recurring' | 'major_gift' | 'campaign';
  status?: 'completed' | 'pending' | 'failed' | 'refunded';
  dateFrom?: Date;
  dateTo?: Date;
}

export interface GetDonationsResponse {
  success: boolean;
  data: {
    total: number;
    count: number;
    averageGift: number;
    donations: Donation[];
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  };
  timestamp: string;
}

export interface GetCampaignPerformanceRequest {
  organizationId: string;
  campaignId?: string;
  status?: 'active' | 'completed' | 'paused' | 'draft';
}

export interface GetCampaignPerformanceResponse {
  success: boolean;
  data: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalRaised: number;
    averageProgress: number;
    campaigns: Campaign[];
  };
  timestamp: string;
}

export interface GetDonorSegmentsRequest {
  organizationId: string;
  segmentType?: 'individual' | 'foundation' | 'corporate' | 'government';
  minDonations?: number;
  isMajorDonor?: boolean;
}

export interface GetDonorSegmentsResponse {
  success: boolean;
  data: {
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
  };
  timestamp: string;
}

export interface CreateDonationRequest {
  organizationId: string;
  donorId: string;
  amount: number;
  currency: string;
  type: 'one_time' | 'recurring' | 'major_gift' | 'campaign';
  campaignId?: string;
  paymentMethod: 'credit_card' | 'bank_transfer' | 'check' | 'cash';
  isRecurring?: boolean;
  recurringFrequency?: 'monthly' | 'quarterly' | 'annually';
  notes?: string;
}

export interface CreateDonationResponse {
  success: boolean;
  data: {
    donation: Donation;
    receiptUrl: string;
  };
  message?: string;
}

export interface GenerateImpactReportRequest {
  organizationId: string;
  period: 'month' | 'quarter' | 'year';
  includePrograms?: boolean;
  includeFinancials?: boolean;
  includeStories?: boolean;
}

export interface GenerateImpactReportResponse {
  success: boolean;
  data: {
    reportUrl: string;
    summary: {
      totalRaised: number;
      peopleServed: number;
      programsActive: number;
      volunteerHours: number;
    };
  };
  message?: string;
}

// ============================================================================
// Alert & Action Types
// ============================================================================

export interface NonprofitAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'donation' | 'campaign' | 'grant' | 'donor' | 'program';
  title: string;
  message: string;
  affectedEntity?: {
    type: 'donation' | 'campaign' | 'grant' | 'donor' | 'program';
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

export interface NonprofitSuggestedAction {
  id: string;
  title: string;
  reason: string;
  severity: 'critical' | 'warning' | 'info';
  href: string;
  icon: string;
  estimatedImpact?: string;
}
