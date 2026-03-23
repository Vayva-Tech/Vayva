// @ts-nocheck
/**
 * Nightlife Promoter Feature
 */

import { NightlifePromoterService } from '../services/nightlife-promoter.service.js';

export class NightlifePromoterFeature {
  constructor(private service: NightlifePromoterService) {}

  async initialize(): Promise<void> {
    await this.service.initialize();
  }

  createPromotion(eventId: string, data: any) {
    return this.service.createPromotion(eventId, data);
  }

  addToGuestList(eventId: string, data: any) {
    return this.service.addToGuestList(eventId, data);
  }

  checkInGuest(eventId: string, guestId: string) {
    return this.service.checkInGuest(eventId, guestId);
  }

  getPromotionStats(promotionId: string) {
    return this.service.getPromotionStats(promotionId);
  }
}
