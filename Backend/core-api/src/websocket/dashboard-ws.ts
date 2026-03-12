// ============================================================================
// DASHBOARD WEBSOCKET SERVER
// ============================================================================
// Provides real-time updates for time-sensitive industries:
// - Food/Restaurant (Kitchen Display System)
// - Events (Live check-ins)
// - Automotive (Test drive scheduling)
// ============================================================================

import { WebSocketServer, WebSocket } from "ws";
import { verify } from "jsonwebtoken";
import { logger } from "@vayva/shared";

// Extend WebSocket with custom properties
interface DashboardClient extends WebSocket {
  merchantId?: string;
  industrySlug?: string;
  subscribedChannels: Set<string>;
  userId?: string;
}

// WebSocket message format
interface WebSocketMessage {
  event: string;
  data: any;
  timestamp: number;
}

// Industry-specific update types
type IndustryUpdateType = 
  | "order_created"
  | "order_updated"
  | "kitchen_status"
  | "booking_confirmed"
  | "check_in"
  | "test_drive_scheduled"
  | "patient_checked_in"
  | "class_booking"
  | "subscription_renewed";

export class DashboardWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, Set<DashboardClient>> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(server: any) {
    // Initialize WebSocket server
    this.wss = new WebSocketServer({ 
      server, 
      path: "/ws/dashboard",
      verifyClient: this.verifyClient.bind(this)
    });
    
    this.setupEventHandlers();
    this.startHeartbeat();
    
