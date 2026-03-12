import { z } from 'zod';

/**
 * Notification Settings Schema
 * 
 * Controls all notification channels, rules, and preferences.
 */

// ============================================================================
// CHANNEL CONFIGURATION
// ============================================================================

export const channelConfigSchema = z.object({
  // Email Notifications
  email: z.object({
    enabled: z.boolean().default(true),
    address: z.string().email(),
    digestEnabled: z.boolean().default(false),
    digestFrequency: z.enum(['hourly', 'daily', 'weekly']).default('daily'),
  }),
  
  // SMS Notifications
  sms: z.object({
    enabled: z.boolean().default(false),
    phoneNumber: z.string().optional(),
    carrier: z.string().optional(),
  }),
  
  // Push Notifications
  push: z.object({
    enabled: z.boolean().default(true),
    browserPermission: z.enum(['granted', 'denied', 'default']).default('default'),
    deviceTokens: z.array(z.string()).optional(),
  }),
  
  // In-App Notifications
  inApp: z.object({
    enabled: z.boolean().default(true),
    showBadge: z.boolean().default(true),
    soundEnabled: z.boolean().default(true),
    desktopNotifications: z.boolean().default(false),
  }),
  
  // Slack Integration
  slack: z.object({
    enabled: z.boolean().default(false),
    webhookUrl: z.string().url().optional(),
    channel: z.string().optional(),
  }),
  
  // WhatsApp Business
  whatsapp: z.object({
    enabled: z.boolean().default(false),
    phoneNumber: z.string().optional(),
    businessAccountId: z.string().optional(),
  }),
});

export type ChannelConfig = z.infer<typeof channelConfigSchema>;

// ============================================================================
// NOTIFICATION RULES
// ============================================================================

export const notificationRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  
  // Trigger
  trigger: z.object({
    type: z.enum(['event', 'threshold', 'schedule', 'ai-insight']),
    event: z.string().optional(), // e.g., 'order.created', 'payment.received'
    threshold: z.object({
      metric: z.string(),
      operator: z.enum(['greater-than', 'less-than', 'equals', 'crosses']),
      value: z.number(),
    }).optional(),
    schedule: z.object({
      frequency: z.enum(['daily', 'weekly', 'monthly']),
      time: z.string(), // "09:00"
    }).optional(),
  }),
  
  // Conditions
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(['equals', 'contains', 'greater-than', 'less-than']),
    value: z.any(),
  })).optional(),
  
  // Actions
  actions: z.array(z.object({
    type: z.enum(['email', 'sms', 'push', 'in-app', 'slack', 'whatsapp']),
    recipient: z.string().optional(), // Override default recipient
    template: z.string(), // Notification template ID
    variables: z.record(z.any()).optional(),
  })),
  
  // Delivery Options
  deliveryOptions: z.object({
    immediate: z.boolean().default(true),
    batchWithSimilar: z.boolean().default(false),
    batchWindowMinutes: z.number().min(1).max(60).default(15),
    retryOnFailure: z.boolean().default(true),
    maxRetries: z.number().min(0).max(5).default(3),
  }),
  
  // Quiet Hours Override
  respectQuietHours: z.boolean().default(true),
  
  // Status
  enabled: z.boolean().default(true),
});

export type NotificationRule = z.infer<typeof notificationRuleSchema>;

// ============================================================================
// QUIET HOURS
// ============================================================================

export const quietHoursSchema = z.object({
  enabled: z.boolean().default(true),
  startTime: z.string(), // "22:00"
  endTime: z.string(), // "08:00"
  timezone: z.string().optional(), // Use business timezone if not specified
  
  // Exceptions
  allowEmergencyContacts: z.boolean().default(true),
  emergencyContactKeywords: z.array(z.string()).default(['urgent', 'emergency', 'critical']),
  
  // VIP Override
  allowVipOverrides: z.boolean().default(false),
  vipContacts: z.array(z.string()).optional(), // Email addresses or phone numbers
});

export type QuietHours = z.infer<typeof quietHoursSchema>;

// ============================================================================
// NOTIFICATION CATEGORIES
// ============================================================================

