/**
 * Table Turn Service
 * Manages table status, reservations, and turn optimization
 */

import {
  type TableTurnConfig,
  type TableTurnTable,
  type TableReservation,
  type TableStatus,
  type WaitlistEntry,
  type TableTurnStats,
  type TableNotification,
  type NotificationChannel,
  type TablePreference,
} from '../../types/table.js';

export interface SeatTableRequest {
  tableId: string;
  partyName: string;
  partySize: number;
  phone?: string;
  email?: string;
  specialRequests?: string;
  serverId?: string;
  serverName?: string;
}

export interface UpdateTableStatusRequest {
  reservationId: string;
  status: TableStatus;
}

export class TableTurnService {
  private config: TableTurnConfig;
  private tables: Map<string, TableTurnTable> = new Map();
  private reservations: Map<string, TableReservation> = new Map();
  private waitlist: Map<string, WaitlistEntry> = new Map();
  private notifications: TableNotification[] = [];
  private listeners: Set<(event: TableTurnEvent) => void> = new Set();
  private historicalTurnTimes: Map<string, number[]> = new Map(); // tableId -> turn times

  constructor(config: TableTurnConfig) {
    this.config = config;
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    // Load tables, active reservations, and waitlist from database
  }

  /**
   * Register a table
   */
  registerTable(table: TableTurnTable): void {
    this.tables.set(table.id, table);
    if (!this.historicalTurnTimes.has(table.id)) {
      this.historicalTurnTimes.set(table.id, []);
    }
  }

  /**
   * Seat a party at a table
   */
  async seatTable(request: SeatTableRequest): Promise<TableReservation> {
    const table = this.tables.get(request.tableId);
    if (!table) throw new Error('Table not found');
    if (table.status !== 'available' && table.status !== 'reserved') {
      throw new Error('Table is not available');
    }

    const reservation: TableReservation = {
      id: this.generateId(),
      tableId: request.tableId,
      partyName: request.partyName,
      partySize: request.partySize,
      phone: request.phone,
      email: request.email,
      status: 'seated',
      seatedAt: new Date(),
      specialRequests: request.specialRequests,
      serverId: request.serverId,
      serverName: request.serverName,
      courseProgress: {
        currentCourse: 'appetizer',
        percentComplete: 0,
      },
    };

    this.reservations.set(reservation.id, reservation);

    // Update table status
    table.status = 'seated';
    table.currentReservation = reservation;

    this.emit({
      type: 'party_seated',
      tableId: request.tableId,
      reservationId: reservation.id,
      timestamp: new Date(),
    });

    return reservation;
  }

  /**
   * Update table status
   */
  async updateStatus(request: UpdateTableStatusRequest): Promise<TableReservation | undefined> {
    const reservation = this.reservations.get(request.reservationId);
    if (!reservation) return undefined;

    const oldStatus = reservation.status;
    reservation.status = request.status;
    const now = new Date();

    // Update timestamps and course progress
    switch (request.status) {
      case 'ordered':
        reservation.orderStartedAt = now;
        reservation.courseProgress.appetizerStarted = now;
        break;
      case 'eating':
        if (reservation.courseProgress.currentCourse === 'appetizer') {
          reservation.courseProgress.appetizerCompleted = now;
          reservation.courseProgress.entreeStarted = now;
          reservation.courseProgress.currentCourse = 'entree';
        }
        reservation.courseProgress.percentComplete = 25;
        break;
      case 'dessert':
        reservation.courseProgress.entreeCompleted = now;
        reservation.courseProgress.dessertStarted = now;
        reservation.courseProgress.currentCourse = 'dessert';
        reservation.courseProgress.percentComplete = 75;
        break;
      case 'check_dropped':
        reservation.checkDroppedAt = now;
        reservation.courseProgress.percentComplete = 90;
        break;
      case 'paid':
        reservation.paidAt = now;
        reservation.courseProgress.currentCourse = 'complete';
        reservation.courseProgress.percentComplete = 100;
        break;
      case 'cleaning':
        reservation.clearedAt = now;
        this.recordTurnTime(reservation);
        break;
    }

    // Update table status
    const table = this.tables.get(reservation.tableId);
    if (table) {
      table.status = request.status;
    }

    this.emit({
      type: 'status_changed',
      tableId: reservation.tableId,
      reservationId: reservation.id,
      oldStatus,
      newStatus: request.status,
      timestamp: now,
    });

    // Check for turn prediction and notifications
    if (request.status === 'paid' && this.config.autoNotifyWhenReady) {
      await this.scheduleTableReadyNotification(reservation);
    }

    return reservation;
  }

