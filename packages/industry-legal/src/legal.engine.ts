/**
 * Legal Industry Engine
 * Main orchestrator for all legal-specific features
 */

import {
  DashboardEngine,
  type DashboardEngineConfig,
  type DataResolver,
} from '@vayva/industry-core';

import {
  MatterService,
  ClientService,
  BillingService,
  DocumentService,
  CalendarService,
  TrustAccountingService,
  ConflictCheckService,
  // Phase 4: AI Services
  ContractAnalysisService,
  LegalResearchService,
  AIDocumentAutomationService,
} from './services/index.js';

import { LEGAL_DASHBOARD_CONFIG } from './dashboard/index.js';

export interface LegalEngineConfig {
  matterManagement?: boolean;
  timeBilling?: boolean;
  documentManagement?: boolean;
  calendarIntegration?: boolean;
  trustAccounting?: boolean;
  conflictChecking?: boolean;
  // Phase 4: AI Services
  aiContractAnalysis?: boolean;
  aiLegalResearch?: boolean;
  aiDocumentAutomation?: boolean;
}

export type LegalFeatureId = 
  | 'matter-management'
  | 'client-relationship'
  | 'time-billing'
  | 'document-assembly'
  | 'calendar-deadlines'
  | 'trust-accounting'
  | 'conflict-checking'
  | 'business-development'
  // Phase 4: AI Features
  | 'ai-contract-analysis'
  | 'ai-legal-research'
  | 'ai-document-automation';

export interface LegalEngineStatus {
  initialized: boolean;
  activeFeatures: LegalFeatureId[];
  dashboardReady: boolean;
  servicesReady: boolean;
}

export class LegalEngine {
  // Feature services
  private matterService?: MatterService;
  private clientService?: ClientService;
  private billingService?: BillingService;
  private documentService?: DocumentService;
  private calendarService?: CalendarService;
  private trustAccountingService?: TrustAccountingService;
  private conflictCheckService?: ConflictCheckService;
  
  // Phase 4: AI Services
  private contractAnalysisService?: ContractAnalysisService;
  private legalResearchService?: LegalResearchService;
  private aiDocumentAutomationService?: AIDocumentAutomationService;

  // Dashboard engine
  private dashboardEngine: DashboardEngine;

  // Configuration
  private legalConfig: LegalEngineConfig;

  // Status tracking
  private status: LegalEngineStatus;

  constructor(
    config: LegalEngineConfig = {}
  ) {
    this.legalConfig = config;
    this.dashboardEngine = new DashboardEngine();
    this.dashboardEngine.setConfig(LEGAL_DASHBOARD_CONFIG);
    
    this.status = {
      initialized: false,
      activeFeatures: [],
      dashboardReady: false,
      servicesReady: false,
    };
  }

