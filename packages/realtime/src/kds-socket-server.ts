/**
 * WebSocket Server for KDS Real-Time Sync
 * 
 * Features:
 * - Store-specific channels
 * - Ticket lifecycle events
 * - Timer synchronization
 * - Kitchen chat
 * - Audio alert triggers
 */

import { Server } from 'socket.io';
import { createServer } from 'http';

const PORT = process.env.KDS_WS_PORT || 3001;

export class KDSSocketServer {
  private io: Server;
  private httpServer: any;
  private storeChannels: Map<string, Set<string>> = new Map();
  private timerSyncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.httpServer = createServer();
    this.io = new Server(this.httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`[KDS_WS] Client connected: ${socket.id}`);

      // Subscribe to store channel
      socket.on('subscribe', ({ channel }: { channel: string }) => {
        socket.join(channel);
        const storeId = channel.replace('kds:', '');
        
        if (!this.storeChannels.has(storeId)) {
          this.storeChannels.set(storeId, new Set());
        }
        this.storeChannels.get(storeId)!.add(socket.id);
        
        console.log(`[KDS_WS] ${socket.id} subscribed to ${channel}`);
        console.log(`[KDS_WS] Store ${storeId} has ${this.storeChannels.get(storeId)?.size} connected clients`);
      });

      // Unsubscribe from channel
      socket.on('unsubscribe', ({ channel }: { channel: string }) => {
        socket.leave(channel);
        const storeId = channel.replace('kds:', '');
        this.storeChannels.get(storeId)?.delete(socket.id);
      });

      // Broadcast KDS update
      socket.on('kds:broadcast', (update: any) => {
        const channel = `kds:${update.storeId}`;
        socket.to(channel).emit('kds:update', update);
        console.log(`[KDS_WS] Broadcast ${update.type} to ${channel}`);
      });

      // Typing indicator for kitchen chat
      socket.on('kds:typing', (data: any) => {
        const channel = `kds:${data.storeId}`;
        socket.to(channel).emit('kds:typing', data);
      });

      // Timer synchronization request
      socket.on('kds:timer-sync', (data: any, callback: any) => {
        callback({
          success: true,
          serverTime: Date.now(),
        });
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`[KDS_WS] Client disconnected: ${socket.id}`);
        
        // Remove from all store channels
        this.storeChannels.forEach((clients, storeId) => {
          clients.delete(socket.id);
          if (clients.size === 0) {
            this.storeChannels.delete(storeId);
          }
        });
      });
    });
  }

  /**
   * Start WebSocket server
   */
  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpServer.listen(PORT, () => {
        console.log(`[KDS_WS] Server running on port ${PORT}`);
        resolve();
      });

      this.httpServer.on('error', (error: any) => {
        console.error('[KDS_WS] Server error:', error);
        reject(error);
      });

      // Start timer sync interval (every 30 seconds)
      this.timerSyncInterval = setInterval(() => {
        this.broadcastTimerSync();
      }, 30000);
    });
  }

  /**
   * Stop WebSocket server
   */
  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.timerSyncInterval) {
        clearInterval(this.timerSyncInterval);
      }

      this.io.close((err?: Error) => {
        if (err) {
          reject(err);
        } else {
          console.log('[KDS_WS] Server stopped');
          resolve();
        }
      });
    });
  }

  /**
   * Broadcast timer synchronization to all clients
   */
  private broadcastTimerSync() {
    this.io.emit('kds:timer-sync', {
      serverTime: Date.now(),
      type: 'sync',
    });
  }

  /**
   * Send audio alert to specific store
   */
  sendAudioAlert(storeId: string, alertType: 'urgent' | 'overdue' | 'bump' | 'chat') {
    const channel = `kds:${storeId}`;
    this.io.to(channel).emit('kds:audio-alert', {
      type: alertType,
      timestamp: Date.now(),
    });
    console.log(`[KDS_WS] Sent ${alertType} audio alert to ${channel}`);
  }

  /**
   * Get connected clients count for a store
   */
  getConnectedClientsCount(storeId: string): number {
    return this.storeChannels.get(storeId)?.size || 0;
  }

  /**
   * Get server stats
   */
  getStats() {
    return {
      connectedClients: this.io.engine.clientsCount,
      activeStores: this.storeChannels.size,
      storeDetails: Array.from(this.storeChannels.entries()).map(([storeId, clients]) => ({
        storeId,
        clientCount: clients.size,
      })),
    };
  }
}

// Export singleton instance
export const kdsSocketServer = new KDSSocketServer();

// Start server if run directly
if (require.main === module) {
  kdsSocketServer.start().catch(console.error);
}
