/**
 * Showing Feedback Management
 * Handles feedback collection and analysis
 */

import type { 
  Showing, 
  ShowingFeedback, 
  FeedbackSentiment, 
  InterestLevel,
  Lead,
} from '../../types';

export interface FeedbackSummary {
  totalFeedback: number;
  avgRating: number;
  sentimentBreakdown: Record<FeedbackSentiment, number>;
  interestLevelBreakdown: Record<InterestLevel, number>;
  priceOpinionBreakdown: Record<string, number>;
  topLikedFeatures: string[];
  topConcerns: string[];
  followUpRequested: number;
}

export interface FeedbackAnalysis {
  overallSentiment: FeedbackSentiment;
  buyerInterest: InterestLevel;
  likelyToMakeOffer: boolean;
  estimatedOfferRange?: { low: number; high: number };
  recommendedActions: string[];
}

/**
 * Create feedback for a showing
 */
export function createFeedback(
  showingId: string,
  data: Omit<ShowingFeedback, 'id' | 'showingId' | 'submittedAt'>
): ShowingFeedback {
  return {
    id: `feedback-${showingId}-${Date.now()}`,
    showingId,
    submittedAt: new Date(),
    ...data,
  };
}

/**
 * Validate feedback data
 */
export function validateFeedback(
  data: Partial<ShowingFeedback>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.sentiment) {
    errors.push('Sentiment is required');
  }

  if (!data.interestLevel) {
    errors.push('Interest level is required');
  }

  if (data.rating === undefined || data.rating < 1 || data.rating > 5) {
    errors.push('Rating must be between 1 and 5');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Analyze feedback to determine buyer intent
 */
export function analyzeFeedback(feedback: ShowingFeedback): FeedbackAnalysis {
  const analysis: FeedbackAnalysis = {
    overallSentiment: feedback.sentiment,
    buyerInterest: feedback.interestLevel,
    likelyToMakeOffer: false,
    recommendedActions: [],
  };

  // Determine if likely to make offer
  if (feedback.interestLevel === 'high' && 
      (feedback.sentiment === 'very_interested' || feedback.sentiment === 'interested')) {
    analysis.likelyToMakeOffer = true;
  }

  if (feedback.estimatedOfferPrice) {
    analysis.estimatedOfferRange = {
      low: feedback.estimatedOfferPrice * 0.95,
      high: feedback.estimatedOfferPrice * 1.05,
    };
  }

  // Generate recommendations
  if (feedback.followUpRequested) {
    analysis.recommendedActions.push('Schedule follow-up call within 24 hours');
  }

  if (feedback.interestLevel === 'high') {
    analysis.recommendedActions.push('Send comparable sales to support pricing');
    analysis.recommendedActions.push('Prepare offer paperwork in advance');
  } else if (feedback.interestLevel === 'medium') {
    analysis.recommendedActions.push('Address concerns raised during showing');
    analysis.recommendedActions.push('Suggest second showing or virtual tour');
  } else if (feedback.interestLevel === 'low') {
    analysis.recommendedActions.push('Send alternative listings that may better match criteria');
  }

  if (feedback.priceOpinion === 'too_high') {
    analysis.recommendedActions.push('Provide CMA showing market value');
    analysis.recommendedActions.push('Discuss seller flexibility on price');
  }

  if (feedback.concerns && feedback.concerns.length > 0) {
    analysis.recommendedActions.push(`Address specific concerns: ${feedback.concerns.join(', ')}`);
  }

  return analysis;
}

/**
 * Summarize feedback for multiple showings
 */
export function summarizeFeedback(feedbackList: ShowingFeedback[]): FeedbackSummary {
  const summary: FeedbackSummary = {
    totalFeedback: feedbackList.length,
    avgRating: 0,
    sentimentBreakdown: {
      very_interested: 0,
      interested: 0,
      neutral: 0,
      not_interested: 0,
      negative: 0,
    },
    interestLevelBreakdown: {
      high: 0,
      medium: 0,
      low: 0,
      none: 0,
    },
    priceOpinionBreakdown: {
      too_high: 0,
      fair: 0,
      too_low: 0,
    },
    topLikedFeatures: [],
    topConcerns: [],
    followUpRequested: 0,
  };

  if (feedbackList.length === 0) {
    return summary;
  }

  // Calculate averages and breakdowns
  const featureCounts = new Map<string, number>();
  const concernCounts = new Map<string, number>();
  let totalRating = 0;

  for (const feedback of feedbackList) {
    // Rating
    totalRating += feedback.rating;

    // Sentiment
    summary.sentimentBreakdown[feedback.sentiment]++;

    // Interest level
    summary.interestLevelBreakdown[feedback.interestLevel]++;

    // Price opinion
    if (feedback.priceOpinion) {
      summary.priceOpinionBreakdown[feedback.priceOpinion]++;
    }

    // Liked features
    if (feedback.likedFeatures) {
      for (const feature of feedback.likedFeatures) {
        featureCounts.set(feature, (featureCounts.get(feature) || 0) + 1);
      }
    }

    // Concerns
    if (feedback.concerns) {
      for (const concern of feedback.concerns) {
        concernCounts.set(concern, (concernCounts.get(concern) || 0) + 1);
      }
    }

    // Follow up
    if (feedback.followUpRequested) {
      summary.followUpRequested++;
    }
  }

  summary.avgRating = Math.round((totalRating / feedbackList.length) * 10) / 10;

  // Get top features and concerns
  summary.topLikedFeatures = Array.from(featureCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([feature]) => feature);

  summary.topConcerns = Array.from(concernCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([concern]) => concern);

  return summary;
}

/**
 * Get feedback trends over time
 */
export function getFeedbackTrends(
  feedbackList: ShowingFeedback[],
  period: 'day' | 'week' | 'month' = 'week'
): Array<{
  period: string;
  avgRating: number;
  count: number;
  topSentiment: FeedbackSentiment;
}> {
  const grouped = new Map<string, ShowingFeedback[]>();

  for (const feedback of feedbackList) {
    const date = new Date(feedback.submittedAt);
    let key: string;

    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
    }

    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(feedback);
  }

  return Array.from(grouped.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, feedbacks]) => {
      const summary = summarizeFeedback(feedbacks);
      
      // Find top sentiment
      const topSentiment = Object.entries(summary.sentimentBreakdown)
        .sort((a, b) => b[1] - a[1])[0][0] as FeedbackSentiment;

      return {
        period: key,
        avgRating: summary.avgRating,
        count: feedbacks.length,
        topSentiment,
      };
    });
}

