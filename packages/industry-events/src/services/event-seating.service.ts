/**
 * Event Seating Service
 * Manages table assignments, seating charts, and guest placement
 */

import { z } from 'zod';

export interface Table {
  id: string;
  eventId: string;
  name: string; // e.g., "Table 1", "Head Table"
  type: 'round' | 'rectangular' | 'head' | 'sweetheart' | 'other';
  capacity: number;
  assignedGuests: string[]; // Guest IDs
  location?: string;
  notes?: string;
}

export interface SeatingAssignment {
  id: string;
  eventId: string;
  guestId: string;
  tableId: string;
  seatNumber?: number;
  mealChoice?: 'chicken' | 'fish' | 'vegetarian' | 'vegan' | 'other';
  dietaryRestrictions?: string[];
}

export interface SeatingConfig {
  enableAutoAssignment?: boolean;
  trackMealChoices?: boolean;
  enforceCapacityLimits?: boolean;
}

const TableSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  name: z.string(),
  type: z.enum(['round', 'rectangular', 'head', 'sweetheart', 'other']),
  capacity: z.number().min(1),
  assignedGuests: z.array(z.string()),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export class EventSeatingService {
  private tables: Map<string, Table>;
  private assignments: Map<string, SeatingAssignment>;
  private config: SeatingConfig;

  constructor(config: SeatingConfig = {}) {
    this.config = {
      enableAutoAssignment: false,
      trackMealChoices: true,
      enforceCapacityLimits: true,
      ...config,
    };
    this.tables = new Map();
    this.assignments = new Map();
  }

  async initialize(): Promise<void> {
    console.log('[EVENT_SEATING] Initializing service...');
    this.initializeSampleData();
    console.log('[EVENT_SEATING] Service initialized');
  }

  private initializeSampleData(): void {
    const sampleTables: Table[] = [
      {
        id: 't1',
        eventId: 'event1',
        name: 'Head Table',
        type: 'head',
        capacity: 10,
        assignedGuests: ['g1', 'g2', 'g3', 'g4'],
        location: 'Front Center',
      },
      {
        id: 't2',
        eventId: 'event1',
        name: 'Table 1',
        type: 'round',
        capacity: 8,
        assignedGuests: ['g5', 'g6', 'g7'],
        location: 'Left Side',
      },
      {
        id: 't3',
        eventId: 'event1',
        name: 'Table 2',
        type: 'round',
        capacity: 8,
        assignedGuests: ['g8', 'g9', 'g10', 'g11', 'g12'],
        location: 'Right Side',
      },
    ];

    const sampleAssignments: SeatingAssignment[] = [
      {
        id: 'sa1',
        eventId: 'event1',
        guestId: 'g1',
        tableId: 't1',
        seatNumber: 1,
        mealChoice: 'chicken',
        dietaryRestrictions: [],
      },
      {
        id: 'sa2',
        eventId: 'event1',
        guestId: 'g5',
        tableId: 't2',
        seatNumber: 1,
        mealChoice: 'vegetarian',
        dietaryRestrictions: ['gluten-free'],
      },
      {
        id: 'sa3',
        eventId: 'event1',
        guestId: 'g8',
        tableId: 't3',
        seatNumber: 1,
        mealChoice: 'fish',
        dietaryRestrictions: [],
      },
    ];

    sampleTables.forEach(table => this.tables.set(table.id, table));
    sampleAssignments.forEach(assignment => this.assignments.set(assignment.id, assignment));
  }

  createTable(tableData: Partial<Table>): Table {
    const table: Table = {
      ...tableData,
      id: tableData.id || `t_${Date.now()}`,
      assignedGuests: tableData.assignedGuests || [],
    } as Table;

    TableSchema.parse(table);
    this.tables.set(table.id, table);
    return table;
  }

  assignGuestToTable(guestId: string, tableId: string): boolean {
    const table = this.tables.get(tableId);
    if (!table) return false;

    if (this.config.enforceCapacityLimits && table.assignedGuests.length >= table.capacity) {
      throw new Error(`Table ${table.name} is at full capacity (${table.capacity})`);
    }

    if (!table.assignedGuests.includes(guestId)) {
      table.assignedGuests.push(guestId);
    }

    return true;
  }

  removeGuestFromTable(guestId: string, tableId: string): boolean {
    const table = this.tables.get(tableId);
    if (!table) return false;

    const index = table.assignedGuests.indexOf(guestId);
    if (index > -1) {
      table.assignedGuests.splice(index, 1);
    }

    return true;
  }

  createSeatingAssignment(assignmentData: Partial<SeatingAssignment>): SeatingAssignment {
    const assignment: SeatingAssignment = {
      ...assignmentData,
      id: assignmentData.id || `sa_${Date.now()}`,
    } as SeatingAssignment;

    this.assignments.set(assignment.id, assignment);
    
    if (assignment.tableId && assignment.guestId) {
      this.assignGuestToTable(assignment.guestId, assignment.tableId);
    }
    
    return assignment;
  }

  getTablesForEvent(eventId: string): Table[] {
    return Array.from(this.tables.values()).filter(t => t.eventId === eventId);
  }

  getTableAvailability(tableId: string): {
    capacity: number;
    assigned: number;
    available: number;
    percentFull: number;
  } {
    const table = this.tables.get(tableId);
    if (!table) return { capacity: 0, assigned: 0, available: 0, percentFull: 0 };

    return {
      capacity: table.capacity,
      assigned: table.assignedGuests.length,
      available: table.capacity - table.assignedGuests.length,
      percentFull: (table.assignedGuests.length / table.capacity) * 100,
    };
  }

  getAssignmentsForTable(tableId: string): SeatingAssignment[] {
    return Array.from(this.assignments.values()).filter(a => a.tableId === tableId);
  }

  getUnassignedGuests(eventId: string, allGuestIds: string[]): string[] {
    const assignedGuestIds = Array.from(this.assignments.values())
      .filter(a => a.eventId === eventId)
      .map(a => a.guestId);
    
    return allGuestIds.filter(id => !assignedGuestIds.includes(id));
  }

  getMealChoiceCounts(eventId: string): Record<string, number> {
    const assignments = Array.from(this.assignments.values()).filter(a => a.eventId === eventId);
    const counts: Record<string, number> = {};

    assignments.forEach(a => {
      if (a.mealChoice) {
        counts[a.mealChoice] = (counts[a.mealChoice] || 0) + 1;
      }
    });

    return counts;
  }

  getStatistics(): {
    totalTables: number;
    totalCapacity: number;
    totalAssigned: number;
    averageOccupancy: number;
    emptySeats: number;
    tablesAtCapacity: number;
  } {
    const allTables = Array.from(this.tables.values());
    const totalCapacity = allTables.reduce((sum, t) => sum + t.capacity, 0);
    const totalAssigned = allTables.reduce((sum, t) => sum + t.assignedGuests.length, 0);
    const tablesAtCapacity = allTables.filter(t => t.assignedGuests.length >= t.capacity).length;

    return {
      totalTables: allTables.length,
      totalCapacity,
      totalAssigned,
      averageOccupancy: totalCapacity > 0 ? (totalAssigned / totalCapacity) * 100 : 0,
      emptySeats: totalCapacity - totalAssigned,
      tablesAtCapacity: tablesAtCapacity,
    };
  }
}
