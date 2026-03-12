/**
 * Event Guest List Service
 * Manages guest lists, RSVPs, and attendance tracking
 */

import { z } from 'zod';

export interface Guest {
  id: string;
  eventId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  plusOne: boolean;
  plusOneName?: string;
  rsvpStatus: 'pending' | 'accepted' | 'declined' | 'waitlist';
  rsvpDate?: Date;
  mealPreference?: 'chicken' | 'fish' | 'vegetarian' | 'vegan' | 'other';
  dietaryRestrictions?: string[];
  tableAssignment?: string;
  notes?: string;
  invitationSent: boolean;
  reminderSent: boolean;
}

export interface GuestCategory {
  id: string;
  eventId: string;
  name: string; // e.g., "Family", "Friends", "Colleagues", "VIP"
  guestIds: string[];
  priority: number; // For seating priority
}

export interface GuestListConfig {
  enableAutoReminders?: boolean;
  trackDietaryRestrictions?: boolean;
  allowPlusOnes?: boolean;
}

const GuestSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  plusOne: z.boolean(),
  plusOneName: z.string().optional(),
  rsvpStatus: z.enum(['pending', 'accepted', 'declined', 'waitlist']),
  rsvpDate: z.date().optional(),
  mealPreference: z.enum(['chicken', 'fish', 'vegetarian', 'vegan', 'other']).optional(),
  dietaryRestrictions: z.array(z.string()).optional(),
  tableAssignment: z.string().optional(),
  notes: z.string().optional(),
  invitationSent: z.boolean(),
  reminderSent: z.boolean(),
});

export class EventGuestListService {
  private guests: Map<string, Guest>;
  private categories: Map<string, GuestCategory>;
  private config: GuestListConfig;

  constructor(config: GuestListConfig = {}) {
    this.config = {
      enableAutoReminders: true,
      trackDietaryRestrictions: true,
      allowPlusOnes: true,
      ...config,
    };
    this.guests = new Map();
    this.categories = new Map();
  }

  async initialize(): Promise<void> {
    console.log('[EVENT_GUEST] Initializing service...');
    this.initializeSampleData();
    console.log('[EVENT_GUEST] Service initialized');
  }

  private initializeSampleData(): void {
    const sampleGuests: Guest[] = [
      {
        id: 'g1',
        eventId: 'event1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0201',
        plusOne: true,
        plusOneName: 'Jane Smith',
        rsvpStatus: 'accepted',
        rsvpDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        mealPreference: 'chicken',
        dietaryRestrictions: [],
        invitationSent: true,
        reminderSent: true,
      },
      {
        id: 'g2',
        eventId: 'event1',
        firstName: 'Emily',
        lastName: 'Johnson',
        email: 'emily.j@email.com',
        phone: '+1-555-0202',
        plusOne: false,
        rsvpStatus: 'accepted',
        rsvpDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        mealPreference: 'vegetarian',
        dietaryRestrictions: ['gluten-free'],
        invitationSent: true,
        reminderSent: false,
      },
      {
        id: 'g3',
        eventId: 'event1',
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.b@email.com',
        plusOne: true,
        rsvpStatus: 'pending',
        invitationSent: true,
        reminderSent: false,
      },
      {
        id: 'g4',
        eventId: 'event1',
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'sarah.w@email.com',
        plusOne: false,
        rsvpStatus: 'declined',
        rsvpDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        invitationSent: true,
        reminderSent: false,
      },
    ];

    const sampleCategories: GuestCategory[] = [
      {
        id: 'cat1',
        eventId: 'event1',
        name: 'Family',
        guestIds: ['g1', 'g2'],
        priority: 1,
      },
      {
        id: 'cat2',
        eventId: 'event1',
        name: 'Friends',
        guestIds: ['g3'],
        priority: 2,
      },
      {
        id: 'cat3',
        eventId: 'event1',
        name: 'Colleagues',
        guestIds: ['g4'],
        priority: 3,
      },
    ];

    sampleGuests.forEach(guest => this.guests.set(guest.id, guest));
    sampleCategories.forEach(category => this.categories.set(category.id, category));
  }

  createGuest(guestData: Partial<Guest>): Guest {
    const guest: Guest = {
      ...guestData,
      id: guestData.id || `g_${Date.now()}`,
      rsvpStatus: guestData.rsvpStatus || 'pending',
      invitationSent: guestData.invitationSent || false,
      reminderSent: guestData.reminderSent || false,
      plusOne: guestData.plusOne || false,
    } as Guest;

    GuestSchema.parse(guest);
    this.guests.set(guest.id, guest);
    return guest;
  }

