/**
 * Playbook Definitions
 * Pre-configured automated playbooks for customer success
 */

import { Playbook } from '../lib/types';

/**
 * Built-in playbooks for common customer success scenarios
 */
export const BUILT_IN_PLAYBOOKS: Record<string, Playbook> = {
  // ============================================================================
  // Trial & Onboarding Playbooks
  // ============================================================================

  trial_expiring_3_days: {
    id: 'trial_expiring_3_days',
    name: 'Trial Expiring - 3 Days',
    description: 'Nurture trial users 3 days before expiration',
    trigger: {
      type: 'time',
      condition: 'trial_ends_in_3_days',
    },
    actions: [
      {
        type: 'whatsapp',
        template: 'trial_expiring_reminder',
        message: 'Hi {{firstName}}! Your Vayva trial ends in 3 days. Need help getting set up? Reply to chat with our team.',
        delay: 0,
      },
      {
        type: 'email',
        template: 'trial_expiring_value_summary',
        delay: 1000 * 60 * 60, // 1 hour later
      },
      {
        type: 'task',
        assignee: 'csm',
        title: 'Call trial customer - 3 days to expiration',
        priority: 'medium',
        delay: 1000 * 60 * 60 * 24, // 24 hours later
      },
    ],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  trial_expiring_1_day: {
    id: 'trial_expiring_1_day',
    name: 'Trial Expiring - Final Day',
    description: 'Urgent outreach on final day of trial',
    trigger: {
      type: 'time',
      condition: 'trial_ends_in_1_day',
    },
    actions: [
      {
        type: 'whatsapp',
        template: 'trial_final_day',
        message: 'Hi {{firstName}}! Today is your last day of the Vayva trial. Don\'t lose your progress - upgrade now: {{upgradeUrl}}',
        delay: 0,
      },
      {
        type: 'task',
        assignee: 'csm',
        title: 'URGENT: Trial expires today - call customer',
        priority: 'high',
        delay: 1000 * 60 * 60 * 4, // 4 hours later
      },
    ],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  onboarding_day_1: {
    id: 'onboarding_day_1',
    name: 'Onboarding Day 1',
    description: 'Welcome message and setup guidance',
    trigger: {
      type: 'event',
      condition: 'store_created',
    },
    actions: [
      {
        type: 'whatsapp',
        template: 'welcome_onboarding',
        message: 'Welcome to Vayva, {{firstName}}! 🎉 I\'m your AI assistant. Let\'s get your store set up. First, add your products here: {{productsUrl}}',
        delay: 1000 * 60 * 30, // 30 minutes after signup
      },
      {
        type: 'email',
        template: 'onboarding_checklist',
        delay: 1000 * 60 * 60 * 2, // 2 hours later
      },
    ],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  onboarding_day_3: {
    id: 'onboarding_day_3',
    name: 'Onboarding Day 3',
    description: 'Check-in and feature discovery',
    trigger: {
      type: 'time',
      condition: '3_days_after_signup',
    },
    actions: [
      {
        type: 'whatsapp',
        template: 'onboarding_checkin',
        message: 'Hi {{firstName}}! How is your store setup going? Have you tried connecting WhatsApp? It takes 2 minutes: {{whatsappUrl}}',
        delay: 0,
      },
      {
        type: 'task',
        assignee: 'csm',
        title: 'Check onboarding progress - Day 3',
        priority: 'low',
        delay: 1000 * 60 * 60 * 24,
      },
    ],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  onboarding_day_7: {
    id: 'onboarding_day_7',
    name: 'Onboarding Day 7',
    description: 'First week milestone and tips',
    trigger: {
      type: 'time',
      condition: '7_days_after_signup',
    },
    actions: [
      {
        type: 'whatsapp',
        template: 'first_week_milestone',
        message: 'You\'ve been with Vayva for a week, {{firstName}}! 🎉 Here are 3 tips to get your first sale: {{tipsUrl}}',
        delay: 0,
      },
      {
        type: 'email',
        template: 'first_week_success_stories',
        delay: 1000 * 60 * 60 * 2,
      },
    ],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // ============================================================================
  // Health Score Based Playbooks
  // ============================================================================

  health_score_critical: {
    id: 'health_score_critical',
    name: 'Critical Health Score Alert',
    description: 'Immediate intervention for critical health scores',
    trigger: {
      type: 'health_score',
      condition: 'score < 40',
    },
    actions: [
      {
        type: 'slack',
        channel: '#churn-alerts',
        message: '🚨 CRITICAL: {{storeName}} health score dropped to {{score}}. Immediate intervention required.',
        delay: 0,
      },
      {
        type: 'task',
        assignee: 'csm',
        title: 'URGENT: Critical health score intervention - {{storeName}}',
        priority: 'urgent',
        delay: 0,
      },
      {
        type: 'whatsapp',
        template: 'founder_outreach_critical',
        message: 'Hi {{firstName}}, I noticed you haven\'t been active on Vayva lately. Is everything okay? I\'d love to help - can we chat?',
        delay: 1000 * 60 * 60 * 2, // 2 hours later
      },
      {
        type: 'email',
        template: 'executive_outreach_critical',
        delay: 1000 * 60 * 60 * 24, // 24 hours later
      },
    ],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  health_score_at_risk: {
    id: 'health_score_at_risk',
    name: 'At-Risk Health Score',
    description: 'Proactive outreach for declining health',
    trigger: {
      type: 'health_score',
      condition: 'score < 60 AND score >= 40',
    },
    actions: [
      {
        type: 'slack',
        channel: '#customer-success',
        message: '⚠️ At-risk merchant: {{storeName}} (score: {{score}})',
        delay: 0,
      },
      {
        type: 'task',
        assignee: 'csm',
        title: 'Reach out to at-risk merchant - {{storeName}}',
        priority: 'medium',
        delay: 1000 * 60 * 60 * 4,
      },
      {
        type: 'whatsapp',
        template: 'proactive_help_offer',
        message: 'Hi {{firstName}}! I noticed you might need some help getting the most out of Vayva. Want to schedule a quick call?',
        delay: 1000 * 60 * 60 * 24,
      },
    ],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  health_score_declining: {
    id: 'health_score_declining',
    name: 'Declining Health Score',
    description: 'Catch merchants before they become at-risk',
    trigger: {
      type: 'health_score',
      condition: 'score_declined_by > 15',
    },
    actions: [
      {
        type: 'whatsapp',
        template: 'check_in_declining',
        message: 'Hi {{firstName}}! Just checking in - is there anything about Vayva that\'s not working for you? I\'m here to help!',
        delay: 0,
      },
      {
        type: 'email',
        template: 'feature_tips_declining',
        delay: 1000 * 60 * 60 * 48,
      },
    ],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // ============================================================================
  // Feature Adoption Playbooks
  // ============================================================================

  feature_adoption_low: {
    id: 'feature_adoption_low',
    name: 'Low Feature Adoption',
    description: 'Help merchants discover more features',
    trigger: {
      type: 'metric',
      condition: 'features_used < 30%',
      duration: '7_days',
    },
    actions: [
      {
        type: 'whatsapp',
        template: 'feature_discovery',
        message: 'Hi {{firstName}}! You\'re using Vayva but missing out on some powerful features. Check them out: {{featuresUrl}}',
        delay: 0,
      },
      {
        type: 'in_app',
        message: 'Discover features that can help you sell more',
        delay: 1000 * 60 * 60,
      },
      {
        type: 'task',
        assignee: 'csm',
        title: 'Schedule feature training - {{storeName}}',
        priority: 'low',
        delay: 1000 * 60 * 60 * 24 * 3, // 3 days later
      },
    ],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  ai_agent_not_used: {
    id: 'ai_agent_not_used',
    name: 'AI Agent Not Activated',
    description: 'Encourage AI agent usage',
    trigger: {
      type: 'metric',
      condition: 'ai_conversations_30d = 0',
      duration: '14_days_after_signup',
    },
    actions: [
      {
        type: 'whatsapp',
        template: 'ai_agent_demo',
        message: 'Hi {{firstName}}! Did you know Vayva\'s AI can handle customer inquiries 24/7? See how it works: {{demoUrl}}',
        delay: 0,
      },
      {
        type: 'email',
        template: 'ai_agent_case_studies',
        delay: 1000 * 60 * 60 * 48,
      },
    ],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  whatsapp_not_connected: {
    id: 'whatsapp_not_connected',
    name: 'WhatsApp Not Connected',
    description: 'Drive WhatsApp integration adoption',
    trigger: {
      type: 'metric',
      condition: 'whatsapp_connected = false',
      duration: '3_days_after_signup',
    },
    actions: [
      {
        type: 'whatsapp',
        template: 'whatsapp_setup_reminder',
        message: 'Hi {{firstName}}! Connect your WhatsApp to start receiving orders directly. It only takes 2 minutes: {{setupUrl}}',
        delay: 0,
      },
      {
        type: 'task',
        assignee: 'csm',
        title: 'Help with WhatsApp setup - {{storeName}}',
        priority: 'medium',
        delay: 1000 * 60 * 60 * 24,
      },
    ],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // ============================================================================
  // Engagement Playbooks
  // ============================================================================

  inactive_7_days: {
    id: 'inactive_7_days',
    name: 'Inactive 7 Days',
    description: 'Re-engage merchants inactive for a week',
    trigger: {
      type: 'metric',
      condition: 'days_since_login >= 7',
      duration: 'continuous',
    },
    actions: [
      {
        type: 'whatsapp',
        template: 'reengagement_7_days',
        message: 'Hi {{firstName}}! We miss you on Vayva. Is there anything I can help you with?',
        delay: 0,
      },
      {
        type: 'email',
        template: 'whats_new_reengagement',
        delay: 1000 * 60 * 60 * 24,
      },
    ],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  inactive_14_days: {
    id: 'inactive_14_days',
    name: 'Inactive 14 Days',
    description: 'Urgent re-engagement for 2-week inactive',
    trigger: {
      type: 'metric',
      condition: 'days_since_login >= 14',
      duration: 'continuous',
    },
    actions: [
      {
        type: 'slack',
        channel: '#churn-alerts',
        message: '⚠️ {{storeName}} inactive for 14+ days',
        delay: 0,
      },
      {
        type: 'whatsapp',
        template: 'reengagement_14_days_personal',
        message: '{{firstName}}, I noticed you haven\'t logged in for 2 weeks. Is Vayva not meeting your needs? Let\'s talk.',
        delay: 0,
      },
      {
        type: 'task',
        assignee: 'csm',
        title: 'Win-back call - {{storeName}} (14 days inactive)',
        priority: 'high',
        delay: 1000 * 60 * 60 * 4,
      },
    ],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // ============================================================================
  // Business Milestone Playbooks
  // ============================================================================

  first_order: {
    id: 'first_order',
    name: 'First Order Celebration',
    description: 'Celebrate merchant\'s first order',
    trigger: {
      type: 'event',
      condition: 'first_order_received',
    },
    actions: [
      {
        type: 'whatsapp',
        template: 'first_order_congrats',
        message: '🎉 Congratulations {{firstName}}! You just received your first order! Here\'s how to fulfill it: {{fulfillmentUrl}}',
        delay: 0,
      },
      {
        type: 'email',
        template: 'first_order_best_practices',
        delay: 1000 * 60 * 60 * 2,
      },
    ],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  tenth_order: {
    id: 'tenth_order',
    name: '10th Order Milestone',
    description: 'Celebrate 10 orders milestone',
    trigger: {
      type: 'event',
      condition: 'order_count = 10',
    },
    actions: [
      {
        type: 'whatsapp',
        template: 'milestone_10_orders',
        message: '🚀 Amazing {{firstName}}! You\'ve completed 10 orders! You\'re building something great. Here\'s a tip to scale further: {{scalingTip}}',
        delay: 0,
      },
    ],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  revenue_milestone_100k: {
    id: 'revenue_milestone_100k',
    name: '₦100k Revenue Milestone',
    description: 'Celebrate ₦100k total revenue',
    trigger: {
      type: 'event',
      condition: 'total_revenue >= 100000',
    },
    actions: [
      {
        type: 'whatsapp',
        template: 'revenue_milestone_100k',
        message: '💰 Incredible {{firstName}}! You\'ve made ₦100,000 on Vayva! Here\'s how to reach ₦500k: {{growthTips}}',
        delay: 0,
      },
      {
        type: 'task',
        assignee: 'csm',
        title: 'Celebrate 100k milestone with {{storeName}}',
        priority: 'medium',
        delay: 1000 * 60 * 60 * 24,
      },
    ],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // ============================================================================
  // Support Playbooks
  // ============================================================================

  support_ticket_created: {
    id: 'support_ticket_created',
    name: 'Support Ticket Follow-up',
    description: 'Proactive follow-up after ticket creation',
    trigger: {
      type: 'event',
      condition: 'support_ticket_created',
    },
    actions: [
      {
        type: 'whatsapp',
        template: 'support_acknowledgment',
        message: 'Hi {{firstName}}! We received your support request. Our team is on it and will respond within 24 hours.',
        delay: 1000 * 60 * 15, // 15 minutes
      },
    ],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  support_ticket_resolved: {
    id: 'support_ticket_resolved',
    name: 'Support Resolution Follow-up',
    description: 'Check-in after ticket resolution',
    trigger: {
      type: 'event',
      condition: 'support_ticket_resolved',
    },
    actions: [
      {
        type: 'whatsapp',
        template: 'support_resolution_followup',
        message: 'Hi {{firstName}}! We closed your support ticket. Is everything working as expected now?',
        delay: 1000 * 60 * 60 * 24, // 24 hours after resolution
      },
    ],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // ============================================================================
  // Billing Playbooks
  // ============================================================================

  payment_failed: {
    id: 'payment_failed',
    name: 'Payment Failed',
    description: 'Handle failed payments with care',
    trigger: {
      type: 'event',
      condition: 'payment_failed',
    },
    actions: [
      {
        type: 'whatsapp',
        template: 'payment_failed',
        message: 'Hi {{firstName}}. Your Vayva subscription payment of ₦{{amount}} failed. Please update your payment method: {{updateUrl}}',
        delay: 0,
      },
      {
        type: 'email',
        template: 'payment_failed_instructions',
        delay: 1000 * 60 * 30,
      },
    ],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  subscription_canceled: {
    id: 'subscription_canceled',
    name: 'Subscription Canceled',
    description: 'Win-back canceled subscriptions',
    trigger: {
      type: 'event',
      condition: 'subscription_canceled',
    },
    actions: [
      {
        type: 'whatsapp',
        template: 'cancellation_feedback',
        message: 'Hi {{firstName}}. I\'m sorry to see you go. Could you share what made you cancel? Your feedback helps us improve.',
        delay: 1000 * 60 * 60 * 24,
      },
      {
        type: 'task',
        assignee: 'csm',
        title: 'Win-back: {{storeName}} canceled subscription',
        priority: 'high',
        delay: 1000 * 60 * 60 * 48,
      },
      {
        type: 'email',
        template: 'win_back_offer',
        delay: 1000 * 60 * 60 * 24 * 7, // 7 days later
      },
    ],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // ============================================================================
  // NPS Follow-up Playbooks
  // ============================================================================

  nps_detractor: {
    id: 'nps_detractor',
    name: 'NPS Detractor Follow-up',
    description: 'Immediate response to NPS detractors (0-6)',
    trigger: {
      type: 'event',
      condition: 'nps_score <= 6',
    },
    actions: [
      {
        type: 'slack',
        channel: '#nps-detractors',
        message: '😞 NPS Detractor: {{storeName}} scored {{score}}/10',
        delay: 0,
      },
      {
        type: 'task',
        assignee: 'csm',
        title: 'URGENT: NPS detractor follow-up - {{storeName}}',
        priority: 'urgent',
        delay: 0,
      },
      {
        type: 'whatsapp',
        template: 'nps_detractor_apology',
        message: 'Hi {{firstName}}. Thank you for your feedback. I\'m sorry we haven\'t met your expectations. Can we schedule a call to make this right?',
        delay: 1000 * 60 * 30,
      },
    ],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  nps_promoter: {
    id: 'nps_promoter',
    name: 'NPS Promoter Advocacy',
    description: 'Leverage NPS promoters (9-10)',
    trigger: {
      type: 'event',
      condition: 'nps_score >= 9',
    },
    actions: [
      {
        type: 'whatsapp',
        template: 'nps_promoter_thanks',
        message: 'Thank you so much {{firstName}}! Your feedback means the world to us. Would you mind leaving us a review? {{reviewUrl}}',
        delay: 0,
      },
      {
        type: 'task',
        assignee: 'csm',
        title: 'Thank promoter and ask for referral - {{storeName}}',
        priority: 'low',
        delay: 1000 * 60 * 60 * 24,
      },
    ],
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

/**
 * Get all enabled playbooks
 */
export function getEnabledPlaybooks(): Playbook[] {
  return Object.values(BUILT_IN_PLAYBOOKS).filter(p => p.enabled);
}

/**
 * Get playbook by ID
 */
export function getPlaybookById(id: string): Playbook | undefined {
  return BUILT_IN_PLAYBOOKS[id];
}

/**
 * Get playbooks by trigger type
 */
export function getPlaybooksByTriggerType(type: string): Playbook[] {
  return Object.values(BUILT_IN_PLAYBOOKS).filter(
    p => p.enabled && p.trigger.type === type
  );
}
