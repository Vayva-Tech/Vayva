/**
 * Conversion Metrics Dashboard Queries
 * 
 * SQL queries and Prisma queries for tracking trial conversion,
 * win-back recovery, milestone engagement, and overall campaign performance.
 */

import { prisma } from '@vayva/db';

// ============================================
// TRIAL CONVERSION METRICS
// ============================================

/**
 * Get trial conversion rate for a date range
 */
export async function getTrialConversionRate(startDate: Date, endDate: Date) {
  const query = `
    WITH trials AS (
      SELECT 
        COUNT(*) as total_trials,
        COUNT(CASE WHEN status IN ('ACTIVE', 'PAID') THEN 1 END) as converted
      FROM "MerchantAiSubscription"
      WHERE 
        "createdAt" >= $1 
        AND "createdAt" <= $2
        AND status IN ('TRIAL_ACTIVE', 'TRIAL_EXPIRED_GRACE', 'ACTIVE', 'PAID')
    )
    SELECT 
      total_trials,
      converted,
      ROUND((converted::DECIMAL / NULLIF(total_trials, 0)::DECIMAL) * 100, 2) as conversion_rate
    FROM trials;
  `;

  return await prisma.$queryRawUnsafe(query, startDate, endDate);
}

/**
 * Get trial conversion by plan type
 */
export async function getTrialConversionByPlan(startDate: Date, endDate: Date) {
  const query = `
    SELECT 
      plan,
      COUNT(*) as trial_count,
      COUNT(CASE WHEN status IN ('ACTIVE', 'PAID') THEN 1 END) as converted,
      ROUND((COUNT(CASE WHEN status IN ('ACTIVE', 'PAID') THEN 1 END)::DECIMAL / 
            NULLIF(COUNT(*), 0)::DECIMAL) * 100, 2) as conversion_rate
    FROM "MerchantAiSubscription"
    WHERE 
      "createdAt" >= $1 
      AND "createdAt" <= $2
      AND status IN ('TRIAL_ACTIVE', 'TRIAL_EXPIRED_GRACE', 'ACTIVE', 'PAID')
    GROUP BY plan
    ORDER BY conversion_rate DESC;
  `;

  return await prisma.$queryRawUnsafe(query, startDate, endDate);
}

/**
 * Get trial lifecycle funnel
 */
export async function getTrialLifecycleFunnel(startDate: Date, endDate: Date) {
  const query = `
    SELECT 
      status,
      COUNT(*) as count
    FROM "MerchantAiSubscription"
    WHERE 
      "createdAt" >= $1 
      AND "createdAt" <= $2
    GROUP BY status
    ORDER BY count DESC;
  `;

  return await prisma.$queryRawUnsafe(query, startDate, endDate);
}

/**
 * Get average days to convert
 */
export async function getAverageDaysToConvert(startDate: Date, endDate: Date) {
  const query = `
    SELECT 
      ROUND(AVG(EXTRACT(EPOCH FROM ("upgradedAt" - "createdAt")) / 86400), 1) as avg_days_to_convert
    FROM "MerchantAiSubscription"
    WHERE 
      "createdAt" >= $1 
      AND "createdAt" <= $2
      AND status IN ('ACTIVE', 'PAID')
      AND "upgradedAt" IS NOT NULL;
  `;

  return await prisma.$queryRawUnsafe(query, startDate, endDate);
}

// ============================================
// WIN-BACK CAMPAIGN METRICS
// ============================================

/**
 * Get win-back recovery rate
 */
export async function getWinBackRecoveryRate(startDate: Date, endDate: Date) {
  const query = `
    WITH winback_stats AS (
      SELECT 
        COUNT(DISTINCT s.id) as total_expired,
        COUNT(DISTINCT CASE WHEN s.status IN ('ACTIVE', 'PAID') 
                            AND s."upgradedAt" >= $1 
                            AND s."upgradedAt" <= $2 
                       THEN s.id END) as recovered
      FROM "MerchantAiSubscription" s
      WHERE 
        s."trialExpiresAt" < $1
        AND s.status IN ('TRIAL_EXPIRED_GRACE', 'SOFT_CLOSED')
    )
    SELECT 
      total_expired,
      recovered,
      ROUND((recovered::DECIMAL / NULLIF(total_expired, 0)::DECIMAL) * 100, 2) as recovery_rate
    FROM winback_stats;
  `;

  return await prisma.$queryRawUnsafe(query, startDate, endDate);
}

