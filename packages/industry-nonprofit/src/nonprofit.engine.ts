/**
 * Nonprofit Industry Engine
 * Main orchestrator for nonprofit features
 */

import { DashboardEngine } from '@vayva/industry-core';

import { DonorManagementService } from './services/donor-management.service';
import { CampaignManagerService } from './services/campaign-manager.service';
import { GrantTrackerService } from './services/grant-tracker.service';

import { DonorManagementFeature } from './features/donor-management.feature';
import { CampaignManagerFeature } from './features/campaign-manager.feature';
import { GrantTrackerFeature } from './features/grant-tracker.feature';

export interface NonprofitEngineConfig {
  donorManagement?: boolean;
  campaignManager?: boolean;
  grantTracker?: boolean;
}

export type NonprofitFeatureId = 'donor-management' | 'campaign-manager' | 'grant-tracker';

export class NonprofitEngine {
  private dashboardEngine: DashboardEngine;
  private config: NonprofitEngineConfig;
  
  private donorService?: DonorManagementService;
  private campaignService?: CampaignManagerService;
  private grantService?: GrantTrackerService;

  private donorFeature?: DonorManagementFeature;
  private campaignFeature?: CampaignManagerFeature;
  private grantFeature?: GrantTrackerFeature;

  constructor(config: NonprofitEngineConfig = {}) {
    this.config = {
      donorManagement: true,
      campaignManager: true,
      grantTracker: true,
      ...config,
    };
    
    this.dashboardEngine = new DashboardEngine();
  }

  async initialize(): Promise<void> {
    try {
      if (this.config.donorManagement) {
        this.donorService = new DonorManagementService();
        await this.donorService.initialize();
        this.donorFeature = new DonorManagementFeature(this.donorService);
      }

      if (this.config.campaignManager) {
        this.campaignService = new CampaignManagerService();
        await this.campaignService.initialize();
        this.campaignFeature = new CampaignManagerFeature(this.campaignService);
      }

      if (this.config.grantTracker) {
        this.grantService = new GrantTrackerService();
        await this.grantService.initialize();
        this.grantFeature = new GrantTrackerFeature(this.grantService);
      }

      this.registerDataResolvers();
      console.warn('[NONPROFIT_ENGINE] Initialized successfully');
    } catch (error) {
      console.error('[NONPROFIT_ENGINE] Initialization failed:', error);
      throw error;
    }
  }

  getDashboardEngine(): DashboardEngine {
    return this.dashboardEngine;
  }

  getFeature<T>(featureId: string): T | undefined {
    switch (featureId) {
      case 'donor-management':
        return this.donorFeature as T;
      case 'campaign-manager':
        return this.campaignFeature as T;
      case 'grant-tracker':
        return this.grantFeature as T;
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

export class NonprofitEngineFactory {
  static create(config?: NonprofitEngineConfig): NonprofitEngine {
    return new NonprofitEngine(config);
  }

  static createDefault(): NonprofitEngine {
    return new NonprofitEngine({
      donorManagement: true,
      campaignManager: true,
    });
  }
}

export function createDefaultNonprofitConfig(): NonprofitEngineConfig {
  return {
    donorManagement: true,
    campaignManager: true,
  };
}
