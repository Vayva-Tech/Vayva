/**
 * Event Seating Feature
 * High-level API for seating management
 */

import { EventSeatingService, Table, SeatingAssignment } from '../services/event-seating.service';

export class EventSeatingFeature {
  constructor(private service: EventSeatingService) {}

  async getTables(eventId: string): Promise<Table[]> {
    return this.service.getTablesForEvent(eventId);
  }

  async addTable(tableData: Partial<Table>): Promise<Table> {
    return this.service.createTable(tableData);
  }

  async assignGuest(guestId: string, tableId: string): Promise<boolean> {
    return this.service.assignGuestToTable(guestId, tableId);
  }

  async removeGuest(guestId: string, tableId: string): Promise<boolean> {
    return this.service.removeGuestFromTable(guestId, tableId);
  }

  async createAssignment(assignmentData: Partial<SeatingAssignment>): Promise<SeatingAssignment> {
    return this.service.createSeatingAssignment(assignmentData);
  }

  async getTableAvailability(tableId: string): Promise<{
    capacity: number;
    assigned: number;
    available: number;
    percentFull: number;
  }> {
    return this.service.getTableAvailability(tableId);
  }

  async getAssignmentsForTable(tableId: string): Promise<SeatingAssignment[]> {
    return this.service.getAssignmentsForTable(tableId);
  }

  async getUnassignedGuests(eventId: string, allGuestIds: string[]): Promise<string[]> {
    return this.service.getUnassignedGuests(eventId, allGuestIds);
  }

  async getMealCounts(eventId: string): Promise<Record<string, number>> {
    return this.service.getMealChoiceCounts(eventId);
  }

  async getStats(): Promise<{
    totalTables: number;
    totalCapacity: number;
    totalAssigned: number;
    averageOccupancy: number;
    emptySeats: number;
    tablesAtCapacity: number;
  }> {
    return this.service.getStatistics();
  }
}
