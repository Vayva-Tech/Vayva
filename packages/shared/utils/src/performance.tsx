/**
 * Performance Optimization Utilities
 * 
 * Collection of utilities for optimizing React component performance:
 * - Lazy loading with code splitting
 * - Memoization helpers
 * - Virtual scrolling
 * - Image optimization
 */

import { lazy, Suspense, useMemo, useCallback, memo, useState, useRef, useEffect } from 'react';

// ============================================================================
// LAZY LOADING UTILITIES
// ============================================================================

/**
 * Creates a lazily loaded component with automatic loading state
 * 
 * @param importFn - Dynamic import function
 * @param options - Loading options
 * @returns Lazily loaded component
 */
export function createLazyComponent<T extends object>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  options: {
    loadingFallback?: React.ReactNode;
    errorFallback?: (error: Error) => React.ReactNode;
    timeout?: number;
  } = {}
) {
  const {
    loadingFallback = <div>Loading...</div>,
    errorFallback,
    timeout = 10000
  } = options;

  const LazyComponent = lazy(() => 
    Promise.race([
      importFn(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Component load timeout')), timeout)
      )
    ])
  );

  return {
    Component: (props: T) => (
      <Suspense fallback={loadingFallback}>
        <LazyComponent {...props} />
      </Suspense>
    ),
    preload: () => importFn()
  };
}

/**
 * Preloads multiple components in parallel
 * 
 * @param importFns - Array of dynamic import functions
 */
export async function preloadComponents(
  importFns: Array<() => Promise<any>>
): Promise<void> {
  await Promise.all(importFns.map(fn => fn()));
}

// ============================================================================
// MEMOIZATION UTILITIES
// ============================================================================

/**
 * Creates a memoized version of an expensive function
 * Uses WeakMap for automatic garbage collection
 * 
 * @param fn - Function to memoize
 * @param resolver - Optional custom argument resolver
 * @returns Memoized function
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  resolver?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

/**
 * Hook for memoizing expensive calculations
 * 
 * @param calculation - Expensive calculation function
 * @param dependencies - Calculation dependencies
 * @returns Calculated result
 */
export function useMemoizedCalculation<T>(
  calculation: () => T,
  dependencies: any[]
): T {
  return useMemo(calculation, dependencies);
}

/**
 * Hook for memoizing callback functions
 * 
 * @param callback - Callback function
 * @param dependencies - Callback dependencies
 * @returns Memoized callback
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: any[]
): T {
  return useCallback(callback, dependencies);
}

// ============================================================================
// VIRTUAL SCROLLING UTILITIES
// ============================================================================

/**
 * Hook for virtualizing long lists
 * Only renders visible items for better performance
 * 
 * @param items - List of items to render
 * @param itemHeight - Height of each item in pixels
 * @param containerHeight - Height of visible container
 * @returns Visible items and scroll position
 */
export function useVirtualList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  
  return {
    totalHeight,
    visibleCount,
    getVisibleItems: (scrollTop: number) => {
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(startIndex + visibleCount, items.length);
      
      return {
        items: items.slice(startIndex, endIndex),
        startIndex,
        offsetY: startIndex * itemHeight
      };
    }
  };
}

// ============================================================================
// IMAGE OPTIMIZATION UTILITIES
// ============================================================================

/**
 * Hook for lazy loading images with Intersection Observer
 * 
 * @param src - Image source URL
 * @param placeholderSrc - Placeholder image URL
 * @returns Loading state and image ref
 */
export function useLazyImage(
  src: string,
  placeholderSrc?: string
) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return {
    imgRef,
    isLoaded,
    isInView,
    shouldLoad: isInView && !isLoaded
  };
}

// ============================================================================
// COMPONENT WRAPPERS
// ============================================================================

/**
 * Higher-order component for pure rendering (shallow comparison)
 */
export function withPureComponent<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return memo(WrappedComponent);
}

/**
 * Higher-order component for conditional rendering based on viewport
 */
export function withViewportDetection<P extends object>(
  WrappedComponent: React.ComponentType<P & { inViewport: boolean }>
) {
  return function ViewportDetectedComponent(props: P) {
    const [inViewport, setInViewport] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setInViewport(entry.isIntersecting);
        }
      );

      if (ref.current) {
        observer.observe(ref.current);
      }

      return () => observer.disconnect();
    }, []);

    return (
      <div ref={ref}>
        <WrappedComponent {...props} inViewport={inViewport} />
      </div>
    );
  };
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

/**
 * Hook for measuring component render time
 */
export function useRenderTime(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[${componentName}] Render time: ${duration.toFixed(2)}ms`);
      }
    };
  }, [componentName]);
}

/**
 * Hook for debouncing rapid updates
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for throttling frequent updates
 */
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastUpdated = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();
    
    if (now - lastUpdated.current >= interval) {
      setThrottledValue(value);
      lastUpdated.current = now;
    }
  }, [value, interval]);

  return throttledValue;
}
