import { logger } from "@vayva/shared";
import { EventEmitter } from "events";
import { WebSocket } from "ws";

// Types for WebSocket events
export interface WebSocketEvent {
  type: string;
  payload: unknown;
  timestamp: string;
  storeId: string;
}

export interface ClientConnection {
  id: string;
  storeId: string;
  userId: string;
  socket: WebSocket;
  subscriptions: Set<string>;
  connectedAt: Date;
}

// WebSocket event types
export enum WebSocketEventType {
  ORDER_CREATED = "order.created",
  ORDER_UPDATED = "order.updated",
  ORDER_COMPLETED = "order.completed",
  INVENTORY_LOW = "inventory.low",
  CUSTOMER_NEW = "customer.new",
  PAYMENT_RECEIVED = "payment.received",
  ALERT_CRITICAL = "alert.critical",
  PERFORMANCE_UPDATE = "performance.update",
  ANALYTICS_LIVE = "analytics.live"
}

// WebSocket channels/topics
export enum WebSocketChannel {
  ORDERS = "orders",
  INVENTORY = "inventory",
  CUSTOMERS = "customers",
  FINANCE = "finance",
  ALERTS = "alerts",
  ANALYTICS = "analytics",
  STORE_EVENTS = "store_events"
}

/**
 * Enhanced WebSocket Manager for real-time features
 */
export class WebSocketManager extends EventEmitter {
  private static instance: WebSocketManager;
  private connections: Map<string, ClientConnection> = new Map();
  private channelSubscriptions: Map<string, Set<string>> = new Map();
  private heartbeatInterval: ReturnType<typeof setTimeout> | null = null;

  private constructor() {
    super();
    this.initializeHeartbeat();
  }

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  /**
   * Register a new WebSocket connection
   */
  public registerConnection(
    socket: WebSocket,
    storeId: string,
    userId: string
  ): string {
    const connectionId = this.generateConnectionId();
    
    const connection: ClientConnection = {
      id: connectionId,
      storeId,
      userId,
      socket,
      subscriptions: new Set(),
      connectedAt: new Date()
    };

    this.connections.set(connectionId, connection);
    
    // Setup event listeners
    this.setupSocketListeners(connection);
    
    logger.info("[WEBSOCKET_CONNECTED]", {
      connectionId,
      storeId,
      userId,
      totalConnections: this.connections.size
    });

    // Send welcome message
    this.sendToConnection(connectionId, {
      type: "connection.established",
      payload: {
        connectionId,
        supportedChannels: Object.values(WebSocketChannel),
        serverTime: new Date().toISOString()
      }
    });

    return connectionId;
  }