  /**
   * Mark table as available (after cleaning)
   */
  async clearTable(tableId: string): Promise<TableTurnTable | undefined> {
    const table = this.tables.get(tableId);
    if (!table) return undefined;

    table.status = 'available';
    table.currentReservation = undefined;

    // Check waitlist for suitable party
    if (this.config.waitlistIntegration) {
      const suitableParty = this.findSuitablePartyForTable(table);
      if (suitableParty) {
        await this.notifyWaitlistParty(suitableParty, table);
      }
    }

    this.emit({
      type: 'table_cleared',
      tableId,
      timestamp: new Date(),
    });

    return table;
  }

  /**
   * Add to waitlist
   */
  async addToWaitlist(
    partyName: string,
    partySize: number,
    phone: string,
    preferences: TablePreference[] = [],
    quotedWaitMinutes: number = 30
  ): Promise<WaitlistEntry> {
    const entry: WaitlistEntry = {
      id: this.generateId(),
      partyName,
      partySize,
      phone,
      quotedWaitMinutes,
      status: 'waiting',
      joinedAt: new Date(),
      preferences,
      quotedTime: new Date(Date.now() + quotedWaitMinutes * 60000),
    };

    this.waitlist.set(entry.id, entry);

    this.emit({
      type: 'waitlist_added',
      entryId: entry.id,
      timestamp: new Date(),
    });

    return entry;
  }

  /**
   * Seat from waitlist
   */
  async seatFromWaitlist(
    waitlistId: string,
    tableId: string,
    serverId?: string,
    serverName?: string
  ): Promise<{ reservation: TableReservation; entry: WaitlistEntry } | undefined> {
    const entry = this.waitlist.get(waitlistId);
    if (!entry) return undefined;

    entry.status = 'seated';
    entry.seatedAt = new Date();
    entry.actualWaitMinutes = Math.round(
      (entry.seatedAt.getTime() - entry.joinedAt.getTime()) / 60000
    );

    const reservation = await this.seatTable({
      tableId,
      partyName: entry.partyName,
      partySize: entry.partySize,
      phone: entry.phone,
      serverId,
      serverName,
    });

    return { reservation, entry };
  }

  /**
   * Get available tables
   */
  getAvailableTables(partySize?: number, section?: string): TableTurnTable[] {
    return Array.from(this.tables.values())
      .filter(table => {
        if (table.status !== 'available') return false;
        if (partySize && (table.minCapacity > partySize || table.maxCapacity < partySize)) return false;
        if (section && table.section !== section) return false;
        return true;
      })
      .sort((a, b) => a.capacity - b.capacity);
  }

  /**
   * Get table by ID
   */
  getTable(tableId: string): TableTurnTable | undefined {
    return this.tables.get(tableId);
  }

  /**
   * Get all tables
   */
  getAllTables(): TableTurnTable[] {
    return Array.from(this.tables.values());
  }

  /**
   * Get active reservations
   */
  getActiveReservations(): TableReservation[] {
    return Array.from(this.reservations.values())
      .filter(r => r.status !== 'cleaning' && !r.clearedAt)
      .sort((a, b) => (a.seatedAt?.getTime() || 0) - (b.seatedAt?.getTime() || 0));
  }

