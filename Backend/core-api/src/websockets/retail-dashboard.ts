import { WebSocketServer, WebSocket } from 'ws';
import { prisma } from '@vayva/db';
import type { Server } from 'http';

interface ChannelSubscribers {
  [channel: string]: Set<WebSocket>;
}

interface AuthenticatedSocket extends WebSocket {
  storeId?: string;
  userId?: string;
  isAuthenticated: boolean;
}

export class RetailWebSocketServer {
  private wss: WebSocketServer;
  private channels: ChannelSubscribers = {};
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws/retail-dashboard',
    });

    this.initialize();
  }

  private initialize() {
    this.wss.on('connection', (ws: AuthenticatedSocket) => {
      console.log('[Retail WS] New connection');
      
      ws.isAuthenticated = false;

      // Handle authentication
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message.toString());
          
          switch (data.type) {
            case 'auth':
              await this.handleAuthentication(ws, data);
              break;
            
            case 'subscribe':
              await this.handleSubscribe(ws, data);
              break;
            
            case 'unsubscribe':
              this.handleUnsubscribe(ws, data);
              break;
            
            case 'ping':
              ws.send(JSON.stringify({ type: 'pong' }));
              break;
          }
        } catch (error) {
          console.error('[Retail WS] Error processing message:', error);
          ws.send(JSON.stringify({ 
            type: 'error', 
            error: 'Invalid message format' 
          }));
        }
      });

      ws.on('close', () => {
        console.log('[Retail WS] Connection closed');
        this.removeClient(ws);
      });

      ws.on('error', (error) => {
        console.error('[Retail WS] WebSocket error:', error);
        this.removeClient(ws);
      });

      // Send initial connection confirmation
      ws.send(JSON.stringify({ 
        type: 'connected', 
        timestamp: new Date().toISOString() 
      }));
    });

    // Start heartbeat to keep connections alive
    this.startHeartbeat();
  }

  private async handleAuthentication(
    ws: AuthenticatedSocket, 
    data: { token: string; storeId: string; userId: string }
  ) {
    try {
      // TODO: Implement token validation with Clerk/JWT
      const { storeId, userId } = data;
      
      // Validate user has access to store
      const membership = await prisma.teamMember.findFirst({
        where: {
          userId,
          storeId,
          status: 'active',
        },
      });

      if (!membership) {
        ws.send(JSON.stringify({ 
          type: 'auth_error', 
          error: 'Unauthorized access to store' 
        }));
        return;
      }

      ws.storeId = storeId;
      ws.userId = userId;
      ws.isAuthenticated = true;

      ws.send(JSON.stringify({ 
        type: 'auth_success',
        storeId,
        userId,
      }));

      console.log(`[Retail WS] User ${userId} authenticated for store ${storeId}`);
    } catch (error) {
      console.error('[Retail WS] Auth error:', error);
      ws.send(JSON.stringify({ 
        type: 'auth_error', 
        error: 'Authentication failed' 
      }));
    }
  }

  private async handleSubscribe(
    ws: AuthenticatedSocket, 
    data: { channel: string }
  ) {
    if (!ws.isAuthenticated) {
      ws.send(JSON.stringify({ 
        type: 'error', 
        error: 'Authentication required' 
      }));
      return;
    }

    const { channel } = data;
    
    // Validate channel format: store:{storeId}:{type}
    if (!channel.startsWith(`store:${ws.storeId}:`)) {
      ws.send(JSON.stringify({ 
        type: 'error', 
        error: 'Invalid channel - must match your store' 
      }));
      return;
    }

    if (!this.channels[channel]) {
      this.channels[channel] = new Set();
    }
    
    this.channels[channel].add(ws);
    
    console.log(`[Retail WS] Client subscribed to ${channel}`);
    
    ws.send(JSON.stringify({
      type: 'subscribed',
      channel,
      subscriberCount: this.channels[channel].size,
    }));
  }

  private handleUnsubscribe(
    ws: AuthenticatedSocket, 
    data: { channel: string }
  ) {
    const { channel } = data;
    
    if (this.channels[channel]) {
      this.channels[channel].delete(ws);
      
      if (this.channels[channel].size === 0) {
        delete this.channels[channel];
      }
      
      console.log(`[Retail WS] Client unsubscribed from ${channel}`);
    }
  }

  private removeClient(ws: AuthenticatedSocket) {
    Object.keys(this.channels).forEach((channel) => {
      this.channels[channel].delete(ws);
      if (this.channels[channel].size === 0) {
        delete this.channels[channel];
      }
    });
  }

  /**
   * Broadcast message to all clients in a channel
   */
  public broadcastToChannel(channel: string, data: any) {
    const subscribers = this.channels[channel];
    if (!subscribers || subscribers.size === 0) {
      console.log(`[Retail WS] No subscribers for ${channel}`);
      return;
    }

    const message = JSON.stringify({
      type: 'update',
      channel,
      data,
      timestamp: new Date().toISOString(),
    });

    let removedCount = 0;
    subscribers.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      } else {
        // Clean up closed connections
        subscribers.delete(client);
        removedCount++;
      }
    });

    if (removedCount > 0) {
      console.log(`[Retail WS] Cleaned up ${removedCount} closed connections`);
    }

    console.log(`[Retail WS] Broadcast to ${subscribers.size} clients in ${channel}`);
  }

  /**
   * Broadcast to all channels matching a pattern
   */
  public broadcastToStore(storeId: string, type: string, data: any) {
    const pattern = `store:${storeId}:${type}`;
    const matchingChannels = Object.keys(this.channels).filter((ch) => 
      ch.startsWith(pattern)
    );

    matchingChannels.forEach((channel) => {
      this.broadcastToChannel(channel, data);
    });

    console.log(`[Retail WS] Store broadcast to ${matchingChannels.length} channels`);
  }

  /**
   * Get statistics
   */
  public getStats() {
    return {
      totalConnections: Object.values(this.channels).reduce(
        (sum, subs) => sum + subs.size, 
        0
      ),
      channelCount: Object.keys(this.channels).length,
      channels: Object.entries(this.channels).map(([channel, subs]) => ({
        channel,
        subscriberCount: subs.size,
      })),
    };
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if ((ws as AuthenticatedSocket).isAuthenticated) {
          ws.ping();
        }
      });
    }, 30000); // Every 30 seconds
  }

  public shutdown() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.wss.clients.forEach((client) => {
      client.close();
    });

    this.wss.close();
  }
}

// Singleton instance
let instance: RetailWebSocketServer | null = null;

export function getRetailWebSocketServer(): RetailWebSocketServer | null {
  return instance;
}

export function initializeRetailWebSocketServer(server: Server): RetailWebSocketServer {
  if (instance) {
    console.log('[Retail WS] Using existing instance');
    return instance;
  }

  instance = new RetailWebSocketServer(server);
  console.log('[Retail WS] Server initialized on port 3001');
  return instance;
}
