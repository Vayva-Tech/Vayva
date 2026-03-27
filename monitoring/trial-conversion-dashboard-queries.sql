-- ============================================
-- TRIAL & CONVERSION ANALYTICS QUERIES
-- ============================================
-- Comprehensive SQL queries for monitoring trial performance,
-- conversion rates, and email campaign effectiveness.
-- ============================================

-- ============================================
-- 1. TRIAL OVERVIEW DASHBOARD
-- ============================================

-- Current Trial Status Summary
SELECT 
  status,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM merchant_ai_subscriptions
WHERE status IN (
  'TRIAL_ACTIVE', 
  'TRIAL_EXPIRED_GRACE', 
  'SUBSCRIPTION_ACTIVE',
  'SOFT_CLOSED'
)
GROUP BY status
ORDER BY count DESC;

-- Trials Expiring Soon (Next 7 Days)
SELECT 
  id,
  store_id,
  trial_expires_at,
  CASE 
    WHEN trial_expires_at <= NOW() + INTERVAL '1 day' THEN 'URGENT (< 24h)'
    WHEN trial_expires_at <= NOW() + INTERVAL '3 days' THEN 'HIGH (1-3 days)'
    ELSE 'MEDIUM (4-7 days)'
  END as urgency,
  EXTRACT(EPOCH FROM (trial_expires_at - NOW())) / 3600 as hours_remaining
FROM merchant_ai_subscriptions
WHERE status = 'TRIAL_ACTIVE'
  AND trial_expires_at BETWEEN NOW() AND NOW() + INTERVAL '7 days'
ORDER BY trial_expires_at ASC;

-- Daily Trial Signup Trend (Last 30 Days)
SELECT 
  DATE(created_at) as signup_date,
  COUNT(*) as trials_started,
  ROUND(AVG(EXTRACT(EPOCH FROM (trial_expires_at - created_at)) / 86400), 1) as avg_trial_duration_days
FROM merchant_ai_subscriptions
WHERE created_at > CURRENT_DATE - INTERVAL '30 days'
GROUP BY 1
ORDER BY 1;

-- ============================================
-- 2. CONVERSION FUNNEL ANALYSIS
-- ============================================

-- Overall Trial to Paid Conversion Rate
WITH trial_cohort AS (
  SELECT 
    COUNT(*) as total_trials,
    SUM(CASE 
      WHEN status IN ('SUBSCRIPTION_ACTIVE', 'SUBSCRIPTION_PAUSED') 
      THEN 1 ELSE 0 
    END) as converted
  FROM merchant_ai_subscriptions
  WHERE trial_start_date IS NOT NULL
    AND created_at > CURRENT_DATE - INTERVAL '90 days'
)
SELECT 
  total_trials,
  converted,
  ROUND(100.0 * converted / NULLIF(total_trials, 0), 2) as conversion_rate_percent
FROM trial_cohort;

-- Conversion Rate by Plan Type
SELECT 
  activated_plan_name,
  COUNT(*) as conversions,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage_of_conversions,
  AVG(EXTRACT(EPOCH FROM (activated_at - trial_start_date)) / 86400) as avg_days_to_convert
FROM merchant_ai_subscriptions
WHERE status = 'SUBSCRIPTION_ACTIVE'
  AND trial_start_date IS NOT NULL
  AND activated_plan_name IS NOT NULL
GROUP BY 1
ORDER BY 2 DESC;

-- Time to Convert Distribution
SELECT 
  CASE 
    WHEN days_to_convert <= 1 THEN 'Same day'
    WHEN days_to_convert <= 3 THEN '1-3 days'
    WHEN days_to_convert <= 5 THEN '4-5 days'
    WHEN days_to_convert <= 7 THEN '6-7 days'
    ELSE '8+ days'
  END as conversion_timeframe,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM (
  SELECT 
    EXTRACT(EPOCH FROM (activated_at - trial_start_date)) / 86400 as days_to_convert
  FROM merchant_ai_subscriptions
  WHERE status = 'SUBSCRIPTION_ACTIVE'
    AND trial_start_date IS NOT NULL
    AND activated_at IS NOT NULL
) subq
GROUP BY 1
ORDER BY 1;

-- ============================================
-- 3. EMAIL CAMPAIGN EFFECTIVENESS
-- ============================================

