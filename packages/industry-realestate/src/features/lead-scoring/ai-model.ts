/**
 * Lead Scoring AI Model Integration
 * Uses AI to enhance lead qualification and provide insights
 */

import type { Lead, LeadScore, LeadActivity } from '../../types';

export interface AIAnalysisRequest {
  lead: Lead;
  activities: LeadActivity[];
  factors: Array<{
    name: string;
    score: number;
    weight: number;
  }>;
}

export interface AIAnalysisResult {
  insights: string;
  recommendations: string[];
  conversionProbability: number;
  estimatedValue?: number;
  estimatedCloseDate?: Date;
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number; // 0-1
}

/**
 * Analyze lead using AI
 * This is a mock implementation - in production, this would call
 * Groq, OpenAI, or another AI service
 */
export async function analyzeLeadWithAI(
  request: AIAnalysisRequest
): Promise<AIAnalysisResult> {
  // In production, this would make an API call to an AI service
  // For now, we provide rule-based analysis

  const { lead, activities, factors } = request;

  // Calculate base metrics
  const inquiryRecency = factors.find(f => f.name === 'inquiry_recency')?.score || 50;
  const showingRequests = factors.find(f => f.name === 'showing_requests')?.score || 0;
  const preApproval = factors.find(f => f.name === 'pre_approval_status')?.score || 0;
  const timeline = factors.find(f => f.name === 'timeline_urgency')?.score || 50;

  // Generate insights based on factors
  const insights = generateInsights(lead, factors, activities);

  // Generate recommendations
  const recommendations = generateRecommendations(lead, factors);

  // Calculate conversion probability
  const conversionProbability = calculateConversionProbability(factors);

  // Estimate value
  const estimatedValue = estimateDealValue(lead);

  // Estimate close date
  const estimatedCloseDate = estimateCloseDate(lead, timeline);

  // Determine sentiment
  const sentiment = determineSentiment(factors, activities);

  return {
    insights,
    recommendations,
    conversionProbability,
    estimatedValue,
    estimatedCloseDate,
    sentiment,
    confidence: 0.75, // AI confidence level
  };
}

/**
 * Generate insights about the lead
 */
function generateInsights(
  lead: Lead,
  factors: Array<{ name: string; score: number; weight: number }>,
  activities: LeadActivity[]
): string {
  const insights: string[] = [];

  // Check pre-approval status
  const preApprovalFactor = factors.find(f => f.name === 'pre_approval_status');
  if (preApprovalFactor && preApprovalFactor.score >= 85) {
    insights.push(`${lead.firstName} is pre-approved and ready to buy`);
  } else if (preApprovalFactor && preApprovalFactor.score < 50) {
    insights.push(`${lead.firstName} needs financing guidance`);
  }

  // Check engagement level
  const showingFactor = factors.find(f => f.name === 'showing_requests');
  const viewFactor = factors.find(f => f.name === 'property_views');
  
  if (showingFactor && showingFactor.score >= 80) {
    insights.push('High engagement - multiple showing requests');
  } else if (viewFactor && viewFactor.score >= 70 && (!showingFactor || showingFactor.score < 50)) {
    insights.push('Browsing properties but not requesting showings - may need nurturing');
  }

  // Check timeline
  const timelineFactor = factors.find(f => f.name === 'timeline_urgency');
  if (timelineFactor && timelineFactor.score >= 90) {
    insights.push('Urgent timeline - ready to move quickly');
  }

  // Check communication
  const commFactor = factors.find(f => f.name === 'communication_frequency');
  if (commFactor && commFactor.score < 40) {
    insights.push('Low communication - may need follow-up');
  }

  return insights.join('. ') + '.';
}

/**
 * Generate follow-up recommendations
 */
