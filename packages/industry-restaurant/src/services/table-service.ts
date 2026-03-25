/**
 * Table Management Service
 * 
 * Manages restaurant tables including:
 * - Floor plan configuration
 * - Table status tracking
 * - Turnover optimization
 * - Seating assignments
 */

import { Table, FloorPlan, TABLE_STATUS } from '../types';

type FloorTableStatus = (typeof TABLE_STATUS)[keyof typeof TABLE_STATUS];

export class TableManagementService {
  private tables: Map<string, Table>;
  private floorPlans: Map<string, FloorPlan>;

  constructor() {
    this.tables = new Map();
    this.floorPlans = new Map();
  }

  // ============================================================================
  // FLOOR PLAN MANAGEMENT
  // ============================================================================

  /**
   * Set or update floor plan
   */
  setFloorPlan(floorPlan: FloorPlan): void {
    this.floorPlans.set(floorPlan.id, floorPlan);
    
    // Also index individual tables
    floorPlan.tables.forEach((table) => {
      this.tables.set(table.id, table);
    });
  }

  /**
   * Get floor plan by ID
   */
  getFloorPlan(floorPlanId: string): FloorPlan | undefined {
    return this.floorPlans.get(floorPlanId);
  }

  /**
   * Get all floor plans
   */
  getAllFloorPlans(): FloorPlan[] {
    return Array.from(this.floorPlans.values());
  }

  // ============================================================================
  // TABLE STATUS MANAGEMENT
  // ============================================================================

  /**
   * Update table status
   */
  updateTableStatus(tableId: string, status: FloorTableStatus): Table | null {
    const table = this.tables.get(tableId);
    if (!table) return null;

    const oldStatus = table.status;
    table.status = status;

    // Track turnover metrics
    if (oldStatus === TABLE_STATUS.SEATED && status === TABLE_STATUS.AVAILABLE) {
      // Table just turned
      if (table.currentParty) {
        const seatedTime = new Date(table.currentParty.seatedAt).getTime();
        const now = Date.now();
        table.actualTurnoverMinutes = Math.round((now - seatedTime) / 1000 / 60);
        table.currentParty = undefined;
      }
    }

    this.tables.set(tableId, table);
    return table;
  }

  /**
   * Seat party at table
   */
  seatParty(tableId: string, partySize: number, serverId: string): Table | null {
    const table = this.tables.get(tableId);
    if (!table) return null;

    if (table.status !== TABLE_STATUS.AVAILABLE) {
      throw new Error(`Table ${tableId} is not available`);
    }

    if (partySize > table.capacity) {
      throw new Error(`Party size ${partySize} exceeds table capacity ${table.capacity}`);
    }

    table.status = TABLE_STATUS.SEATED;
    table.currentParty = {
      size: partySize,
      seatedAt: new Date(),
      serverId,
    };

    this.tables.set(tableId, table);
    return table;
  }

  /**
   * Release table (make available)
   */
  releaseTable(tableId: string): Table | null {
    return this.updateTableStatus(tableId, TABLE_STATUS.AVAILABLE);
  }

  // ============================================================================
  // TABLE QUERIES
  // ============================================================================

  /**
   * Get available tables
   */
  getAvailableTables(partySize?: number): Table[] {
    let tables = Array.from(this.tables.values()).filter(
      (t) => t.status === TABLE_STATUS.AVAILABLE
    );

    if (partySize) {
      tables = tables.filter((t) => t.capacity >= partySize);
    }

    return tables.sort((a, b) => a.capacity - b.capacity);
  }

  /**
   * Get tables by status
   */
  getTablesByStatus(status: FloorTableStatus): Table[] {
    return Array.from(this.tables.values()).filter((t) => t.status === status);
  }

  /**
   * Get table by ID
   */
  getTable(tableId: string): Table | undefined {
    return this.tables.get(tableId);
  }

  /**
   * Get all tables
   */
  getAllTables(): Table[] {
    return Array.from(this.tables.values());
  }

  // ============================================================================
  // TURNOVER OPTIMIZATION
  // ============================================================================

  /**
   * Calculate table turnover rate
   */
  calculateTurnoverRate(periodHours: number = 4): number {
    const tablesArray = Array.from(this.tables.values());
    const activeTables = tablesArray.filter((t) => t.actualTurnoverMinutes !== undefined);

    if (activeTables.length === 0) return 0;

    const avgTurnoverMinutes =
      activeTables.reduce((sum, t) => sum + (t.actualTurnoverMinutes || 0), 0) /
      activeTables.length;

    const periodMinutes = periodHours * 60;
    return Math.round((periodMinutes / avgTurnoverMinutes) * 10) / 10;
  }

  /**
   * Get tables approaching turnover goal
   */
  getTablesApproachingTurnover(goalMinutes: number, thresholdMinutes: number = 15): Table[] {
    const now = Date.now();
    
    return Array.from(this.tables.values())
      .filter((t) => {
        if (!t.currentParty?.seatedAt) return false;
        
        const seatedTime = new Date(t.currentParty.seatedAt).getTime();
        const elapsedMinutes = (now - seatedTime) / 1000 / 60;
        
        return elapsedMinutes >= (goalMinutes - thresholdMinutes);
      })
      .sort((a, b) => {
        const timeA = a.currentParty?.seatedAt ? new Date(a.currentParty.seatedAt).getTime() : 0;
        const timeB = b.currentParty?.seatedAt ? new Date(b.currentParty.seatedAt).getTime() : 0;
        return timeA - timeB;
      });
  }