/**
 * Compare feedback between properties
 */
export function comparePropertyFeedback(
  propertyFeedback: Map<string, ShowingFeedback[]>
): Array<{
  propertyId: string;
  avgRating: number;
  totalShowings: number;
  interestScore: number;
  topConcerns: string[];
}> {
  return Array.from(propertyFeedback.entries()).map(([propertyId, feedbacks]) => {
    const summary = summarizeFeedback(feedbacks);
    
    // Calculate interest score (0-100)
    const interestScore = 
      (summary.interestLevelBreakdown.high * 100 +
       summary.interestLevelBreakdown.medium * 50 +
       summary.interestLevelBreakdown.low * 25) / 
      Math.max(1, summary.totalFeedback);

    return {
      propertyId,
      avgRating: summary.avgRating,
      totalShowings: summary.totalFeedback,
      interestScore: Math.round(interestScore),
      topConcerns: summary.topConcerns,
    };
  });
}

/**
 * Generate follow-up tasks from feedback
 */
export function generateFollowUpTasks(
  feedback: ShowingFeedback,
  showing: Showing
): Array<{
  task: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: Date;
}> {
  const tasks: Array<{ task: string; priority: 'high' | 'medium' | 'low'; dueDate: Date }> = [];
  const now = new Date();

  if (feedback.followUpRequested) {
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 1);
    tasks.push({
      task: `Follow up with ${showing.clients.map(c => c.name).join(', ')}`,
      priority: 'high',
      dueDate,
    });
  }

  if (feedback.interestLevel === 'high') {
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 2);
    tasks.push({
      task: 'Send comparable sales and market analysis',
      priority: 'high',
      dueDate,
    });
  }

  if (feedback.priceOpinion === 'too_high') {
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 1);
    tasks.push({
      task: 'Prepare CMA to justify pricing',
      priority: 'medium',
      dueDate,
    });
  }

  if (feedback.concerns && feedback.concerns.length > 0) {
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 3);
    tasks.push({
      task: `Address concerns: ${feedback.concerns.join(', ')}`,
      priority: 'medium',
      dueDate,
    });
  }

  return tasks;
}

/**
 * Export feedback to lead notes
 */
export function exportToLeadNotes(
  feedback: ShowingFeedback,
  showing: Showing
): string {
  const lines: string[] = [];
  
  lines.push(`Showing Feedback - ${new Date(showing.scheduledAt).toLocaleDateString()}`);
  lines.push(`Rating: ${feedback.rating}/5`);
  lines.push(`Sentiment: ${feedback.sentiment}`);
  lines.push(`Interest Level: ${feedback.interestLevel}`);
  
  if (feedback.priceOpinion) {
    lines.push(`Price Opinion: ${feedback.priceOpinion}`);
  }
  
  if (feedback.likedFeatures && feedback.likedFeatures.length > 0) {
    lines.push(`Liked: ${feedback.likedFeatures.join(', ')}`);
  }
  
  if (feedback.concerns && feedback.concerns.length > 0) {
    lines.push(`Concerns: ${feedback.concerns.join(', ')}`);
  }
  
  if (feedback.additionalComments) {
    lines.push(`Comments: ${feedback.additionalComments}`);
  }
  
  if (feedback.estimatedOfferPrice) {
    lines.push(`Estimated Offer: $${feedback.estimatedOfferPrice.toLocaleString()}`);
  }

  return lines.join('\n');
}
