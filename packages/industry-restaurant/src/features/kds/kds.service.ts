// @ts-nocheck
/**
 * Kitchen Display System (KDS) Service
 * Manages real-time order queue for kitchen operations
 */

import {
  type KDSConfig,
  type KDSOrder,
  type KDSItem,
  type KDSStation,
  type KDSStatus,
  type KDSCourse,
  type KDSStats,
  type KDSAlert,
  type KDSEvent,
  type KDSPriority,
} from '../../types/kds.js';

export interface KDSOrderUpdate {
  orderId: string;
  status?: KDSStatus;
  startedAt?: Date;
  readyAt?: Date;
  servedAt?: Date;
  bumpedAt?: Date;
}

export class KDSService {
  private config: KDSConfig;
  private orders: Map<string, KDSOrder> = new Map();
  private listeners: Set<(event: KDSEvent) => void> = new Set();
  private stats: KDSStats = {
    totalOrders: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    avgPrepTimeMinutes: 0,
    rushOrders: 0,
    overdueOrders: 0,
  };

  constructor(config: KDSConfig) {
    this.config = config;
  }

  /**
   * Initialize the KDS service
   */
  async initialize(): Promise<void> {
    // Load any persisted orders
    this.calculateStats();
  }

  /**
   * Receive a new order from POS
   */
  receiveOrder(order: Omit<KDSOrder, 'receivedAt' | 'status'>): KDSOrder {
    const fullOrder: KDSOrder = {
      ...order,
      receivedAt: new Date(),
      status: 'pending',
    };

    this.orders.set(fullOrder.id, fullOrder);
    this.calculateStats();

    const event: KDSEvent = {
      type: 'order-received',
      orderId: fullOrder.id,
      timestamp: new Date(),
      data: fullOrder,
    };
    this.emit(event);

    // Check for rush orders or allergies
    this.checkAlerts(fullOrder);

    return fullOrder;
  }

  /**
   * Update order status
   */
  updateOrder(update: KDSOrderUpdate): KDSOrder | undefined {
    const order = this.orders.get(update.orderId);
    if (!order) return undefined;

    if (update.status) {
      order.status = update.status;

      // Set timestamps based on status
      switch (update.status) {
        case 'preparing':
          order.startedAt = update.startedAt || new Date();
          break;
        case 'ready':
          order.readyAt = update.readyAt || new Date();
          if (order.startedAt) {
            order.prepTimeMinutes = Math.round(
              (order.readyAt.getTime() - order.startedAt.getTime()) / 60000
            );
          }
          break;
        case 'served':
          order.servedAt = update.servedAt || new Date();
          break;
        case 'bumped':
          order.bumpedAt = update.bumpedAt || new Date();
          break;
      }
    }

    this.orders.set(update.orderId, order);
    this.calculateStats();

    const event: KDSEvent = {
      type: 'status-changed',
      orderId: order.id,
      timestamp: new Date(),
      data: { status: order.status, order },
    };
    this.emit(event);

    return order;
  }

  /**
   * Update individual item status
   */
  updateItemStatus(
    orderId: string,
    itemId: string,
    status: KDSStatus
  ): KDSOrder | undefined {
    const order = this.orders.get(orderId);
    if (!order) return undefined;

    const item = order.items.find(i => i.id === itemId);
    if (!item) return undefined;

    item.status = status;

    // Check if all items are ready
    if (status === 'ready' && order.items.every(i => i.status === 'ready')) {
      this.updateOrder({ orderId, status: 'ready' });
    }

    return order;
  }

  /**
   * Bump (complete) an order
   */
  bumpOrder(orderId: string): KDSOrder | undefined {
    return this.updateOrder({
      orderId,
      status: 'bumped',
      bumpedAt: new Date(),
    });
  }

  /**
   * Get orders by status
   */
  getOrdersByStatus(status: KDSStatus): KDSOrder[] {
    return Array.from(this.orders.values())
      .filter(order => order.status === status)
      .sort((a, b) => a.receivedAt.getTime() - b.receivedAt.getTime());
  }

  /**
   * Get orders by station
   */
  getOrdersByStation(stationId: string): KDSOrder[] {
    return Array.from(this.orders.values())
      .filter(order => order.station === stationId)
      .sort((a, b) => a.receivedAt.getTime() - b.receivedAt.getTime());
  }

  /**
   * Get orders by course
   */
  getOrdersByCourse(course: KDSCourse): KDSOrder[] {
    return Array.from(this.orders.values())
      .filter(order => order.course === course)
      .sort((a, b) => a.receivedAt.getTime() - b.receivedAt.getTime());
  }

  /**
   * Get active orders (not bumped)
   */
  getActiveOrders(): KDSOrder[] {
    return Array.from(this.orders.values())
      .filter(order => order.status !== 'bumped')
      .sort((a, b) => {
        // Rush orders first, then by priority, then by received time
        if (a.priority === 'rush' && b.priority !== 'rush') return -1;
        if (a.priority !== 'rush' && b.priority === 'rush') return 1;
        return a.receivedAt.getTime() - b.receivedAt.getTime();
      });
  }

