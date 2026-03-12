/**
 * Lead Scoring Engine
 * Main engine for calculating lead scores
 */

import type { 
  Lead, 
  LeadScore, 
  LeadActivity, 
  LeadScoringConfig,
  LeadScoringRequest,
  LeadScoringResponse,
  LeadBatchScoreRequest,
  LeadBatchScoreResponse,
} from '../../types';
import { DEFAULT_SCORING_FACTORS, DEFAULT_TEMPERATURE_THRESHOLDS } from '../../types/lead';
import { 
  calculateAllFactors, 
  calculateWeightedScore,
  determineTemperature,
  determinePriority,
  FactorCalculationContext,
} from './factors';
import { analyzeLeadWithAI, AIAnalysisRequest } from './ai-model';

// Cache for lead scores (in production, use Redis)
const scoreCache = new Map<string, { score: LeadScore; expiresAt: Date }>();

/**
 * Calculate lead score
 */
export async function calculateLeadScore(
  lead: Lead,
  activities: LeadActivity[],
  config?: Partial<LeadScoringConfig>,
  includeAiAnalysis: boolean = true
): Promise<LeadScore> {
  const startTime = Date.now();

  // Build factor calculation context
  const context: FactorCalculationContext = {
    lead,
    activities,
  };

  // Calculate all factors
  const factors = calculateAllFactors(context);

  // Calculate weighted overall score
  const overallScore = calculateWeightedScore(factors);

  // Determine temperature and priority
  const temperature = determineTemperature(overallScore);
  const priority = determinePriority(overallScore, temperature);

  // AI Analysis (if enabled)
  let aiInsights: string | undefined;
  let aiRecommendations: string[] | undefined;
  let conversionProbability: number = overallScore / 100;
  let estimatedValue: number | undefined;
  let estimatedCloseDate: Date | undefined;

  if (includeAiAnalysis && config?.aiEnabled !== false) {
    const aiRequest: AIAnalysisRequest = {
      lead,
      activities,
      factors: factors.map(f => ({
        name: f.name,
        score: f.score,
        weight: f.weight,
      })),
    };

    try {
      const aiResult = await analyzeLeadWithAI(aiRequest);
      aiInsights = aiResult.insights;
      aiRecommendations = aiResult.recommendations;
      conversionProbability = aiResult.conversionProbability;
      estimatedValue = aiResult.estimatedValue;
      estimatedCloseDate = aiResult.estimatedCloseDate;
    } catch (error) {
      console.error('AI analysis failed:', error);
      // Continue without AI insights
    }
  }

  const score: LeadScore = {
    id: `score-${lead.id}-${Date.now()}`,
    leadId: lead.id,
    overallScore,
    temperature,
    priority,
    factors,
    conversionProbability,
    estimatedValue,
    estimatedCloseDate,
    aiInsights,
    aiRecommendations,
    calculatedAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  };

  return score;
}

/**
 * Score a single lead (with caching)
 */