export const notificationCategoriesSchema = z.object({
  // Sales & Orders
  sales: z.object({
    newOrder: z.boolean().default(true),
    largeOrder: z.boolean().default(true),
    largeOrderThreshold: z.number().min(0).default(500),
    orderStatusChange: z.boolean().default(false),
    paymentReceived: z.boolean().default(true),
    refundProcessed: z.boolean().default(true),
  }),
  
  // Customers
  customers: z.object({
    newCustomer: z.boolean().default(true),
    vipCustomerActivity: z.boolean().default(true),
    customerComplaint: z.boolean().default(true),
    negativeReview: z.boolean().default(true),
    positiveReview: z.boolean().default(false),
    customerChurnRisk: z.boolean().default(true),
  }),
  
  // Inventory
  inventory: z.object({
    lowStock: z.boolean().default(true),
    outOfStock: z.boolean().default(true),
    restockAlert: z.boolean().default(false),
    expirationAlert: z.boolean().default(true),
    shrinkageDetected: z.boolean().default(false),
  }),
  
  // Appointments & Bookings
  appointments: z.object({
    newBooking: z.boolean().default(true),
    bookingCancelled: z.boolean().default(true),
    bookingReminder: z.boolean().default(true),
    noShow: z.boolean().default(true),
    waitlistAvailable: z.boolean().default(false),
  }),
  
  // Finance
  finance: z.object({
    invoiceSent: z.boolean().default(false),
    invoiceOverdue: z.boolean().default(true),
    paymentFailed: z.boolean().default(true),
    budgetExceeded: z.boolean().default(true),
    cashflowWarning: z.boolean().default(true),
    taxDeadline: z.boolean().default(true),
  }),
  
  // Staff & HR
  staff: z.object({
    shiftReminder: z.boolean().default(false),
    timeOffRequest: z.boolean().default(true),
    newHire: z.boolean().default(false),
    workAnniversary: z.boolean().default(false),
    performanceReview: z.boolean().default(false),
  }),
  
  // AI Insights
  aiInsights: z.object({
    trendAlert: z.boolean().default(true),
    anomalyDetected: z.boolean().default(true),
    optimizationOpportunity: z.boolean().default(true),
    benchmarkingInsight: z.boolean().default(true),
    forecastUpdate: z.boolean().default(false),
    recommendationReady: z.boolean().default(true),
  }),
  
  // System & Security
  system: z.object({
    loginAlert: z.boolean().default(false), // Unusual login
    securityWarning: z.boolean().default(true),
    systemMaintenance: z.boolean().default(true),
    backupCompleted: z.boolean().default(false),
    apiRateLimitWarning: z.boolean().default(false),
    integrationError: z.boolean().default(true),
  }),
  
  // Marketing
  marketing: z.object({
    campaignCompleted: z.boolean().default(true),
    campaignPerformance: z.boolean().default(false),
    leadMilestone: z.boolean().default(true),
    socialMediaMention: z.boolean().default(false),
    emailBounce: z.boolean().default(true),
  }),
});

// ============================================================================
// COMBINED NOTIFICATION SETTINGS SCHEMA
// ============================================================================

export const notificationSettingsSchema = z.object({
  // Channel Configuration
  channels: channelConfigSchema,
  
  // Notification Rules (Custom)
  customRules: z.array(notificationRuleSchema).optional(),
  
  // Quiet Hours
  quietHours: quietHoursSchema,
  
  // Category Preferences
  categories: notificationCategoriesSchema,
  
  // Do Not Disturb
  doNotDisturb: z.object({
    enabled: z.boolean().default(false),
    startDate: z.string(),
    endDate: z.string(),
    allowEmergency: z.boolean().default(true),
  }).optional(),
  
  // Notification Digest
  digest: z.object({
    enabled: z.boolean().default(false),
    frequency: z.enum(['hourly', 'daily', 'weekly', 'monthly']).default('daily'),
    deliveryTime: z.string().default('09:00'),
    includeCharts: z.boolean().default(false),
    maxItems: z.number().min(1).max(100).default(20),
  }),
  
  // Priority Settings
  priority: z.object({
    highPriorityKeywords: z.array(z.string()).default(['urgent', 'critical', 'emergency']),
    autoEscalateAfterMinutes: z.number().min(0).max(1440).default(60),
    escalationContact: z.string().optional(),
  }),
  
  // Analytics
  trackEngagement: z.boolean().default(true),
  markAsReadAutomatically: z.boolean().default(false),
});

export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;
