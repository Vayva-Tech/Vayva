import { z } from 'zod';

/**
 * AI Settings Schema
 * 
 * Controls all AI-powered features including:
 * - AI personality and tone
 * - Automation levels
 * - Alert sensitivity
 * - Data sharing preferences
 * - Action permissions
 * - Industry-specific AI behaviors
 */

// ============================================================================
// AI PERSONALITY & COMMUNICATION STYLE
// ============================================================================

export const aiPersonalitySchema = z.object({
  // Communication Tone
  tone: z.enum(['professional', 'friendly', 'casual', 'formal', 'enthusiastic']).default('professional'),
  
  // Response Length
  responseLength: z.enum(['concise', 'moderate', 'detailed']).default('moderate'),
  
  // Technical Level
  technicalLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).default('intermediate'),
  
  // Proactivity
  proactivity: z.enum(['reactive', 'balanced', 'proactive']).default('balanced'),
  
  // Emoji Usage
  emojiUsage: z.boolean().default(false),
  
  // Language Style
  useIndustryJargon: z.boolean().default(true),
  explainTechnicalTerms: z.boolean().default(false),
});

export type AIPersonality = z.infer<typeof aiPersonalitySchema>;

// ============================================================================
// AUTOMATION LEVEL
// ============================================================================

export const automationLevelSchema = z.object({
  // Overall Automation Mode
  mode: z.enum(['manual', 'semi-automated', 'fully-automated']).default('semi-automated'),
  
  // Task-Specific Automation
  tasks: z.object({
    // Customer Communication
    respondToInquiries: z.boolean().default(false),
    sendFollowUps: z.boolean().default(true),
    scheduleAppointments: z.boolean().default(false),
    
    // Marketing
    createSocialMediaPosts: z.boolean().default(false),
    sendEmailCampaigns: z.boolean().default(false),
    optimizeAdSpend: z.boolean().default(false),
    
    // Operations
    adjustInventory: z.boolean().default(false),
    updatePricing: z.boolean().default(false),
    reorderStock: z.boolean().default(false),
    
    // Finance
    sendInvoiceReminders: z.boolean().default(true),
    processRefunds: z.boolean().default(false),
    applyDiscounts: z.boolean().default(false),
    
    // Analytics
    generateReports: z.boolean().default(true),
    identifyTrends: z.boolean().default(true),
    detectAnomalies: z.boolean().default(true),
  }),
  
  // Approval Requirements
  approvalRequired: z.object({
    spendingOver: z.number().min(0).default(100), // AI needs approval for expenses over this amount
    discountOver: z.number().min(0).max(100).default(20), // Percentage
    refundOver: z.number().min(0).default(50),
    priceChangeOver: z.number().min(0).max(100).default(15), // Percentage
  }),
});

export type AutomationLevel = z.infer<typeof automationLevelSchema>;

// ============================================================================
// ALERT SENSITIVITY
// ============================================================================

export const alertSensitivitySchema = z.object({
  // Overall Sensitivity Level
  level: z.enum(['critical-only', 'important', 'all-insights']).default('important'),
  
  // Alert Categories
  categories: z.object({
    // Sales & Revenue
    salesMilestones: z.boolean().default(true),
    revenueDrops: z.boolean().default(true),
    largeOrders: z.boolean().default(true),
    
    // Inventory
    lowStock: z.boolean().default(true),
    outOfStock: z.boolean().default(true),
    overstock: z.boolean().default(false),
    
    // Customer
    newCustomers: z.boolean().default(true),
    vipCustomerActivity: z.boolean().default(true),
    negativeReviews: z.boolean().default(true),
    churnRisk: z.boolean().default(true),
    
    // Operations
    systemIssues: z.boolean().default(true),
    complianceAlerts: z.boolean().default(true),
    staffIssues: z.boolean().default(false),
    
    // AI Insights
    trendAlerts: z.boolean().default(true),
    anomalyDetection: z.boolean().default(true),
    optimizationSuggestions: z.boolean().default(true),
    benchmarkingInsights: z.boolean().default(true),
    
    // Financial
    cashflowWarnings: z.boolean().default(true),
    unpaidInvoices: z.boolean().default(true),
    budgetOverruns: z.boolean().default(true),
  }),
  
  // Thresholds
  thresholds: z.object({
    revenueDropPercentage: z.number().min(0).max(100).default(20), // Alert if revenue drops by X%
    inventoryDaysRemaining: z.number().min(0).default(7), // Alert when inventory < X days
    customerResponseTimeHours: z.number().min(0).default(24), // Alert if response time > X hours
    websiteConversionRate: z.number().min(0).max(100).default(2), // Alert if conversion < X%
  }),
  
  // Quiet Hours for Alerts
  quietHours: z.object({
    enabled: z.boolean().default(true),
    startTime: z.string(), // "22:00"
    endTime: z.string(), // "08:00"
    allowCriticalAlerts: z.boolean().default(true),
  }),
});

