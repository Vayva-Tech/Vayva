/**
 * Performance Utilities
 * 
 * Debounce, throttle, memoization, and lazy loading helpers
 */

/**
 * Debounce function - delays execution until after wait milliseconds
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  options?: { leading?: boolean; trailing?: boolean }
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const { leading = false, trailing = true } = options || {};
  let lastCallTime: number | null = null;

  return function executedFunction(...args: Parameters<T>): void {
    const now = Date.now();
    
    if (!lastCallTime && options?.leading) {
      func.apply(this, args);
      lastCallTime = now;
      return;
    }

    if (timeout) {
      clearTimeout(timeout);
    }

    if (trailing) {
      timeout = setTimeout(() => {
        func.apply(this, args);
        timeout = null;
        lastCallTime = trailing ? null : Date.now();
      }, wait);
    }
  };
}

/**
 * Throttle function - limits execution to once per interval
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number,
  options?: { leading?: boolean; trailing?: boolean }
): (...args: Parameters<T>) => void {
  const { leading = true, trailing = true } = options || {};
  let inThrottle = false;
  let lastFunc: ReturnType<typeof setTimeout> | null = null;
  let lastRan: number | null = null;

  return function executedFunction(...args: Parameters<T>): void {
    if (!inThrottle) {
      if (leading) {
        func.apply(this, args);
        lastRan = Date.now();
      }
      inThrottle = true;
    } else {
      if (trailing) {
        if (lastFunc) {
          clearTimeout(lastFunc);
        }
        lastFunc = setTimeout(() => {
          if (Date.now() - (lastRan || 0) >= limit) {
            func.apply(this, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - (lastRan || 0)));
      }
    }
  };
}

/**
 * Simple memoization for expensive computations
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  const memoized = ((...args: Parameters<T>) => {
    const key = resolver ? resolver(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;

  // Expose cache for manual clearing
  (memoized as T & { cache: Map<string, ReturnType<T>> }).cache = cache;

  return memoized;
}

/**
 * Memoize with TTL (time-to-live)
 */
export function memoizeWithTTL<T extends (...args: unknown[]) => unknown>(
  func: T,
  ttl: number, // milliseconds
  resolver?: (...args: Parameters<T>) => string
): T {
  interface CacheEntry {
    value: ReturnType<T>;
    timestamp: number;
  }

  const cache = new Map<string, CacheEntry>();

  const memoized = ((...args: Parameters<T>) => {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    const entry = cache.get(key);

    if (entry && Date.now() - entry.timestamp < ttl) {
      return entry.value;
    }

    const result = func(...args);
    cache.set(key, { value: result, timestamp: Date.now() });
    return result;
  }) as T;

  return memoized;
}

/**
 * Lazy load a component or module
 */
export function lazyLoad<T>(
  importFn: () => Promise<{ default: T }>
): {
  load: () => Promise<T>;
  loaded: boolean;
  promise: Promise<T> | null;
} {
  let loaded = false;
  let promise: Promise<T> | null = null;
  let result: T | null = null;

  return {
    get loaded() {
      return loaded;
    },
    get promise() {
      return promise;
    },
    async load(): Promise<T> {
      if (loaded && result) {
        return result;
      }

      if (!promise) {
        promise = importFn().then((module) => {
          loaded = true;
          result = module.default;
          return result;
        });
      }

      return promise;
    },
  };
}

/**
 * Create a retry wrapper with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    shouldRetry?: (error: Error) => boolean;
  }
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    shouldRetry,
  } = options || {};

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      if (shouldRetry && !shouldRetry(lastError)) {
        throw lastError;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Request idle callback fallback
 */
export function requestIdleCallbackCompat(
  callback: IdleRequestCallback,
  timeout?: number
): number {
  if ('requestIdleCallback' in window) {
    return requestIdleCallback(callback, { timeout });
  }
  
  // Fallback to setTimeout
  return window.setTimeout(() => callback({
    didTimeout: false,
    timeRemaining: () => Infinity,
  }));
}
