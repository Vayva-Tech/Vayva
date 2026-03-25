/**
 * Lifecycle Manager - Handles add-on mount/unmount/update lifecycle
 * 
 * Provides hooks for add-ons to respond to lifecycle events
 * and manages cleanup to prevent memory leaks.
 */

import { PermissionManager } from './permissions';

export type LifecycleState =
  | 'installing'   // Initial installation in progress
  | 'activating'   // Being activated/started
  | 'active'       // Running normally
  | 'deactivating' // Being paused/stopped
  | 'inactive'     // Paused but still installed
  | 'uninstalling' // Being removed
  | 'error';       // Error state

export interface AddOnLifecycleHooks {
  /** Called when add-on is first installed */
  onInstall?: (context: LifecycleContext) => Promise<void> | void;
  
  /** Called when add-on is activated */
  onActivate?: (context: LifecycleContext) => Promise<void> | void;
  
  /** Called when add-on configuration changes */
  onConfigure?: (
    newConfig: Record<string, unknown>,
    oldConfig: Record<string, unknown>,
    context: LifecycleContext
  ) => Promise<void> | void;
  
  /** Called periodically (every 5 minutes while active) */
  onHeartbeat?: (context: LifecycleContext) => Promise<void> | void;
  
  /** Called when add-on is deactivated */
  onDeactivate?: (context: LifecycleContext) => Promise<void> | void;
  
  /** Called when add-on is being uninstalled */
  onUninstall?: (context: LifecycleContext) => Promise<void> | void;
  
  /** Called when an error occurs */
  onError?: (error: Error, context: LifecycleContext) => Promise<void> | void;
}

export interface LifecycleContext {
  /** Add-on instance ID */
  instanceId: string;
  /** Add-on definition ID */
  addOnId: string;
  /** Current lifecycle state */
  state: LifecycleState;
  /** Store ID */
  storeId: string;
  /** Current configuration */
  config: Record<string, unknown>;
  /** Permission manager */
  permissions: PermissionManager;
  /** API client for making authorized requests */
  api: AddOnAPIClient;
  /** Storage utilities */
  storage: AddOnStorage;
  /** Logger */
  logger: AddOnLogger;
}

interface AddOnAPIClient {
  get: <T>(path: string, params?: Record<string, unknown>) => Promise<T>;
  post: <T>(path: string, body: unknown) => Promise<T>;
  put: <T>(path: string, body: unknown) => Promise<T>;
  delete: <T>(path: string) => Promise<T>;
}

interface AddOnStorage {
  /** Get stored value */
  get: <T>(key: string) => Promise<T | null>;
  /** Set stored value */
  set: <T>(key: string, value: T) => Promise<void>;
  /** Delete stored value */
  delete: (key: string) => Promise<void>;
  /** Clear all add-on data */
  clear: () => Promise<void>;
}

interface AddOnLogger {
  debug: (message: string, meta?: Record<string, unknown>) => void;
  info: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, error?: Error, meta?: Record<string, unknown>) => void;
}

interface LifecycleConfig {
  instanceId: string;
  addOnId: string;
  storeId: string;
  initialConfig: Record<string, unknown>;
  permissions: PermissionManager;
  hooks: AddOnLifecycleHooks;
}

export class LifecycleManager {
  private state: LifecycleState = 'installing';
  private config: LifecycleConfig;
  private context: LifecycleContext;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private cleanupCallbacks: Array<() => void> = [];
  private errorCount = 0;
  private readonly maxErrors = 5;

  constructor(config: LifecycleConfig) {
    this.config = config;
    this.context = this.createContext();
  }

  /**
   * Start the add-on lifecycle
   */
  async start(): Promise<void> {
    try {
      this.setState('activating');

      // Call onInstall for first-time setup
      if (this.config.hooks.onInstall) {
        await this.config.hooks.onInstall(this.context);
      }

      // Call onActivate to start the add-on
      if (this.config.hooks.onActivate) {
        await this.config.hooks.onActivate(this.context);
      }

      this.setState('active');
      this.startHeartbeat();

      this.log('info', 'Add-on started successfully');
    } catch (error) {
      await this.handleError(error as Error, 'start');
    }
  }

  /**
   * Pause the add-on (preserves state)
   */
  async pause(): Promise<void> {
    if (this.state !== 'active') return;

    this.setState('deactivating');
    this.stopHeartbeat();

    try {
      if (this.config.hooks.onDeactivate) {
        await this.config.hooks.onDeactivate(this.context);
      }

      this.setState('inactive');
      this.log('info', 'Add-on paused');
    } catch (error) {
      await this.handleError(error as Error, 'pause');
    }
  }

  /**
   * Resume a paused add-on
   */
  async resume(): Promise<void> {
    if (this.state !== 'inactive') return;

    this.setState('activating');

    try {
      if (this.config.hooks.onActivate) {
        await this.config.hooks.onActivate(this.context);
      }

      this.setState('active');
      this.startHeartbeat();

      this.log('info', 'Add-on resumed');
    } catch (error) {
      await this.handleError(error as Error, 'resume');
    }
  }

  /**
   * Update add-on configuration
   */
  async updateConfig(newConfig: Record<string, unknown>): Promise<void> {
    const oldConfig = { ...this.context.config };
    this.context.config = { ...oldConfig, ...newConfig };

    try {
      if (this.config.hooks.onConfigure) {
        await this.config.hooks.onConfigure(
          this.context.config,
          oldConfig,
          this.context
        );
      }

      this.log('info', 'Configuration updated');
    } catch (error) {
      // Revert on error
      this.context.config = oldConfig;
      await this.handleError(error as Error, 'updateConfig');
    }
  }