  /**
   * Get waitlist
   */
  getWaitlist(): WaitlistEntry[] {
    return Array.from(this.waitlist.values())
      .filter(e => e.status === 'waiting' || e.status === 'notified')
      .sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime());
  }

  /**
   * Get table turn stats
   */
  getStats(periodDays: number = 30): TableTurnStats {
    const cutoff = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
    const completedReservations = Array.from(this.reservations.values())
      .filter(r => r.clearedAt && r.clearedAt >= cutoff);

    const turnTimes = completedReservations
      .filter(r => r.seatedAt && r.clearedAt)
      .map(r => (r.clearedAt!.getTime() - r.seatedAt!.getTime()) / 60000);

    const avgTurnTime = turnTimes.length > 0
      ? turnTimes.reduce((a, b) => a + b, 0) / turnTimes.length
      : 0;

    const totalCovers = completedReservations.reduce((sum, r) => sum + r.partySize, 0);

    // Calculate peak hours
    const hourlyData = new Map<number, { turnTimes: number[]; count: number }>();
    for (const reservation of completedReservations) {
      if (!reservation.seatedAt) continue;
      const hour = reservation.seatedAt.getHours();
      const existing = hourlyData.get(hour) || { turnTimes: [], count: 0 };
      if (reservation.clearedAt) {
        existing.turnTimes.push(
          (reservation.clearedAt.getTime() - reservation.seatedAt.getTime()) / 60000
        );
      }
      existing.count++;
      hourlyData.set(hour, existing);
    }

    const peakHours = Array.from(hourlyData.entries())
      .map(([hour, data]) => ({
        hour,
        avgTurnTime: data.turnTimes.length > 0
          ? data.turnTimes.reduce((a, b) => a + b, 0) / data.turnTimes.length
          : 0,
        tableCount: data.count,
      }))
      .sort((a, b) => a.hour - b.hour);

    // Calculate utilization
    const totalTableHours = this.tables.size * 24 * periodDays;
    const occupiedHours = completedReservations
      .filter(r => r.seatedAt && r.clearedAt)
      .reduce((sum, r) => sum + (r.clearedAt!.getTime() - r.seatedAt!.getTime()) / 3600000, 0);
    const avgUtilization = totalTableHours > 0 ? (occupiedHours / totalTableHours) * 100 : 0;

    return {
      totalTurns: completedReservations.length,
      avgTurnTimeMinutes: Math.round(avgTurnTime),
      avgTableUtilization: Math.round(avgUtilization),
      totalCovers,
      avgPartySize: completedReservations.length > 0
        ? totalCovers / completedReservations.length
        : 0,
      peakHours,
    };
  }

  /**
   * Find best table for party
   */
  findBestTable(partySize: number, preferences: TablePreference[] = []): TableTurnTable | undefined {
    const available = this.getAvailableTables(partySize);
    if (available.length === 0) return undefined;

    if (!this.config.seatingOptimization || preferences.length === 0) {
      // Return smallest suitable table
      return available[0];
    }

    // Score tables based on preferences
    const scored = available.map(table => {
      let score = 0;
      for (const pref of preferences) {
        switch (pref.type) {
          case 'section':
            if (table.section === pref.value) score += pref.priority;
            break;
          case 'feature':
            if (table.features.includes(pref.value as any)) score += pref.priority;
            break;
          case 'size':
            if (table.shape === pref.value) score += pref.priority;
            break;
        }
      }
      // Prefer tables with lower avg turn time (faster turnover)
      score -= table.avgTurnTimeMinutes / 10;
      return { table, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.table;
  }

  /**
   * Get estimated wait time
   */
  getEstimatedWaitTime(partySize: number): number {
    const available = this.getAvailableTables(partySize);
    if (available.length > 0) return 0;

    // Find tables that will free up soon
    const activeReservations = this.getActiveReservations();
    if (activeReservations.length === 0) return 0;

    // Simple estimation based on average remaining time
    // In production, this would use the prediction engine
    const avgRemainingMinutes = 30; // Placeholder
    return avgRemainingMinutes;
  }

  /**
   * Subscribe to table turn events
   */
  subscribe(listener: (event: TableTurnEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private recordTurnTime(reservation: TableReservation): void {
    if (!reservation.seatedAt || !reservation.clearedAt) return;

    const turnTime = (reservation.clearedAt.getTime() - reservation.seatedAt.getTime()) / 60000;
    const history = this.historicalTurnTimes.get(reservation.tableId);
    if (history) {
      history.push(turnTime);
      // Keep last 100 turn times
      if (history.length > 100) {
        history.shift();
      }
    }

    // Update table's average
    const table = this.tables.get(reservation.tableId);
    if (table && history) {
      table.avgTurnTimeMinutes = Math.round(
        history.reduce((a, b) => a + b, 0) / history.length
      );
    }
  }

  private async scheduleTableReadyNotification(reservation: TableReservation): Promise<void> {
    // Calculate when table will be ready
    const readyTime = new Date(Date.now() + this.config.tableResetTimeMinutes * 60000);
    const notifyTime = new Date(readyTime.getTime() - this.config.readyNotificationLeadTime * 60000);

    // Schedule notification
    const delay = notifyTime.getTime() - Date.now();
    if (delay > 0) {
      setTimeout(() => {
        this.sendTableReadyNotification(reservation);
      }, delay);
    }
  }

  private async sendTableReadyNotification(reservation: TableReservation): Promise<void> {
    const table = this.tables.get(reservation.tableId);
    if (!table) return;

    for (const channel of this.config.notificationChannels) {
      const notification: TableNotification = {
        id: this.generateId(),
        tableId: reservation.tableId,
        type: 'table_ready',
        channel,
        recipient: '', // Would be set based on staff assignments
        message: `Table ${table.number} will be ready in ${this.config.readyNotificationLeadTime} minutes`,
        sent: false,
      };

      await this.sendNotification(notification);
    }
  }

  private findSuitablePartyForTable(table: TableTurnTable): WaitlistEntry | undefined {
    const waiting = this.getWaitlist();

    for (const entry of waiting) {
      if (entry.partySize >= table.minCapacity && entry.partySize <= table.maxCapacity) {
        // Check preferences
        const meetsPreferences = entry.preferences.every(pref => {
          switch (pref.type) {
            case 'section':
              return table.section === pref.value;
            case 'feature':
              return table.features.includes(pref.value as any);
            default:
              return true;
          }
        });

        if (meetsPreferences) {
          return entry;
        }
      }
    }

    return undefined;
  }

  private async notifyWaitlistParty(entry: WaitlistEntry, table: TableTurnTable): Promise<void> {
    entry.status = 'notified';
    entry.notifiedAt = new Date();

    for (const channel of this.config.notificationChannels) {
      const notification: TableNotification = {
        id: this.generateId(),
        tableId: table.id,
        type: 'waitlist_available',
        channel,
        recipient: entry.phone,
        message: `Your table is ready! Please arrive within 5 minutes.`,
        sent: false,
      };

      await this.sendNotification(notification);
    }

    this.emit({
      type: 'waitlist_notified',
      tableId: table.id,
      entryId: entry.id,
      timestamp: new Date(),
    });
  }

  private async sendNotification(notification: TableNotification): Promise<void> {
    // Implementation would integrate with SMS, push, pager systems
    notification.sent = true;
    notification.sentAt = new Date();
    this.notifications.push(notification);
  }

  private generateId(): string {
    return `tt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private emit(event: TableTurnEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in table turn event listener:', error);
      }
    }
  }
}

export interface TableTurnEvent {
  type: 'party_seated' | 'status_changed' | 'table_cleared' | 'waitlist_added' | 'waitlist_notified';
  tableId?: string;
  reservationId?: string;
  entryId?: string;
  oldStatus?: TableStatus;
  newStatus?: TableStatus;
  timestamp: Date;
}
