/**
 * Guest List Manager Feature
 */

import { GuestListManagerService } from '../services/guest-list-manager.service.js';

export class GuestListManagerFeature {
  constructor(private service: GuestListManagerService) {}

  async initialize(): Promise<void> {
    await this.service.initialize();
  }

  addGuest(eventId: string, data: any) {
    return this.service.addGuest(eventId, data);
  }

  updateRSVP(eventId: string, guestId: string, status: any) {
    return this.service.updateRSVP(eventId, guestId, status);
  }

  getGuestList(eventId: string, filters?: any) {
    return this.service.getGuestList(eventId, filters);
  }

  getStatistics(eventId: string) {
    return this.service.getStatistics(eventId);
  }
}
