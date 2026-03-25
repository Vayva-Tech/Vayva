/**
 * Nightlife Event Promoter Service
 * Manages event promotion, guest lists, and VIP services
 */

import { z } from 'zod';

export interface Promotion {
  id: string;
  eventId: string;
  name: string;
  type: 'social-media' | 'email' | 'flyer' | 'influencer';
  budget: number;
  reach?: number;
  conversions?: number;
  startDate: Date;
  endDate: Date;
}

export interface GuestListEntry {
  id: string;
  eventId: string;
  name: string;
  phone: string;
  vipStatus: boolean;
  tableReservation?: boolean;
  bottlesPurchased?: number;
  checkedIn: boolean;
  checkInTime?: Date;
}

export interface PromotionConfig {
  enableSocialMedia?: boolean;
  enableEmailMarketing?: boolean;
  trackROI?: boolean;
}

const PromotionSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  name: z.string(),
  type: z.enum(['social-media', 'email', 'flyer', 'influencer']),
  budget: z.number().min(0),
  reach: z.number().optional(),
  conversions: z.number().optional(),
  startDate: z.date(),
  endDate: z.date(),
});

export class NightlifePromoterService {
  private promotions: Map<string, Promotion>;
  private guestLists: Map<string, GuestListEntry[]>;
  private config: PromotionConfig;

  constructor(config: PromotionConfig = {}) {
    this.config = {
      enableSocialMedia: true,
      enableEmailMarketing: true,
      trackROI: true,
      ...config,
    };
    this.promotions = new Map();
    this.guestLists = new Map();
  }

  async initialize(): Promise<void> {
    console.log('[NIGHTLIFE_PROMOTER] Initializing service...');
    console.log('[NIGHTLIFE_PROMOTER] Service initialized');
  }

  createPromotion(eventId: string, promotionData: Partial<Promotion>): Promotion {
    const promotion: Promotion = {
      ...promotionData,
      id: promotionData.id || `promo_${Date.now()}`,
      startDate: promotionData.startDate || new Date(),
      endDate: promotionData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    } as Promotion;

    PromotionSchema.parse(promotion);
    this.promotions.set(promotion.id, promotion);
    return promotion;
  }

  addToGuestList(eventId: string, entryData: Partial<GuestListEntry>): GuestListEntry {
    const list = this.guestLists.get(eventId) || [];
    
    const entry: GuestListEntry = {
      ...entryData,
      id: entryData.id || `guest_${Date.now()}`,
      checkedIn: false,
      vipStatus: entryData.vipStatus || false,
    } as GuestListEntry;

    list.push(entry);
    this.guestLists.set(eventId, list);
    return entry;
  }

  checkInGuest(eventId: string, guestId: string): boolean {
    const list = this.guestLists.get(eventId);
    if (!list) return false;

    const guest = list.find(g => g.id === guestId);
    if (!guest) return false;

    guest.checkedIn = true;
    guest.checkInTime = new Date();
    return true;
  }

  getEventGuestList(eventId: string): GuestListEntry[] {
    return this.guestLists.get(eventId) || [];
  }

  getPromotionStats(promotionId: string): {
    spend: number;
    reach: number;
    conversions: number;
    roi: number;
  } {
    const promo = this.promotions.get(promotionId);
    if (!promo) {
      return { spend: 0, reach: 0, conversions: 0, roi: 0 };
    }

    const roi = promo.reach && promo.conversions 
      ? ((promo.conversions - promo.budget) / promo.budget) * 100 
      : 0;

    return {
      spend: promo.budget,
      reach: promo.reach || 0,
      conversions: promo.conversions || 0,
      roi: Math.round(roi * 100) / 100,
    };
  }
}
