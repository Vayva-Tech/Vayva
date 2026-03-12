/**
 * Real-Time KDS Updates via WebSocket
 * 
 * Provides live synchronization for kitchen operations:
 * - Ticket status changes
 * - New order notifications  
 * - Station updates
 * - 86 board changes
 * - Timer synchronization
 */

import { io, Socket } from 'socket.io-client';

type KDSUpdateType = 
  | 'ticket-created'
  | 'ticket-status-changed'
  | 'ticket-bumped'
  | 'item-completed'
  | 'station-updated'
  | '86-item-added'
  | '86-item-removed';

interface KDSUpdate {
  type: KDSUpdateType;
  storeId: string;
  stationId?: string;
  ticketId?: string;
  data: any;
  timestamp: number;
}

type KDSUpdateCallback = (update: KDSUpdate) => void;

class KDSRealTimeService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<KDSUpdateCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  /**
   * Initialize WebSocket connection
   */
  connect(storeId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
        
        this.socket = io(wsUrl, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: this.reconnectDelay,
          reconnectionAttempts: this.maxReconnectAttempts,
        });

        this.socket.on('connect', () => {
          console.log('[KDS_WS] Connected to real-time server');
          this.reconnectAttempts = 0;
          
          // Subscribe to store's KDS channel
          this.socket?.emit('subscribe', {
            channel: `kds:${storeId}`,
          });
          
          resolve();
        });

        this.socket.on('disconnect', () => {
          console.log('[KDS_WS] Disconnected from real-time server');
        });

        this.socket.on('connect_error', (error) => {
          console.error('[KDS_WS] Connection error:', error);
          reject(error);
        });

        // Listen for KDS updates
        this.socket.on('kds:update', (update: KDSUpdate) => {
          if (update.storeId === storeId) {
            this.notifyListeners(update);
          }
        });

        // Handle reconnection
        this.socket.on('reconnect', (attemptNumber: number) => {
          console.log(`[KDS_WS] Reconnected after ${attemptNumber} attempts`);
          this.reconnectAttempts = 0;
          
          // Re-subscribe to channel
          this.socket?.emit('subscribe', {
            channel: `kds:${storeId}`,
          });
        });

      } catch (error) {
        console.error('[KDS_WS] Failed to initialize:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  /**
   * Subscribe to KDS updates
   */
  subscribe(storeId: string, callback: KDSUpdateCallback): () => void {
    const key = `store:${storeId}`;
    
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    
    this.listeners.get(key)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }

  /**
   * Notify all listeners of an update
   */
  private notifyListeners(update: KDSUpdate) {
    const key = `store:${update.storeId}`;
    const callbacks = this.listeners.get(key) || new Set();
    
    callbacks.forEach(callback => {
      try {
        callback(update);
      } catch (error) {
        console.error('[KDS_WS] Error in listener callback:', error);
      }
    });
  }

  /**
   * Broadcast KDS update to all connected clients
   */
  broadcastUpdate(update: KDSUpdate) {
    if (!this.socket?.connected) {
      console.warn('[KDS_WS] Cannot broadcast: not connected');
      return;
    }

    this.socket.emit('kds:broadcast', update);
  }

  /**
   * Send typing indicator (for kitchen chat)
   */
  sendTypingIndicator(storeId: string, stationId: string, userId: string) {
    this.socket?.emit('kds:typing', {
      storeId,
      stationId,
      userId,
      timestamp: Date.now(),
    });
  }

  /**
   * Request timer synchronization
   */
  requestTimerSync(storeId: string) {
    return new Promise<number>((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      this.socket.emit('kds:timer-sync', { storeId }, (response: any) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response.serverTime);
        }
      });
    });
  }

  /**
   * Check connection status
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get connection state
   */
  getConnectionState(): 'disconnected' | 'connecting' | 'connected' {
    if (!this.socket) return 'disconnected';
    if (this.socket.connected) return 'connected';
    return 'connecting';
  }
}

// Export singleton instance
export const kdsRealTimeService = new KDSRealTimeService();

// Convenience hook for React components
export function useKDSRealTime(storeId: string, onUpdate: KDSUpdateCallback) {
  useEffect(() => {
    if (!storeId) return;

    let unsubscribe: (() => void) | null = null;

    const init = async () => {
      try {
        await kdsRealTimeService.connect(storeId);
        unsubscribe = kdsRealTimeService.subscribe(storeId, onUpdate);
      } catch (error) {
        console.error('[KDSRealTime] Failed to initialize:', error);
      }
    };

    init();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [storeId, onUpdate]);
}
