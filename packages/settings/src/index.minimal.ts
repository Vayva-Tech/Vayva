/**
 * Simplified @vayva/settings package for Phase 3 AI Integration
 * Contains only the essential types and functions needed for AI settings integration
 */

// ============================================================================
// CORE TYPES - Only what's needed for AI integration
// ============================================================================

export interface AIPersonality {
  tone: 'professional' | 'friendly' | 'casual' | 'formal' | 'enthusiastic';
  responseLength: 'concise' | 'moderate' | 'detailed';
  technicalLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  proactivity: 'reactive' | 'balanced' | 'proactive';
  emojiUsage: boolean;
  useIndustryJargon: boolean;
  explainTechnicalTerms: boolean;
}

export interface AutomationLevel {
  mode: 'manual' | 'semi-automated' | 'fully-automated';
  tasks: {
    respondToInquiries: boolean;
    sendFollowUps: boolean;
    scheduleAppointments: boolean;
    createSocialMediaPosts: boolean;
    sendEmailCampaigns: boolean;
    optimizeAdSpend: boolean;
    adjustInventory: boolean;
    updatePricing: boolean;
    reorderStock: boolean;
    sendInvoiceReminders: boolean;
    processRefunds: boolean;
    applyDiscounts: boolean;
    generateReports: boolean;
    identifyTrends: boolean;
    detectAnomalies: boolean;
  };
  approvalRequired: {
    spendingOver: number;
    discountOver: number;
    refundOver: number;
    priceChangeOver: number;
  };
}

export interface AlertSensitivity {
  level: 'critical-only' | 'important' | 'all-insights';
  categories: {
    salesMilestones: boolean;
    revenueDrops: boolean;
    largeOrders: boolean;
    lowStock: boolean;
    outOfStock: boolean;
    overstock: boolean;
    newCustomers: boolean;
    vipCustomerActivity: boolean;
    negativeReviews: boolean;
    churnRisk: boolean;
    systemIssues: boolean;
    complianceAlerts: boolean;
    staffIssues: boolean;
    trendAlerts: boolean;
    anomalyDetection: boolean;
    optimizationSuggestions: boolean;
    benchmarkingInsights: boolean;
    cashflowWarnings: boolean;
    unpaidInvoices: boolean;
    budgetOverruns: boolean;
  };
  thresholds: {
    revenueDropPercentage: number;
    inventoryDaysRemaining: number;
    customerResponseTimeHours: number;
    websiteConversionRate: number;
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    allowCriticalAlerts: boolean;
  };
}

export interface DataSharingLevel {
  enableBenchmarking: boolean;
  shareDataForBenchmarks: boolean;
  benchmarkComparisonGroup: 'local' | 'national' | 'global' | 'industry-specific';
  allowDataForModelImprovement: boolean;
  allowFeatureUsageAnalytics: boolean;
  dataAccess: {
    allowFullHistoryAccess: boolean;
    maxDataRangeMonths: number;
    excludeSensitiveData: boolean;
    piiRedaction: boolean;
  };
}

export interface ActionPermissions {
  autoExecute: Array<
    'send-email' | 'create-report' | 'update-inventory-count' | 'adjust-price-under-threshold' |
    'send-appointment-reminder' | 'post-social-media-scheduled' | 'apply-standard-discount' |
    'generate-invoice' | 'send-review-response'
  >;
  requiresApproval: Array<
    'spend-money' | 'issue-refund' | 'change-price-significantly' | 'cancel-order' |
    'ban-customer' | 'hire-staff' | 'fire-staff' | 'sign-contract' | 'approve-loan'
  >;
  prohibited: Array<
    'access-bank-accounts' | 'transfer-money' | 'modify-ownership' | 'delete-business' |
    'access-personal-data'
  >;
}

export interface ForecastingSettings {
  aggressiveness: 'conservative' | 'moderate' | 'aggressive';
  shortTermDays: number;
  mediumTermDays: number;
  longTermDays: number;
  minimumConfidence: number;
  predictions: {
    revenue: boolean;
    orders: boolean;
    traffic: boolean;
    conversion: boolean;
    inventory: boolean;
    churn: boolean;
    lifetimeValue: boolean;
  };
  modelPreference: 'simple' | 'advanced' | 'custom';
  includeSeasonality: boolean;
  includeExternalFactors: boolean;
}

