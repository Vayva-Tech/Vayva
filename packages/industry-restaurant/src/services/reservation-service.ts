// @ts-nocheck
/**
 * Reservation Management Service
 * 
 * Manages restaurant reservations including:
 * - Booking management
 * - Availability checking
 * - Table assignment
 * - Reminder automation
 */

import { Reservation, Table, TABLE_STATUS } from '../types';

export class ReservationService {
  private reservations: Map<string, Reservation>;
  private tables: Map<string, Table>;

  constructor() {
    this.reservations = new Map();
    this.tables = new Map();
  }

  // ============================================================================
  // RESERVATION CRUD
  // ============================================================================

  /**
   * Create new reservation
   */
  createReservation(
    data: Omit<Reservation, 'id' | 'confirmationNumber' | 'status' | 'createdAt' | 'updatedAt'>
  ): Reservation {
    const confirmationNumber = this.generateConfirmationNumber();
    
    const reservation: Reservation = {
      ...data,
      id: `res-${Date.now()}`,
      confirmationNumber,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.reservations.set(reservation.id, reservation);
    return reservation;
  }

  /**
   * Update reservation
   */
  updateReservation(
    reservationId: string,
    updates: Partial<Reservation>
  ): Reservation | null {
    const reservation = this.reservations.get(reservationId);
    if (!reservation) return null;

    Object.assign(reservation, {
      ...updates,
      updatedAt: new Date(),
    });

    this.reservations.set(reservationId, reservation);
    return reservation;
  }

  /**
   * Cancel reservation
   */
  cancelReservation(reservationId: string, reason?: string): Reservation | null {
    return this.updateReservation(reservationId, {
      status: 'cancelled',
      notes: reason ? `${this.reservations.get(reservationId)?.notes || ''}\nCancelled: ${reason}` : undefined,
    });
  }

  /**
   * Confirm reservation
   */
  confirmReservation(reservationId: string): Reservation | null {
    return this.updateReservation(reservationId, {
      status: 'confirmed',
    });
  }

  /**
   * Seat reservation (mark as seated)
   */
  seatReservation(reservationId: string, tableId: string): Reservation | null {
    const reservation = this.reservations.get(reservationId);
    if (!reservation) return null;

    // Assign table
    this.updateReservation(reservationId, {
      status: 'seated',
      tableId,
    });

    // Update table status
    const table = this.tables.get(tableId);
    if (table) {
      table.status = TABLE_STATUS.SEATED;
      table.currentParty = {
        size: reservation.partySize,
        seatedAt: new Date(),
        serverId: 'TBD',
      };
      this.tables.set(tableId, table);
    }

    return reservation;
  }

  // ============================================================================
  // AVAILABILITY MANAGEMENT
  // ============================================================================

  /**
   * Check availability for given date/time
   */
  checkAvailability(
    date: string,
    time: string,
    partySize: number
  ): { available: boolean; tables?: Table[]; waitTime?: number } {
    const reservations = this.getReservationsForDateTime(date, time);
    const availableTables = this.getAvailableTablesForParty(partySize, date, time);

    if (availableTables.length > 0) {
      return { available: true, tables: availableTables };
    }

    // Calculate wait time
    const waitTime = this.calculateWaitTime(date, time, partySize);
    return { available: false, waitTime };
  }

  /**
   * Get available time slots for a date
   */
  getAvailableSlots(date: string, partySize: number): Array<{
    time: string;
    available: boolean;
    tables: number;
  }> {
    const slots: Array<{ time: string; available: boolean; tables: number }> = [];
    const startHour = 17; // 5 PM
    const endHour = 22; // 10 PM

    for (let hour = startHour; hour < endHour; hour++) {
      for (const minute of ['00', '30']) {
        const time = `${hour.toString().padStart(2, '0')}:${minute}`;
        const availableTables = this.getAvailableTablesForParty(partySize, date, time);
        
        slots.push({
          time,
          available: availableTables.length > 0,
          tables: availableTables.length,
        });
      }
    }

    return slots;
  }

  // ============================================================================
  // TABLE ASSIGNMENT
  // ============================================================================

  /**
   * Auto-assign table to reservation
   */
  autoAssignTable(reservation: Reservation): Table | null {
    const availableTables = this.getAvailableTablesForParty(
      reservation.partySize,
      reservation.date,
      reservation.time
    );

    if (availableTables.length === 0) return null;

    // Find best fit (smallest table that fits party)
    const bestTable = availableTables.reduce((best, current) => {
      const bestDiff = best.capacity - reservation.partySize;
      const currentDiff = current.capacity - reservation.partySize;
      
      return currentDiff >= 0 && currentDiff < bestDiff ? current : best;
    });

    return bestTable;
  }

  /**
   * Manually assign table to reservation
   */
  assignTable(reservationId: string, tableId: string): Reservation | null {
    const table = this.tables.get(tableId);
    if (!table) return null;

    return this.updateReservation(reservationId, {
      tableId,
    });
  }

  // ============================================================================
  // REMINDERS & NOTIFICATIONS
  // ============================================================================

  /**
   * Send reservation reminders
   */
  sendReminders(hoursBefore: number = 2): Array<{
    reservationId: string;
    customerName: string;
    sent: boolean;
  }> {
    const now = new Date();
    const reminderTime = new Date(now.getTime() + hoursBefore * 60 * 60 * 1000);

    return this.getAllReservations()
      .filter((r) => {
        if (r.status !== 'confirmed' || r.remindersSent) return false;
        const resDateTime = new Date(`${r.date}T${r.time}`);
        const diffMs = Math.abs(resDateTime.getTime() - reminderTime.getTime());
        return diffMs < 30 * 60 * 1000; // Within 30 minutes
      })
      .map((r) => ({
        reservationId: r.id,
        customerName: r.customerName,
        sent: true, // Would actually send SMS/email
      }));
  }

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  /**
   * Get reservation statistics
   */
  getStatistics(dateRange: { start: Date; end: Date }): {
    totalReservations: number;
    confirmed: number;
    cancelled: number;
    noShows: number;
    avgPartySize: number;
    peakTimes: Array<{ time: string; count: number }>;
  } {
    const reservations = this.getAllReservations().filter((r) => {
      const resDate = new Date(r.date);
      return resDate >= dateRange.start && resDate <= dateRange.end;
    });

    const peakTimes = new Map<string, number>();
    reservations.forEach((r) => {
      const hour = r.time.split(':')[0] + ':00';
      peakTimes.set(hour, (peakTimes.get(hour) || 0) + 1);
    });

    return {
      totalReservations: reservations.length,
      confirmed: reservations.filter((r) => r.status === 'confirmed').length,
      cancelled: reservations.filter((r) => r.status === 'cancelled').length,
      noShows: reservations.filter((r) => r.status === 'no_show').length,
      avgPartySize: reservations.reduce((sum, r) => sum + r.partySize, 0) / reservations.length,
      peakTimes: Array.from(peakTimes.entries())
        .map(([time, count]) => ({ time, count }))
        .sort((a, b) => b.count - a.count),
    };
  }

  /**
   * Get deposit tracking
   */
  getDepositTracking(): {
    totalDeposits: number;
    collected: number;
    pending: number;
    refunded: number;
  } {
    const reservations = this.getAllReservations().filter((r) => r.depositAmount && r.depositAmount > 0);

    return {
      totalDeposits: reservations.reduce((sum, r) => sum + (r.depositAmount || 0), 0),
      collected: reservations
        .filter((r) => r.depositPaid)
        .reduce((sum, r) => sum + (r.depositAmount || 0), 0),
      pending: reservations
        .filter((r) => !r.depositPaid)
        .reduce((sum, r) => sum + (r.depositAmount || 0), 0),
      refunded: 0, // Would track separately
    };
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  setTables(tables: Table[]): void {
    tables.forEach((t) => this.tables.set(t.id, t));
  }

  getAllReservations(): Reservation[] {
    return Array.from(this.reservations.values());
  }

  getReservationById(id: string): Reservation | undefined {
    return this.reservations.get(id);
  }

  private getReservationsForDateTime(date: string, time: string): Reservation[] {
    return this.getAllReservations().filter(
      (r) => r.date === date && r.time === time && r.status === 'confirmed'
    );
  }

  private getAvailableTablesForParty(partySize: number, date: string, time: string): Table[] {
    const reservedTableIds = this.getReservationsForDateTime(date, time).map((r) => r.tableId);
    
    return Array.from(this.tables.values()).filter(
      (t) => t.capacity >= partySize && !reservedTableIds.includes(t.id)
    );
  }

  private calculateWaitTime(date: string, time: string, partySize: number): number {
    const upcomingReservations = this.getAllReservations()
      .filter((r) => {
        const resDateTime = new Date(`${r.date}T${r.time}`);
        const targetDateTime = new Date(`${date}T${time}`);
        return resDateTime > targetDateTime && r.status === 'confirmed';
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });

    if (upcomingReservations.length === 0) return 30;

    // Estimate based on next available slot
    return upcomingReservations.length * 30;
  }

  private generateConfirmationNumber(): string {
    return `RES-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }
}

// Export singleton instance
export const reservationService = new ReservationService();