/**
 * Get win-back email performance by template
 */
export async function getWinBackEmailPerformance() {
  // This would require an EmailCampaign table to track sends/opens/clicks
  // For now, we'll use a placeholder that assumes such tracking exists
  const query = `
    SELECT 
      template_name,
      sent_count,
      open_count,
      click_count,
      ROUND((open_count::DECIMAL / NULLIF(sent_count, 0)::DECIMAL) * 100, 2) as open_rate,
      ROUND((click_count::DECIMAL / NULLIF(sent_count, 0)::DECIMAL) * 100, 2) as click_rate,
      conversions,
      ROUND((conversions::DECIMAL / NULLIF(sent_count, 0)::DECIMAL) * 100, 2) as conversion_rate
    FROM email_campaign_performance
    WHERE campaign_type = 'winback'
    ORDER BY conversion_rate DESC;
  `;

  return await prisma.$queryRawUnsafe(query);
}

/**
 * Get win-back revenue impact
 */
export async function getWinBackRevenueImpact(startDate: Date, endDate: Date) {
  const query = `
    SELECT 
      COUNT(DISTINCT s."merchantId") as recovered_merchants,
      SUM(CASE WHEN p.amount IS NOT NULL THEN p.amount ELSE 0 END) as total_revenue,
      AVG(p.amount) as avg_revenue_per_merchant
    FROM "MerchantAiSubscription" s
    LEFT JOIN "Payment" p ON s.id = p."subscriptionId"
    WHERE 
      s.status IN ('ACTIVE', 'PAID')
      AND s."upgradedAt" >= $1 
      AND s."upgradedAt" <= $2
      AND s.status IN ('TRIAL_EXPIRED_GRACE', 'SOFT_CLOSED')
      BEFORE s."upgradedAt";
  `;

  return await prisma.$queryRawUnsafe(query, startDate, endDate);
}

// ============================================
// MILESTONE ENGAGEMENT METRICS
// ============================================

/**
 * Get milestone achievement distribution
 */
export async function getMilestoneDistribution(startDate: Date, endDate: Date) {
  const query = `
    SELECT 
      milestone_type,
      COUNT(*) as achievement_count,
      COUNT(DISTINCT "merchantId") as unique_merchants,
      ROUND(AVG(value_achieved), 2) as avg_value
    FROM "MilestoneRecord"
    WHERE 
      "achievedAt" >= $1 
      AND "achievedAt" <= $2
    GROUP BY milestone_type
    ORDER BY achievement_count DESC;
  `;

  return await prisma.$queryRawUnsafe(query, startDate, endDate);
}

/**
 * Get time to first milestone
 */
export async function getTimeToFirstMilestone(startDate: Date, endDate: Date) {
  const query = `
    WITH first_milestones AS (
      SELECT 
        m."merchantId",
        MIN(m."achievedAt") as first_milestone_at,
        s."createdAt" as subscription_start
      FROM "MilestoneRecord" m
      JOIN "MerchantAiSubscription" s ON m."merchantId" = s.id
      WHERE m."achievedAt" >= $1 AND m."achievedAt" <= $2
      GROUP BY m."merchantId", s."createdAt"
    )
    SELECT 
      ROUND(AVG(EXTRACT(EPOCH FROM (first_milestone_at - subscription_start)) / 3600), 1) as avg_hours_to_first_milestone
    FROM first_milestones;
  `;

  return await prisma.$queryRawUnsafe(query, startDate, endDate);
}

/**
 * Get milestone celebration email engagement
 */
