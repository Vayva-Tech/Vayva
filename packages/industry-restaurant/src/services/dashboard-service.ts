/**
 * Restaurant Dashboard Service
 * 
 * Provides real-time dashboard data including:
 * - Live metrics and KPIs
 * - Order feed
 * - Table status
 * - Revenue tracking
 * - Staff activity
 */

import {
  DashboardMetrics,
  KPIMetric,
  Order,
  Table,
  Reservation,
  StaffMember,
  RevenueBreakdown,
  AIInsight,
  ORDER_STATUS,
  TABLE_STATUS,
} from '../types';

export class RestaurantDashboardService {
  private metrics: DashboardMetrics | null = null;
  private orders: Map<string, Order>;
  private tables: Map<string, Table>;
  private reservations: Map<string, Reservation>;
  private staffMembers: Map<string, StaffMember>;

  constructor() {
    this.orders = new Map();
    this.tables = new Map();
    this.reservations = new Map();
    this.staffMembers = new Map();
  }

  // ============================================================================
  // LIVE METRICS
  // ============================================================================

  /**
   * Get real-time dashboard metrics
   */
  getLiveMetrics(): DashboardMetrics {
    if (!this.metrics) {
      this.metrics = this.calculateMetrics();
    }
    
    return {
      ...this.metrics,
      lastUpdated: new Date(),
      isLive: true,
    };
  }

  /**
   * Calculate aggregate metrics from all data sources
   */
  private calculateMetrics(): DashboardMetrics {
    const ordersArray = Array.from(this.orders.values());
    const activeOrders = ordersArray.filter(
      (o) => ![ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED].includes(o.status as any)
    );

    const todayRevenue = ordersArray
      .filter((o) => this.isToday(o.createdAt))
      .reduce((sum, o) => sum + o.total, 0);

    const todayOrders = ordersArray.filter((o) => this.isToday(o.createdAt)).length;
    const todayGuests = this.calculateGuestCount(activeOrders);
    const avgTicket = todayOrders > 0 ? todayRevenue / todayOrders : 0;
    const tableTurn = this.calculateAverageTableTurn();

    return {
      revenue: todayRevenue,
      orders: todayOrders,
      guests: todayGuests,
      averageTicket: Math.round(avgTicket * 100) / 100,
      tableTurn: Math.round(tableTurn * 10) / 10,
      revenueChange: this.calculateRevenueChange(todayRevenue),
      ordersChange: this.calculateOrdersChange(todayOrders),
      guestsChange: this.calculateGuestsChange(todayGuests),
      averageTicketChange: this.calculateAvgTicketChange(avgTicket),
      tableTurnChange: this.calculateTableTurnChange(tableTurn),
      isLive: true,
      lastUpdated: new Date(),
    };
  }

  /**
   * Get KPI metrics for dashboard cards
   */
  getKPIMetrics(): KPIMetric[] {
    const metrics = this.getLiveMetrics();

    return [
      {
        label: 'Revenue',
        value: metrics.revenue,
        change: metrics.revenueChange,
        trend: metrics.revenueChange >= 0 ? 'up' : 'down',
        isPositive: metrics.revenueChange >= 0,
        isLive: true,
        tooltip: 'Total revenue for current service period',
      },
      {
        label: 'Orders',
        value: metrics.orders,
        change: metrics.ordersChange,
        trend: metrics.ordersChange >= 0 ? 'up' : 'down',
        isPositive: metrics.ordersChange >= 0,
        isLive: true,
        tooltip: 'Number of orders processed',
      },
      {
        label: 'Guests',
        value: metrics.guests,
        change: metrics.guestsChange,
        trend: metrics.guestsChange >= 0 ? 'up' : 'down',
        isPositive: metrics.guestsChange >= 0,
        isLive: true,
        tooltip: 'Total guest count',
      },
      {
        label: 'Avg Ticket',
        value: metrics.averageTicket,
        change: metrics.averageTicketChange,
        trend: metrics.averageTicketChange >= 0 ? 'up' : 'down',
        isPositive: metrics.averageTicketChange >= 0,
        isLive: true,
        tooltip: 'Average revenue per order',
      },
      {
        label: 'Table Turn',
        value: metrics.tableTurn,
        change: metrics.tableTurnChange,
        trend: metrics.tableTurnChange >= 0 ? 'up' : 'down',
        isPositive: metrics.tableTurnChange >= 0,
        isLive: true,
        tooltip: 'Average table turnover rate',
      },
    ];
  }

  // ============================================================================
  // ORDER FEED
  // ============================================================================

