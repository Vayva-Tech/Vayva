/**
 * Donor Management Feature
 */

import { DonorManagementService } from '../services/donor-management.service.js';

export class DonorManagementFeature {
  constructor(private service: DonorManagementService) {}

  async initialize(): Promise<void> {
    await this.service.initialize();
  }

  addDonor(data: any) {
    return this.service.addDonor(data);
  }

  recordDonation(data: any) {
    return this.service.recordDonation(data);
  }

  getStatistics() {
    return this.service.getStatistics();
  }
}