-- Trial Nurture Email Performance
SELECT 
  headers->>'X-Trial-Days-Remaining' as days_remaining,
  COUNT(*) as sent,
  SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as opens,
  SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) as clicks,
  ROUND(100.0 * SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as open_rate,
  ROUND(100.0 * SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as click_rate,
  SUM(CASE WHEN converted_within_24h THEN 1 ELSE 0 END) as conversions_24h,
  ROUND(100.0 * SUM(CASE WHEN converted_within_24h THEN 1 ELSE 0 END) / COUNT(*), 2) as conversion_rate
FROM email_jobs
WHERE headers->>'X-Email-Type' = 'trial-nurture'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY 1
ORDER BY 1;

-- Win-Back Campaign Recovery Rate
SELECT 
  headers->>'X-Days-Since-Expiry' as days_since_expiry,
  COUNT(*) as sent,
  SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as opens,
  SUM(CASE WHEN reactivated_at IS NOT NULL THEN 1 ELSE 0 END) as reactivations,
  ROUND(100.0 * SUM(CASE WHEN reactivated_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as recovery_rate
FROM email_jobs e
LEFT JOIN LATERAL (
  SELECT 
    updated_at as reactivated_at
  FROM merchant_ai_subscriptions
  WHERE store_id = e.store_id
    AND status = 'SUBSCRIPTION_ACTIVE'
    AND updated_at > e.created_at
  ORDER BY updated_at ASC
  LIMIT 1
) reactivation ON true
WHERE headers->>'X-Email-Type' = 'win-back'
  AND created_at > NOW() - INTERVAL '60 days'
GROUP BY 1
ORDER BY 1;

-- Email Campaign ROI Analysis
SELECT 
  headers->>'X-Email-Type' as campaign_type,
  COUNT(*) as emails_sent,
  SUM(CASE WHEN converted_at IS NOT NULL THEN 1 ELSE 0 END) as conversions,
  ROUND(100.0 * SUM(CASE WHEN converted_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as conversion_rate,
  SUM(revenue_generated) FILTER (WHERE converted_at IS NOT NULL) as total_revenue,
  ROUND(SUM(revenue_generated) FILTER (WHERE converted_at IS NOT NULL) / NULLIF(COUNT(*), 0), 2) as revenue_per_email
FROM email_jobs e
LEFT JOIN LATERAL (
  SELECT 
    updated_at as converted_at,
    monthly_amount as revenue_generated
  FROM merchant_ai_subscriptions
  WHERE store_id = e.store_id
    AND status = 'SUBSCRIPTION_ACTIVE'
    AND updated_at > e.created_at
  ORDER BY updated_at ASC
  LIMIT 1
) conversion ON true
WHERE created_at > NOW() - INTERVAL '90 days'
GROUP BY 1
ORDER BY 4 DESC;

-- ============================================
-- 4. MILESTONE IMPACT ANALYSIS
-- ============================================

-- Milestone Achievement Rate
SELECT 
  milestone_type,
  COUNT(DISTINCT store_id) as stores_achieved,
  MIN(achieved_at) as first_achievement,
  MAX(achieved_at) as last_achievement,
  ROUND(AVG(EXTRACT(EPOCH FROM (achieved_at - store_created_at)) / 86400), 1) as avg_days_to_achieve
FROM milestone_records
WHERE achieved_at > CURRENT_DATE - INTERVAL '90 days'
GROUP BY 1
ORDER BY 2 DESC;

-- Milestone Impact on Retention
SELECT 
  CASE 
    WHEN m.store_id IS NOT NULL THEN 'Achieved Milestone'
    ELSE 'No Milestone'
  END as milestone_status,
  COUNT(*) as total_stores,
  SUM(CASE WHEN s.status = 'SUBSCRIPTION_ACTIVE' THEN 1 ELSE 0 END) as retained,
  ROUND(100.0 * SUM(CASE WHEN s.status = 'SUBSCRIPTION_ACTIVE' THEN 1 ELSE 0 END) / COUNT(*), 2) as retention_rate
FROM merchant_ai_subscriptions s
LEFT JOIN milestone_records m ON s.store_id = m.store_id
WHERE s.created_at > CURRENT_DATE - INTERVAL '90 days'
GROUP BY 1;

-- ============================================
-- 5. CHURN ANALYSIS
-- ============================================

-- Churn Reason Breakdown (for expired trials)
SELECT 
  churn_reason,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM merchant_ai_subscriptions
WHERE status = 'SOFT_CLOSED'
  AND closed_at > CURRENT_DATE - INTERVAL '90 days'
GROUP BY 1
ORDER BY 2 DESC;

-- Time to Churn After Trial Expiry
SELECT 
  CASE 
    WHEN days_to_churn <= 3 THEN 'Churned within 3 days'
    WHEN days_to_churn <= 7 THEN 'Churned within 4-7 days'
    WHEN days_to_churn <= 14 THEN 'Churned within 8-14 days'
    WHEN days_to_churn <= 30 THEN 'Churned within 15-30 days'
    ELSE 'Churned after 30+ days'
  END as churn_timeframe,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM (
  SELECT 
    EXTRACT(EPOCH FROM (closed_at - trial_expires_at)) / 86400 as days_to_churn
  FROM merchant_ai_subscriptions
  WHERE status = 'SOFT_CLOSED'
    AND trial_expires_at IS NOT NULL
    AND closed_at IS NOT NULL
) subq
GROUP BY 1
ORDER BY 1;

-- ============================================
-- 6. REVENUE IMPACT QUERIES
-- ============================================

-- Monthly Recurring Revenue from Trial Conversions
SELECT 
  DATE_TRUNC('month', activated_at) as month,
  COUNT(*) as new_subscriptions,
  SUM(monthly_amount) as new_mrr,
  AVG(monthly_amount) as avg_subscription_value
FROM merchant_ai_subscriptions
WHERE status = 'SUBSCRIPTION_ACTIVE'
  AND trial_start_date IS NOT NULL
  AND activated_at > CURRENT_DATE - INTERVAL '12 months'
GROUP BY 1
ORDER BY 1;

-- Incremental Revenue from Win-Back Campaigns
SELECT 
  DATE_TRUNC('month', reactivated_at) as month,
  COUNT(*) as reactivated_subscriptions,
  SUM(monthly_amount) as recovered_mrr,
  ROUND(100.0 * SUM(monthly_amount) / NULLIF(SUM(SUM(monthly_amount)) OVER (), 0), 2) as pct_of_total_mrr
FROM (
  SELECT DISTINCT ON (store_id)
    s.store_id,
    s.monthly_amount,
    s.updated_at as reactivated_at
  FROM merchant_ai_subscriptions s
  INNER JOIN email_jobs e ON s.store_id = e.store_id
  WHERE e.headers->>'X-Email-Type' = 'win-back'
    AND s.status = 'SUBSCRIPTION_ACTIVE'
    AND s.updated_at > e.created_at
  ORDER BY s.store_id, s.updated_at ASC
) reactivations
WHERE reactivated_at > CURRENT_DATE - INTERVAL '12 months'
GROUP BY 1
ORDER BY 1;

-- ============================================
-- 7. PRODUCT TOUR ENGAGEMENT
-- ============================================

-- Product Tour Completion Impact on Conversion
SELECT 
  CASE 
    WHEN tour_completed THEN 'Completed Tour'
    ELSE 'Did Not Complete'
  END as tour_status,
  COUNT(*) as total_users,
  SUM(CASE WHEN status = 'SUBSCRIPTION_ACTIVE' THEN 1 ELSE 0 END) as converted,
  ROUND(100.0 * SUM(CASE WHEN status = 'SUBSCRIPTION_ACTIVE' THEN 1 ELSE 0 END) / COUNT(*), 2) as conversion_rate
FROM merchant_ai_subscriptions s
LEFT JOIN (
  SELECT 
    store_id,
    BOOL_OR(completed) as tour_completed
  FROM product_tour_progress
  GROUP BY store_id
) tours ON s.store_id = tours.store_id
WHERE s.trial_start_date IS NOT NULL
GROUP BY 1;

-- Most Effective Tour Steps
SELECT 
  step_id,
  COUNT(*) as views,
  SUM(CASE WHEN completed THEN 1 ELSE 0 END) as completions,
  ROUND(100.0 * SUM(CASE WHEN completed THEN 1 ELSE 0 END) / COUNT(*), 2) as completion_rate,
  AVG(time_spent_seconds) as avg_time_spent
FROM product_tour_step_analytics
WHERE created_at > CURRENT_DATE - INTERVAL '90 days'
GROUP BY 1
ORDER BY 3 DESC;

-- ============================================
-- 8. PLAN SELECTION ANALYSIS
-- ============================================

-- Guided Quiz vs Manual Plan Selection
SELECT 
  plan_selection_method,
  selected_plan,
  COUNT(*) as selections,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY plan_selection_method), 2) as pct_of_method,
  SUM(CASE WHEN converted_to_paid THEN 1 ELSE 0 END) as conversions,
  ROUND(100.0 * SUM(CASE WHEN converted_to_paid THEN 1 ELSE 0 END) / COUNT(*), 2) as conversion_rate
FROM (
  SELECT 
    COALESCE(metadata->>'planSelectionMethod', 'manual') as plan_selection_method,
    metadata->>'selectedPlan' as selected_plan,
    status = 'SUBSCRIPTION_ACTIVE' as converted_to_paid
  FROM merchant_ai_subscriptions
  WHERE metadata IS NOT NULL
    AND created_at > CURRENT_DATE - INTERVAL '90 days'
) subq
GROUP BY 1, 2
ORDER BY 1, 4 DESC;

-- Plan Distribution Over Time
SELECT 
  DATE_TRUNC('week', created_at) as week,
  selected_plan,
  COUNT(*) as new_trials,
  SUM(COUNT(*)) OVER (PARTITION BY DATE_TRUNC('week', created_at)) as weekly_total
FROM merchant_ai_subscriptions
WHERE metadata->>'selectedPlan' IS NOT NULL
  AND created_at > CURRENT_DATE - INTERVAL '12 weeks'
GROUP BY 1, 2
ORDER BY 1, 2;

-- ============================================
-- 9. REAL-TIME MONITORING QUERIES
-- ============================================

-- Live Trial Count by Urgency
SELECT 
  CASE 
    WHEN trial_expires_at <= NOW() + INTERVAL '1 day' THEN '🔴 Critical (<24h)'
    WHEN trial_expires_at <= NOW() + INTERVAL '3 days' THEN '🟠 High (1-3 days)'
    WHEN trial_expires_at <= NOW() + INTERVAL '5 days' THEN '🟡 Medium (4-5 days)'
    ELSE '🟢 Low (>5 days)'
  END as urgency_level,
  COUNT(*) as active_trials
FROM merchant_ai_subscriptions
WHERE status = 'TRIAL_ACTIVE'
GROUP BY 1
ORDER BY 1;

-- Email Queue Status (Last Hour)
SELECT 
  status,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (completed_at - created_at))) as avg_processing_time_seconds
FROM email_jobs
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY 1;

-- Worker Execution Health (Last 24 Hours)
SELECT 
  worker_name,
  COUNT(*) as executions,
  SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
  ROUND(100.0 * SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) as p95_duration_ms
FROM worker_executions
WHERE executed_at > NOW() - INTERVAL '24 hours'
GROUP BY 1
ORDER BY 5 ASC;

-- ============================================
-- 10. COHORT ANALYSIS
-- ============================================

-- Trial Cohort Retention by Signup Week
SELECT 
  DATE_TRUNC('week', trial_start_date) as cohort_week,
  COUNT(*) as cohort_size,
  SUM(CASE WHEN status = 'SUBSCRIPTION_ACTIVE' THEN 1 ELSE 0 END) as still_active,
  ROUND(100.0 * SUM(CASE WHEN status = 'SUBSCRIPTION_ACTIVE' THEN 1 ELSE 0 END) / COUNT(*), 2) as active_rate,
  ROUND(100.0 * SUM(CASE WHEN activated_plan_name IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as conversion_rate
FROM merchant_ai_subscriptions
WHERE trial_start_date IS NOT NULL
  AND trial_start_date > CURRENT_DATE - INTERVAL '12 weeks'
GROUP BY 1
ORDER BY 1;

-- Feature Usage Impact on Conversion
SELECT 
  feature_used,
  COUNT(DISTINCT store_id) as stores_using_feature,
  SUM(CASE WHEN converted THEN 1 ELSE 0 END) as converted,
  ROUND(100.0 * SUM(CASE WHEN converted THEN 1 ELSE 0 END) / COUNT(DISTINCT store_id), 2) as conversion_rate
FROM (
  SELECT 
    s.store_id,
    'Product Tour' as feature_used,
    s.status = 'SUBSCRIPTION_ACTIVE' as converted
  FROM merchant_ai_subscriptions s
  INNER JOIN product_tour_progress p ON s.store_id = p.store_id
  WHERE p.completed = true
  
  UNION ALL
  
  SELECT 
    s.store_id,
    'Milestone Achieved' as feature_used,
    s.status = 'SUBSCRIPTION_ACTIVE' as converted
  FROM merchant_ai_subscriptions s
  INNER JOIN milestone_records m ON s.store_id = m.store_id
  
  UNION ALL
  
  SELECT 
    s.store_id,
    'No Key Feature' as feature_used,
    s.status = 'SUBSCRIPTION_ACTIVE' as converted
  FROM merchant_ai_subscriptions s
  WHERE s.store_id NOT IN (
    SELECT store_id FROM product_tour_progress WHERE completed = true
    UNION
    SELECT store_id FROM milestone_records
  )
) feature_usage
GROUP BY 1
ORDER BY 3 DESC;
