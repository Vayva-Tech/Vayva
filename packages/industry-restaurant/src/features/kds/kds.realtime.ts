// @ts-nocheck
/**
 * KDS Real-time Integration
 * WebSocket and pub/sub integration for live kitchen updates
 */

import { KDSService } from './kds.service';
import {
  type KDSOrder,
  type KDSEvent,
  type KDSAlert,
  type KDSStats,
} from '../../types/kds.js';

export interface KDSRealtimeConfig {
  channelPrefix: string;
  merchantId: string;
  enableSoundAlerts: boolean;
  soundAlertTypes: ('new_order' | 'rush' | 'allergy' | 'overdue')[];
}

export interface KDSChannelMessage {
  type: 'order_update' | 'stats_update' | 'alert' | 'bump' | 'ping';
  payload: unknown;
  timestamp: Date;
}

/**
 * Real-time KDS integration
 * Handles WebSocket connections and event broadcasting
 */
export class KDSRealtime {
  private service: KDSService;
  private config: KDSRealtimeConfig;
  private unsubscribe?: () => void;
  private clients: Set<WebSocket> = new Set();
  private pingInterval?: NodeJS.Timeout;

  constructor(service: KDSService, config: KDSRealtimeConfig) {
    this.service = service;
    this.config = config;
  }

  /**
   * Initialize real-time integration
   */
  async initialize(): Promise<void> {
    // Subscribe to KDS events
    this.unsubscribe = this.service.subscribe((event) => {
      this.handleKDSEvent(event);
    });

    // Start ping interval to keep connections alive
    this.pingInterval = setInterval(() => {
      this.broadcast({
        type: 'ping',
        payload: { timestamp: new Date() },
        timestamp: new Date(),
      });
    }, 30000);
  }

  /**
   * Cleanup and disconnect
   */
  async dispose(): Promise<void> {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    this.clients.clear();
  }

  /**
   * Register a WebSocket client
   */
  registerClient(ws: WebSocket): void {
    this.clients.add(ws);

    // Send initial state
    this.sendToClient(ws, {
      type: 'stats_update',
      payload: this.service.getStats(),
      timestamp: new Date(),
    });

    // Send active orders
    const activeOrders = this.service.getActiveOrders();
    for (const order of activeOrders) {
      this.sendToClient(ws, {
        type: 'order_update',
        payload: order,
        timestamp: new Date(),
      });
    }

    // Handle client disconnect
    ws.addEventListener('close', () => {
      this.clients.delete(ws);
    });
  }

  /**
   * Handle incoming message from client
   */
  handleClientMessage(ws: WebSocket, message: string): void {
    try {
      const data = JSON.parse(message) as KDSChannelMessage;

      switch (data.type) {
        case 'bump':
          this.handleBumpCommand(data.payload as { orderId: string });
          break;
        case 'ping':
          // Respond to client ping
          this.sendToClient(ws, {
            type: 'ping',
            payload: { timestamp: new Date() },
            timestamp: new Date(),
          });
          break;
        default:
          console.warn('Unknown KDS message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling KDS client message:', error);
    }
  }

  /**
   * Get the channel name for this merchant's KDS
   */
  getChannelName(): string {
    return `${this.config.channelPrefix}:${this.config.merchantId}:kds`;
  }

  /**
   * Broadcast order update to all connected clients
   */
  broadcastOrderUpdate(order: KDSOrder): void {
    this.broadcast({
      type: 'order_update',
      payload: order,
      timestamp: new Date(),
    });
  }

  /**
   * Broadcast stats update
   */
  broadcastStatsUpdate(stats: KDSStats): void {
    this.broadcast({
      type: 'stats_update',
      payload: stats,
      timestamp: new Date(),
    });
  }

  /**
   * Broadcast alert
   */
  broadcastAlert(alert: KDSAlert): void {
    this.broadcast({
      type: 'alert',
      payload: alert,
      timestamp: new Date(),
    });

    // Trigger sound alert if enabled
    if (this.config.enableSoundAlerts && this.shouldPlaySound(alert)) {
      this.broadcast({
        type: 'alert',
        payload: { ...alert, playSound: true },
        timestamp: new Date(),
      });
    }
  }

  private handleKDSEvent(event: KDSEvent): void {
    switch (event.type) {
      case 'order-received':
        this.broadcastOrderUpdate(event.data as KDSOrder);
        this.broadcastStatsUpdate(this.service.getStats());
        break;
      case 'status-changed':
        this.broadcastOrderUpdate((event.data as { order: KDSOrder }).order);
        this.broadcastStatsUpdate(this.service.getStats());
        break;
      case 'order-bumped':
        this.broadcastOrderUpdate(event.data as KDSOrder);
        this.broadcastStatsUpdate(this.service.getStats());
        break;
      case 'alert':
        this.broadcastAlert(event.data as KDSAlert);
        break;
    }
  }

  private handleBumpCommand(payload: { orderId: string }): void {
    this.service.bumpOrder(payload.orderId);
  }

  private broadcast(message: KDSChannelMessage): void {
    const messageStr = JSON.stringify(message);
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    }
  }

  private sendToClient(ws: WebSocket, message: KDSChannelMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private shouldPlaySound(alert: KDSAlert): boolean {
    switch (alert.type) {
      case 'rush':
        return this.config.soundAlertTypes.includes('rush');
      case 'allergy':
        return this.config.soundAlertTypes.includes('allergy');
      case 'overdue':
        return this.config.soundAlertTypes.includes('overdue');
      default:
        return this.config.soundAlertTypes.includes('new_order');
    }
  }
}

/**
 * Bump bar integration for physical KDS hardware
 */
export class BumpBarIntegration {
  private service: KDSService;
  private keyMap: Map<string, string> = new Map(); // key -> orderId

  constructor(service: KDSService) {
    this.service = service;
  }

  /**
   * Map a bump bar key to an order
   */
  mapKeyToOrder(key: string, orderId: string): void {
    this.keyMap.set(key, orderId);
  }

  /**
   * Handle bump bar key press
   */
  handleKeyPress(key: string): KDSOrder | undefined {
    const orderId = this.keyMap.get(key);
    if (!orderId) return undefined;

    return this.service.bumpOrder(orderId);
  }

  /**
   * Clear all key mappings
   */
  clearMappings(): void {
    this.keyMap.clear();
  }

  /**
   * Auto-map keys to active orders
   */
  autoMapKeys(): void {
    this.keyMap.clear();
    const activeOrders = this.service.getActiveOrders().slice(0, 20); // Max 20 keys

    for (let i = 0; i < activeOrders.length; i++) {
      const key = (i + 1).toString(); // Keys 1-20
      this.keyMap.set(key, activeOrders[i].id);
    }
  }
}