export interface AISettings {
  personality: AIPersonality;
  automation: AutomationLevel;
  alerts: AlertSensitivity;
  dataSharing: DataSharingLevel;
  actionPermissions: ActionPermissions;
  forecasting: ForecastingSettings;
  industry: Record<string, any>;
  advanced: {
    modelVersion: 'v1' | 'v2' | 'beta';
    temperature: number;
    maxTokens: number;
    contextWindowMessages: number;
    enableCaching: boolean;
    cacheExpirationHours: number;
    enableDebugLogging: boolean;
    logApiCalls: boolean;
  };
}

// Minimal interfaces for other settings sections
export interface BusinessSettings {
  name: string;
  industry: string;
  timezone: string;
  currency: string;
  locale: string;
}

export interface DashboardSettings {
  layout: 'grid' | 'list' | 'kanban';
  theme: 'light' | 'dark' | 'system';
  refreshInterval: number;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  dateFormat: string;
}

export interface SettingsStore {
  business: BusinessSettings;
  dashboard: DashboardSettings;
  notifications: NotificationSettings;
  user: UserPreferences;
}

// ============================================================================
// SETTINGS MANAGER - Minimal implementation
// ============================================================================

export class SettingsManager {
  private aiSettings: AISettings;
  private settingsStore: SettingsStore;

  constructor() {
    this.aiSettings = this.getDefaultAISettings();
    this.settingsStore = this.getDefaultSettingsStore();
  }

  private getDefaultAISettings(): AISettings {
    return {
      personality: {
        tone: 'professional',
        responseLength: 'moderate',
        technicalLevel: 'intermediate',
        proactivity: 'balanced',
        emojiUsage: false,
        useIndustryJargon: true,
        explainTechnicalTerms: false
      },
      automation: {
        mode: 'semi-automated',
        tasks: {
          respondToInquiries: false,
          sendFollowUps: true,
          scheduleAppointments: false,
          createSocialMediaPosts: false,
          sendEmailCampaigns: false,
          optimizeAdSpend: false,
          adjustInventory: false,
          updatePricing: false,
          reorderStock: false,
          sendInvoiceReminders: true,
          processRefunds: false,
          applyDiscounts: false,
          generateReports: true,
          identifyTrends: true,
          detectAnomalies: true,
        },
        approvalRequired: {
          spendingOver: 100,
          discountOver: 20,
          refundOver: 50,
          priceChangeOver: 15,
        }
      },
      alerts: {
        level: 'important',
        categories: {
          salesMilestones: true,
          revenueDrops: true,
          largeOrders: true,
          lowStock: true,
          outOfStock: true,
          overstock: false,
          newCustomers: true,
          vipCustomerActivity: true,
          negativeReviews: true,
          churnRisk: true,
          systemIssues: true,
          complianceAlerts: true,
          staffIssues: false,
          trendAlerts: true,
          anomalyDetection: true,
          optimizationSuggestions: true,
          benchmarkingInsights: true,
          cashflowWarnings: true,
          unpaidInvoices: true,
          budgetOverruns: true,
        },
        thresholds: {
          revenueDropPercentage: 20,
          inventoryDaysRemaining: 7,
          customerResponseTimeHours: 24,
          websiteConversionRate: 2,
        },
        quietHours: {
          enabled: true,
          startTime: "22:00",
          endTime: "08:00",
          allowCriticalAlerts: true,
        }
      },
      dataSharing: {
        enableBenchmarking: true,
        shareDataForBenchmarks: true,
        benchmarkComparisonGroup: 'industry-specific',
        allowDataForModelImprovement: true,
        allowFeatureUsageAnalytics: true,
        dataAccess: {
          allowFullHistoryAccess: true,
          maxDataRangeMonths: 24,
          excludeSensitiveData: true,
          piiRedaction: true,
        }
      },
      actionPermissions: {
        autoExecute: ['send-email', 'create-report'],
        requiresApproval: ['spend-money', 'issue-refund'],
        prohibited: ['access-bank-accounts', 'transfer-money'],
      },
      forecasting: {
        aggressiveness: 'moderate',
        shortTermDays: 7,
        mediumTermDays: 30,
        longTermDays: 90,
        minimumConfidence: 70,
        predictions: {
          revenue: true,
          orders: true,
          traffic: true,
          conversion: true,
          inventory: true,
          churn: true,
          lifetimeValue: false,
        },
        modelPreference: 'advanced',
        includeSeasonality: true,
        includeExternalFactors: true,
      },
      industry: {},
      advanced: {
        modelVersion: 'v2',
        temperature: 0.7,
        maxTokens: 1024,
        contextWindowMessages: 10,
        enableCaching: true,
        cacheExpirationHours: 24,
        enableDebugLogging: false,
        logApiCalls: true,
      },
    };
  }

