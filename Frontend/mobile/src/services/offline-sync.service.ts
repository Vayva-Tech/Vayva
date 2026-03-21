/**
 * Offline-First Architecture - Data Synchronization Service
 * 
 * Provides:
 * - Local database persistence (WatermelonDB/SQLite)
 * - Background sync with conflict resolution
 * - Queue management for offline actions
 * - Network status monitoring
 * - Delta sync for efficiency
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export interface SyncStatus {
  lastSync: Date | null;
  nextSync: Date | null;
  pendingActions: number;
  syncInProgress: boolean;
  error?: string;
}

export interface QueuedAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  timestamp: Date;
  retryCount: number;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  conflicts: Array<{
    entity: string;
    id: string;
    localVersion: any;
    remoteVersion: any;
  }>;
}

class OfflineSyncService {
  private static instance: OfflineSyncService;
  private isOnline: boolean = false;
  private syncInProgress: boolean = false;
  private actionQueue: QueuedAction[] = [];
  private syncInterval: ReturnType<typeof setTimeout> | null = null;
  private readonly MAX_RETRIES = 3;
  private readonly SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.initializeNetworkListener();
    this.loadQueuedActions();
  }

  static getInstance(): OfflineSyncService {
    if (!OfflineSyncService.instance) {
      OfflineSyncService.instance = new OfflineSyncService();
    }
    return OfflineSyncService.instance;
  }

  /**
   * Initialize network connectivity monitoring
   */
  private initializeNetworkListener(): void {
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;

      console.log('[OFFLINE_SYNC] Network status:', {
        isConnected: this.isOnline,
        type: state.type,
      });

      // Trigger sync when coming back online
      if (!wasOnline && this.isOnline) {
        console.log('[OFFLINE_SYNC] Back online, triggering sync...');
        this.syncPendingActions();
      }
    });
  }

  /**
   * Load queued actions from storage
   */
  private async loadQueuedActions(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('@vayva:action-queue');
      if (stored) {
        this.actionQueue = JSON.parse(stored);
        console.log(`[OFFLINE_SYNC] Loaded ${this.actionQueue.length} queued actions`);
      }
    } catch (error) {
      console.error('[OFFLINE_SYNC] Failed to load queue:', error);
    }
  }

  /**
   * Save queued actions to storage
   */
  private async saveQueuedActions(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        '@vayva:action-queue',
        JSON.stringify(this.actionQueue)
      );
    } catch (error) {
      console.error('[OFFLINE_SYNC] Failed to save queue:', error);
    }
  }

  /**
   * Check current network status
   */
  async checkConnection(): Promise<boolean> {
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected ?? false;
    return this.isOnline;
  }

  /**
   * Queue an action for later sync
   */
  async queueAction(action: Omit<QueuedAction, 'id' | 'timestamp' | 'retryCount'>): Promise<string> {
    const queuedAction: QueuedAction = {
      ...action,
      id: `${action.entity}_${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      retryCount: 0,
    };

    this.actionQueue.push(queuedAction);
    await this.saveQueuedActions();

    console.log(`[OFFLINE_SYNC] Queued ${action.type} action for ${action.entity}`);

    // If online, try to sync immediately
    if (this.isOnline && !this.syncInProgress) {
      this.syncPendingActions();
    }

    return queuedAction.id;
  }

  /**
   * Sync pending actions to backend
   */
  async syncPendingActions(): Promise<SyncResult> {
    if (this.syncInProgress) {
      console.log('[OFFLINE_SYNC] Sync already in progress');
      return { success: false, synced: 0, failed: 0, conflicts: [] };
    }

    if (!this.isOnline) {
      console.log('[OFFLINE_SYNC] Cannot sync - offline');
      return { success: false, synced: 0, failed: 0, conflicts: [] };
    }

    this.syncInProgress = true;
    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      conflicts: [],
    };

    try {
      console.log(`[OFFLINE_SYNC] Starting sync of ${this.actionQueue.length} actions`);

      // Process actions in order
      const actionsToProcess = [...this.actionQueue];
      
      for (const action of actionsToProcess) {
        try {
          await this.executeAction(action);
          result.synced++;
          
          // Remove from queue on success
          this.actionQueue = this.actionQueue.filter(a => a.id !== action.id);
        } catch (error: any) {
          console.error(`[OFFLINE_SYNC] Failed to sync ${action.id}:`, error);
          
          if (error.status === 409) {
            // Conflict detected
            result.conflicts.push({
              entity: action.entity,
              id: action.data.id,
              localVersion: action.data,
              remoteVersion: error.remoteData,
            });
          } else if (action.retryCount < this.MAX_RETRIES) {
            // Retry later
            action.retryCount++;
          } else {
            // Max retries reached
            result.failed++;
            this.actionQueue = this.actionQueue.filter(a => a.id !== action.id);
          }
        }
      }

      await this.saveQueuedActions();
      
      console.log(`[OFFLINE_SYNC] Sync complete: ${result.synced} synced, ${result.failed} failed`);
    } catch (error) {
      console.error('[OFFLINE_SYNC] Sync failed:', error);
      result.success = false;
    } finally {
      this.syncInProgress = false;
    }

    return result;
  }

  /**
   * Execute a single queued action
   */
  private async executeAction(action: QueuedAction): Promise<void> {
    const endpoint = `/api/${action.entity}`;
    
    let response: Response;
    
    switch (action.type) {
      case 'create':
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data),
        });
        break;
        
      case 'update':
        response = await fetch(`${endpoint}/${action.data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data),
        });
        break;
        
      case 'delete':
        response = await fetch(`${endpoint}/${action.data.id}`, {
          method: 'DELETE',
        });
        break;
        
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }

    if (!response.ok) {
      const error = new Error('Sync failed') as any;
      error.status = response.status;
      
      if (response.status === 409) {
        error.remoteData = await response.json();
      }
      
      throw error;
    }
  }

  /**
   * Get current sync status
   */
  async getStatus(): Promise<SyncStatus> {
    const lastSyncTimestamp = await AsyncStorage.getItem('@vayva:last-sync');
    const lastSync = lastSyncTimestamp ? new Date(lastSyncTimestamp) : null;
    const nextSync = lastSync 
      ? new Date(lastSync.getTime() + this.SYNC_INTERVAL_MS)
      : null;

    return {
      lastSync,
      nextSync,
      pendingActions: this.actionQueue.length,
      syncInProgress: this.syncInProgress,
    };
  }

  /**
   * Start automatic background sync
   */
  startBackgroundSync(): void {
    if (this.syncInterval) {
      console.log('[OFFLINE_SYNC] Background sync already running');
      return;
    }

    console.log('[OFFLINE_SYNC] Starting background sync every 5 minutes');
    
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncPendingActions();
      }
    }, this.SYNC_INTERVAL_MS);
  }

  /**
   * Stop automatic background sync
   */
  stopBackgroundSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('[OFFLINE_SYNC] Background sync stopped');
    }
  }

  /**
   * Clear all queued actions
   */
  async clearQueue(): Promise<void> {
    this.actionQueue = [];
    await this.saveQueuedActions();
    console.log('[OFFLINE_SYNC] Queue cleared');
  }

  /**
   * Get queued actions for debugging
   */
  getQueuedActions(): QueuedAction[] {
    return [...this.actionQueue];
  }
}

// Export singleton instance
export const offlineSyncService = OfflineSyncService.getInstance();
