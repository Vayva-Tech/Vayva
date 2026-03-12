/**
 * Customer Success Platform Types
 * Phase 3 Implementation
 */

// ============================================================================
// Health Score Types
// ============================================================================

export interface HealthFactor {
  type: 'positive' | 'negative' | 'neutral';
  category: 'engagement' | 'product_usage' | 'business_health' | 'support' | 'billing';
  description: string;
  recommendation?: string;
  impact: number; // Score impact (-25 to +10)
}

export interface HealthScoreResult {
  storeId: string;
  score: number; // 0-100
  factors: HealthFactor[];
  calculatedAt: Date;
  previousScore?: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface HealthMetrics {
  // Engagement (25%)
  daysSinceLogin: number;
  loginFrequency7d: number;
  sessionCount30d: number;

  // Product Usage (35%)
  featureAdoption: number; // 0-1 percentage
  featuresUsed: string[];
  aiConversations30d: number;
  ordersCreated30d: number;

  // Business Health (25%)
  orderGrowth: number; // -1 to 1
  revenueGrowth: number;
  customerCount: number;
  avgOrderValue: number;

  // Support (10%)
  supportTickets30d: number;
  avgResolutionTime: number; // hours
  openTickets: number;

  // Billing (5%)
  subscriptionStatus: 'active' | 'trial' | 'past_due' | 'canceled';
  daysToRenewal: number;
  paymentFailures30d: number;
}

export interface HealthSegment {
  name: 'healthy' | 'at_risk' | 'critical';
  minScore: number;
  maxScore: number;
  color: string;
  description: string;
}

export const HEALTH_SEGMENTS: HealthSegment[] = [
  { name: 'healthy', minScore: 70, maxScore: 100, color: '#22c55e', description: 'Active and engaged merchants' },
  { name: 'at_risk', minScore: 40, maxScore: 69, color: '#f59e0b', description: 'Merchants showing warning signs' },
  { name: 'critical', minScore: 0, maxScore: 39, color: '#ef4444', description: 'High churn risk - immediate attention needed' },
];

// ============================================================================
// Playbook Types
// ============================================================================

export type PlaybookTriggerType = 'time' | 'health_score' | 'metric' | 'event';

export interface PlaybookTrigger {
  type: PlaybookTriggerType;
  condition: string;
  duration?: string; // e.g., '7_days', '3_days'
}

export type PlaybookActionType = 'email' | 'whatsapp' | 'slack' | 'task' | 'in_app' | 'webhook';

export interface PlaybookAction {
  type: PlaybookActionType;
  template?: string;
  message?: string;
  channel?: string;
  assignee?: string;
  title?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  delay?: number; // milliseconds
  url?: string;
}

export interface Playbook {
  id: string;
  name: string;
  description: string;
  trigger: PlaybookTrigger;
  actions: PlaybookAction[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlaybookExecution {
  id: string;
  playbookId: string;
  storeId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  actionsExecuted: PlaybookActionExecution[];
  error?: string;
}

export interface PlaybookActionExecution {
  actionIndex: number;
  actionType: PlaybookActionType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  executedAt?: Date;
  result?: unknown;
  error?: string;
}

// ============================================================================
// NPS Types
// ============================================================================

export interface NpsSurvey {
  id: string;
  storeId: string;
  status: 'sent' | 'responded' | 'expired';
  sentAt: Date;
  respondedAt?: Date;
  score?: number; // 0-10
  feedback?: string;
  followUpAction?: string;
}

export interface NpsMetrics {
  totalSent: number;
  totalResponded: number;
  responseRate: number;
  averageScore: number;
  npsScore: number; // -100 to 100
  promoters: number; // 9-10
  passives: number; // 7-8
  detractors: number; // 0-6
}

export type NpsCategory = 'promoter' | 'passive' | 'detractor';

export function categorizeNps(score: number): NpsCategory {
  if (score >= 9) return 'promoter';
  if (score >= 7) return 'passive';
  return 'detractor';
}

// ============================================================================
// Queue Job Types
// ============================================================================

export interface HealthScoreJobData {
  storeId: string;
  forceRecalculate?: boolean;
}

export interface PlaybookJobData {
  playbookId: string;
  storeId: string;
  triggerData?: Record<string, unknown>;
}

export interface NpsSurveyJobData {
  storeId: string;
  surveyType: 'scheduled' | 'triggered';
}

export interface NpsResponseJobData {
  storeId: string;
  phone: string;
  message: string;
  receivedAt: Date;
}
