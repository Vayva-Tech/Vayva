// @ts-nocheck
/**
 * Events Industry Engine
 * Main orchestrator for all event management features
 */

import { DashboardEngine } from '@vayva/industry-core';

import { EventTimelineBuilderService } from './services/event-timeline-builder.service';
import { VendorCoordinatorService } from './services/vendor-coordinator.service';
import { SeatingChartDesignerService } from './services/seating-chart-designer.service';
import { GuestListManagerService } from './services/guest-list-manager.service';

import { EventTimelineBuilderFeature } from './features/event-timeline-builder.feature';
import { VendorCoordinatorFeature } from './features/vendor-coordinator.feature';
import { SeatingChartDesignerFeature } from './features/seating-chart-designer.feature';
import { GuestListManagerFeature } from './features/guest-list-manager.feature';

export interface EventsEngineConfig {
  timelineBuilder?: boolean;
  vendorCoordinator?: boolean;
  seatingDesigner?: boolean;
  guestListManager?: boolean;
}

export type EventsFeatureId = 
  | 'timeline-builder'
  | 'vendor-coordinator'
  | 'seating-designer'
  | 'guest-list-manager';

export class EventsEngine {
  private dashboardEngine: DashboardEngine;
  private config: EventsEngineConfig;
  
  // Services
  private timelineService?: EventTimelineBuilderService;
  private vendorService?: VendorCoordinatorService;
  private seatingService?: SeatingChartDesignerService;
  private guestService?: GuestListManagerService;

  // Features
  private timelineFeature?: EventTimelineBuilderFeature;
  private vendorFeature?: VendorCoordinatorFeature;
  private seatingFeature?: SeatingChartDesignerFeature;
  private guestFeature?: GuestListManagerFeature;

  constructor(config: EventsEngineConfig = {}) {
    this.config = {
      timelineBuilder: true,
      vendorCoordinator: true,
      seatingDesigner: true,
      guestListManager: true,
      ...config,
    };
    
    this.dashboardEngine = new DashboardEngine();
  }

  async initialize(): Promise<void> {
    try {
      if (this.config.timelineBuilder) {
        this.timelineService = new EventTimelineBuilderService();
        await this.timelineService.initialize();
        this.timelineFeature = new EventTimelineBuilderFeature(this.timelineService);
      }

      if (this.config.vendorCoordinator) {
        this.vendorService = new VendorCoordinatorService();
        await this.vendorService.initialize();
        this.vendorFeature = new VendorCoordinatorFeature(this.vendorService);
      }

      if (this.config.seatingDesigner) {
        this.seatingService = new SeatingChartDesignerService();
        await this.seatingService.initialize();
        this.seatingFeature = new SeatingChartDesignerFeature(this.seatingService);
      }

      if (this.config.guestListManager) {
        this.guestService = new GuestListManagerService();
        await this.guestService.initialize();
        this.guestFeature = new GuestListManagerFeature(this.guestService);
      }

      this.registerDataResolvers();
      console.log('[EVENTS_ENGINE] Initialized successfully');
    } catch (error) {
      console.error('[EVENTS_ENGINE] Initialization failed:', error);
      throw error;
    }
  }

  getDashboardEngine(): DashboardEngine {
    return this.dashboardEngine;
  }

  getFeature<T>(featureId: string): T | undefined {
    switch (featureId) {
      case 'timeline-builder':
        return this.timelineFeature as T;
      case 'vendor-coordinator':
        return this.vendorFeature as T;
      case 'seating-designer':
        return this.seatingFeature as T;
      case 'guest-list-manager':
        return this.guestFeature as T;
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

export class EventsEngineFactory {
  static create(config?: EventsEngineConfig): EventsEngine {
    return new EventsEngine(config);
  }

  static createDefault(): EventsEngine {
    return new EventsEngine({
      timelineBuilder: true,
      vendorCoordinator: true,
      seatingDesigner: true,
      guestListManager: true,
    });
  }
}

export function createDefaultEventsConfig(): EventsEngineConfig {
  return {
    timelineBuilder: true,
    vendorCoordinator: true,
    seatingDesigner: true,
    guestListManager: true,
  };
}
