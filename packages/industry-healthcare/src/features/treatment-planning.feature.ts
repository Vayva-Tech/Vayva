/**
 * Treatment Planning Feature Module
 */

import { TreatmentPlanService, TreatmentPlanData, TreatmentGoal } from '../services/treatment-plan-service.js';

export interface TreatmentPlanningConfig {
  enableGoalTracking: boolean;
  enableProgressNotes: boolean;
  defaultReviewPeriodDays: number;
}

export class TreatmentPlanningFeature {
  private service: TreatmentPlanService;
  private config: TreatmentPlanningConfig;
  private initialized: boolean = false;

  constructor(config: TreatmentPlanningConfig = {
    enableGoalTracking: true,
    enableProgressNotes: true,
    defaultReviewPeriodDays: 30,
  }) {
    this.config = config;
    this.service = new TreatmentPlanService();
  }

  async initialize(): Promise<void> {
    if (!this.initialized) {
      await this.service.initialize();
      this.initialized = true;
      console.log('[TreatmentPlanningFeature] Initialized');
    }
  }

  async createTreatmentPlan(planData: TreatmentPlanData): Promise<any> {
    return this.service.createTreatmentPlan(planData);
  }

  async getTreatmentPlan(planId: string): Promise<any> {
    return this.service.getTreatmentPlan(planId);
  }

  async updateTreatmentPlan(planId: string, updates: Partial<TreatmentPlanData>): Promise<any> {
    return this.service.updateTreatmentPlan(planId, updates);
  }

  async addGoal(planId: string, goal: TreatmentGoal): Promise<any> {
    return this.service.addGoal(planId, goal);
  }

  async trackProgress(planId: string, notes: string, outcomes?: string[]): Promise<any> {
    return this.service.trackProgress(planId, notes, outcomes);
  }

  async archivePlan(planId: string, reason: string): Promise<any> {
    return this.service.archivePlan(planId, reason);
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async dispose(): Promise<void> {
    await this.service.dispose();
    this.initialized = false;
  }
}
