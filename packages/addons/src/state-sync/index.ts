/**
 * State Sync - Bidirectional state synchronization between add-ons and host
 * 
 * Provides:
 * - Reactive state sharing using EventEmitter pattern
 * - Optimistic updates with rollback capability
 * - State validation and sanitization
 * - Conflict resolution for concurrent updates
 */

// ============================================================================
// Types
// ============================================================================

export type StateValue = 
  | string 
  | number 
  | boolean 
  | null 
  | StateValue[] 
  | { [key: string]: StateValue };

export interface StateSlice {
  [key: string]: StateValue;
}

export interface StateChange<T = StateValue> {
  /** Path to the changed property (e.g., "user.name") */
  path: string;
  /** Previous value */
  previousValue: T;
  /** New value */
  newValue: T;
  /** Timestamp of change */
  timestamp: number;
  /** Source of the change */
  source: string;
  /** Change ID for tracking */
  changeId: string;
}

export interface StateSubscription {
  /** Unique subscription ID */
  id: string;
  /** Path pattern to watch (e.g., "user.*" or "cart.items") */
  path: string;
  /** Callback function */
  callback: (change: StateChange) => void;
  /** Whether to receive updates for nested properties */
  deep: boolean;
}

export interface StateSyncOptions {
  /** Enable optimistic updates */
  optimistic: boolean;
  /** Debounce delay for batched updates (ms) */
  debounceMs: number;
  /** Maximum batch size before flush */
  maxBatchSize: number;
  /** Enable state validation */
  validateState: boolean;
  /** Enable conflict resolution */
  resolveConflicts: boolean;
  /** Conflict resolution strategy */
  conflictStrategy: 'last-write-wins' | 'first-write-wins' | 'merge';
}

export interface StateSyncConfig {
  /** Add-on instance ID */
  instanceId: string;
  /** Add-on definition ID */
  addOnId: string;
  /** Store/Tenant ID */
  storeId: string;
  /** Options for state synchronization */
  options: StateSyncOptions;
  /** State schema for validation */
  schema?: StateSchema;
  /** Initial state */
  initialState?: StateSlice;
}

export interface StateSchema {
  properties: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    required?: boolean;
    default?: StateValue;
    validate?: (value: StateValue) => boolean | string;
  }>;
}

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_SYNC_OPTIONS: StateSyncOptions = {
  optimistic: true,
  debounceMs: 16, // One frame at 60fps
  maxBatchSize: 100,
  validateState: true,
  resolveConflicts: true,
  conflictStrategy: 'last-write-wins',
};

// ============================================================================
// State Sync Class
// ============================================================================

export class StateSync {
  private config: StateSyncConfig;
  private state: StateSlice = {};
  private subscriptions: Map<string, StateSubscription> = new Map();
  private pendingChanges: StateChange[] = [];
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private changeHistory: StateChange[] = [];
  private maxHistorySize = 50;

  constructor(config: Omit<StateSyncConfig, 'options'> & { options?: Partial<StateSyncOptions> }) {
    this.config = {
      ...config,
      options: { ...DEFAULT_SYNC_OPTIONS, ...config.options },
    };
    
    if (config.initialState) {
      this.state = { ...config.initialState };
    }
  }

  /**
   * Get current state (full or at specific path)
   */
  get<T = StateValue>(path?: string): T | StateSlice {
    if (!path) return this.state as T;
    return this.getPathValue(this.state, path) as T;
  }

  /**
   * Set state at a specific path
   */
  set<T extends StateValue>(path: string, value: T, source = 'add-on'): void {
    // Validate if schema provided
    if (this.config.options.validateState && this.config.schema) {
      const validation = this.validateValue(path, value);
      if (!validation.valid) {
        console.warn(`[StateSync] Validation failed for ${path}:`, validation.error);
        return;
      }
    }

    const previousValue = this.getPathValue(this.state, path) as T;
    
    const change: StateChange<T> = {
      path,
      previousValue,
      newValue: value,
      timestamp: Date.now(),
      source,
      changeId: this.generateChangeId(),
    };

    // Apply optimistically
    if (this.config.options.optimistic) {
      this.setPathValue(this.state, path, value);
    }

    // Queue for sync
    this.pendingChanges.push(change);
    this.addToHistory(change);

    // Flush if batch is full
    if (this.pendingChanges.length >= this.config.options.maxBatchSize) {
      this.flush();
    } else {
      this.scheduleFlush();
    }

    // Notify local subscribers immediately
    this.notifySubscribers(change);
  }

  /**
   * Batch multiple state updates
   */
  batch(updates: Array<{ path: string; value: StateValue }>, source = 'add-on'): void {
    updates.forEach(({ path, value }) => {
      this.set(path, value, source);
    });
  }

  /**
   * Subscribe to state changes at a path pattern
   */
  subscribe(
    path: string,
    callback: (change: StateChange) => void,
    options: { deep?: boolean } = {}
  ): () => void {
    const id = this.generateSubscriptionId();
    const subscription: StateSubscription = {
      id,
      path,
      callback,
      deep: options.deep ?? false,
    };

    this.subscriptions.set(id, subscription);

    // Return unsubscribe function
    return () => {
      this.subscriptions.delete(id);
    };
  }

