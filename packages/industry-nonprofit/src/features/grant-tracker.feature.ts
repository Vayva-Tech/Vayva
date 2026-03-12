/**
 * Grant Tracker Feature
 */

import { GrantTrackerService } from '../services/grant-tracker.service.js';

export class GrantTrackerFeature {
  constructor(private service: GrantTrackerService) {}

  async initialize(): Promise<void> {
    await this.service.initialize();
  }

  createGrant(data: any) {
    return this.service.createGrant(data);
  }

  updateGrantStatus(grantId: string, status: string) {
    return this.service.updateGrantStatus(grantId, status);
  }

  getStatistics() {
    return this.service.getStatistics();
  }
}
