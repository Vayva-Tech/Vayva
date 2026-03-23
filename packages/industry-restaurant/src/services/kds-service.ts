// @ts-nocheck
/**
 * Kitchen Display System (KDS) Service
 * 
 * Manages kitchen operations including:
 * - Ticket management and routing
 * - Station coordination
 * - Timer tracking
 * - Order firing
 * - Bump management
 */

import {
  Ticket,
  Order,
  OrderItem,
  KitchenStation,
  TICKET_STATUS,
} from '../types';

export class KDSService {
  private stations: Map<string, KitchenStation>;
  private tickets: Map<string, Ticket>;
  private orders: Map<string, Order>;

  constructor() {
    this.stations = new Map();
    this.tickets = new Map();
    this.orders = new Map();
  }

  // ============================================================================
  // STATION MANAGEMENT
  // ============================================================================

  /**
   * Initialize kitchen stations
   */
  initializeStations(stationConfigs: Array<{ id: string; name: string; type: string }>) {
    stationConfigs.forEach((config) => {
      this.stations.set(config.id, {
        id: config.id,
        name: config.name,
        type: config.type as KitchenStation['type'],
        isActive: true,
        tickets: [],
        avgCookTime: 0,
        efficiency: 100,
        queueLength: 0,
      });
    });
  }

  /**
   * Get all active stations
   */
  getStations(): KitchenStation[] {
    return Array.from(this.stations.values()).filter((station) => station.isActive);
  }

  /**
   * Get station by ID
   */
  getStation(stationId: string): KitchenStation | undefined {
    return this.stations.get(stationId);
  }

  /**
   * Update station efficiency metrics
   */
  updateStationMetrics(stationId: string, metrics: Partial<Pick<KitchenStation, 'avgCookTime' | 'efficiency'>>) {
    const station = this.stations.get(stationId);
    if (station) {
      Object.assign(station, metrics);
    }
  }

  // ============================================================================
  // TICKET MANAGEMENT
  // ============================================================================

  /**
   * Create tickets from an order
   * Routes items to appropriate stations
   */
  createTicketsFromOrder(order: Order): Ticket[] {
    const ticketsByStation = new Map<string, OrderItem[]>();

    // Group items by station
    order.items.forEach((item) => {
      const stationItems = ticketsByStation.get(item.station) || [];
      stationItems.push(item);
      ticketsByStation.set(item.station, stationItems);
    });

    // Create tickets for each station
    const tickets: Ticket[] = [];
    ticketsByStation.forEach((items, station) => {
      const ticket: Ticket = {
        id: `ticket-${Date.now()}-${station}`,
        ticketNumber: `TKT-${Math.floor(Math.random() * 10000)}`,
        orderId: order.id,
        type: order.type as 'dine-in' | 'takeout' | 'delivery',
        tableNumber: order.tableId,
        serverName: order.serverId || 'Unknown',
        status: TICKET_STATUS.FRESH,
        items,
        station,
        timerSeconds: 0,
        targetTime: new Date(Date.now() + 30 * 60 * 1000), // 30 min default
        startTime: undefined,
        bumpTime: undefined,
        priority: 'normal',
        allergies: this.extractAllergies(items),
      };

      tickets.push(ticket);
      this.tickets.set(ticket.id, ticket);

      // Add ticket to station queue
      const stationData = this.stations.get(station);
      if (stationData) {
        stationData.tickets.push(ticket);
        stationData.queueLength = stationData.tickets.length;
      }
    });

    return tickets;
  }

  /**
   * Start cooking a ticket
   */
  startTicket(ticketId: string): Ticket | null {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return null;

    ticket.status = TICKET_STATUS.COOKING;
    ticket.startTime = new Date();
    ticket.timerSeconds = 0;

    // Update station queue
    const station = this.stations.get(ticket.station);
    if (station) {
      station.efficiency = this.calculateStationEfficiency(station);
    }

    return ticket;
  }

  /**
   * Mark ticket as ready
   */
  completeTicket(ticketId: string): Ticket | null {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return null;

    ticket.status = TICKET_STATUS.READY;
    const completedTime = Date.now() - (ticket.startTime ? new Date(ticket.startTime).getTime() : Date.now());
    
    // Update station metrics
    const station = this.stations.get(ticket.station);
    if (station) {
      station.avgCookTime = this.updateAverageCookTime(station.avgCookTime, completedTime / 1000 / 60);
      station.efficiency = this.calculateStationEfficiency(station);
    }

    return ticket;
  }

  /**
   * Bump a ticket (extend time)
   */
  bumpTicket(ticketId: string, minutes: number): Ticket | null {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return null;

    ticket.bumpTime = new Date(Date.now() + minutes * 60 * 1000);
    ticket.targetTime = new Date(new Date(ticket.targetTime).getTime() + minutes * 60 * 1000);

    return ticket;
  }

  /**
   * Mark ticket as urgent
   */
  markUrgent(ticketId: string): Ticket | null {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return null;

    ticket.priority = 'urgent';
    ticket.status = TICKET_STATUS.URGENT;

    return ticket;
  }

