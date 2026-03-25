/**
 * Professional Services Industry Engine
 * Main orchestrator for all professional services-specific features
 */

import {
  DashboardEngine,
  type DashboardEngineConfig,
} from '@vayva/industry-core';

import {
  MatterService,
  ClientService,
  BillingService,
  DocumentService,
  CalendarService,
  TrustAccountingService,
  ConflictCheckService,
} from './services/index';

import { PROFESSIONAL_SERVICES_DASHBOARD_CONFIG } from './dashboard/professional-dashboard.config';

export interface ProfessionalEngineConfig {
  matterManagement?: boolean;
  timeBilling?: boolean;
  documentManagement?: boolean;
  calendarIntegration?: boolean;
  trustAccounting?: boolean;
  conflictChecking?: boolean;
}

export type ProfessionalFeatureId = 
  | 'matter-management'
  | 'client-relationship'
  | 'time-billing'
  | 'document-assembly'
  | 'calendar-deadlines'
  | 'trust-accounting'
  | 'conflict-checking'
  | 'business-development';

export interface ProfessionalEngineStatus {
  initialized: boolean;
  activeFeatures: ProfessionalFeatureId[];
  dashboardReady: boolean;
  servicesReady: boolean;
}

export class ProfessionalEngine {
  private dashboardEngine: DashboardEngine;
  private config: ProfessionalEngineConfig;
  private status: ProfessionalEngineStatus;
  private services: Map<string, any>;

  constructor(config?: ProfessionalEngineConfig) {
    this.config = {
      matterManagement: true,
      timeBilling: true,
      documentManagement: true,
      calendarIntegration: true,
      trustAccounting: true,
      conflictChecking: true,
      ...config,
    };

    this.status = {
      initialized: false,
      activeFeatures: [],
      dashboardReady: false,
      servicesReady: false,
    };

    this.services = new Map();
    this.dashboardEngine = new DashboardEngine();
    this.dashboardEngine.setConfig(PROFESSIONAL_SERVICES_DASHBOARD_CONFIG);
  }

  async initialize(tenantId: string): Promise<void> {
    try {
      // Initialize services based on config
      if (this.config.matterManagement) {
        this.services.set('matter', new MatterService());
        this.status.activeFeatures.push('matter-management');
      }

      if (this.config.timeBilling) {
        this.services.set('billing', new BillingService());
        this.status.activeFeatures.push('time-billing');
      }

      if (this.config.documentManagement) {
        this.services.set('document', new DocumentService());
        this.status.activeFeatures.push('document-assembly');
      }

      if (this.config.calendarIntegration) {
        this.services.set('calendar', new CalendarService());
        this.status.activeFeatures.push('calendar-deadlines');
      }

      if (this.config.trustAccounting) {
        this.services.set('trust', new TrustAccountingService());
        this.status.activeFeatures.push('trust-accounting');
      }

      if (this.config.conflictChecking) {
        this.services.set('conflict', new ConflictCheckService());
        this.status.activeFeatures.push('conflict-checking');
      }

      // Add client service always
      this.services.set('client', new ClientService());
      this.status.activeFeatures.push('client-relationship');

      this.status.servicesReady = true;
      this.status.initialized = true;

      // Register data resolvers for dashboard widgets
      this.registerDataResolvers();

      console.log(`[PROFESSIONAL_ENGINE] Initialized with ${this.status.activeFeatures.length} features`);
    } catch (error) {
      console.error('[PROFESSIONAL_ENGINE] Initialization failed:', error);
      throw error;
    }
  }

  getDashboardEngine(): DashboardEngine {
    return this.dashboardEngine;
  }

  getService<T>(serviceName: string): T | undefined {
    return this.services.get(serviceName) as T;
  }

  getStatus(): ProfessionalEngineStatus {
    return { ...this.status };
  }

  getActiveFeatures(): ProfessionalFeatureId[] {
    return [...this.status.activeFeatures];
  }

  // Feature-specific methods
  async getMatterService(): Promise<MatterService | undefined> {
    if (!this.status.initialized) {
      await this.initialize('');
    }
    return this.getService<MatterService>('matter');
  }

  async getClientService(): Promise<ClientService | undefined> {
    if (!this.status.initialized) {
      await this.initialize('');
    }
    return this.getService<ClientService>('client');
  }

  async getBillingService(): Promise<BillingService | undefined> {
    if (!this.status.initialized) {
      await this.initialize('');
    }
    return this.getService<BillingService>('billing');
  }

  async getDocumentService(): Promise<DocumentService | undefined> {
    if (!this.status.initialized) {
      await this.initialize('');
    }
    return this.getService<DocumentService>('document');
  }

  async getCalendarService(): Promise<CalendarService | undefined> {
    if (!this.status.initialized) {
      await this.initialize('');
    }
    return this.getService<CalendarService>('calendar');
  }

  async getTrustAccountingService(): Promise<TrustAccountingService | undefined> {
    if (!this.status.initialized) {
      await this.initialize('');
    }
    return this.getService<TrustAccountingService>('trust');
  }

  async getConflictCheckService(): Promise<ConflictCheckService | undefined> {
    if (!this.status.initialized) {
      await this.initialize('');
    }
    return this.getService<ConflictCheckService>('conflict');
  }

  /**
   * Check if a feature is available (initialized)
   */
  isFeatureAvailable(featureId: ProfessionalFeatureId): boolean {
    return this.status.activeFeatures.includes(featureId);
  }

