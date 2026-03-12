/**
 * Event Guest List Feature
 * High-level API for guest list management
 */

import { EventGuestListService, Guest, GuestCategory } from '../services/event-guest-list.service';

export class EventGuestListFeature {
  constructor(private service: EventGuestListService) {}

  async getGuests(eventId: string): Promise<Guest[]> {
    return this.service.getGuestsForEvent(eventId);
  }

  async addGuest(guestData: Partial<Guest>): Promise<Guest> {
    return this.service.createGuest(guestData);
  }

  async updateRSVP(guestId: string, status: Guest['rsvpStatus'], mealPreference?: Guest['mealPreference']): Promise<boolean> {
    return this.service.updateRSVP(guestId, status, mealPreference);
  }

  async sendInvitation(guestId: string): Promise<boolean> {
    return this.service.sendInvitation(guestId);
  }

  async markReminderSent(guestId: string): Promise<boolean> {
    return this.service.markReminderSent(guestId);
  }

  async getPendingRSVPs(eventId: string): Promise<Guest[]> {
    return this.service.getPendingRSVPs(eventId);
  }

  async getConfirmedAttendees(eventId: string): Promise<Guest[]> {
    return this.service.getConfirmedAttendees(eventId);
  }

  async getTotalHeadcount(eventId: string): Promise<{
    guests: number;
    plusOnes: number;
    total: number;
  }> {
    return this.service.getTotalHeadcount(eventId);
  }

  async getMealCounts(eventId: string): Promise<Record<string, number>> {
    return this.service.getMealPreferenceCounts(eventId);
  }

  async getDietaryAlerts(eventId: string): Promise<Array<{ guestName: string; restrictions: string[] }>> {
    return this.service.getDietaryRestrictionsAlert(eventId);
  }

  async createCategory(categoryData: Partial<GuestCategory>): Promise<GuestCategory> {
    return this.service.createCategory(categoryData);
  }

  async addGuestToCategory(categoryId: string, guestId: string): Promise<boolean> {
    return this.service.addGuestToCategory(categoryId, guestId);
  }

  async getStats(): Promise<{
    totalInvited: number;
    confirmed: number;
    declined: number;
    pending: number;
    waitlisted: number;
    totalHeadcount: number;
    invitationsSent: number;
    remindersNeeded: number;
    responseRate: number;
  }> {
    return this.service.getStatistics();
  }
}