export type AlertSensitivity = z.infer<typeof alertSensitivitySchema>;

// ============================================================================
// DATA SHARING & PRIVACY
// ============================================================================

export const dataSharingLevelSchema = z.object({
  // Anonymized Benchmarking
  enableBenchmarking: z.boolean().default(true),
  shareDataForBenchmarks: z.boolean().default(true),
  benchmarkComparisonGroup: z.enum(['local', 'national', 'global', 'industry-specific']).default('industry-specific'),
  
  // AI Training
  allowDataForModelImprovement: z.boolean().default(true),
  allowFeatureUsageAnalytics: z.boolean().default(true),
  
  // Data Access Permissions
  dataAccess: z.object({
    allowFullHistoryAccess: z.boolean().default(true),
    maxDataRangeMonths: z.number().min(1).max(60).default(24), // AI can access up to X months of data
    excludeSensitiveData: z.boolean().default(true),
    piiRedaction: z.boolean().default(true), // Personally Identifiable Information
  }),
  
  // Third-Party Integrations
  thirdPartyIntegrations: z.array(z.object({
    service: z.string(),
    enabled: z.boolean(),
    dataShared: z.array(z.string()), // e.g., ['orders', 'customers', 'inventory']
    lastSyncDate: z.string().optional(),
  })).optional(),
});

export type DataSharingLevel = z.infer<typeof dataSharingLevelSchema>;

// ============================================================================
// INDUSTRY-SPECIFIC AI BEHAVIORS
// ============================================================================

export const industryAISettingsSchema = z.object({
  // Healthcare AI
  healthcare: z.object({
    clinicalDecisionSupport: z.boolean().default(false), // AI suggests treatments
    drugInteractionChecking: z.boolean().default(true),
    diagnosisCoding: z.boolean().default(false), // Auto-suggest ICD-10 codes
    patientRiskStratification: z.boolean().default(true),
    appointmentNoShowPrediction: z.boolean().default(true),
  }).optional(),
  
  // Restaurant AI
  restaurant: z.object({
    demandForecasting: z.boolean().default(true),
    menuOptimization: z.boolean().default(true),
    ingredientWasteReduction: z.boolean().default(true),
    tableTurnOptimization: z.boolean().default(false),
    dynamicPricing: z.boolean().default(false),
    reviewSentimentAnalysis: z.boolean().default(true),
  }).optional(),
  
  // Retail AI
  retail: z.object({
    demandForecasting: z.boolean().default(true),
    personalizedRecommendations: z.boolean().default(true),
    dynamicPricing: z.boolean().default(false),
    visualMerchandising: z.boolean().default(false),
    shrinkagePrevention: z.boolean().default(false),
    customerSegmentation: z.boolean().default(true),
  }).optional(),
  
  // Legal AI
  legal: z.object({
    documentReview: z.boolean().default(false),
    legalResearch: z.boolean().default(false),
    contractAnalysis: z.boolean().default(false),
    billingOptimization: z.boolean().default(true),
    outcomePrediction: z.boolean().default(false),
  }).optional(),
  
  // Real Estate AI
  realestate: z.object({
    propertyValuation: z.boolean().default(false),
    leadScoring: z.boolean().default(true),
    marketTrendAnalysis: z.boolean().default(true),
    showingOptimization: z.boolean().default(false),
    investmentAnalysis: z.boolean().default(false),
  }).optional(),
  
  // Events AI
  events: z.object({
    guestCountPrediction: z.boolean().default(true),
    vendorRecommendations: z.boolean().default(true),
    budgetOptimization: z.boolean().default(false),
    seatingArrangement: z.boolean().default(false),
    timelineOptimization: z.boolean().default(false),
  }).optional(),
});