  /**
   * Apply external state changes (from host or other add-ons)
   */
  applyExternalChange(change: StateChange): void {
    // Check for conflicts
    if (this.config.options.resolveConflicts) {
      const lastChange = this.getLastChangeAtPath(change.path);
      
      if (lastChange && lastChange.timestamp > change.timestamp) {
        // Conflict detected
        const resolved = this.resolveConflict(lastChange, change);
        if (!resolved) return; // Keep local value
      }
    }

    // Apply the external change
    this.setPathValue(this.state, change.path, change.newValue);
    this.notifySubscribers(change);
  }

  /**
   * Synchronize full state with host
   */
  sync(): Promise<void> {
    return this.flush();
  }

  /**
   * Get state diff between current and provided state
   */
  diff(otherState: StateSlice): StateChange[] {
    const changes: StateChange[] = [];
    
    const compare = (obj1: StateValue, obj2: StateValue, path: string) => {
      if (JSON.stringify(obj1) !== JSON.stringify(obj2)) {
        changes.push({
          path,
          previousValue: obj1,
          newValue: obj2,
          timestamp: Date.now(),
          source: 'diff',
          changeId: this.generateChangeId(),
        });
      }
    };

    this.deepCompare(this.state, otherState, '', compare);
    return changes;
  }

  /**
   * Patch state with partial updates
   */
  patch(partialState: Partial<StateSlice>, source = 'host'): void {
    Object.entries(partialState).forEach(([key, value]) => {
      if (value !== undefined) {
        this.set(key, value as StateValue, source);
      }
    });
  }

  /**
   * Reset state to initial or provided value
   */
  reset(newState?: StateSlice): void {
    const oldState = { ...this.state };
    this.state = newState || { ...this.config.initialState };
    
    // Notify all subscribers of reset
    this.subscriptions.forEach((sub) => {
      sub.callback({
        path: '*',
        previousValue: oldState,
        newValue: this.state,
        timestamp: Date.now(),
        source: 'system',
        changeId: this.generateChangeId(),
      });
    });
  }

  /**
   * Get change history (for undo/debugging)
   */
  getHistory(): StateChange[] {
    return [...this.changeHistory];
  }

  /**
   * Undo last change
   */
  undo(): boolean {
    const lastChange = this.changeHistory.pop();
    if (!lastChange) return false;

    this.setPathValue(this.state, lastChange.path, lastChange.previousValue);
    this.notifySubscribers({
      ...lastChange,
      newValue: lastChange.previousValue,
      previousValue: lastChange.newValue,
      source: 'undo',
    });

    return true;
  }

