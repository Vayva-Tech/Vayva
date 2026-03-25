/**
 * Grant Tracker Feature
 */

import type { Grant } from '../services/grant-tracker.service';
import { GrantTrackerService } from '../services/grant-tracker.service';

export class GrantTrackerFeature {
  constructor(private service: GrantTrackerService) {}

  async initialize(): Promise<void> {
    await this.service.initialize();
  }

  createGrant(data: any) {
    return this.service.createGrant(data);
  }

  updateGrantStatus(grantId: string, status: Grant['status']) {
    return this.service.updateGrantStatus(grantId, status);
  }

  getStatistics() {
    return this.service.getStatistics();
  }
}