  updateRSVP(guestId: string, status: Guest['rsvpStatus'], mealPreference?: Guest['mealPreference']): boolean {
    const guest = this.guests.get(guestId);
    if (!guest) return false;

    guest.rsvpStatus = status;
    guest.rsvpDate = new Date();
    
    if (mealPreference) {
      guest.mealPreference = mealPreference;
    }

    return true;
  }

  sendInvitation(guestId: string): boolean {
    const guest = this.guests.get(guestId);
    if (!guest) return false;

    guest.invitationSent = true;
    return true;
  }

  markReminderSent(guestId: string): boolean {
    const guest = this.guests.get(guestId);
    if (!guest) return false;

    guest.reminderSent = true;
    return true;
  }

  getGuestsForEvent(eventId: string): Guest[] {
    return Array.from(this.guests.values()).filter(g => g.eventId === eventId);
  }

  getGuestsByRSVPStatus(eventId: string, status: Guest['rsvpStatus']): Guest[] {
    return this.getGuestsForEvent(eventId).filter(g => g.rsvpStatus === status);
  }

  getPendingRSVPs(eventId: string): Guest[] {
    return this.getGuestsByRSVPStatus(eventId, 'pending');
  }

  getConfirmedAttendees(eventId: string): Guest[] {
    return this.getGuestsByRSVPStatus(eventId, 'accepted');
  }

  getTotalHeadcount(eventId: string): {
    guests: number;
    plusOnes: number;
    total: number;
  } {
    const attendees = this.getConfirmedAttendees(eventId);
    const guests = attendees.length;
    const plusOnes = attendees.filter(g => g.plusOne).length;

    return {
      guests,
      plusOnes,
      total: guests + plusOnes,
    };
  }

  getMealPreferenceCounts(eventId: string): Record<string, number> {
    const attendees = this.getConfirmedAttendees(eventId);
    const counts: Record<string, number> = {};

    attendees.forEach(g => {
      if (g.mealPreference) {
        counts[g.mealPreference] = (counts[g.mealPreference] || 0) + 1;
      }
      if (g.plusOne && g.plusOneName) {
        // Count plus-one meals (assume same as guest for simplicity)
        if (g.mealPreference) {
          counts[g.mealPreference] = (counts[g.mealPreference] || 0) + 1;
        }
      }
    });

    return counts;
  }

  getDietaryRestrictionsAlert(eventId: string): Array<{ guestName: string; restrictions: string[] }> {
    const attendees = this.getConfirmedAttendees(eventId);
    return attendees
      .filter(g => g.dietaryRestrictions && g.dietaryRestrictions.length > 0)
      .map(g => ({
        guestName: `${g.firstName} ${g.lastName}`,
        restrictions: g.dietaryRestrictions!,
      }));
  }

  createCategory(categoryData: Partial<GuestCategory>): GuestCategory {
    const category: GuestCategory = {
      ...categoryData,
      id: categoryData.id || `cat_${Date.now()}`,
      guestIds: categoryData.guestIds || [],
      priority: categoryData.priority || 0,
    } as GuestCategory;

    this.categories.set(category.id, category);
    return category;
  }

  addGuestToCategory(categoryId: string, guestId: string): boolean {
    const category = this.categories.get(categoryId);
    if (!category) return false;

    if (!category.guestIds.includes(guestId)) {
      category.guestIds.push(guestId);
    }

    return true;
  }

  getStatistics(): {
    totalInvited: number;
    confirmed: number;
    declined: number;
    pending: number;
    waitlisted: number;
    totalHeadcount: number;
    invitationsSent: number;
    remindersNeeded: number;
    responseRate: number;
  } {
    const allGuests = Array.from(this.guests.values());
    const confirmed = this.getGuestsByRSVPStatus('event1', 'accepted');
    const declined = this.getGuestsByRSVPStatus('event1', 'declined');
    const pending = this.getGuestsByRSVPStatus('event1', 'pending');
    const waitlisted = this.getGuestsByRSVPStatus('event1', 'waitlist');
    const invitationsSent = allGuests.filter(g => g.invitationSent).length;
    const remindersNeeded = allGuests.filter(g => 
      g.rsvpStatus === 'pending' && !g.reminderSent
    ).length;

    const responded = confirmed.length + declined.length;
    const responseRate = allGuests.length > 0 ? (responded / allGuests.length) * 100 : 0;

    const headcount = this.getTotalHeadcount('event1');

    return {
      totalInvited: allGuests.length,
      confirmed: confirmed.length,
      declined: declined.length,
      pending: pending.length,
      waitlisted: waitlisted.length,
      totalHeadcount: headcount.total,
      invitationsSent,
      remindersNeeded,
      responseRate,
    };
  }
}