    logger.info("[WEBSOCKET] Dashboard WebSocket server initialized");
  }

  private verifyClient(info: any, cb: (result: boolean, code?: number, message?: string) => void) {
    const { req } = info;
    const token = this.extractToken(req);
    
    if (!token) {
      cb(false, 4001, "Missing authentication token");
      return;
    }

    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as any;
      req.user = decoded;
      cb(true);
    } catch (error) {
      cb(false, 4002, "Invalid token");
    }
  }

  private setupEventHandlers() {
    this.wss.on("connection", (ws: DashboardClient, req: any) => {
      const user = req.user;
      ws.merchantId = user.merchantId;
      ws.userId = user.id;
      ws.industrySlug = user.industrySlug;
      ws.subscribedChannels = new Set();
      
      logger.info(`[WEBSOCKET] Client connected: ${user.merchantId}`);
      
      // Subscribe to merchant-specific channel
      this.subscribeToChannel(ws, `merchant:${ws.merchantId}`);
      
      // Subscribe to industry channel for shared updates
      if (ws.industrySlug) {
        this.subscribeToChannel(ws, `industry:${ws.industrySlug}`);
      }
      
      // Send welcome message
      this.sendMessage(ws, {
        event: "connected",
        data: {
          merchantId: ws.merchantId,
          industrySlug: ws.industrySlug,
          timestamp: Date.now()
        }
      });
      
      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          logger.error("[WEBSOCKET] Message parse error:", error);
        }
      });
      
      ws.on("close", () => {
        this.handleDisconnect(ws);
      });
      
      ws.on("error", (error) => {
        logger.error(`[WEBSOCKET] Client error:`, error);
      });
    });
    
    this.wss.on("error", (error) => {
      logger.error("[WEBSOCKET] Server error:", error);
    });
  }

  private handleMessage(ws: DashboardClient, message: any) {
    switch (message.event) {
      case "subscribe":
        this.handleSubscribe(ws, message.data?.channel);
        break;
      case "unsubscribe":
        this.handleUnsubscribe(ws, message.data?.channel);
        break;
      case "ping":
        this.sendMessage(ws, { event: "pong", data: {}, timestamp: Date.now() });
        break;
      default:
        logger.warn(`[WEBSOCKET] Unknown event: ${message.event}`);
    }
  }

  private handleSubscribe(ws: DashboardClient, channel: string) {
    if (channel) {
      this.subscribeToChannel(ws, channel);
      this.sendMessage(ws, {
        event: "subscribed",
        data: { channel },
        timestamp: Date.now()
      });
    }
  }

  private handleUnsubscribe(ws: DashboardClient, channel: string) {
    if (channel) {
      this.unsubscribeFromChannel(ws, channel);
      this.sendMessage(ws, {
        event: "unsubscribed",
        data: { channel },
        timestamp: Date.now()
      });
    }
  }

  private handleDisconnect(ws: DashboardClient) {
    logger.info(`[WEBSOCKET] Client disconnected: ${ws.merchantId}`);
    this.removeClient(ws);
  }

  private subscribeToChannel(ws: DashboardClient, channel: string) {
    if (!this.clients.has(channel)) {
      this.clients.set(channel, new Set());
    }
    
    this.clients.get(channel)!.add(ws);
    ws.subscribedChannels.add(channel);
    
    logger.debug(`[WEBSOCKET] Client subscribed to ${channel}`);
  }

  private unsubscribeFromChannel(ws: DashboardClient, channel: string) {
    const channelClients = this.clients.get(channel);
    if (channelClients) {
      channelClients.delete(ws);
      if (channelClients.size === 0) {
        this.clients.delete(channel);
      }
    }
    ws.subscribedChannels.delete(channel);
    
    logger.debug(`[WEBSOCKET] Client unsubscribed from ${channel}`);
  }

  private removeClient(ws: DashboardClient) {
    // Remove from all channels
    ws.subscribedChannels.forEach(channel => {
      this.unsubscribeFromChannel(ws, channel);
    });
  }

  private sendMessage(ws: DashboardClient, message: WebSocketMessage) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private extractToken(req: any): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }
    
    // Also check query params for WebSocket connections
    if (req.url) {
      const url = new URL(req.url, `http://${req.headers.host}`);
      return url.searchParams.get("token");
    }
    
    return null;
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws: DashboardClient) => {
        if (ws.readyState === WebSocket.OPEN) {
          this.sendMessage(ws, {
            event: "heartbeat",
            data: { ping: Date.now() },
            timestamp: Date.now()
          });
        }
      });
    }, 30000); // Every 30 seconds
  }

  // Public methods for broadcasting updates
  public broadcastToIndustry(industry: string, event: string, data: any) {
    const channelKey = `industry:${industry}`;
    const clients = this.clients.get(channelKey);
    
    if (clients) {
      const message: WebSocketMessage = {
        event,
        data,
        timestamp: Date.now()
      };
      
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
      
      logger.debug(`[WEBSOCKET] Broadcast to industry ${industry}: ${event}`);
    }
  }

  public broadcastToMerchant(merchantId: string, event: string, data: any) {
    const channelKey = `merchant:${merchantId}`;
    const clients = this.clients.get(channelKey);
    
    if (clients) {
      const message: WebSocketMessage = {
        event,
        data,
        timestamp: Date.now()
      };
      
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
      
      logger.debug(`[WEBSOCKET] Broadcast to merchant ${merchantId}: ${event}`);
    }
  }

  public broadcastToAll(event: string, data: any) {
    const message: WebSocketMessage = {
      event,
      data,
      timestamp: Date.now()
    };
    
    this.wss.clients.forEach((ws: DashboardClient) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
    
    logger.debug(`[WEBSOCKET] Broadcast to all clients: ${event}`);
  }

  // Industry-specific broadcast helpers
  public broadcastOrderUpdate(merchantId: string, orderId: string, status: string) {
    this.broadcastToMerchant(merchantId, "order_updated", {
      orderId,
      status,
      timestamp: Date.now()
    });
  }

  public broadcastKitchenUpdate(merchantId: string, orderId: string, status: string) {
    this.broadcastToMerchant(merchantId, "kitchen_status", {
      orderId,
      status,
      timestamp: Date.now()
    });
  }

  public broadcastBookingConfirmation(merchantId: string, bookingId: string, customerName: string) {
    this.broadcastToMerchant(merchantId, "booking_confirmed", {
      bookingId,
      customerName,
      timestamp: Date.now()
    });
  }

  public broadcastCheckIn(merchantId: string, eventId: string, attendeeName: string) {
    this.broadcastToMerchant(merchantId, "check_in", {
      eventId,
      attendeeName,
      timestamp: Date.now()
    });
  }

  public shutdown() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.wss.clients.forEach((ws: DashboardClient) => {
      ws.close(1001, "Server shutting down");
    });
    
    this.wss.close();
    logger.info("[WEBSOCKET] Dashboard WebSocket server shut down");
  }
}

// Singleton instance
let dashboardWS: DashboardWebSocketServer | null = null;

export function initializeDashboardWebSocket(server: any): DashboardWebSocketServer {
  if (!dashboardWS) {
    dashboardWS = new DashboardWebSocketServer(server);
  }
  return dashboardWS;
}

export function getDashboardWebSocket(): DashboardWebSocketServer | null {
  return dashboardWS;
}