function generateRecommendations(
  lead: Lead,
  factors: Array<{ name: string; score: number; weight: number }>
): string[] {
  const recommendations: string[] = [];

  const preApprovalFactor = factors.find(f => f.name === 'pre_approval_status');
  const showingFactor = factors.find(f => f.name === 'showing_requests');
  const timelineFactor = factors.find(f => f.name === 'timeline_urgency');
  const commFactor = factors.find(f => f.name === 'communication_frequency');

  // Pre-approval recommendations
  if (preApprovalFactor && preApprovalFactor.score < 50) {
    recommendations.push('Connect with preferred lender for pre-approval');
  }

  // Showing recommendations
  if (showingFactor && showingFactor.score < 50) {
    recommendations.push('Proactively suggest properties matching criteria');
  }

  // Timeline recommendations
  if (timelineFactor && timelineFactor.score >= 80) {
    recommendations.push('Prioritize - client has urgent timeline');
    recommendations.push('Schedule daily check-ins');
  }

  // Communication recommendations
  if (commFactor && commFactor.score < 40) {
    recommendations.push('Send personalized market update');
    recommendations.push('Try alternative contact method (call vs email)');
  }

  // General recommendations
  if (!lead.preferredLocations || lead.preferredLocations.length === 0) {
    recommendations.push('Ask about preferred neighborhoods/areas');
  }

  if (!lead.budgetMin && !lead.budgetMax) {
    recommendations.push('Discuss budget and financing options');
  }

  return recommendations;
}

/**
 * Calculate conversion probability
 */
function calculateConversionProbability(
  factors: Array<{ name: string; score: number; weight: number }>
): number {
  const weightedSum = factors.reduce((sum, f) => sum + f.score * f.weight, 0);
  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
  const averageScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

  // Convert score (0-100) to probability (0-1)
  // Use a curve that requires high scores for high probability
  const probability = Math.pow(averageScore / 100, 1.5);
  
  return Math.round(probability * 100) / 100;
}

/**
 * Estimate potential deal value
 */
function estimateDealValue(lead: Lead): number | undefined {
  if (lead.budgetMax) {
    return lead.budgetMax;
  }
  if (lead.preApprovalAmount) {
    return lead.preApprovalAmount;
  }
  if (lead.budgetMin) {
    return lead.budgetMin * 1.2; // Estimate 20% above minimum
  }
  return undefined;
}

/**
 * Estimate close date based on timeline
 */
function estimateCloseDate(lead: Lead, timelineScore: number): Date | undefined {
  const now = new Date();
  
  if (timelineScore >= 90) {
    // Immediate - within 30 days
    now.setDate(now.getDate() + 30);
    return now;
  } else if (timelineScore >= 75) {
    // 1-2 months
    now.setDate(now.getDate() + 60);
    return now;
  } else if (timelineScore >= 50) {
    // 2-3 months
    now.setDate(now.getDate() + 90);
    return now;
  }
  
  return undefined;
}

/**
 * Determine lead sentiment based on activities and factors
 */
function determineSentiment(
  factors: Array<{ name: string; score: number; weight: number }>,
  activities: LeadActivity[]
): 'positive' | 'neutral' | 'negative' {
  const avgScore = factors.reduce((sum, f) => sum + f.score, 0) / factors.length;
  
  if (avgScore >= 70) return 'positive';
  if (avgScore >= 40) return 'neutral';
  return 'negative';
}

/**
 * Batch analyze multiple leads
 */
export async function batchAnalyzeLeads(
  requests: AIAnalysisRequest[]
): Promise<AIAnalysisResult[]> {
  // In production, this could batch calls to the AI service
  const results: AIAnalysisResult[] = [];
  
  for (const request of requests) {
    const result = await analyzeLeadWithAI(request);
    results.push(result);
  }
  
  return results;
}

/**
 * Get AI model status
 */
export function getAIModelStatus(): {
  available: boolean;
  model: string;
  version: string;
} {
  // In production, this would check the actual AI service status
  return {
    available: true,
    model: 'groq-llama-3.1-70b',
    version: '1.0.0',
  };
}
