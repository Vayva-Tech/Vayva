/**
 * Customer Success Platform Constants
 */

// Health Score Weights (must sum to 100)
export const HEALTH_SCORE_WEIGHTS = {
  ENGAGEMENT: 25,      // 25% - Login frequency, session activity
  PRODUCT_USAGE: 35,   // 35% - Feature adoption, AI usage
  BUSINESS_HEALTH: 25, // 25% - Order growth, revenue trends
  SUPPORT: 10,         // 10% - Ticket volume, resolution time
  BILLING: 5,          // 5%  - Payment status, subscription health
} as const;

// Health Score Thresholds
export const HEALTH_THRESHOLDS = {
  EXCELLENT: 80,
  GOOD: 70,
  FAIR: 40,
  POOR: 20,
} as const;

// Engagement Thresholds
export const ENGAGEMENT_THRESHOLDS = {
  DAYS_SINCE_LOGIN_WARNING: 7,
  DAYS_SINCE_LOGIN_CRITICAL: 14,
  MIN_SESSIONS_30D: 5,
  MIN_LOGIN_FREQUENCY_7D: 2,
} as const;

// Product Usage Thresholds
export const PRODUCT_USAGE_THRESHOLDS = {
  MIN_FEATURE_ADOPTION: 0.3, // 30%
  MIN_AI_CONVERSATIONS_30D: 10,
  MIN_ORDERS_CREATED_30D: 5,
} as const;

// Business Health Thresholds
export const BUSINESS_THRESHOLDS = {
  ORDER_GROWTH_WARNING: -0.2, // -20%
  ORDER_GROWTH_CRITICAL: -0.5, // -50%
} as const;

// Support Thresholds
export const SUPPORT_THRESHOLDS = {
  MAX_TICKETS_30D: 5,
  MAX_OPEN_TICKETS: 2,
  MAX_RESOLUTION_HOURS: 48,
} as const;

// NPS Configuration
export const NPS_CONFIG = {
  MIN_DAYS_BETWEEN_SURVEYS: 90,
  SURVEY_EXPIRY_DAYS: 14,
  FOLLOW_UP_DELAY_HOURS: 24,
} as const;

// Playbook Configuration
export const PLAYBOOK_CONFIG = {
  MAX_EXECUTIONS_PER_PLAYBOOK_PER_DAY: 3,
  ACTION_TIMEOUT_MS: 30000,
  MAX_RETRY_ATTEMPTS: 3,
} as const;

// Queue Names
export const CS_QUEUES = {
  HEALTH_SCORE_CALCULATION: 'cs.health-score.calculation',
  PLAYBOOK_EXECUTION: 'cs.playbook.execution',
  NPS_SURVEY: 'cs.nps.survey',
  NPS_RESPONSE_PROCESSOR: 'cs.nps.response',
} as const;

// Feature flags for tracking adoption
export const TRACKED_FEATURES = [
  'ai_agent',
  'whatsapp_integration',
  'product_catalog',
  'order_management',
  'payment_processing',
  'delivery_integration',
  'analytics_dashboard',
  'autopilot_rules',
  'customer_segmentation',
  'inventory_management',
  'subscription_billing',
  'webhook_integration',
] as const;

// Health Score Calculation Schedule
export const HEALTH_SCORE_SCHEDULE = {
  DAILY_CALCULATION_HOUR: 2, // 2 AM
  WEEKLY_REPORT_DAY: 1, // Monday
  MONTHLY_REPORT_DAY: 1, // 1st of month
} as const;
