/**
 * Matter Management Feature Module
 */

import { MatterManagementService } from '../services/matter-management.service.js';

export class MatterManagementFeature {
  private service: MatterManagementService;
  private initialized: boolean = false;

  constructor() {
    this.service = new MatterManagementService();
  }

  async initialize(): Promise<void> {
    if (!this.initialized) {
      await this.service.initialize();
      this.initialized = true;
      console.log('[MatterManagementFeature] Initialized');
    }
  }

  async getCasesByPracticeArea(storeId: string) {
    return this.service.getCasesByPracticeArea(storeId);
  }

  async updateCaseStage(caseId: string, stage: string) {
    return this.service.updateCaseStage(caseId, stage);
  }

  async closeCase(caseId: string, reason?: string) {
    return this.service.closeCase(caseId, reason);
  }

  async getCaseWinRate(storeId: string, practiceAreaId?: string) {
    return this.service.getCaseWinRate(storeId, practiceAreaId);
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async dispose(): Promise<void> {
    await this.service.dispose();
    this.initialized = false;
  }
}