export async function getMilestoneEmailEngagement() {
  const query = `
    SELECT 
      milestone_type,
      COUNT(*) as emails_sent,
      SUM(CASE WHEN opened THEN 1 ELSE 0 END) as opens,
      SUM(CASE WHEN clicked THEN 1 ELSE 0 END) as clicks,
      ROUND((SUM(CASE WHEN opened THEN 1 ELSE 0 END)::DECIMAL / COUNT(*)) * 100, 2) as open_rate,
      ROUND((SUM(CASE WHEN clicked THEN 1 ELSE 0 END)::DECIMAL / COUNT(*)) * 100, 2) as click_rate
    FROM milestone_email_events
    WHERE email_type = 'milestone_celebration'
    GROUP BY milestone_type
    ORDER BY emails_sent DESC;
  `;

  return await prisma.$queryRawUnsafe(query);
}

// ============================================
// PRODUCT TOUR METRICS
// ============================================

/**
 * Get product tour completion rates
 */
export async function getProductTourCompletion() {
  const query = `
    SELECT 
      tour_id,
      COUNT(*) as started,
      COUNT(CASE WHEN completed THEN 1 END) as completed,
      ROUND((COUNT(CASE WHEN completed THEN 1 END)::DECIMAL / NULLIF(COUNT(*), 0)::DECIMAL) * 100, 2) as completion_rate,
      ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - started_at))), 0) as avg_duration_seconds
    FROM product_tour_sessions
    GROUP BY tour_id
    ORDER BY completion_rate DESC;
  `;

  return await prisma.$queryRawUnsafe(query);
}

/**
 * Get feature activation after tour completion
 */
export async function getFeatureActivationAfterTour(tourId: string) {
  const query = `
    WITH toured_merchants AS (
      SELECT DISTINCT "merchantId"
      FROM product_tour_sessions
      WHERE tour_id = $1
      AND completed = true
    ),
    activations AS (
      SELECT 
        f.feature_name,
        COUNT(DISTINCT fa."merchantId") as activated_count,
        COUNT(DISTINCT tm."merchantId") as total_toured,
        ROUND((COUNT(DISTINCT fa."merchantId")::DECIMAL / NULLIF(COUNT(DISTINCT tm."merchantId"), 0)::DECIMAL) * 100, 2) as activation_rate
      FROM toured_merchants tm
      LEFT JOIN feature_activations fa ON tm."merchantId" = fa."merchantId"
      CROSS JOIN (SELECT DISTINCT feature_name FROM feature_activations) f
      GROUP BY f.feature_name
    )
    SELECT * FROM activations
    ORDER BY activation_rate DESC;
  `;

  return await prisma.$queryRawUnsafe(query, tourId);
}

// ============================================
// PLAN SELECTION METRICS
// ============================================

/**
 * Get plan selection distribution
 */
export async function getPlanSelectionDistribution(startDate: Date, endDate: Date) {
  const query = `
    SELECT 
      COALESCE(metadata->>'selectedPlan', plan) as selected_plan,
      metadata->>'planSelectionMethod' as selection_method,
      COUNT(*) as count,
      ROUND((COUNT(*)::DECIMAL / SUM(COUNT(*)) OVER()) * 100, 2) as percentage
    FROM "MerchantAiSubscription"
    WHERE 
      "createdAt" >= $1 
      AND "createdAt" <= $2
    GROUP BY 
      COALESCE(metadata->>'selectedPlan', plan),
      metadata->>'planSelectionMethod'
    ORDER BY count DESC;
  `;

  return await prisma.$queryRawUnsafe(query, startDate, endDate);
}

/**
 * Get plan recommendation accuracy
 */
export async function getPlanRecommendationAccuracy() {
  const query = `
    SELECT 
      recommended_plan,
      actual_plan,
      COUNT(*) as count,
      CASE 
        WHEN recommended_plan = actual_plan THEN 'Match'
        ELSE 'Mismatch'
      END as match_status
    FROM (
      SELECT 
        metadata->>'selectedPlan' as recommended_plan,
        plan as actual_plan
      FROM "MerchantAiSubscription"
      WHERE metadata IS NOT NULL
      AND metadata->>'planSelectionMethod' = 'guided_quiz'
    ) subq
    GROUP BY recommended_plan, actual_plan
    ORDER BY recommended_plan, match_status DESC;
  `;

  return await prisma.$queryRawUnsafe(query);
}

// ============================================
// REVENUE IMPACT METRICS
// ============================================