  /**
   * Unregister a WebSocket connection
   */
  public unregisterConnection(connectionId: string): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection) return false;

    // Clean up subscriptions
    connection.subscriptions.forEach(channel => {
      this.unsubscribeFromChannel(connectionId, channel);
    });

    // Close socket if still open
    if (connection.socket.readyState === WebSocket.OPEN) {
      connection.socket.close(1000, "Normal closure");
    }

    this.connections.delete(connectionId);
    
    logger.info("[WEBSOCKET_DISCONNECTED]", {
      connectionId,
      storeId: connection.storeId,
      userId: connection.userId,
      totalConnections: this.connections.size
    });

    return true;
  }

  /**
   * Subscribe to a channel/topic
   */
  public subscribeToChannel(connectionId: string, channel: string): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection) return false;

    connection.subscriptions.add(channel);
    
    if (!this.channelSubscriptions.has(channel)) {
      this.channelSubscriptions.set(channel, new Set());
    }
    
    this.channelSubscriptions.get(channel)!.add(connectionId);
    
    logger.debug("[WEBSOCKET_SUBSCRIBED]", {
      connectionId,
      channel,
      subscriptionCount: connection.subscriptions.size
    });

    return true;
  }

  /**
   * Unsubscribe from a channel/topic
   */
  public unsubscribeFromChannel(connectionId: string, channel: string): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection) return false;

    connection.subscriptions.delete(channel);
    
    const channelSubscribers = this.channelSubscriptions.get(channel);
    if (channelSubscribers) {
      channelSubscribers.delete(connectionId);
      
      // Clean up empty channel
      if (channelSubscribers.size === 0) {
        this.channelSubscriptions.delete(channel);
      }
    }
    
    logger.debug("[WEBSOCKET_UNSUBSCRIBED]", {
      connectionId,
      channel
    });

    return true;
  }

  /**
   * Broadcast message to all subscribers of a channel
   */
  public broadcastToChannel(
    channel: string,
    event: Omit<WebSocketEvent, 'timestamp' | 'storeId'>
  ): number {
    const subscribers = this.channelSubscriptions.get(channel);
    if (!subscribers || subscribers.size === 0) return 0;

    const eventWithMetadata: WebSocketEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      storeId: "broadcast" // Will be filtered by connection storeId
    };

    let sentCount = 0;
    
    subscribers.forEach(connectionId => {
      const connection = this.connections.get(connectionId);
      if (connection && this.sendToConnection(connectionId, eventWithMetadata)) {
        sentCount++;
      }
    });

    if (sentCount > 0) {
      logger.debug("[WEBSOCKET_BROADCAST]", {
        channel,
        eventType: event.type,
        subscribers: subscribers.size,
        sent: sentCount
      });
    }

    return sentCount;
  }

  /**
   * Send message to specific store connections
   */
  public sendToStore(
    storeId: string,
    event: Omit<WebSocketEvent, 'timestamp' | 'storeId'>
  ): number {
    let sentCount = 0;
    
    this.connections.forEach((connection, connectionId) => {
      if (connection.storeId === storeId) {
        const eventWithMetadata: WebSocketEvent = {
          ...event,
          timestamp: new Date().toISOString(),
          storeId
        };
        
        if (this.sendToConnection(connectionId, eventWithMetadata)) {
          sentCount++;
        }
      }
    });

    if (sentCount > 0) {
      logger.debug("[WEBSOCKET_STORE_MESSAGE]", {
        storeId,
        eventType: event.type,
        connections: sentCount
      });
    }

    return sentCount;
  }

  /**
   * Send message to specific user
   */
  public sendToUser(
    userId: string,
    event: Omit<WebSocketEvent, 'timestamp' | 'storeId'>
  ): number {
    let sentCount = 0;
    
    this.connections.forEach((connection, connectionId) => {
      if (connection.userId === userId) {
        const eventWithMetadata: WebSocketEvent = {
          ...event,
          timestamp: new Date().toISOString(),
          storeId: connection.storeId
        };
        
        if (this.sendToConnection(connectionId, eventWithMetadata)) {
          sentCount++;
        }
      }
    });

    return sentCount;
  }

  /**
   * Get connection statistics
   */
  public getStats() {
    const stats = {
      totalConnections: this.connections.size,
      connectionsByStore: {} as Record<string, number>,
      subscriptionsByChannel: {} as Record<string, number>,
      uptime: process.uptime()
    };

    // Count connections by store
    this.connections.forEach(connection => {
      stats.connectionsByStore[connection.storeId] = 
        (stats.connectionsByStore[connection.storeId] || 0) + 1;
    });

    // Count subscriptions by channel
    this.channelSubscriptions.forEach((subscribers, channel) => {
      stats.subscriptionsByChannel[channel] = subscribers.size;
    });

    return stats;
  }

  /**
   * Setup socket event listeners
   */
  private setupSocketListeners(connection: ClientConnection) {
    connection.socket.on("message", (data: WebSocket.Data) => {
      this.handleMessage(connection.id, data);
    });

    connection.socket.on("close", () => {
      this.unregisterConnection(connection.id);
    });

    connection.socket.on("error", (error) => {
      logger.error("[WEBSOCKET_ERROR]", {
        connectionId: connection.id,
        error: error.message
      });
      this.unregisterConnection(connection.id);
    });
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(connectionId: string, data: WebSocket.Data) {
    try {
      const message = JSON.parse(data.toString());
      const connection = this.connections.get(connectionId);
      
      if (!connection) return;

      switch (message.type) {
        case "subscribe":
          if (message.channel) {
            this.subscribeToChannel(connectionId, message.channel);
            this.sendToConnection(connectionId, {
              type: "subscription.confirmed",
              payload: { channel: message.channel }
            });
          }
          break;

        case "unsubscribe":
          if (message.channel) {
            this.unsubscribeFromChannel(connectionId, message.channel);
            this.sendToConnection(connectionId, {
              type: "unsubscription.confirmed",
              payload: { channel: message.channel }
            });
          }
          break;

        case "ping":
          this.sendToConnection(connectionId, {
            type: "pong",
            payload: { timestamp: new Date().toISOString() }
          });
          break;

        default:
          logger.warn("[WEBSOCKET_UNKNOWN_MESSAGE]", {
            connectionId,
            messageType: message.type
          });
      }
    } catch (error) {
      logger.error("[WEBSOCKET_MESSAGE_ERROR]", {
        connectionId,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  /**
   * Send message to specific connection
   */
  private sendToConnection(
    connectionId: string,
    event: Omit<WebSocketEvent, "timestamp" | "storeId"> &
      Partial<Pick<WebSocketEvent, "timestamp" | "storeId">>
  ): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection || connection.socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      const fullEvent: WebSocketEvent = {
        timestamp: event.timestamp ?? new Date().toISOString(),
        storeId: event.storeId ?? connection.storeId,
        ...event,
      };
      connection.socket.send(JSON.stringify(fullEvent));
      return true;
    } catch (error) {
      logger.error("[WEBSOCKET_SEND_ERROR]", {
        connectionId,
        error: error instanceof Error ? error.message : "Unknown error"
      });
      return false;
    }
  }

  /**
   * Initialize heartbeat mechanism
   */
  private initializeHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.broadcastToChannel(WebSocketChannel.ALERTS, {
        type: "heartbeat",
        payload: {
          serverTime: new Date().toISOString(),
          connectionCount: this.connections.size
        }
      });
    }, 30000); // Every 30 seconds
  }

  /**
   * Generate unique connection ID
   */
  private generateConnectionId(): string {
    return `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup resources
   */
  public destroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    this.connections.forEach((_, connectionId) => {
      this.unregisterConnection(connectionId);
    });

    logger.info("[WEBSOCKET_MANAGER_DESTROYED]");
  }
}

/**
 * Real-time Event Publisher for business events
 */
export class RealTimeEventPublisher {
  private wsManager: WebSocketManager;

  constructor() {
    this.wsManager = WebSocketManager.getInstance();
  }

  /**
   * Publish order-related events
   */
  public publishOrderEvent(
    storeId: string,
    eventType: WebSocketEventType,
    orderId: string,
    orderData: unknown
  ) {
    this.wsManager.sendToStore(storeId, {
      type: eventType,
      payload: {
        orderId,
        order: orderData,
        action: eventType.split('.')[1] // created, updated, completed
      }
    });
  }

  /**
   * Publish inventory alerts
   */
  public publishInventoryAlert(
    storeId: string,
    productId: string,
    productName: string,
    currentStock: number,
    threshold: number
  ) {
    this.wsManager.sendToStore(storeId, {
      type: WebSocketEventType.INVENTORY_LOW,
      payload: {
        productId,
        productName,
        currentStock,
        threshold,
        alertLevel: currentStock < threshold ? 'critical' : 'warning'
      }
    });
  }

  /**
   * Publish customer events
   */
  public publishCustomerEvent(
    storeId: string,
    eventType: WebSocketEventType,
    customerId: string,
    customerData: unknown
  ) {
    this.wsManager.sendToStore(storeId, {
      type: eventType,
      payload: {
        customerId,
        customer: customerData
      }
    });
  }

  /**
   * Publish payment events
   */
  public publishPaymentEvent(
    storeId: string,
    paymentId: string,
    amount: number,
    paymentMethod: string,
    status: string
  ) {
    this.wsManager.sendToStore(storeId, {
      type: WebSocketEventType.PAYMENT_RECEIVED,
      payload: {
        paymentId,
        amount,
        paymentMethod,
        status,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Publish critical alerts
   */
  public publishCriticalAlert(
    storeId: string,
    alertType: string,
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    metadata?: unknown
  ) {
    this.wsManager.sendToStore(storeId, {
      type: WebSocketEventType.ALERT_CRITICAL,
      payload: {
        alertType,
        message,
        severity,
        metadata,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Publish performance updates
   */
  public publishPerformanceUpdate(
    storeId: string,
    metrics: unknown
  ) {
    this.wsManager.sendToStore(storeId, {
      type: WebSocketEventType.PERFORMANCE_UPDATE,
      payload: {
        metrics,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Publish live analytics
   */
  public publishLiveAnalytics(storeId: string, analyticsData: unknown) {
    this.wsManager.sendToStore(storeId, {
      type: WebSocketEventType.ANALYTICS_LIVE,
      payload: {
        ...(analyticsData && typeof analyticsData === "object"
          ? (analyticsData as Record<string, unknown>)
          : {}),
        timestamp: new Date().toISOString(),
      },
    });
  }
}