  /**
   * Get order by ID
   */
  getOrder(orderId: string): KDSOrder | undefined {
    return this.orders.get(orderId);
  }

  /**
   * Get current stats
   */
  getStats(): KDSStats {
    return { ...this.stats };
  }

  /**
   * Get stations
   */
  getStations(): KDSStation[] {
    return this.config.stations;
  }

  /**
   * Get overdue orders (exceeding promised time)
   */
  getOverdueOrders(): KDSOrder[] {
    const now = new Date();
    return Array.from(this.orders.values()).filter(order => {
      if (order.status === 'bumped' || order.status === 'served') return false;
      if (!order.promisedTime) return false;
      return now > order.promisedTime;
    });
  }

  /**
   * Subscribe to KDS events
   */
  subscribe(listener: (event: KDSEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Route order items to appropriate stations
   */
  routeOrderToStations(order: KDSOrder): Map<string, KDSItem[]> {
    const stationItems = new Map<string, KDSItem[]>();

    for (const item of order.items) {
      const station = this.findStationForItem(item);
      if (station) {
        item.station = station.id;
        const items = stationItems.get(station.id) || [];
        items.push(item);
        stationItems.set(station.id, items);
      }
    }

    return stationItems;
  }

  /**
   * Get orders for a specific display mode
   */
  getOrdersForDisplay(mode: 'queue' | 'course' | 'station'): KDSOrder[] {
    const activeOrders = this.getActiveOrders();

    switch (mode) {
      case 'queue':
        return activeOrders;
      case 'course':
        return activeOrders.sort((a, b) => {
          const courseOrder = ['appetizer', 'entree', 'dessert', 'drink'];
          return (
            courseOrder.indexOf(a.course) - courseOrder.indexOf(b.course)
          );
        });
      case 'station':
        return activeOrders.sort((a, b) => {
          const stationA = this.config.stations.find(s => s.id === a.station);
          const stationB = this.config.stations.find(s => s.id === b.station);
          return (stationA?.displayOrder || 0) - (stationB?.displayOrder || 0);
        });
      default:
        return activeOrders;
    }
  }

  /**
   * Clear completed orders (bumped and older than threshold)
   */
  clearOldOrders(olderThanMinutes: number = 60): number {
    const cutoff = new Date(Date.now() - olderThanMinutes * 60000);
    let cleared = 0;

    for (const [id, order] of this.orders) {
      if (order.status === 'bumped' && order.bumpedAt && order.bumpedAt < cutoff) {
        this.orders.delete(id);
        cleared++;
      }
    }

    if (cleared > 0) {
      this.calculateStats();
    }

    return cleared;
  }

  private findStationForItem(item: KDSItem): KDSStation | undefined {
    // Find station that handles this item's category
    // This would typically be based on menu item categories
    return this.config.stations.find(station =>
      station.categories.some(cat =>
        item.name.toLowerCase().includes(cat.toLowerCase())
      )
    );
  }

  private calculateStats(): void {
    const orders = Array.from(this.orders.values());
    const activeOrders = orders.filter(o => o.status !== 'bumped');

    this.stats = {
      totalOrders: orders.length,
      pendingOrders: activeOrders.filter(o => o.status === 'pending').length,
      preparingOrders: activeOrders.filter(o => o.status === 'preparing').length,
      readyOrders: activeOrders.filter(o => o.status === 'ready').length,
      avgPrepTimeMinutes: this.calculateAvgPrepTime(orders),
      rushOrders: activeOrders.filter(o => o.priority === 'rush').length,
      overdueOrders: this.getOverdueOrders().length,
    };
  }

  private calculateAvgPrepTime(orders: KDSOrder[]): number {
    const completedOrders = orders.filter(o => o.prepTimeMinutes !== undefined);
    if (completedOrders.length === 0) return 0;

    const total = completedOrders.reduce(
      (sum, o) => sum + (o.prepTimeMinutes || 0),
      0
    );
    return Math.round(total / completedOrders.length);
  }

  private checkAlerts(order: KDSOrder): void {
    const alerts: KDSAlert[] = [];

    // Check for rush orders
    if (order.priority === 'rush') {
      alerts.push({
        type: 'rush',
        orderId: order.id,
        message: `Rush order #${order.orderNumber}`,
        severity: 'warning',
        timestamp: new Date(),
      });
    }

    // Check for allergies
    if (order.allergies.length > 0) {
      alerts.push({
        type: 'allergy',
        orderId: order.id,
        message: `ALLERGY ALERT: ${order.allergies.join(', ')}`,
        severity: 'critical',
        timestamp: new Date(),
      });
    }

    // Emit alerts
    for (const alert of alerts) {
      const event: KDSEvent = {
        type: 'alert',
        orderId: order.id,
        timestamp: new Date(),
        data: alert,
      };
      this.emit(event);
    }
  }

  private emit(event: KDSEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in KDS event listener:', error);
      }
    }
  }
}
