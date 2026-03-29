/**
 * Storage Utilities
 * 
 * Type-safe wrappers for localStorage, sessionStorage, and cookies
 */

export type StorageType = 'local' | 'session';

export interface StorageOptions {
  serialize?: <T>(value: T) => string;
  deserialize?: <T>(value: string) => T;
}

/**
 * Create storage wrapper with type safety
 */
export function createStorage(
  type: StorageType = 'local',
  options?: StorageOptions
) {
  const storage = type === 'local' ? localStorage : sessionStorage;
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
  } = options || {};

  return {
    /**
     * Get item from storage
     */
    get<T>(key: string, defaultValue?: T): T | null {
      try {
        const item = storage.getItem(key);
        if (!item) {
          return defaultValue ?? null;
        }
        return deserialize<T>(item);
      } catch {
        return defaultValue ?? null;
      }
    },

    /**
     * Set item in storage
     */
    set<T>(key: string, value: T): void {
      try {
        const serialized = serialize(value);
        storage.setItem(key, serialized);
      } catch (error) {
        console.error('[STORAGE_SET_ERROR]', { key, error });
      }
    },

    /**
     * Remove item from storage
     */
    remove(key: string): void {
      storage.removeItem(key);
    },

    /**
     * Clear all items
     */
    clear(): void {
      storage.clear();
    },

    /**
     * Check if key exists
     */
    has(key: string): boolean {
      return storage.getItem(key) !== null;
    },

    /**
     * Get all keys
     */
    keys(): string[] {
      const keys: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key) {
          keys.push(key);
        }
      }
      return keys;
    },

    /**
     * Get all values
     */
    getAll<T>(): Record<string, T> {
      const result: Record<string, T> = {};
      
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key) {
          const value = this.get<T>(key);
          if (value !== null) {
            result[key] = value;
          }
        }
      }
      
      return result;
    },
  };
}

/**
 * LocalStorage wrapper
 */
export const localStorageWrapper = createStorage('local');

/**
 * SessionStorage wrapper
 */
export const sessionStorageWrapper = createStorage('session');

/**
 * Cookie utilities
 */
export const cookies = {
  /**
   * Set cookie
   */
  set(name: string, value: string, options?: {
    days?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  }): void {
    const {
      days,
      path = '/',
      domain,
      secure = false,
      sameSite = 'lax',
    } = options || {};

    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = `; expires=${date.toUTCString()}`;
    }

    const cookieParts = [
      `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
      expires,
      `path=${path}`,
      domain ? `domain=${domain}` : '',
      secure ? 'secure' : '',
      `samesite=${sameSite}`,
    ].filter(Boolean);

    document.cookie = cookieParts.join('; ');
  },

  /**
   * Get cookie by name
   */
  get(name: string): string | null {
    const match = document.cookie.match(new RegExp(
      '(^|;\\s*)(' + encodeURIComponent(name) + ')=([^;]*)'
    ));
    return match ? decodeURIComponent(match[3]) : null;
  },

  /**
   * Remove cookie
   */
  remove(name: string, path?: string, domain?: string): void {
    this.set(name, '', {
      days: -1,
      path,
      domain,
    });
  },

  /**
   * Get all cookies
   */
  getAll(): Record<string, string> {
    const cookies: Record<string, string> = {};
    
    document.cookie.split(';').forEach(cookie => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        cookies[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    });
    
    return cookies;
  },
};

/**
 * Create typed storage key
 */
export function createTypedKey<T>(prefix: string, key: string) {
  return `${prefix}:${key}` as const;
}

/**
 * Safe storage access with fallback
 */
export function safeGet<T>(
  key: string,
  defaultValue: T,
  type: StorageType = 'local'
): T {
  const storage = createStorage(type);
  return storage.get<T>(key, defaultValue) ?? defaultValue;
}