  /**
   * Get tickets filtered by station and status
   */
  getTickets(filters?: {
    stationId?: string;
    status?: string;
    type?: string;
  }): Ticket[] {
    let tickets = Array.from(this.tickets.values());

    if (filters?.stationId) {
      tickets = tickets.filter((t) => t.station === filters.stationId);
    }

    if (filters?.status) {
      tickets = tickets.filter((t) => t.status === filters.status);
    }

    if (filters?.type) {
      tickets = tickets.filter((t) => t.type === filters.type);
    }

    // Sort by priority and time
    return tickets.sort((a, b) => {
      // Priority first
      const priorityOrder = { urgent: 0, high: 1, normal: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      // Then by timer (oldest first)
      return a.timerSeconds - b.timerSeconds;
    });
  }

  /**
   * Update ticket timers
   */
  updateTimers(): void {
    this.tickets.forEach((ticket) => {
      if (ticket.startTime && ticket.status === TICKET_STATUS.COOKING) {
        const elapsed = Math.floor((Date.now() - new Date(ticket.startTime).getTime()) / 1000);
        ticket.timerSeconds = elapsed;

        // Auto-update status based on time
        const elapsedMinutes = elapsed / 60;
        const targetMinutes = (new Date(ticket.targetTime).getTime() - new Date(ticket.startTime).getTime()) / 1000 / 60;

        if (elapsedMinutes > targetMinutes * 1.25) {
          ticket.status = TICKET_STATUS.OVERDUE;
        } else if (elapsedMinutes > targetMinutes * 0.9) {
          ticket.status = TICKET_STATUS.URGENT;
        }
      }
    });
  }

  // ============================================================================
  // PREP LIST MANAGEMENT
  // ============================================================================

  /**
   * Generate prep list based on inventory and forecast
   */
  generatePrepList(forecast: { covers: number; popularItems: string[] }) {
    // This would integrate with inventory system
    // For now, return a basic structure
    return {
      date: new Date().toISOString(),
      items: [] as Array<{
        name: string;
        targetQuantity: number;
        currentQuantity: number;
        unit: string;
        priority: 'high' | 'medium' | 'low';
      }>,
    };
  }

  // ============================================================================
  // ANALYTICS & METRICS
  // ============================================================================

  /**
   * Get station performance metrics
   */
  getStationPerformance(stationId: string) {
    const station = this.stations.get(stationId);
    if (!station) return null;

    const tickets = station.tickets;
    const avgCookTime = tickets.reduce((sum, t) => sum + t.timerSeconds, 0) / tickets.length;
    const onTimeTickets = tickets.filter(
      (t) => t.timerSeconds <= (new Date(t.targetTime).getTime() - (t.startTime ? new Date(t.startTime).getTime() : 0)) / 1000
    ).length;

    return {
      totalTickets: tickets.length,
      avgCookTime: Math.round(avgCookTime),
      onTimePercentage: tickets.length > 0 ? (onTimeTickets / tickets.length) * 100 : 0,
      efficiency: station.efficiency,
      queueLength: station.queueLength,
    };
  }

  /**
   * Get kitchen-wide metrics
   */
  getKitchenMetrics() {
    const stations = this.getStations();
    const allTickets = Array.from(this.tickets.values());

    return {
      activeTickets: allTickets.filter((t) => t.status !== TICKET_STATUS.READY).length,
      avgCookTime: stations.reduce((sum, s) => sum + s.avgCookTime, 0) / stations.length,
      totalEfficiency: stations.reduce((sum, s) => sum + s.efficiency, 0) / stations.length,
      ticketsByStatus: {
        fresh: allTickets.filter((t) => t.status === TICKET_STATUS.FRESH).length,
        cooking: allTickets.filter((t) => t.status === TICKET_STATUS.COOKING).length,
        ready: allTickets.filter((t) => t.status === TICKET_STATUS.READY).length,
        urgent: allTickets.filter((t) => t.status === TICKET_STATUS.URGENT).length,
        overdue: allTickets.filter((t) => t.status === TICKET_STATUS.OVERDUE).length,
      },
    };
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private extractAllergies(items: OrderItem[]): string[] {
    // Extract allergens from order items
    const allergens = new Set<string>();
    items.forEach((item) => {
      item.modifiers?.forEach((mod) => {
        if (mod.value.toLowerCase().includes('allergy') || mod.value.toLowerCase().includes('no')) {
          allergens.add(mod.value);
        }
      });
      if (item.specialInstructions?.toLowerCase().includes('allergy')) {
        allergens.add(item.specialInstructions);
      }
    });
    return Array.from(allergens);
  }

  private calculateStationEfficiency(station: KitchenStation): number {
    if (station.tickets.length === 0) return 100;

    const onTimeTickets = station.tickets.filter(
      (t) => t.timerSeconds <= (new Date(t.targetTime).getTime() - (t.startTime ? new Date(t.startTime).getTime() : 0)) / 1000
    ).length;

    return Math.round((onTimeTickets / station.tickets.length) * 100);
  }

  private updateAverageCookTime(currentAvg: number, newTime: number): number {
    // Simple moving average
    return Math.round((currentAvg * 0.7 + newTime * 0.3) * 10) / 10;
  }
}

// Export singleton instance
export const kdsService = new KDSService();
