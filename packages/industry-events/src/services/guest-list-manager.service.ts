/**
 * Guest List Manager Service
 * Manages event guest lists, invitations, and RSVP tracking
 */

import { z } from 'zod';

export interface GuestListEntry {
  id: string;
  eventId: string;
  guestName: string;
  email: string;
  phone?: string;
  plusOne?: boolean;
  plusOneName?: string;
  invitationSent: boolean;
  invitationSentAt?: Date;
  rsvpStatus: 'pending' | 'attending' | 'not-attending' | 'maybe';
  rsvpDate?: Date;
  mealPreference?: string;
  specialRequirements?: string;
  category: string; // family, friends, colleagues, etc.
}

export interface GuestListStats {
  total: number;
  invited: number;
  responded: number;
  attending: number;
  notAttending: number;
  maybe: number;
  pending: number;
  withPlusOnes: number;
}

export interface GuestListConfig {
  autoReminders?: boolean;
  reminderDaysBefore?: number;
  allowPlusOnes?: boolean;
  trackMealPreferences?: boolean;
}

const GuestListEntrySchema = z.object({
  id: z.string(),
  eventId: z.string(),
  guestName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  plusOne: z.boolean().optional(),
  plusOneName: z.string().optional(),
  invitationSent: z.boolean(),
  invitationSentAt: z.date().optional(),
  rsvpStatus: z.enum(['pending', 'attending', 'not-attending', 'maybe']),
  rsvpDate: z.date().optional(),
  mealPreference: z.string().optional(),
  specialRequirements: z.string().optional(),
  category: z.string(),
});

export class GuestListManagerService {
  private guestLists: Map<string, GuestListEntry[]>; // eventId -> entries
  private config: GuestListConfig;

  constructor(config: GuestListConfig = {}) {
    this.config = {
      autoReminders: true,
      reminderDaysBefore: 7,
      allowPlusOnes: true,
      trackMealPreferences: true,
      ...config,
    };
    this.guestLists = new Map();
  }

  async initialize(): Promise<void> {
    console.warn('[GUEST_LIST] Initializing service...');
    console.warn('[GUEST_LIST] Service initialized');
  }

  /**
   * Add guest to list
   */
  addGuest(eventId: string, guestData: Partial<GuestListEntry>): GuestListEntry {
    const list = this.guestLists.get(eventId) || [];
    
    const guest: GuestListEntry = {
      ...guestData,
      id: guestData.id || `guest_${Date.now()}`,
      invitationSent: guestData.invitationSent || false,
      rsvpStatus: guestData.rsvpStatus || 'pending',
      category: guestData.category || 'general',
    } as GuestListEntry;

    GuestListEntrySchema.parse(guest);
    list.push(guest);
    this.guestLists.set(eventId, list);
    
    return guest;
  }

  /**
   * Update RSVP status
   */
  updateRSVP(eventId: string, guestId: string, status: GuestListEntry['rsvpStatus']): boolean {
    const list = this.guestLists.get(eventId);
    if (!list) return false;

    const guest = list.find(g => g.id === guestId);
    if (!guest) return false;

    guest.rsvpStatus = status;
    guest.rsvpDate = new Date();
    
    return true;
  }

  /**
   * Mark invitation as sent
   */
  markInvitationSent(eventId: string, guestId: string): boolean {
    const list = this.guestLists.get(eventId);
    if (!list) return false;

    const guest = list.find(g => g.id === guestId);
    if (!guest) return false;

    guest.invitationSent = true;
    guest.invitationSentAt = new Date();
    
    return true;
  }

  /**
   * Get guest list for event
   */
  getGuestList(eventId: string, filters?: { 
    rsvpStatus?: string; 
    category?: string;
    hasPlusOne?: boolean;
  }): GuestListEntry[] {
    const list = this.guestLists.get(eventId) || [];
    
    if (!filters) return list;

    let filtered = list;
    if (filters.rsvpStatus) {
      filtered = filtered.filter(g => g.rsvpStatus === filters.rsvpStatus);
    }
    if (filters.category) {
      filtered = filtered.filter(g => g.category === filters.category);
    }
    if (filters.hasPlusOne !== undefined) {
      filtered = filtered.filter(g => !!g.plusOne === filters.hasPlusOne);
    }

    return filtered;
  }

  /**
   * Get statistics
   */
  getStatistics(eventId: string): GuestListStats {
    const list = this.guestLists.get(eventId) || [];
    
    return {
      total: list.length,
      invited: list.filter(g => g.invitationSent).length,
      responded: list.filter(g => g.rsvpStatus !== 'pending').length,
      attending: list.filter(g => g.rsvpStatus === 'attending').length,
      notAttending: list.filter(g => g.rsvpStatus === 'not-attending').length,
      maybe: list.filter(g => g.rsvpStatus === 'maybe').length,
      pending: list.filter(g => g.rsvpStatus === 'pending').length,
      withPlusOnes: list.filter(g => g.plusOne).length,
    };
  }

  /**
   * Get pending RSVPs
   */
  getPendingRSVPs(eventId: string): GuestListEntry[] {
    const list = this.guestLists.get(eventId) || [];
    return list.filter(g => g.rsvpStatus === 'pending' && g.invitationSent);
  }
}
