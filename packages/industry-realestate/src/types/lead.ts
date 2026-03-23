// @ts-nocheck
/**
 * Real Estate Lead Scoring Types
 * Lead management and AI-powered scoring
 */

import type { Address } from './property';

export type LeadStatus = 
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'nurturing'
  | 'active'
  | 'closed'
  | 'lost'
  | 'archived';

export type LeadSource = 
  | 'website'
  | 'referral'
  | 'social_media'
  | 'open_house'
  | 'sign_call'
  | 'zillow'
  | 'realtor_com'
  | 'facebook'
  | 'instagram'
  | 'google'
  | 'walk_in'
  | 'other';

export type LeadType = 'buyer' | 'seller' | 'renter' | 'investor' | 'vendor';

export type LeadTemperature = 'hot' | 'warm' | 'cold' | 'frozen';

export type LeadPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface Lead {
  id: string;
  merchantId: string;
  agentId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  type: LeadType;
  status: LeadStatus;
  source: LeadSource;
  sourceDetails?: string;
  address?: Address;
  budgetMin?: number;
  budgetMax?: number;
  preferredLocations?: string[];
  propertyType?: string[];
  bedrooms?: number;
  bathrooms?: number;
  timeline?: string; // e.g., "3 months", "immediately"
  preApproved?: boolean;
  preApprovalAmount?: number;
  notes?: string;
  tags: string[];
  assignedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  lastContactedAt?: Date;
  nextFollowUpAt?: Date;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  type: 'view' | 'inquiry' | 'showing_request' | 'email_open' | 'link_click' | 'call' | 'meeting' | 'note';
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  createdBy?: string;
}

export interface LeadScore {
  id: string;
  leadId: string;
  overallScore: number; // 0-100
  temperature: LeadTemperature;
  priority: LeadPriority;
  factors: LeadScoreFactor[];
  conversionProbability: number; // 0-1
  estimatedValue?: number;
  estimatedCloseDate?: Date;
  aiInsights?: string;
  aiRecommendations?: string[];
  calculatedAt: Date;
  expiresAt?: Date;
}

export interface LeadScoreFactor {
  name: string;
  category: string;
  weight: number; // 0-1
  score: number; // 0-100
  rawValue: number | string | boolean;
  description: string;
}

export interface LeadScoringConfig {
  merchantId: string;
  enabled: boolean;
  aiEnabled: boolean;
  factors: ScoringFactorConfig[];
  autoAssign: boolean;
  autoAssignThreshold: number; // minimum score for auto-assignment
  temperatureThresholds: {
    hot: number;
    warm: number;
    cold: number;
  };
}

export interface ScoringFactorConfig {
  name: string;
  category: string;
  weight: number;
  enabled: boolean;
  minValue?: number;
  maxValue?: number;
  formula?: string;
}

export interface LeadFilter {
  merchantId?: string;
  agentId?: string;
  status?: LeadStatus[];
  type?: LeadType[];
  source?: LeadSource[];
  temperature?: LeadTemperature[];
  priority?: LeadPriority[];
  minScore?: number;
  maxScore?: number;
  assigned?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  lastContactedAfter?: Date;
  lastContactedBefore?: Date;
  tags?: string[];
}

export interface LeadScoringRequest {
  leadId: string;
  forceRecalculate?: boolean;
  includeAiAnalysis?: boolean;
}

export interface LeadScoringResponse {
  leadId: string;
  score: LeadScore;
  processingTime: number;
  cached: boolean;
}

export interface LeadBatchScoreRequest {
  leadIds: string[];
  includeAiAnalysis?: boolean;
}

export interface LeadBatchScoreResponse {
  scores: LeadScore[];
  failed: string[];
  processingTime: number;
}

// Default scoring factors
export const DEFAULT_SCORING_FACTORS: ScoringFactorConfig[] = [
  {
    name: 'inquiry_recency',
    category: 'engagement',
    weight: 0.15,
    enabled: true,
    formula: 'days_since_inquiry < 1 ? 100 : days_since_inquiry < 7 ? 80 : days_since_inquiry < 30 ? 50 : 20',
  },
  {
    name: 'property_views',
    category: 'engagement',
    weight: 0.10,
    enabled: true,
    minValue: 0,
    maxValue: 50,
  },
  {
    name: 'showing_requests',
    category: 'engagement',
    weight: 0.15,
    enabled: true,
    minValue: 0,
    maxValue: 10,
  },
  {
    name: 'price_range_alignment',
    category: 'financial',
    weight: 0.10,
    enabled: true,
  },
  {
    name: 'pre_approval_status',
    category: 'financial',
    weight: 0.15,
    enabled: true,
  },
  {
    name: 'response_time',
    category: 'communication',
    weight: 0.10,
    enabled: true,
  },
  {
    name: 'communication_frequency',
    category: 'communication',
    weight: 0.10,
    enabled: true,
  },
  {
    name: 'location_match',
    category: 'preferences',
    weight: 0.10,
    enabled: true,
  },
  {
    name: 'timeline_urgency',
    category: 'preferences',
    weight: 0.05,
    enabled: true,
  },
];

// Temperature thresholds
export const DEFAULT_TEMPERATURE_THRESHOLDS = {
  hot: 75,
  warm: 50,
  cold: 25,
};