  private getDefaultSettingsStore(): SettingsStore {
    return {
      business: {
        name: 'Vayva Business',
        industry: 'technology',
        timezone: 'America/New_York',
        currency: 'USD',
        locale: 'en-US'
      },
      dashboard: {
        layout: 'grid',
        theme: 'system',
        refreshInterval: 300000
      },
      notifications: {
        email: true,
        sms: false,
        push: true,
        inApp: true
      },
      user: {
        theme: 'system',
        language: 'en',
        dateFormat: 'MM/dd/yyyy'
      }
    };
  }

  public getAISettings(): AISettings {
    return { ...this.aiSettings };
  }

  public updateAISettings(newSettings: Partial<AISettings>): void {
    this.aiSettings = {
      ...this.aiSettings,
      ...newSettings
    };
  }

  public getSettings(): SettingsStore {
    return { ...this.settingsStore };
  }

  public updateBusinessSettings(updates: Partial<BusinessSettings>): void {
    this.settingsStore.business = {
      ...this.settingsStore.business,
      ...updates
    };
  }

  public updateDashboardSettings(updates: Partial<DashboardSettings>): void {
    this.settingsStore.dashboard = {
      ...this.settingsStore.dashboard,
      ...updates
    };
  }

  public updateNotificationSettings(updates: Partial<NotificationSettings>): void {
    this.settingsStore.notifications = {
      ...this.settingsStore.notifications,
      ...updates
    };
  }

  public updateUserPreferences(updates: Partial<UserPreferences>): void {
    this.settingsStore.user = {
      ...this.settingsStore.user,
      ...updates
    };
  }

  public async saveAllSettings(): Promise<void> {
    // Mock implementation - in real app this would persist to database
    return Promise.resolve();
  }

  public reset(): void {
    this.aiSettings = this.getDefaultAISettings();
    this.settingsStore = this.getDefaultSettingsStore();
  }

  public exportSettings(): string {
    return JSON.stringify({
      ai: this.aiSettings,
      settings: this.settingsStore
    }, null, 2);
  }

  public async importSettings(settingsJson: string): Promise<void> {
    // Mock implementation
    const parsed = JSON.parse(settingsJson);
    if (parsed.ai) this.aiSettings = parsed.ai;
    if (parsed.settings) this.settingsStore = parsed.settings;
  }
}

// ============================================================================
// GLOBAL INSTANCE MANAGEMENT
// ============================================================================

let globalSettingsManager: SettingsManager | null = null;

export function initializeSettingsManager(manager: SettingsManager): void {
  globalSettingsManager = manager;
}

export function getSettingsManager(): SettingsManager {
  if (!globalSettingsManager) {
    globalSettingsManager = new SettingsManager();
  }
  return globalSettingsManager;
}

// ============================================================================
// REACT HOOKS (Minimal implementation)
// ============================================================================

interface UseSettingsReturn {
  settings: SettingsStore;
  ai: AISettings;
  loading: boolean;
  error: string | null;
  updateAISettings: (updates: Partial<AISettings>) => void;
  updateBusinessSettings: (updates: Partial<BusinessSettings>) => void;
  updateDashboardSettings: (updates: Partial<DashboardSettings>) => void;
  updateNotificationSettings: (updates: Partial<NotificationSettings>) => void;
  updateUserPreferences: (updates: Partial<UserPreferences>) => void;
  saveAllSettings: () => Promise<void>;
  reset: () => void;
  exportSettings: () => string;
  importSettings: () => Promise<void>;
}

export function useSettings(): UseSettingsReturn {
  const manager = getSettingsManager();
  
  return {
    settings: manager.getSettings(),
    ai: manager.getAISettings(),
    loading: false,
    error: null,
    updateAISettings: (updates: Partial<AISettings>) => manager.updateAISettings(updates),
    updateBusinessSettings: (updates: Partial<BusinessSettings>) => manager.updateBusinessSettings(updates),
    updateDashboardSettings: (updates: Partial<DashboardSettings>) => manager.updateDashboardSettings(updates),
    updateNotificationSettings: (updates: Partial<NotificationSettings>) => manager.updateNotificationSettings(updates),
    updateUserPreferences: (updates: Partial<UserPreferences>) => manager.updateUserPreferences(updates),
    saveAllSettings: () => manager.saveAllSettings(),
    reset: () => manager.reset(),
    exportSettings: () => manager.exportSettings(),
    importSettings: () => manager.importSettings('')
  };
}

export function useAISettings() {
  const manager = getSettingsManager();
  return manager.getAISettings();
}