  /**
   * Initialize the legal engine and all enabled features
   */
  async initialize(): Promise<void> {
    try {
      // Initialize services based on config
      if (this.legalConfig.matterManagement) {
        this.matterService = new MatterService();
        await this.matterService.initialize();
        this.status.activeFeatures.push('matter-management');
      }

      if (this.legalConfig.timeBilling) {
        this.billingService = new BillingService();
        await this.billingService.initialize();
        this.status.activeFeatures.push('time-billing');
      }

      if (this.legalConfig.documentManagement) {
        this.documentService = new DocumentService();
        await this.documentService.initialize();
        this.status.activeFeatures.push('document-assembly');
      }

      if (this.legalConfig.calendarIntegration) {
        this.calendarService = new CalendarService();
        await this.calendarService.initialize();
        this.status.activeFeatures.push('calendar-deadlines');
      }

      if (this.legalConfig.trustAccounting) {
        this.trustAccountingService = new TrustAccountingService();
        await this.trustAccountingService.initialize();
        this.status.activeFeatures.push('trust-accounting');
      }

      if (this.legalConfig.conflictChecking) {
        this.conflictCheckService = new ConflictCheckService();
        await this.conflictCheckService.initialize();
        this.status.activeFeatures.push('conflict-checking');
      }

      // Add client service always
      this.clientService = new ClientService();
      await this.clientService.initialize();
      this.status.activeFeatures.push('client-relationship');

      // Phase 4: Initialize AI Services
      if (this.legalConfig.aiContractAnalysis) {
        this.contractAnalysisService = new ContractAnalysisService();
        await this.contractAnalysisService.initialize();
        this.status.activeFeatures.push('ai-contract-analysis');
      }

      if (this.legalConfig.aiLegalResearch) {
        this.legalResearchService = new LegalResearchService();
        await this.legalResearchService.initialize();
        this.status.activeFeatures.push('ai-legal-research');
      }

      if (this.legalConfig.aiDocumentAutomation) {
        this.aiDocumentAutomationService = new AIDocumentAutomationService();
        await this.aiDocumentAutomationService.initialize();
        this.status.activeFeatures.push('ai-document-automation');
      }

      this.status.servicesReady = true;
      this.status.initialized = true;
      this.status.dashboardReady = true;

      // Register data resolvers for dashboard widgets
      this.registerDataResolvers();

      console.log(`[LEGAL_ENGINE] Initialized with ${this.status.activeFeatures.length} features`);
    } catch (error) {
      console.error('[LEGAL_ENGINE] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get the dashboard engine for widget configuration
   */
  getDashboardEngine(): DashboardEngine {
    return this.dashboardEngine;
  }

  /**
   * Get a specific service by name
   */
  getService<T>(serviceName: string): T | undefined {
    switch (serviceName) {
      case 'matter':
        return this.matterService as T;
      case 'client':
        return this.clientService as T;
      case 'billing':
        return this.billingService as T;
      case 'document':
        return this.documentService as T;
      case 'calendar':
        return this.calendarService as T;
      case 'trust':
        return this.trustAccountingService as T;
      case 'conflict':
        return this.conflictCheckService as T;
      // Phase 4: AI Services
      case 'contractAnalysis':
        return this.contractAnalysisService as T;
      case 'legalResearch':
        return this.legalResearchService as T;
      case 'aiDocumentAutomation':
        return this.aiDocumentAutomationService as T;
      default:
        return undefined;
    }
  }

  /**
   * Get current engine status
   */
  getStatus(): LegalEngineStatus {
    return { ...this.status };
  }

  /**
   * Get active features
   */
  getActiveFeatures(): LegalFeatureId[] {
    return [...this.status.activeFeatures];
  }

  // Feature-specific accessor methods
  async getMatterService(): Promise<MatterService | undefined> {
    if (!this.status.initialized) {
      await this.initialize();
    }
    return this.matterService;
  }

  async getClientService(): Promise<ClientService | undefined> {
    if (!this.status.initialized) {
      await this.initialize();
    }
    return this.clientService;
  }

  async getBillingService(): Promise<BillingService | undefined> {
    if (!this.status.initialized) {
      await this.initialize();
    }
    return this.billingService;
  }

  async getDocumentService(): Promise<DocumentService | undefined> {
    if (!this.status.initialized) {
      await this.initialize();
    }
    return this.documentService;
  }

  async getCalendarService(): Promise<CalendarService | undefined> {
    if (!this.status.initialized) {
      await this.initialize();
    }
    return this.calendarService;
  }

  async getTrustAccountingService(): Promise<TrustAccountingService | undefined> {
    if (!this.status.initialized) {
      await this.initialize();
    }
    return this.trustAccountingService;
  }

  async getConflictCheckService(): Promise<ConflictCheckService | undefined> {
    if (!this.status.initialized) {
      await this.initialize();
    }
    return this.conflictCheckService;
  }

  // Phase 4: AI Service Accessors
  async getContractAnalysisService(): Promise<ContractAnalysisService | undefined> {
    if (!this.status.initialized) {
      await this.initialize();
    }
    return this.contractAnalysisService;
  }

  async getLegalResearchService(): Promise<LegalResearchService | undefined> {
    if (!this.status.initialized) {
      await this.initialize();
    }
    return this.legalResearchService;
  }

  async getAIDocumentAutomationService(): Promise<AIDocumentAutomationService | undefined> {
    if (!this.status.initialized) {
      await this.initialize();
    }
    return this.aiDocumentAutomationService;
  }

  /**
   * Check if a feature is available (initialized)
   */
  isFeatureAvailable(featureId: LegalFeatureId): boolean {
    return this.status.activeFeatures.includes(featureId);
  }

  /**
   * Get legal-specific feature
   */
  getLegalFeature<T>(featureId: LegalFeatureId): T | undefined {
    return this.getFeature<T>(featureId);
  }

  /**
   * Get a feature service by ID
   */
  getFeature<T>(featureId: string): T | undefined {
    switch (featureId) {
      case 'matter-management':
        return this.matterService as T;
      case 'client-relationship':
        return this.clientService as T;
      case 'time-billing':
        return this.billingService as T;
      case 'document-assembly':
        return this.documentService as T;
      case 'calendar-deadlines':
        return this.calendarService as T;
      case 'trust-accounting':
        return this.trustAccountingService as T;
      case 'conflict-checking':
        return this.conflictCheckService as T;
      // Phase 4: AI Features
      case 'ai-contract-analysis':
        return this.contractAnalysisService as T;
      case 'ai-legal-research':
        return this.legalResearchService as T;
      case 'ai-document-automation':
        return this.aiDocumentAutomationService as T;
      default:
        return undefined;
    }
  }

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(featureId: string): boolean {
    switch (featureId) {
      case 'matter-management':
        return !!this.legalConfig.matterManagement;
      case 'client-relationship':
        return true; // Client service always enabled
      case 'time-billing':
        return !!this.legalConfig.timeBilling;
      case 'document-assembly':
        return !!this.legalConfig.documentManagement;
      case 'calendar-deadlines':
        return !!this.legalConfig.calendarIntegration;
      case 'trust-accounting':
        return !!this.legalConfig.trustAccounting;
      case 'conflict-checking':
        return !!this.legalConfig.conflictChecking;
      // Phase 4: AI Features
      case 'ai-contract-analysis':
        return !!this.legalConfig.aiContractAnalysis;
      case 'ai-legal-research':
        return !!this.legalConfig.aiLegalResearch;
      case 'ai-document-automation':
        return !!this.legalConfig.aiDocumentAutomation;
      default:
        return false;
    }
  }

  /**
   * Cleanup and dispose of all resources
   */
  async dispose(): Promise<void> {
    // Cleanup services if needed
    if (this.matterService?.dispose) {
      await this.matterService.dispose();
    }
    if (this.clientService?.dispose) {
      await this.clientService.dispose();
    }
    if (this.billingService?.dispose) {
      await this.billingService.dispose();
    }
    if (this.documentService?.dispose) {
      await this.documentService.dispose();
    }
    if (this.calendarService?.dispose) {
      await this.calendarService.dispose();
    }
    if (this.trustAccountingService?.dispose) {
      await this.trustAccountingService.dispose();
    }
    if (this.conflictCheckService?.dispose) {
      await this.conflictCheckService.dispose();
    }
  }

  /**
   * Register data resolvers for dashboard widgets
   */
  private registerDataResolvers(): void {
    // Register static data resolver for simple widgets
    this.dashboardEngine.registerDataResolver('static', {
      resolve: async (config, context) => ({
        widgetId: config.query || 'static',
        data: config.params || {},
        cachedAt: new Date(),
      }),
    });

    // Register entity resolver for database entities
    this.dashboardEngine.registerDataResolver('entity', {
      resolve: async (config, context) => ({
        widgetId: config.entity || 'entity',
        data: {
          entity: config.entity,
          filter: config.filter,
          storeId: context.storeId,
        },
        cachedAt: new Date(),
      }),
    });

    // Register analytics resolver
    this.dashboardEngine.registerDataResolver('analytics', {
      resolve: async (config, context) => ({
        widgetId: config.query || 'analytics',
        data: {
          query: config.query,
          params: config.params,
          storeId: context.storeId,
        },
        cachedAt: new Date(),
      }),
    });

    // Register realtime resolver
    this.dashboardEngine.registerDataResolver('realtime', {
      resolve: async (config, context) => ({
        widgetId: config.channel || 'realtime',
        data: {
          channel: config.channel,
          storeId: context.storeId,
        },
        cachedAt: new Date(),
      }),
    });
  }
}

export class LegalEngineFactory {
  static create(config?: LegalEngineConfig): LegalEngine {
    return new LegalEngine(config);
  }

  static createDefault(): LegalEngine {
    return new LegalEngine({
      matterManagement: true,
      timeBilling: true,
      documentManagement: true,
      calendarIntegration: true,
      trustAccounting: true,
      conflictChecking: true,
    });
  }
}

export function createDefaultLegalConfig(): LegalEngineConfig {
  return {
    matterManagement: true,
    timeBilling: true,
    documentManagement: true,
    calendarIntegration: true,
    trustAccounting: true,
    conflictChecking: true,
  };
}
