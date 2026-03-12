/**
 * Vendor Coordinator Feature
 */

import { VendorCoordinatorService } from '../services/vendor-coordinator.service.js';

export class VendorCoordinatorFeature {
  constructor(private service: VendorCoordinatorService) {}

  async initialize(): Promise<void> {
    await this.service.initialize();
  }

  addVendor(data: any) {
    return this.service.addVendor(data);
  }

  createContract(data: any) {
    return this.service.createContract(data);
  }

  getVendorsByEvent(eventId: string, filters?: any) {
    return this.service.getVendorsByEvent(eventId, filters);
  }

  getStatistics(eventId: string) {
    return this.service.getStatistics(eventId);
  }
}