export async function scoreLead(
  request: LeadScoringRequest,
  lead: Lead,
  activities: LeadActivity[],
  config?: Partial<LeadScoringConfig>
): Promise<LeadScoringResponse> {
  const startTime = Date.now();

  // Check cache if not forcing recalculation
  if (!request.forceRecalculate) {
    const cached = scoreCache.get(lead.id);
    if (cached && cached.expiresAt > new Date()) {
      return {
        leadId: lead.id,
        score: cached.score,
        processingTime: Date.now() - startTime,
        cached: true,
      };
    }
  }

  // Calculate score
  const score = await calculateLeadScore(
    lead,
    activities,
    config,
    request.includeAiAnalysis
  );

  // Cache the result
  scoreCache.set(lead.id, {
    score,
    expiresAt: score.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  return {
    leadId: lead.id,
    score,
    processingTime: Date.now() - startTime,
    cached: false,
  };
}

/**
 * Score multiple leads in batch
 */
export async function scoreLeadsBatch(
  request: LeadBatchScoreRequest,
  leadsData: Array<{ lead: Lead; activities: LeadActivity[] }>,
  config?: Partial<LeadScoringConfig>
): Promise<LeadBatchScoreResponse> {
  const startTime = Date.now();
  const scores: LeadScore[] = [];
  const failed: string[] = [];

  // Process leads in parallel
  const promises = leadsData.map(async ({ lead, activities }) => {
    try {
      const score = await calculateLeadScore(
        lead,
        activities,
        config,
        request.includeAiAnalysis
      );
      return { success: true, score, leadId: lead.id };
    } catch (error) {
      return { success: false, leadId: lead.id, error };
    }
  });

  const results = await Promise.all(promises);

  for (const result of results) {
    if (result.success) {
      scores.push(result.score!);
    } else {
      failed.push(result.leadId);
    }
  }

  return {
    scores,
    failed,
    processingTime: Date.now() - startTime,
  };
}

/**
 * Get score from cache
 */
export function getCachedScore(leadId: string): LeadScore | undefined {
  const cached = scoreCache.get(leadId);
  if (cached && cached.expiresAt > new Date()) {
    return cached.score;
  }
  return undefined;
}

/**
 * Invalidate cached score
 */
export function invalidateScoreCache(leadId: string): void {
  scoreCache.delete(leadId);
}

/**
 * Clear all cached scores
 */
export function clearScoreCache(): void {
  scoreCache.clear();
}

/**
 * Get leads by temperature
 */
export function getLeadsByTemperature(
  scores: LeadScore[],
  temperature: 'hot' | 'warm' | 'cold' | 'frozen'
): LeadScore[] {
  return scores.filter(s => s.temperature === temperature);
}

/**
 * Get leads by priority
 */
export function getLeadsByPriority(
  scores: LeadScore[],
  priority: 'urgent' | 'high' | 'medium' | 'low'
): LeadScore[] {
  return scores.filter(s => s.priority === priority);
}

/**
 * Get top scoring leads
 */
export function getTopLeads(scores: LeadScore[], count: number = 10): LeadScore[] {
  return [...scores]
    .sort((a, b) => b.overallScore - a.overallScore)
    .slice(0, count);
}

/**
 * Get score distribution
 */
export function getScoreDistribution(scores: LeadScore[]): {
  hot: number;
  warm: number;
  cold: number;
  frozen: number;
} {
  return {
    hot: scores.filter(s => s.temperature === 'hot').length,
    warm: scores.filter(s => s.temperature === 'warm').length,
    cold: scores.filter(s => s.temperature === 'cold').length,
    frozen: scores.filter(s => s.temperature === 'frozen').length,
  };
}

/**
 * Get priority distribution
 */
export function getPriorityDistribution(scores: LeadScore[]): {
  urgent: number;
  high: number;
  medium: number;
  low: number;
} {
  return {
    urgent: scores.filter(s => s.priority === 'urgent').length,
    high: scores.filter(s => s.priority === 'high').length,
    medium: scores.filter(s => s.priority === 'medium').length,
    low: scores.filter(s => s.priority === 'low').length,
  };
}

/**
 * Calculate average score
 */
export function calculateAverageScore(scores: LeadScore[]): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, s) => acc + s.overallScore, 0);
  return Math.round(sum / scores.length);
}

/**
 * Get scoring summary statistics
 */
export function getScoringSummary(scores: LeadScore[]) {
  return {
    total: scores.length,
    averageScore: calculateAverageScore(scores),
    temperatureDistribution: getScoreDistribution(scores),
    priorityDistribution: getPriorityDistribution(scores),
    topLead: scores.length > 0 ? getTopLeads(scores, 1)[0] : undefined,
  };
}

/**
 * Re-score leads when activities change
 */
export async function rescoreOnActivity(
  leadId: string,
  lead: Lead,
  activities: LeadActivity[],
  config?: Partial<LeadScoringConfig>
): Promise<LeadScore> {
  // Invalidate cache
  invalidateScoreCache(leadId);
  
  // Recalculate score
  return calculateLeadScore(lead, activities, config, true);
}

/**
 * Validate scoring configuration
 */
export function validateScoringConfig(
  config: Partial<LeadScoringConfig>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.factors) {
    const totalWeight = config.factors.reduce((sum, f) => sum + f.weight, 0);
    if (Math.abs(totalWeight - 1) > 0.01) {
      errors.push(`Factor weights must sum to 1.0, got ${totalWeight}`);
    }

    for (const factor of config.factors) {
      if (factor.weight < 0 || factor.weight > 1) {
        errors.push(`Factor ${factor.name} weight must be between 0 and 1`);
      }
    }
  }

  if (config.temperatureThresholds) {
    const { hot, warm, cold } = config.temperatureThresholds;
    if (hot <= warm || warm <= cold) {
      errors.push('Temperature thresholds must be in descending order (hot > warm > cold)');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