  /**
   * Stop and cleanup the add-on
   */
  async stop(): Promise<void> {
    this.setState('uninstalling');
    this.stopHeartbeat();

    try {
      // Run all cleanup callbacks
      this.cleanupCallbacks.forEach((cb) => {
        try {
          cb();
        } catch (e) {
          this.log('error', 'Cleanup callback failed', e as Error);
        }
      });
      this.cleanupCallbacks = [];

      // Call onDeactivate if active
      if (this.state === 'active' && this.config.hooks.onDeactivate) {
        await this.config.hooks.onDeactivate(this.context);
      }

      // Call onUninstall
      if (this.config.hooks.onUninstall) {
        await this.config.hooks.onUninstall(this.context);
      }

      this.log('info', 'Add-on stopped and cleaned up');
    } catch (error) {
      await this.handleError(error as Error, 'stop');
    }
  }

  /**
   * Register a cleanup callback to run on stop
   */
  onCleanup(callback: () => void): void {
    this.cleanupCallbacks.push(callback);
  }

  /**
   * Get current lifecycle state
   */
  getState(): LifecycleState {
    return this.state;
  }

  /**
   * Check if add-on is in a running state
   */
  isRunning(): boolean {
    return this.state === 'active';
  }

  private setState(newState: LifecycleState): void {
    const oldState = this.state;
    this.state = newState;
    this.context.state = newState;

    this.log('debug', 'State transition', undefined, {
      from: oldState,
      to: newState,
    });
  }

  private startHeartbeat(): void {
    if (this.config.hooks.onHeartbeat) {
      this.heartbeatInterval = setInterval(async () => {
        try {
          await this.config.hooks.onHeartbeat!(this.context);
        } catch (error) {
          this.log('error', 'Heartbeat failed', error as Error);
        }
      }, 5 * 60 * 1000); // 5 minutes
    }
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private async handleError(
    error: Error,
    operation: string
  ): Promise<void> {
    this.errorCount++;
    this.setState('error');

    this.log('error', `Error during ${operation}`, error, {
      operation,
      errorCount: this.errorCount,
      maxErrors: this.maxErrors,
    });

    // Call onError hook if available
    if (this.config.hooks.onError) {
      try {
        await this.config.hooks.onError(error, this.context);
      } catch (hookError) {
        this.log(
          'error',
          'Error handler failed',
          hookError as Error
        );
      }
    }

    // If too many errors, stop the add-on
    if (this.errorCount >= this.maxErrors) {
      this.log('error', 'Max errors reached, stopping add-on');
      await this.stop();
    }
  }

  private createContext(): LifecycleContext {
    return {
      instanceId: this.config.instanceId,
      addOnId: this.config.addOnId,
      state: this.state,
      storeId: this.config.storeId,
      config: this.config.initialConfig,
      permissions: this.config.permissions,
      api: this.createAPIClient(),
      storage: this.createStorage(),
      logger: this.createLogger(),
    };
  }

  private createAPIClient(): AddOnAPIClient {
    const baseURL = `/api/addons/${this.config.instanceId}`;

    const request = async <T>(
      method: string,
      path: string,
      body?: unknown
    ): Promise<T> => {
      const response = await fetch(`${baseURL}${path}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Addon-Instance': this.config.instanceId,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    };

    return {
      get: <T>(path: string) => request<T>('GET', path),
      post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
      put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
      delete: <T>(path: string) => request<T>('DELETE', path),
    };
  }

  private createStorage(): AddOnStorage {
    const prefix = `addon:${this.config.instanceId}:`;

    return {
      get: async <T>(key: string): Promise<T | null> => {
        const value = localStorage.getItem(`${prefix}${key}`);
        return value ? JSON.parse(value) : null;
      },
      set: async <T>(key: string, value: T): Promise<void> => {
        localStorage.setItem(`${prefix}${key}`, JSON.stringify(value));
      },
      delete: async (key: string): Promise<void> => {
        localStorage.removeItem(`${prefix}${key}`);
      },
      clear: async (): Promise<void> => {
        Object.keys(localStorage)
          .filter((key) => key.startsWith(prefix))
          .forEach((key) => localStorage.removeItem(key));
      },
    };
  }

  private createLogger(): AddOnLogger {
    const createLogEntry = (
      level: string,
      message: string,
      error?: Error,
      meta?: Record<string, unknown>
    ) => ({
      timestamp: new Date().toISOString(),
      instanceId: this.config.instanceId,
      addOnId: this.config.addOnId,
      level,
      message,
      error: error?.message,
      stack: error?.stack,
      ...meta,
    });

    return {
      debug: (message, meta) => {
        console.debug('[AddOn]', createLogEntry('debug', message, undefined, meta));
      },
      info: (message, meta) => {
        console.info('[AddOn]', createLogEntry('info', message, undefined, meta));
      },
      warn: (message, meta) => {
        console.warn('[AddOn]', createLogEntry('warn', message, undefined, meta));
      },
      error: (message, error, meta) => {
        console.error('[AddOn]', createLogEntry('error', message, error, meta));
      },
    };
  }

  private log(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    error?: Error,
    meta?: Record<string, unknown>
  ): void {
    this.context.logger[level](message, error as (Error & Record<string, unknown>) | undefined, meta);
  }
}

/**
 * Create a lifecycle manager from add-on definition
 */
export function createLifecycleManager(
  config: Omit<LifecycleConfig, 'hooks'> & { hooks?: AddOnLifecycleHooks }
): LifecycleManager {
  return new LifecycleManager(config as LifecycleConfig);
}
