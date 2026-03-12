/**
 * Seating Chart Designer Service
 * Manages seating arrangements and table assignments
 */

import { z } from 'zod';

export interface Table {
  id: string;
  eventId: string;
  name: string;
  shape: 'round' | 'rectangular' | 'square' | 'custom';
  capacity: number;
  assignedGuests: string[]; // Guest IDs
  location?: { x: number; y: number };
  notes?: string;
}

export interface Guest {
  id: string;
  eventId: string;
  name: string;
  email?: string;
  rsvpStatus: 'pending' | 'confirmed' | 'declined';
  tableId?: string;
  dietaryRestrictions?: string[];
  groupAffiliation?: string; // e.g., "bride-family", "groom-friends"
}

export interface SeatingChart {
  id: string;
  eventId: string;
  name: string;
  tables: Table[];
  guests: Guest[];
  venueCapacity: number;
  layoutDimensions?: { width: number; height: number };
}

export interface SeatingConfig {
  enableAutoAssign?: boolean;
  groupPreferences?: boolean;
  optimizeCapacity?: boolean;
}

const TableSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  name: z.string(),
  shape: z.enum(['round', 'rectangular', 'square', 'custom']),
  capacity: z.number().min(1),
  assignedGuests: z.array(z.string()),
  location: z.object({ x: z.number(), y: z.number() }).optional(),
  notes: z.string().optional(),
});

export class SeatingChartDesignerService {
  private charts: Map<string, SeatingChart>;
  private config: SeatingConfig;

  constructor(config: SeatingConfig = {}) {
    this.config = {
      enableAutoAssign: false,
      groupPreferences: true,
      optimizeCapacity: true,
      ...config,
    };
    this.charts = new Map();
  }

  async initialize(): Promise<void> {
    console.log('[SEATING_DESIGNER] Initializing service...');
    console.log('[SEATING_DESIGNER] Service initialized');
  }

  /**
   * Create a seating chart
   */
  createSeatingChart(eventId: string, name: string, venueCapacity: number): SeatingChart {
    const chart: SeatingChart = {
      id: `seating_${Date.now()}`,
      eventId,
      name,
      tables: [],
      guests: [],
      venueCapacity,
    };

    this.charts.set(chart.id, chart);
    return chart;
  }

  /**
   * Add a table to the chart
   */
  addTable(chartId: string, tableData: Partial<Table>): Table {
    const chart = this.charts.get(chartId);
    if (!chart) throw new Error('Seating chart not found');

    const table: Table = {
      ...tableData,
      id: tableData.id || `table_${Date.now()}`,
      assignedGuests: tableData.assignedGuests || [],
    } as Table;

    TableSchema.parse(table);
    chart.tables.push(table);
    return table;
  }

  /**
   * Add a guest
   */
  addGuest(chartId: string, guestData: Partial<Guest>): Guest {
    const chart = this.charts.get(chartId);
    if (!chart) throw new Error('Seating chart not found');

    const guest: Guest = {
      ...guestData,
      id: guestData.id || `guest_${Date.now()}`,
      rsvpStatus: guestData.rsvpStatus || 'pending',
    } as Guest;

    chart.guests.push(guest);
    return guest;
  }

  /**
   * Assign guest to table
   */
  assignGuestToTable(chartId: string, guestId: string, tableId: string): boolean {
    const chart = this.charts.get(chartId);
    if (!chart) return false;

    const guest = chart.guests.find(g => g.id === guestId);
    const table = chart.tables.find(t => t.id === tableId);

    if (!guest || !table) return false;

    // Remove from previous table
    if (guest.tableId) {
      const prevTable = chart.tables.find(t => t.id === guest.tableId);
      if (prevTable) {
        prevTable.assignedGuests = prevTable.assignedGuests.filter(id => id !== guestId);
      }
    }

    // Check capacity
    if (table.assignedGuests.length >= table.capacity) {
      return false; // Table full
    }

    // Assign to new table
    guest.tableId = tableId;
    if (!table.assignedGuests.includes(guestId)) {
      table.assignedGuests.push(guestId);
    }

    return true;
  }

  /**
   * Get seating chart
   */
  getSeatingChart(chartId: string): SeatingChart | undefined {
    return this.charts.get(chartId);
  }

  /**
   * Get statistics
   */
  getStatistics(chartId: string): {
    totalTables: number;
    totalGuests: number;
    confirmedGuests: number;
    pendingRsvp: number;
    assignedGuests: number;
    unassignedGuests: number;
    totalCapacity: number;
    utilizationPercentage: number;
  } {
    const chart = this.charts.get(chartId);
    if (!chart) {
      return {
        totalTables: 0,
        totalGuests: 0,
        confirmedGuests: 0,
        pendingRsvp: 0,
        assignedGuests: 0,
        unassignedGuests: 0,
        totalCapacity: 0,
        utilizationPercentage: 0,
      };
    }

    const totalCapacity = chart.tables.reduce((sum, t) => sum + t.capacity, 0);
    const assignedGuests = chart.guests.filter(g => g.tableId).length;

    return {
      totalTables: chart.tables.length,
      totalGuests: chart.guests.length,
      confirmedGuests: chart.guests.filter(g => g.rsvpStatus === 'confirmed').length,
      pendingRsvp: chart.guests.filter(g => g.rsvpStatus === 'pending').length,
      assignedGuests,
      unassignedGuests: chart.guests.length - assignedGuests,
      totalCapacity,
      utilizationPercentage: totalCapacity > 0 ? Math.round((assignedGuests / totalCapacity) * 100) : 0,
    };
  }
}