  /**
   * Destroy the sync instance and cleanup
   */
  destroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.subscriptions.clear();
    this.pendingChanges = [];
    this.changeHistory = [];
  }

  // ==========================================================================
  // Private Methods
  // ==========================================================================

  private getPathValue(obj: StateValue, path: string): StateValue | undefined {
    const keys = path.split('.');
    let current: StateValue = obj;
    
    for (const key of keys) {
      if (current === null || typeof current !== 'object') return undefined;
      current = (current as StateSlice)[key];
    }
    
    return current;
  }

  private setPathValue(obj: StateSlice, path: string, value: StateValue): void {
    const keys = path.split('.');
    let current: StateSlice = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key] as StateSlice;
    }
    
    current[keys[keys.length - 1]] = value;
  }

  private scheduleFlush(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = setTimeout(() => {
      this.flush();
    }, this.config.options.debounceMs);
  }

  private async flush(): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.pendingChanges.length === 0) return;

    const changes = [...this.pendingChanges];
    this.pendingChanges = [];

    // Emit to host (would be implemented with actual transport)
    this.emitToHost({
      type: 'state:sync',
      instanceId: this.config.instanceId,
      changes,
    });
  }

  private emitToHost(message: Record<string, unknown>): void {
    // In real implementation, this would use postMessage or API call
    window.dispatchEvent(
      new CustomEvent('vayva:addon-state-sync', {
        detail: message,
      })
    );
  }

  private notifySubscribers(change: StateChange): void {
    this.subscriptions.forEach((sub) => {
      const matches = sub.deep
        ? change.path.startsWith(sub.path) || sub.path === '*'
        : change.path === sub.path || 
          (sub.path.endsWith('.*') && change.path.startsWith(sub.path.slice(0, -2)));

      if (matches) {
        try {
          sub.callback(change);
        } catch (error) {
          console.error(`[StateSync] Subscriber error for ${sub.path}:`, error);
        }
      }
    });
  }

  private resolveConflict(localChange: StateChange, remoteChange: StateChange): boolean {
    switch (this.config.options.conflictStrategy) {
      case 'last-write-wins':
        return remoteChange.timestamp > localChange.timestamp;
      case 'first-write-wins':
        return remoteChange.timestamp < localChange.timestamp;
      case 'merge':
        // Simple merge for objects
        if (
          typeof localChange.newValue === 'object' &&
          typeof remoteChange.newValue === 'object'
        ) {
          const merged = {
            ...(localChange.newValue as Record<string, unknown>),
            ...(remoteChange.newValue as Record<string, unknown>),
          };
          this.setPathValue(this.state, localChange.path, merged as StateValue);
          return true;
        }
        return remoteChange.timestamp > localChange.timestamp;
      default:
        return true;
    }
  }

  private validateValue(path: string, value: StateValue): { valid: boolean; error?: string } {
    if (!this.config.schema) return { valid: true };

    // Simple path-based validation
    const key = path.split('.').pop() || path;
    const prop = this.config.schema.properties[key];

    if (!prop) return { valid: true };

    if (prop.required && (value === undefined || value === null)) {
      return { valid: false, error: `Required property ${key} is missing` };
    }

    if (prop.validate) {
      const result = prop.validate(value);
      if (result !== true) {
        return { valid: false, error: typeof result === 'string' ? result : 'Validation failed' };
      }
    }

    return { valid: true };
  }

  private addToHistory(change: StateChange): void {
    this.changeHistory.push(change);
    if (this.changeHistory.length > this.maxHistorySize) {
      this.changeHistory.shift();
    }
  }

  private getLastChangeAtPath(path: string): StateChange | undefined {
    return this.changeHistory
      .slice()
      .reverse()
      .find((c) => c.path === path);
  }

  private deepCompare(
    obj1: StateValue,
    obj2: StateValue,
    path: string,
    callback: (v1: StateValue, v2: StateValue, p: string) => void
  ): void {
    if (typeof obj1 === 'object' && typeof obj2 === 'object') {
      const keys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
      keys.forEach((key) => {
        this.deepCompare(
          (obj1 as StateSlice)?.[key],
          (obj2 as StateSlice)?.[key],
          path ? `${path}.${key}` : key,
          callback
        );
      });
    } else {
      callback(obj1, obj2, path);
    }
  }

  private generateChangeId(): string {
    return `${this.config.instanceId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSubscriptionId(): string {
    return `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// Host State Manager - For the host application side
// ============================================================================

export class HostStateManager {
  private addOnStates: Map<string, StateSync> = new Map();

  /**
   * Register an add-on's state sync instance
   */
  registerAddOn(config: StateSyncConfig): StateSync {
    const sync = new StateSync(config);
    this.addOnStates.set(config.instanceId, sync);
    return sync;
  }

  /**
   * Unregister an add-on
   */
  unregisterAddOn(instanceId: string): void {
    const sync = this.addOnStates.get(instanceId);
    if (sync) {
      sync.destroy();
      this.addOnStates.delete(instanceId);
    }
  }

  /**
   * Get state from a specific add-on
   */
  getAddOnState(instanceId: string): StateSlice | undefined {
    return this.addOnStates.get(instanceId)?.get();
  }

  /**
   * Set state for a specific add-on
   */
  setAddOnState(instanceId: string, path: string, value: StateValue): void {
    this.addOnStates.get(instanceId)?.applyExternalChange({
      path,
      previousValue: undefined as unknown as StateValue,
      newValue: value,
      timestamp: Date.now(),
      source: 'host',
      changeId: `host-${Date.now()}`,
    });
  }

  /**
   * Broadcast state to all add-ons
   */
  broadcastState(path: string, value: StateValue): void {
    this.addOnStates.forEach((sync) => {
      sync.applyExternalChange({
        path,
        previousValue: undefined as unknown as StateValue,
        newValue: value,
        timestamp: Date.now(),
        source: 'host-broadcast',
        changeId: `broadcast-${Date.now()}`,
      });
    });
  }

  /**
   * Get all registered add-on states
   */
  getAllStates(): Record<string, StateSlice> {
    const states: Record<string, StateSlice> = {};
    this.addOnStates.forEach((sync, id) => {
      states[id] = sync.get() as StateSlice;
    });
    return states;
  }

  /**
   * Cleanup all add-on states
   */
  destroyAll(): void {
    this.addOnStates.forEach((sync) => sync.destroy());
    this.addOnStates.clear();
  }
}

// ============================================================================
// React Hook (for add-ons using React)
// ============================================================================

export function createStateHook(sync: StateSync) {
  return function useSyncedState<T = StateValue>(path: string, defaultValue?: T) {
    const [value, setValue] = React.useState<T>(
      (sync.get(path) as T) ?? defaultValue!
    );

    React.useEffect(() => {
      const unsubscribe = sync.subscribe(
        path,
        (change) => {
          setValue(change.newValue as T);
        },
        { deep: false }
      );

      return unsubscribe;
    }, [path]);

    const updateValue = React.useCallback(
      (newValue: T) => {
        sync.set(path, newValue as StateValue);
        setValue(newValue);
      },
      [path]
    );

    return [value, updateValue] as const;
  };
}

// React import for hook
import * as React from 'react';

export default StateSync;
