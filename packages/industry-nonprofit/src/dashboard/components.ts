// ============================================================================
// Nonprofit Industry Dashboard Components
// ============================================================================

// Import types from types module to avoid conflicts
import type { Campaign, Donor, Grant, Program, ImpactMetrics } from '../types';

// Import universal dashboard types
import type { 
  UniversalTodoItem,
  UniversalAlertItem
} from '@vayva/industry-core';

// Component-specific interfaces that extend or compose base types
export interface CampaignPerformance {
  id: string;
  name: string;
  goal: number;
  raised: number;
  percentage: number;
  daysLeft: number;
  status: 'on_track' | 'needs_push' | 'almost_there' | 'urgent';
}

export interface DonorSegment {
  type: 'individual' | 'foundation' | 'corporate' | 'government';
  percentage: number;
  count: number;
}

export interface GrantPipelineItem {
  id: string;
  funder: string;
  amount: number;
  deadline: string;
  status: 'submitted' | 'in_progress' | 'planning' | 'awarded' | 'rejected';
}

export interface ProgramFunding {
  program: string;
  percentage: number;
  amount: number;
}

// ---------------------------------------------------------------------------
// Nonprofit Component Props
// ---------------------------------------------------------------------------

export interface ImpactOverviewProps {
  data: {
    totalRaisedYTD: number;
    activeDonors: number;
    campaignsLive: number;
    yoyGrowth: number;
    newDonors: number;
    campaignsLaunching: number;
  };
  loading?: boolean;
  className?: string;
}

export interface DonationTrendsProps {
  data: {
    monthlyRevenue: number[];
    averageGift: number;
    recurringPercentage: number;
    majorDonors: { name: string; amount: number }[];
  };
  loading?: boolean;
  className?: string;
}

export interface DonorSegmentsProps {
  data: DonorSegment[];
  retentionRate: number;
  loading?: boolean;
  className?: string;
}

export interface ActiveCampaignsProps {
  campaigns: CampaignPerformance[];
  loading?: boolean;
  className?: string;
  onCampaignClick?: (campaignId: string) => void;
}

export interface GrantPipelineProps {
  pipeline: GrantPipelineItem[];
  awarded: number;
  pending: number;
  loading?: boolean;
  className?: string;
}

export interface ProgramImpactProps {
  programs: ProgramFunding[];
  impact: ImpactMetrics;
  loading?: boolean;
  className?: string;
}

export interface EngagementMetricsProps {
  data: {
    emailOpenRate: number;
    socialFollowers: number;
    websiteVisitors: number;
    eventAttendance: number;
  };
  loading?: boolean;
  className?: string;
}

export interface MajorDonorsProps {
  donors: { name: string; amount: number; lastDonation: string }[];
  loading?: boolean;
  className?: string;
}

export interface ActionRequiredProps {
  tasks: UniversalTodoItem[];
  alerts: UniversalAlertItem[];
  loading?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'on_track':
      return 'text-green-600 bg-green-50';
    case 'almost_there':
      return 'text-blue-600 bg-blue-50';
    case 'needs_push':
      return 'text-yellow-600 bg-yellow-50';
    case 'urgent':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

export function getDonorSegmentColor(segment: string): string {
  switch (segment) {
    case 'individual':
      return '#10B981'; // Emerald
    case 'foundation':
      return '#3B82F6'; // Blue
    case 'corporate':
      return '#F59E0B'; // Amber
    case 'government':
      return '#8B5CF6'; // Violet
    default:
      return '#6B7280'; // Gray
  }
}