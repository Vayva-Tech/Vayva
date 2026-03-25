/**
 * Nightlife Industry Engine
 * Main orchestrator for nightlife features
 */

import { DashboardEngine } from '@vayva/industry-core';

import { NightlifePromoterService } from './services/nightlife-promoter.service';
import { TableReservationManagerService } from './services/table-reservation-manager.service';
import { BottleServiceManagerService } from './services/bottle-service-manager.service';
import { EventAnalyticsService } from './services/event-analytics.service';

import { NightlifePromoterFeature } from './features/nightlife-promoter.feature';
import { TableReservationFeature } from './features/table-reservation.feature';
import { BottleServiceManagerFeature } from './features/bottle-service-manager.feature';
import { EventAnalyticsFeature } from './features/event-analytics.feature';

export interface NightlifeEngineConfig {
  promoter?: boolean;
  tableReservations?: boolean;
  bottleService?: boolean;
  analytics?: boolean;
}

export type NightlifeFeatureId = 'promoter' | 'table-reservations' | 'bottle-service' | 'analytics';

export class NightlifeEngine {
  private dashboardEngine: DashboardEngine;
  private config: NightlifeEngineConfig;
  
  private promoterService?: NightlifePromoterService;
  private tableService?: TableReservationManagerService;
  private bottleService?: BottleServiceManagerService;
  private analyticsService?: EventAnalyticsService;

  private promoterFeature?: NightlifePromoterFeature;
  private tableFeature?: TableReservationFeature;
  private bottleFeature?: BottleServiceManagerFeature;
  private analyticsFeature?: EventAnalyticsFeature;

  constructor(config: NightlifeEngineConfig = {}) {
    this.config = {
      promoter: true,
      tableReservations: true,
      bottleService: true,
      analytics: true,
      ...config,
    };
    
    this.dashboardEngine = new DashboardEngine();
  }

  async initialize(): Promise<void> {
    try {
      if (this.config.promoter) {
        this.promoterService = new NightlifePromoterService();
        await this.promoterService.initialize();
        this.promoterFeature = new NightlifePromoterFeature(this.promoterService);
      }

      if (this.config.tableReservations) {
        this.tableService = new TableReservationManagerService();
        await this.tableService.initialize();
        this.tableFeature = new TableReservationFeature(this.tableService);
      }

      if (this.config.bottleService) {
        this.bottleService = new BottleServiceManagerService();
        await this.bottleService.initialize();
        this.bottleFeature = new BottleServiceManagerFeature(this.bottleService);
      }

      if (this.config.analytics) {
        this.analyticsService = new EventAnalyticsService();
        await this.analyticsService.initialize();
        this.analyticsFeature = new EventAnalyticsFeature(this.analyticsService);
      }

      this.registerDataResolvers();
      console.log('[NIGHTLIFE_ENGINE] Initialized successfully');
    } catch (error) {
      console.error('[NIGHTLIFE_ENGINE] Initialization failed:', error);
      throw error;
    }
  }

  getDashboardEngine(): DashboardEngine {
    return this.dashboardEngine;
  }

  getFeature<T>(featureId: string): T | undefined {
    switch (featureId) {
      case 'promoter':
        return this.promoterFeature as T;
      case 'table-reservations':
        return this.tableFeature as T;
      case 'bottle-service':
        return this.bottleFeature as T;
      case 'analytics':
        return this.analyticsFeature as T;
      default:
        return undefined;
    }
  }

  private registerDataResolvers(): void {
    this.dashboardEngine.registerDataResolver('static', {
      resolve: async (config, context) => ({
        widgetId: config.query || 'static',
        data: config.params || {},
        cachedAt: new Date(),
      }),
    });
  }
}

export class NightlifeEngineFactory {
  static create(config?: NightlifeEngineConfig): NightlifeEngine {
    return new NightlifeEngine(config);
  }

  static createDefault(): NightlifeEngine {
    return new NightlifeEngine({
      promoter: true,
      tableReservations: true,
    });
  }
}

export function createDefaultNightlifeConfig(): NightlifeEngineConfig {
  return {
    promoter: true,
    tableReservations: true,
  };
}