// ============================================================================
// ACTION PERMISSIONS
// ============================================================================

export const actionPermissionsSchema = z.object({
  // What AI Can Do Without Approval
  autoExecute: z.array(z.enum([
    'send-email',
    'create-report',
    'update-inventory-count',
    'adjust-price-under-threshold',
    'send-appointment-reminder',
    'post-social-media-scheduled',
    'apply-standard-discount',
    'generate-invoice',
    'send-review-response',
  ])).default(['send-email', 'create-report', 'send-appointment-reminder']),
  
  // What Requires User Approval
  requiresApproval: z.array(z.enum([
    'spend-money',
    'issue-refund',
    'change-price-significantly',
    'cancel-order',
    'ban-customer',
    'hire-staff',
    'fire-staff',
    'sign-contract',
    'approve-loan',
  ])).default(['spend-money', 'issue-refund', 'change-price-significantly', 'cancel-order']),
  
  // What AI Cannot Do (Hard Restrictions)
  prohibited: z.array(z.enum([
    'access-bank-accounts',
    'transfer-money',
    'modify-ownership',
    'delete-business',
    'access-personal-data',
  ])).default(['access-bank-accounts', 'transfer-money', 'modify-ownership', 'delete-business']),
});

// ============================================================================
// FORECASTING & PREDICTIONS
// ============================================================================

export const forecastingSettingsSchema = z.object({
  // Forecast Aggressiveness
  aggressiveness: z.enum(['conservative', 'moderate', 'aggressive']).default('moderate'),
  
  // Forecast Horizon
  shortTermDays: z.number().min(1).max(30).default(7),
  mediumTermDays: z.number().min(30).max(90).default(30),
  longTermDays: z.number().min(90).max(365).default(90),
  
  // Confidence Thresholds
  minimumConfidence: z.number().min(0).max(100).default(70), // Only show forecasts with >= X% confidence
  
  // Prediction Types
  predictions: z.object({
    revenue: z.boolean().default(true),
    orders: z.boolean().default(true),
    traffic: z.boolean().default(true),
    conversion: z.boolean().default(true),
    inventory: z.boolean().default(true),
    churn: z.boolean().default(true),
    lifetimeValue: z.boolean().default(false),
  }),
  
  // Model Preferences
  modelPreference: z.enum(['simple', 'advanced', 'custom']).default('advanced'),
  includeSeasonality: z.boolean().default(true),
  includeExternalFactors: z.boolean().default(true), // Weather, holidays, economic indicators
});

// ============================================================================
// COMBINED AI SETTINGS SCHEMA
// ============================================================================

export const aiSettingsSchema = z.object({
  // Core AI Configuration
  personality: aiPersonalitySchema,
  automation: automationLevelSchema,
  alerts: alertSensitivitySchema,
  dataSharing: dataSharingLevelSchema,
  actionPermissions: actionPermissionsSchema,
  forecasting: forecastingSettingsSchema,
  
  // Industry-Specific AI Behaviors
  industry: industryAISettingsSchema,
  
  // Advanced Settings
  advanced: z.object({
    // Model Configuration
    modelVersion: z.enum(['v1', 'v2', 'beta']).default('v2'),
    temperature: z.number().min(0).max(2).default(0.7), // Creativity vs determinism
    maxTokens: z.number().min(100).max(4096).default(1024),
    
    // Context Window
    contextWindowMessages: z.number().min(1).max(100).default(10), // Number of messages to consider
    
    // Performance
    enableCaching: z.boolean().default(true),
    cacheExpirationHours: z.number().min(1).max(168).default(24),
    
    // Logging & Debugging
    enableDebugLogging: z.boolean().default(false),
    logApiCalls: z.boolean().default(true),
  }).default({
    modelVersion: 'v2',
    temperature: 0.7,
    maxTokens: 1024,
    contextWindowMessages: 10,
    enableCaching: true,
    cacheExpirationHours: 24,
    enableDebugLogging: false,
    logApiCalls: true,
  }),
});

export type AISettings = z.infer<typeof aiSettingsSchema>;
