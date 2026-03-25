/**
 * Lead Scoring Factors
 * Defines and calculates individual scoring factors
 */

import type { Lead, LeadActivity, LeadScoreFactor, ScoringFactorConfig } from '../../types';
import { DEFAULT_SCORING_FACTORS } from '../../types/lead';

export { DEFAULT_SCORING_FACTORS };

export interface FactorCalculationContext {
  lead: Lead;
  activities: LeadActivity[];
  marketData?: {
    avgDaysOnMarket: number;
    avgPrice: number;
    inventoryLevel: 'low' | 'balanced' | 'high';
  };
}

/**
 * Calculate inquiry recency score
 * Higher score for more recent inquiries
 */
export function calculateInquiryRecency(context: FactorCalculationContext): LeadScoreFactor {
  const daysSinceInquiry = Math.floor(
    (Date.now() - context.lead.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  let score: number;
  if (daysSinceInquiry < 1) score = 100;
  else if (daysSinceInquiry < 3) score = 90;
  else if (daysSinceInquiry < 7) score = 80;
  else if (daysSinceInquiry < 14) score = 65;
  else if (daysSinceInquiry < 30) score = 50;
  else if (daysSinceInquiry < 60) score = 35;
  else score = 20;

  return {
    name: 'inquiry_recency',
    category: 'engagement',
    weight: 0.15,
    score,
    rawValue: daysSinceInquiry,
    description: `${daysSinceInquiry} days since inquiry`,
  };
}

/**
 * Calculate property views score
 */
export function calculatePropertyViews(context: FactorCalculationContext): LeadScoreFactor {
  const viewActivities = context.activities.filter(a => a.type === 'view');
  const viewCount = viewActivities.length;

  let score: number;
  if (viewCount >= 20) score = 100;
  else if (viewCount >= 10) score = 85;
  else if (viewCount >= 5) score = 70;
  else if (viewCount >= 3) score = 55;
  else if (viewCount >= 1) score = 40;
  else score = 20;

  return {
    name: 'property_views',
    category: 'engagement',
    weight: 0.10,
    score,
    rawValue: viewCount,
    description: `${viewCount} properties viewed`,
  };
}

/**
 * Calculate showing requests score
 */
export function calculateShowingRequests(context: FactorCalculationContext): LeadScoreFactor {
  const showingActivities = context.activities.filter(a => a.type === 'showing_request');
  const requestCount = showingActivities.length;

  let score: number;
  if (requestCount >= 5) score = 100;
  else if (requestCount >= 3) score = 90;
  else if (requestCount >= 2) score = 80;
  else if (requestCount >= 1) score = 70;
  else score = 30;

  return {
    name: 'showing_requests',
    category: 'engagement',
    weight: 0.15,
    score,
    rawValue: requestCount,
    description: `${requestCount} showing request(s)`,
  };
}

/**
 * Calculate price range alignment score
 */
export function calculatePriceRangeAlignment(context: FactorCalculationContext): LeadScoreFactor {
  const { lead } = context;

  // If no budget specified, give neutral score
  if (!lead.budgetMin && !lead.budgetMax) {
    return {
      name: 'price_range_alignment',
      category: 'financial',
      weight: 0.10,
      score: 50,
      rawValue: 'not specified',
      description: 'Budget not specified',
    };
  }

  // If budget is specified, check if it's realistic
  const hasRealisticBudget = lead.budgetMax && lead.budgetMax >= 100000;
  
  let score = hasRealisticBudget ? 80 : 50;
  
  // Bonus for having both min and max
  if (lead.budgetMin && lead.budgetMax) {
    score += 10;
  }

  return {
    name: 'price_range_alignment',
    category: 'financial',
    weight: 0.10,
    score: Math.min(100, score),
    rawValue: `$${lead.budgetMin || 0} - $${lead.budgetMax || 0}`,
    description: `Budget range: $${lead.budgetMin || 0} - $${lead.budgetMax || 0}`,
  };
}

/**
 * Calculate pre-approval status score
 */
export function calculatePreApprovalStatus(context: FactorCalculationContext): LeadScoreFactor {
  const { lead } = context;

  let score: number;
  let description: string;

  if (lead.preApproved && lead.preApprovalAmount) {
    score = 100;
    description = `Pre-approved for $${lead.preApprovalAmount.toLocaleString()}`;
  } else if (lead.preApproved) {
    score = 85;
    description = 'Pre-approved (amount not specified)';
  } else {
    score = 40;
    description = 'Not pre-approved';
  }

  return {
    name: 'pre_approval_status',
    category: 'financial',
    weight: 0.15,
    score,
    rawValue: lead.preApproved ?? false,
    description,
  };
}

/**
 * Calculate response time score
 */
export function calculateResponseTime(context: FactorCalculationContext): LeadScoreFactor {
  const inquiryActivities = context.activities.filter(a => 
    a.type === 'inquiry' || a.type === 'email_open'
  );

  if (inquiryActivities.length === 0) {
    return {
      name: 'response_time',
      category: 'communication',
      weight: 0.10,
      score: 50,
      rawValue: 'no data',
      description: 'No response data available',
    };
  }

  // Calculate average response time (simplified)
  // In production, this would compare inquiry time to first response time
  const recentResponses = inquiryActivities.slice(-5);
  const avgResponseHours = 24; // Placeholder

  let score: number;
  if (avgResponseHours < 1) score = 100;
  else if (avgResponseHours < 4) score = 90;
  else if (avgResponseHours < 24) score = 75;
  else if (avgResponseHours < 48) score = 60;
  else score = 40;

  return {
    name: 'response_time',
    category: 'communication',
    weight: 0.10,
    score,
    rawValue: `${avgResponseHours} hours`,
    description: `Avg response time: ${avgResponseHours} hours`,
  };
}

/**
 * Calculate communication frequency score
 */
export function calculateCommunicationFrequency(context: FactorCalculationContext): LeadScoreFactor {
  const communicationActivities = context.activities.filter(a =>
    a.type === 'call' || a.type === 'meeting' || a.type === 'inquiry'
  );

  const uniqueDays = new Set(
    communicationActivities.map(a => a.createdAt.toDateString())
  ).size;

  let score: number;
  if (uniqueDays >= 10) score = 100;
  else if (uniqueDays >= 5) score = 85;
  else if (uniqueDays >= 3) score = 70;
  else if (uniqueDays >= 1) score = 55;
  else score = 30;

  return {
    name: 'communication_frequency',
    category: 'communication',
    weight: 0.10,
    score,
    rawValue: `${uniqueDays} days with communication`,
    description: `Communication on ${uniqueDays} unique days`,
  };
}

/**
 * Calculate location match score
 */
export function calculateLocationMatch(context: FactorCalculationContext): LeadScoreFactor {
  const { lead } = context;

  if (!lead.preferredLocations || lead.preferredLocations.length === 0) {
    return {
      name: 'location_match',
      category: 'preferences',
      weight: 0.10,
      score: 50,
      rawValue: 'not specified',
      description: 'No preferred locations specified',
    };
  }

  // Score based on specificity of location preferences
  const locationCount = lead.preferredLocations.length;
  let score: number;
  
  if (locationCount >= 1 && locationCount <= 3) score = 90; // Focused search
  else if (locationCount <= 5) score = 75;
  else score = 60; // Too broad

  return {
    name: 'location_match',
    category: 'preferences',
    weight: 0.10,
    score,
    rawValue: lead.preferredLocations.join(', '),
    description: `Interested in: ${lead.preferredLocations.join(', ')}`,
  };
}

/**
 * Calculate timeline urgency score
 */
export function calculateTimelineUrgency(context: FactorCalculationContext): LeadScoreFactor {
  const { lead } = context;

  if (!lead.timeline) {
    return {
      name: 'timeline_urgency',
      category: 'preferences',
      weight: 0.05,
      score: 50,
      rawValue: 'not specified',
      description: 'Timeline not specified',
    };
  }

  const timeline = lead.timeline.toLowerCase();
  let score: number;
  let description: string;

  if (timeline.includes('immediate') || timeline.includes('asap')) {
    score = 100;
    description = 'Looking to buy immediately';
  } else if (timeline.includes('month') || timeline.includes('30')) {
    score = 90;
    description = 'Timeline: Within 30 days';
  } else if (timeline.includes('2 month') || timeline.includes('60')) {
    score = 75;
    description = 'Timeline: 1-2 months';
  } else if (timeline.includes('3 month') || timeline.includes('90')) {
    score = 60;
    description = 'Timeline: 2-3 months';
  } else if (timeline.includes('6 month')) {
    score = 40;
    description = 'Timeline: 3-6 months';
  } else {
    score = 30;
    description = 'Timeline: 6+ months or flexible';
  }

  return {
    name: 'timeline_urgency',
    category: 'preferences',
    weight: 0.05,
    score,
    rawValue: lead.timeline,
    description,
  };
}

/**
 * Calculate all factors for a lead
 */
export function calculateAllFactors(context: FactorCalculationContext): LeadScoreFactor[] {
  return [
    calculateInquiryRecency(context),
    calculatePropertyViews(context),
    calculateShowingRequests(context),
    calculatePriceRangeAlignment(context),
    calculatePreApprovalStatus(context),
    calculateResponseTime(context),
    calculateCommunicationFrequency(context),
    calculateLocationMatch(context),
    calculateTimelineUrgency(context),
  ];
}

/**
 * Calculate weighted overall score from factors
 */
export function calculateWeightedScore(factors: LeadScoreFactor[]): number {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const factor of factors) {
    totalWeight += factor.weight;
    weightedSum += factor.score * factor.weight;
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

/**
 * Determine lead temperature from score
 */
export function determineTemperature(score: number): 'hot' | 'warm' | 'cold' | 'frozen' {
  if (score >= 75) return 'hot';
  if (score >= 50) return 'warm';
  if (score >= 25) return 'cold';
  return 'frozen';
}

/**
 * Determine lead priority from score and temperature
 */
export function determinePriority(
  score: number,
  temperature: string
): 'urgent' | 'high' | 'medium' | 'low' {
  if (score >= 85) return 'urgent';
  if (score >= 70 || temperature === 'hot') return 'high';
  if (score >= 40 || temperature === 'warm') return 'medium';
  return 'low';
}