/**
 * Get total revenue influenced by email campaigns
 */
export async function getEmailCampaignRevenueImpact(startDate: Date, endDate: Date) {
  const query = `
    WITH campaign_influenced AS (
      SELECT 
        s."merchantId",
        s.plan,
        p.amount,
        p."createdAt" as payment_date,
        e.email_type
      FROM "MerchantAiSubscription" s
      JOIN "Payment" p ON s.id = p."subscriptionId"
      LEFT JOIN email_events e ON s."merchantId" = e."merchantId"
        AND e.sent_at BETWEEN (p."createdAt" - INTERVAL '30 days') AND p."createdAt"
      WHERE 
        p."createdAt" >= $1 
        AND p."createdAt" <= $2
        AND s.status IN ('ACTIVE', 'PAID')
    )
    SELECT 
      email_type,
      COUNT(DISTINCT "merchantId") as converted_merchants,
      SUM(amount) as total_revenue,
      AVG(amount) as avg_revenue,
      ROUND((SUM(amount) / NULLIF(SUM(SUM(amount)) OVER(), 0)) * 100, 2) as revenue_percentage
    FROM campaign_influenced
    GROUP BY email_type
    ORDER BY total_revenue DESC;
  `;

  return await prisma.$queryRawUnsafe(query, startDate, endDate);
}

/**
 * Get LTV comparison: engaged vs non-engaged users
 */
export async function getLTVByEngagement() {
  const query = `
    WITH merchant_engagement AS (
      SELECT 
        s.id as subscription_id,
        s."merchantId",
        s.plan,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM email_events e 
            WHERE e."merchantId" = s."merchantId" 
            AND e.email_type IN ('trial-nurture', 'win-back', 'milestone_celebration')
          ) THEN 'engaged'
          ELSE 'non-engaged'
        END as engagement_status,
        p.amount as revenue
      FROM "MerchantAiSubscription" s
      LEFT JOIN "Payment" p ON s.id = p."subscriptionId"
    )
    SELECT 
      engagement_status,
      plan,
      COUNT(*) as merchant_count,
      SUM(revenue) as total_revenue,
      AVG(revenue) as avg_ltv,
      ROUND(AVG(revenue)::DECIMAL, 2) as rounded_avg_ltv
    FROM merchant_engagement
    GROUP BY engagement_status, plan
    ORDER BY engagement_status, rounded_avg_ltv DESC;
  `;

  return await prisma.$queryRawUnsafe(query);
}

// ============================================
// USAGE ANALYTICS
// ============================================

/**
 * Get most common milestone paths
 */
export async function getCommonMilestonePaths(limit: number = 10) {
  const query = `
    WITH merchant_paths AS (
      SELECT 
        "merchantId",
        ARRAY_AGG(milestone_type ORDER BY "achievedAt" ASC) as milestone_path,
        COUNT(*) as milestone_count
      FROM "MilestoneRecord"
      GROUP BY "merchantId"
      HAVING COUNT(*) >= 2
    )
    SELECT 
      milestone_path,
      COUNT(*) as frequency,
      AVG(milestone_count) as avg_milestones
    FROM merchant_paths
    GROUP BY milestone_path
    ORDER BY frequency DESC
    LIMIT $1;
  `;

  return await prisma.$queryRawUnsafe(query, limit);
}

/**
 * Export comprehensive conversion report
 */
export async function exportConversionReport(startDate: Date, endDate: Date) {
  return {
    dateRange: { start: startDate, end: endDate },
    trialMetrics: await getTrialConversionRate(startDate, endDate),
    planBreakdown: await getTrialConversionByPlan(startDate, endDate),
    funnel: await getTrialLifecycleFunnel(startDate, endDate),
    timeToConvert: await getAverageDaysToConvert(startDate, endDate),
    winBackMetrics: await getWinBackRecoveryRate(startDate, endDate),
    milestoneMetrics: await getMilestoneDistribution(startDate, endDate),
    tourMetrics: await getProductTourCompletion(),
    planSelectionMetrics: await getPlanSelectionDistribution(startDate, endDate),
    revenueImpact: await getEmailCampaignRevenueImpact(startDate, endDate),
  };
}