  /**
   * Get a feature service by ID
   */
  getFeature<T>(featureId: string): T | undefined {
    switch (featureId) {
      case 'matter-management':
        return this.services.get('matter') as T;
      case 'client-relationship':
        return this.services.get('client') as T;
      case 'time-billing':
        return this.services.get('billing') as T;
      case 'document-assembly':
        return this.services.get('document') as T;
      case 'calendar-deadlines':
        return this.services.get('calendar') as T;
      case 'trust-accounting':
        return this.services.get('trust') as T;
      case 'conflict-checking':
        return this.services.get('conflict') as T;
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
        return !!this.config.matterManagement;
      case 'time-billing':
        return !!this.config.timeBilling;
      case 'document-assembly':
        return !!this.config.documentManagement;
      case 'calendar-deadlines':
        return !!this.config.calendarIntegration;
      case 'trust-accounting':
        return !!this.config.trustAccounting;
      case 'conflict-checking':
        return !!this.config.conflictChecking;
      default:
        return false;
    }
  }

  /**
   * Cleanup and dispose of all resources
   */
  async dispose(): Promise<void> {
    // Services don't require explicit cleanup
    this.services.clear();
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

  /**
   * Get comprehensive firm performance metrics
   */
  async getFirmPerformanceMetrics(tenantId: string): Promise<{
    activeMatters: number;
    utilizationRate: number;
    revenueMTD: number;
    collectionRate: number;
    realizationRate: number;
  }> {
    const billingService = await this.getBillingService();
    const matterService = await this.getMatterService();

    if (!matterService || !billingService) {
      return {
        activeMatters: 0,
        utilizationRate: 0,
        revenueMTD: 0,
        collectionRate: 0,
        realizationRate: 0,
      };
    }

    // Aggregate metrics from services
    return {
      activeMatters: 0, // Would call matterService.getActiveCount()
      utilizationRate: 0, // Would call billingService.calculateUtilization()
      revenueMTD: 0, // Would call billingService.getRevenueMTD()
      collectionRate: 0, // Would call billingService.getCollectionRate()
      realizationRate: 0, // Would call billingService.getRealizationRate()
    };
  }

  /**
   * Get client portfolio summary
   */
  async getClientPortfolioSummary(tenantId: string, clientId?: string): Promise<{
    totalClients: number;
    activeMatters: number;
    revenueYTD: number;
    topClients: Array<{ id: string; name: string; revenue: number }>;
  }> {
    const clientService = await this.getClientService();
    const matterService = await this.getMatterService();

    if (!clientService || !matterService) {
      return {
        totalClients: 0,
        activeMatters: 0,
        revenueYTD: 0,
        topClients: [],
      };
    }

    return {
      totalClients: 0,
      activeMatters: 0,
      revenueYTD: 0,
      topClients: [],
    };
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(tenantId: string): Promise<{
    conflictsPending: number;
    cleCompliance: Array<{ attorneyId: string; creditsEarned: number; creditsRequired: number }>;
    trustAccountBalance: number;
    overdueInvoices: number;
  }> {
    const conflictService = await this.getConflictCheckService();
    const trustService = await this.getTrustAccountingService();
    const billingService = await this.getBillingService();

    if (!conflictService || !trustService || !billingService) {
      return {
        conflictsPending: 0,
        cleCompliance: [],
        trustAccountBalance: 0,
        overdueInvoices: 0,
      };
    }

    return {
      conflictsPending: 0,
      cleCompliance: [],
      trustAccountBalance: 0,
      overdueInvoices: 0,
    };
  }

  /**
   * Export data for external reporting
   */
  async exportData(tenantId: string, exportType: 'matters' | 'clients' | 'billing' | 'documents'): Promise<Record<string, any>[]> {
    switch (exportType) {
      case 'matters': {
        const matterService = await this.getMatterService();
        if (!matterService) return [];
        return []; // Would call matterService.exportAll()
      }
      case 'clients': {
        const clientService = await this.getClientService();
        if (!clientService) return [];
        return []; // Would call clientService.exportAll()
      }
      case 'billing': {
        const billingService = await this.getBillingService();
        if (!billingService) return [];
        return []; // Would call billingService.exportTransactions()
      }
      case 'documents': {
        const documentService = await this.getDocumentService();
        if (!documentService) return [];
        return []; // Would call documentService.exportAll()
      }
      default:
        return [];
    }
  }

  /**
   * Get engine health summary
   */
  getHealthSummary(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    activeServices: number;
    enabledFeatures: number;
    dashboardReady: boolean;
    lastActivity?: Date;
  } {
    const status = this.getStatus();
    const activeServices = this.services.size;
    const enabledFeatures = status.activeFeatures.length;

    let healthStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (!status.initialized || activeServices === 0) {
      healthStatus = 'unhealthy';
    } else if (enabledFeatures < 3) {
      healthStatus = 'degraded';
    }

    return {
      status: healthStatus,
      activeServices,
      enabledFeatures,
      dashboardReady: status.dashboardReady,
      lastActivity: undefined,
    };
  }
}

export class ProfessionalEngineFactory {
  static create(config?: ProfessionalEngineConfig): ProfessionalEngine {
    return new ProfessionalEngine(config);
  }

  static createDefault(): ProfessionalEngine {
    return new ProfessionalEngine({
      matterManagement: true,
      timeBilling: true,
      documentManagement: true,
      calendarIntegration: true,
      trustAccounting: true,
      conflictChecking: true,
    });
  }
}

export function createDefaultProfessionalConfig(): ProfessionalEngineConfig {
  return {
    matterManagement: true,
    timeBilling: true,
    documentManagement: true,
    calendarIntegration: true,
    trustAccounting: true,
    conflictChecking: true,
  };
}
