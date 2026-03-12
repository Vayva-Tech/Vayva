/**
 * Conflict Checking Feature Module
 */

import { ConflictCheckService } from '../services/conflict-check.service.js';

export class ConflictCheckingFeature {
  private service: ConflictCheckService;
  private initialized: boolean = false;

  constructor() {
    this.service = new ConflictCheckService();
  }

  async initialize(): Promise<void> {
    if (!this.initialized) {
      await this.service.initialize();
      this.initialized = true;
      console.log('[ConflictCheckingFeature] Initialized');
    }
  }

  async runConflictsCheck(data: any) {
    return this.service.runConflictsCheck(data);
  }

  async getPendingConflictsChecks(storeId: string) {
    return this.service.getPendingConflictsChecks(storeId);
  }

  async clearConflictsCheck(checkId: string, clearedBy: string, waiverReason?: string) {
    return this.service.clearConflictsCheck(checkId, clearedBy, waiverReason);
  }

  async generateConflictsReport(storeId: string, startDate: Date, endDate: Date) {
    return this.service.generateConflictsReport(storeId, startDate, endDate);
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async dispose(): Promise<void> {
    await this.service.dispose();
    this.initialized = false;
  }
}