  // ============================================================================
  // SECTION MANAGEMENT
  // ============================================================================

  /**
   * Get tables by section
   */
  getTablesBySection(sectionId: string): Table[] {
    const floorPlan = Array.from(this.floorPlans.values()).find((fp) =>
      fp.sections.some((sec: { id: string }) => sec.id === sectionId)
    );

    if (!floorPlan) return [];

    const section = floorPlan.sections.find((sec: { id: string }) => sec.id === sectionId);
    if (!section) return [];

    return section.tableIds
      .map((id: string) => this.tables.get(id))
      .filter((t): t is Table => t !== undefined);
  }

  /**
   * Balance server sections
   */
  balanceSections(serverAssignments: Array<{
    serverId: string;
    sectionId: string;
  }>): Array<{
    serverId: string;
    tableCount: number;
    totalCapacity: number;
    occupancy: number;
  }> {
    return serverAssignments.map(({ serverId, sectionId }) => {
      const tables = this.getTablesBySection(sectionId);
      const occupiedTables = tables.filter(
        (t) => t.status === TABLE_STATUS.SEATED
      ).length;

      return {
        serverId,
        tableCount: tables.length,
        totalCapacity: tables.reduce((sum, t) => sum + t.capacity, 0),
        occupancy: tables.length > 0 ? (occupiedTables / tables.length) * 100 : 0,
      };
    });
  }

  // ============================================================================
  // WAITLIST & SEATING
  // ============================================================================

  /**
   * Estimate wait time for party
   */
  estimateWaitTime(partySize: number): number {
    const availableTables = this.getAvailableTables(partySize);
    
    if (availableTables.length > 0) {
      return 0; // Immediate seating available
    }

    // Find tables that will turn soon
    const turningSoon = this.getAllTables().filter(
      (t) =>
        t.status === TABLE_STATUS.SEATED &&
        t.currentParty &&
        t.actualTurnoverMinutes &&
        t.actualTurnoverMinutes < t.turnoverGoalMinutes * 0.8
    );

    if (turningSoon.length === 0) {
      return 45; // Default wait time
    }

    // Estimate based on next available table
    const nextAvailable = turningSoon[0];
    const seatedTime = new Date(nextAvailable.currentParty!.seatedAt).getTime();
    const elapsedMinutes = (Date.now() - seatedTime) / 1000 / 60;
    const remainingMinutes = (nextAvailable.actualTurnoverMinutes || 45) - elapsedMinutes;

    return Math.max(0, Math.round(remainingMinutes));
  }

  /**
   * Combine tables for large party
   */
  combineTables(tableIds: string[], combinedTableNumber: string): Table | null {
    if (tableIds.length < 2) {
      throw new Error('Need at least 2 tables to combine');
    }

    const tables = tableIds.map((id) => this.tables.get(id)).filter((t) => t !== undefined);
    
    if (tables.length !== tableIds.length) {
      throw new Error('One or more tables not found');
    }

    // Check all tables are available
    const allAvailable = tables.every((t) => t.status === TABLE_STATUS.AVAILABLE);
    if (!allAvailable) {
      throw new Error('All tables must be available to combine');
    }

    // Create combined table
    const combinedTable: Table = {
      id: `combined-${combinedTableNumber}`,
      tableNumber: combinedTableNumber,
      section: tables[0].section,
      capacity: tables.reduce((sum, t) => sum + t.capacity, 0),
      status: TABLE_STATUS.AVAILABLE,
      position: {
        x: tables[0].position.x,
        y: tables[0].position.y,
      },
      shape: 'rectangle',
      isCombined: true,
      combinedTableIds: tableIds,
      turnoverGoalMinutes: tables[0].turnoverGoalMinutes,
    };

    // Mark original tables as offline
    tableIds.forEach((id) => {
      const table = this.tables.get(id);
      if (table) {
        table.status = TABLE_STATUS.OFFLINE;
        this.tables.set(id, table);
      }
    });

    this.tables.set(combinedTable.id, combinedTable);
    return combinedTable;
  }

  /**
   * Split combined table back to originals
   */
  splitTable(combinedTableId: string): boolean {
    const combinedTable = this.tables.get(combinedTableId);
    if (!combinedTable?.isCombined || !combinedTable.combinedTableIds) {
      return false;
    }

    // Restore original tables
    combinedTable.combinedTableIds.forEach((id) => {
      const table = this.tables.get(id);
      if (table) {
        table.status = TABLE_STATUS.AVAILABLE;
        this.tables.set(id, table);
      }
    });

    // Remove combined table
    this.tables.delete(combinedTableId);
    return true;
  }

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  /**
   * Get table utilization statistics
   */
  getUtilizationStats(periodHours: number = 4): {
    totalTables: number;
    totalSeats: number;
    avgOccupancy: number;
    peakOccupancy: number;
    turnsCompleted: number;
  } {
    const tablesArray = this.getAllTables();
    const occupiedTables = this.getTablesByStatus(TABLE_STATUS.SEATED).length;

    return {
      totalTables: tablesArray.length,
      totalSeats: tablesArray.reduce((sum, t) => sum + t.capacity, 0),
      avgOccupancy: tablesArray.length > 0 ? (occupiedTables / tablesArray.length) * 100 : 0,
      peakOccupancy: 95, // Would track historical peak
      turnsCompleted: tablesArray.filter((t) => t.actualTurnoverMinutes !== undefined).length,
    };
  }
}

// Export singleton instance
export const tableManagementService = new TableManagementService();
