/**
 * Education Industry Engine
 */

import { DashboardEngine, type DashboardEngineConfig } from '@vayva/industry-core';
import { EDUCATION_DASHBOARD_CONFIG } from './dashboard/index.js';

export interface EducationEngineConfig {
  courseManagement?: boolean;
  studentTracking?: boolean;
  gradebook?: boolean;
  attendance?: boolean;
  scheduling?: boolean;
}

export type EducationFeatureId = 'course-management' | 'student-tracking' | 'gradebook' | 'attendance' | 'scheduling';

export interface EducationEngineStatus {
  initialized: boolean;
  activeFeatures: EducationFeatureId[];
  dashboardReady: boolean;
  servicesReady: boolean;
}

export class EducationEngine {
  private dashboardEngine: DashboardEngine;
  private config: EducationEngineConfig;
  private status: EducationEngineStatus;

  constructor(config: EducationEngineConfig = {}) {
    this.config = { courseManagement: true, studentTracking: true, gradebook: true, attendance: true, scheduling: true, ...config };
    this.dashboardEngine = new DashboardEngine();
    this.dashboardEngine.setConfig(EDUCATION_DASHBOARD_CONFIG);
    this.status = { initialized: false, activeFeatures: [], dashboardReady: false, servicesReady: false };
  }

  async initialize(): Promise<void> {
    Object.entries(this.config).forEach(([key, value]) => {
      if (value) this.status.activeFeatures.push(key as EducationFeatureId);
    });
    this.status.servicesReady = true;
    this.status.initialized = true;
    this.status.dashboardReady = true;
    this.registerDataResolvers();
    console.log(`[EDUCATION_ENGINE] Initialized with ${this.status.activeFeatures.length} features`);
  }

  getDashboardEngine(): DashboardEngine { return this.dashboardEngine; }
  getStatus(): EducationEngineStatus { return { ...this.status }; }
  getActiveFeatures(): EducationFeatureId[] { return [...this.status.activeFeatures]; }
  isFeatureAvailable(featureId: EducationFeatureId): boolean { return this.status.activeFeatures.includes(featureId); }
  async dispose(): Promise<void> {}

  private registerDataResolvers(): void {
    this.dashboardEngine.registerDataResolver('static', { resolve: async (config, context) => ({ widgetId: config.query || 'static', data: config.params || {}, cachedAt: new Date() }) });
    this.dashboardEngine.registerDataResolver('entity', { resolve: async (config, context) => ({ widgetId: config.entity || 'entity', data: { entity: config.entity, filter: config.filter, storeId: context.storeId }, cachedAt: new Date() }) });
    this.dashboardEngine.registerDataResolver('analytics', { resolve: async (config, context) => ({ widgetId: config.query || 'analytics', data: { query: config.query, params: config.params, storeId: context.storeId }, cachedAt: new Date() }) });
    this.dashboardEngine.registerDataResolver('realtime', { resolve: async (config, context) => ({ widgetId: config.channel || 'realtime', data: { channel: config.channel, storeId: context.storeId }, cachedAt: new Date() }) });
  }
}

export class EducationEngineFactory {
  static create(config?: EducationEngineConfig): EducationEngine { return new EducationEngine(config); }
  static createDefault(): EducationEngine { return new EducationEngine({ courseManagement: true, studentTracking: true, gradebook: true, attendance: true, scheduling: true }); }
}

export function createDefaultEducationConfig(): EducationEngineConfig {
  return { courseManagement: true, studentTracking: true, gradebook: true, attendance: true, scheduling: true };
}