  /**
   * Get live order feed
   */
  getLiveOrderFeed(limit: number = 10): Order[] {
    return Array.from(this.orders.values())
      .filter((o) => ![ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED].includes(o.status as any))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  /**
   * Add order to feed
   */
  addOrder(order: Order): void {
    this.orders.set(order.id, order);
    this.invalidateMetrics();
  }

  /**
   * Update order status
   */
  updateOrderStatus(orderId: string, status: string): Order | null {
    const order = this.orders.get(orderId);
    if (!order) return null;

    order.status = status as any;
    order.updatedAt = new Date();
    this.orders.set(orderId, order);
    this.invalidateMetrics();

    return order;
  }

  // ============================================================================
  // TABLE MANAGEMENT
  // ============================================================================

  /**
   * Get table status overview
   */
  getTableStatus(): { tables: Table[]; occupancy: number; waitTime: number } {
    const tablesArray = Array.from(this.tables.values());
    const occupiedTables = tablesArray.filter(
      (t) => t.status === TABLE_STATUS.SEATED || t.status === TABLE_STATUS.ORDERING
    ).length;
    const totalTables = tablesArray.length;

    return {
      tables: tablesArray,
      occupancy: totalTables > 0 ? (occupiedTables / totalTables) * 100 : 0,
      waitTime: this.estimateWaitTime(),
    };
  }

  /**
   * Update table status
   */
  updateTableStatus(tableId: string, status: string, party?: Table['currentParty']): Table | null {
    const table = this.tables.get(tableId);
    if (!table) return null;

    table.status = status as any;
    if (party) {
      table.currentParty = party;
    }
    this.tables.set(tableId, table);

    return table;
  }

  // ============================================================================
  // RESERVATION TRACKING
  // ============================================================================

  /**
   * Get upcoming reservations
   */
  getUpcomingReservations(hours: number = 2): Reservation[] {
    const now = new Date();
    const future = new Date(now.getTime() + hours * 60 * 60 * 1000);

    return Array.from(this.reservations.values())
      .filter((r) => {
        const reservationDate = new Date(`${r.date}T${r.time}`);
        return reservationDate >= now && reservationDate <= future;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
  }

  /**
   * Get reservation timeline data
   */
  getReservationTimeline(): Array<{ hour: string; count: number }> {
    const timeline = new Map<string, number>();
    
    Array.from(this.reservations.values())
      .filter((r) => r.status === 'confirmed')
      .forEach((r) => {
        const hour = r.time.split(':')[0] + ':00';
        timeline.set(hour, (timeline.get(hour) || 0) + 1);
      });

    return Array.from(timeline.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour));
  }

  // ============================================================================
  // STAFF ACTIVITY
  // ============================================================================

  /**
   * Get staff on shift
   */
  getStaffOnShift(): StaffMember[] {
    return Array.from(this.staffMembers.values()).filter((s) => s.isOnShift);
  }

  /**
   * Get staff performance metrics
   */
  getStaffPerformance(): Array<{
    name: string;
    role: string;
    metric: string;
    value: string | number;
  }> {
    return this.getStaffOnShift().map((staff) => ({
      name: staff.name,
      role: staff.role,
      metric: staff.role === 'server' ? 'Tables Served' : 'Efficiency',
      value: staff.role === 'server' 
        ? (staff.performance?.tablesServed || 0)
        : `${staff.performance?.avgTicketTime || 0} min`,
    }));
  }

  // ============================================================================
  // REVENUE ANALYTICS
  // ============================================================================

  /**
   * Get revenue breakdown by stream
   */
  getRevenueBreakdown(): RevenueBreakdown {
    const ordersArray = Array.from(this.orders.values());
    const todayOrders = ordersArray.filter((o) => this.isToday(o.createdAt));

    const byStream = {
      dineIn: todayOrders.filter((o) => o.type === 'dine-in').reduce((sum, o) => sum + o.total, 0),
      takeout: todayOrders.filter((o) => o.type === 'takeout').reduce((sum, o) => sum + o.total, 0),
      delivery: todayOrders.filter((o) => o.type === 'delivery').reduce((sum, o) => sum + o.total, 0),
      catering: todayOrders.filter((o) => o.type === 'catering').reduce((sum, o) => sum + o.total, 0),
      bar: 0, // Would need separate bar orders
    };

    const total = Object.values(byStream).reduce((sum, val) => sum + val, 0);

    return {
      total,
      byStream,
      byMealPeriod: this.getRevenueByMealPeriod(todayOrders),
      percentageChange: this.calculateRevenueChange(total),
      comparison: 'yesterday',
    };
  }

  // ============================================================================
  // AI INSIGHTS
  // ============================================================================

  /**
   * Generate AI insights based on current data
   */
  generateAIInsights(): AIInsight[] {
    const insights: AIInsight[] = [];
    const metrics = this.getLiveMetrics();

    // High revenue insight
    if (metrics.revenueChange > 20) {
      insights.push({
        id: `insight-${Date.now()}`,
        type: 'prediction',
        title: 'Strong Performance',
        description: `Revenue is ${metrics.revenueChange.toFixed(1)}% above average. Consider extending service hours.`,
        confidence: 85,
        impact: 'high',
        data: { revenueChange: metrics.revenueChange },
        actionRequired: false,
        createdAt: new Date(),
      });
    }

    // Low table turn insight
    if (metrics.tableTurn < 1.5) {
      insights.push({
        id: `insight-${Date.now()}-turn`,
        type: 'recommendation',
        title: 'Optimize Table Turnover',
        description: 'Table turnover is below target. Consider implementing pre-bussing or offering express lunch menu.',
        confidence: 75,
        impact: 'medium',
        data: { tableTurn: metrics.tableTurn },
        actionRequired: true,
        createdAt: new Date(),
      });
    }

    return insights;
  }

  // ============================================================================
  // DATA MANAGEMENT
  // ============================================================================

  setTables(tables: Table[]): void {
    tables.forEach((table) => {
      this.tables.set(table.id, table);
    });
    this.invalidateMetrics();
  }

  setReservations(reservations: Reservation[]): void {
    reservations.forEach((reservation) => {
      this.reservations.set(reservation.id, reservation);
    });
  }

  setStaffMembers(staff: StaffMember[]): void {
    staff.forEach((member) => {
      this.staffMembers.set(member.id, member);
    });
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private invalidateMetrics(): void {
    this.metrics = null;
  }

  private isToday(date: Date | string): boolean {
    const today = new Date();
    const checkDate = new Date(date);
    return (
      today.getDate() === checkDate.getDate() &&
      today.getMonth() === checkDate.getMonth() &&
      today.getFullYear() === checkDate.getFullYear()
    );
  }

  private calculateGuestCount(orders: Order[]): number {
    // This would typically come from order data
    // For now, estimate based on table capacity
    return orders.reduce((sum, order) => {
      if (order.tableId) {
        const table = this.tables.get(order.tableId);
        return sum + (table?.capacity || 2);
      }
      return sum + 2;
    }, 0);
  }

  private calculateAverageTableTurn(): number {
    const tablesArray = Array.from(this.tables.values());
    const occupiedTables = tablesArray.filter(
      (t) => t.currentParty && t.actualTurnoverMinutes
    );

    if (occupiedTables.length === 0) return 2.0;

    const avgTurnover =
      occupiedTables.reduce((sum, t) => sum + (t.actualTurnoverMinutes || 0), 0) /
      occupiedTables.length;

    // Convert minutes to turns (assuming 4-hour service period)
    return Math.round((240 / avgTurnover) * 10) / 10;
  }

  private calculateRevenueChange(current: number): number {
    // Simulated historical average
    const historicalAvg = current * 0.85;
    return Math.round(((current - historicalAvg) / historicalAvg) * 1000) / 10;
  }

  private calculateOrdersChange(current: number): number {
    const historicalAvg = current * 0.9;
    return Math.round(((current - historicalAvg) / historicalAvg) * 1000) / 10;
  }

  private calculateGuestsChange(current: number): number {
    const historicalAvg = current * 0.92;
    return Math.round(((current - historicalAvg) / historicalAvg) * 1000) / 10;
  }

  private calculateAvgTicketChange(current: number): number {
    const historicalAvg = current * 0.95;
    return Math.round((current - historicalAvg) * 100) / 100;
  }

  private calculateTableTurnChange(current: number): number {
    const historicalAvg = current * 0.9;
    return Math.round((current - historicalAvg) * 10) / 10;
  }

  private estimateWaitTime(): number {
    const pendingTables = Array.from(this.tables.values()).filter(
      (t) => t.status === TABLE_STATUS.RESERVED
    ).length;

    const avgTurnover = 45; // minutes
    return pendingTables * avgTurnover;
  }

  private getRevenueByMealPeriod(orders: Order[]): RevenueBreakdown['byMealPeriod'] {
    const hour = new Date().getHours();
    
    // Simplified meal period detection
    const period =
      hour >= 6 && hour < 11
        ? 'breakfast'
        : hour >= 11 && hour < 15
        ? 'lunch'
        : hour >= 15 && hour < 22
        ? 'dinner'
        : 'lateNight';

    const total = orders.reduce((sum, o) => sum + o.total, 0);

    return {
      breakfast: period === 'breakfast' ? total : 0,
      lunch: period === 'lunch' ? total : 0,
      dinner: period === 'dinner' ? total : 0,
      lateNight: period === 'lateNight' ? total : 0,
      brunch: 0,
    };
  }
}

// Export singleton instance
export const restaurantDashboardService = new RestaurantDashboardService();
