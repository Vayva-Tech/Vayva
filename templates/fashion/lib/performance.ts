// Image optimization utilities
interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  resize?: 'cover' | 'contain' | 'fill';
}

// Cloudinary-like URL builder for image optimization
export class ImageOptimizer {
  private static readonly BASE_URL = 'https://res.cloudinary.com'; // Replace with your CDN
  private static readonly DEFAULT_QUALITY = 80;
  private static readonly DEFAULT_FORMAT = 'auto';

  static optimize(src: string, options: ImageOptimizationOptions = {}): string {
    if (!src) return '';

    // If it's already an optimized URL, return as-is
    if (src.includes('cloudinary.com') || src.includes('optimization')) {
      return src;
    }

    const {
      width,
      height,
      quality = this.DEFAULT_QUALITY,
      format = this.DEFAULT_FORMAT,
      resize = 'cover'
    } = options;

    // Build optimization parameters
    const params = [];
    
    if (width) params.push(`w_${width}`);
    if (height) params.push(`h_${height}`);
    if (quality !== 100) params.push(`q_${quality}`);
    if (format !== 'auto') params.push(`f_${format}`);
    
    params.push(`c_${resize}`);
    params.push('f_auto'); // Auto format detection
    params.push('dpr_auto'); // Auto device pixel ratio

    const transformation = params.join(',');

    // Handle different image sources
    if (src.startsWith('http')) {
      // External images - proxy through our optimizer
      return `/api/image-proxy?url=${encodeURIComponent(src)}&${transformation}`;
    }

    // Local images
    return src;
  }

  static getPlaceholder(src: string): string {
    return this.optimize(src, { 
      width: 20, 
      height: 20, 
      quality: 20,
      format: 'jpg'
    });
  }

  static getSrcSet(src: string, sizes: number[]): string {
    return sizes
      .map(size => `${this.optimize(src, { width: size })} ${size}w`)
      .join(', ');
  }
}

// Cache management utilities
export class CacheManager {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  static set(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  static delete(key: string): boolean {
    return this.cache.delete(key);
  }

  static clear(): void {
    this.cache.clear();
  }

  static getSize(): number {
    return this.cache.size;
  }
}

// API response caching decorator
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  ttl: number = 300000
): T {
  return (async (...args: any[]) => {
    const cacheKey = `${fn.name}_${JSON.stringify(args)}`;
    const cached = CacheManager.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const result = await fn(...args);
    CacheManager.set(cacheKey, result, ttl);
    return result;
  }) as T;
}

// Performance monitoring
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();

  static start(label: string): void {
    performance.mark(`${label}-start`);
  }

  static end(label: string): number {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);
    
    const measure = performance.getEntriesByName(label)[0];
    const duration = measure.duration;
    
    // Store metric for averaging
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label)!.push(duration);
    
    // Keep only last 100 measurements
    const measurements = this.metrics.get(label)!;
    if (measurements.length > 100) {
      measurements.shift();
    }
    
    return duration;
  }

  static getAverage(label: string): number {
    const measurements = this.metrics.get(label);
    if (!measurements || measurements.length === 0) return 0;
    
    return measurements.reduce((a, b) => a + b, 0) / measurements.length;
  }

  static logMetrics(): void {
    console.table(
      Array.from(this.metrics.entries()).map(([label, measurements]) => ({
        Operation: label,
        'Avg Time (ms)': this.getAverage(label).toFixed(2),
        'Sample Size': measurements.length,
        'Min Time (ms)': Math.min(...measurements).toFixed(2),
        'Max Time (ms)': Math.max(...measurements).toFixed(2)
      }))
    );
  }
}

// Lazy loading utilities
export class LazyLoader {
  private static observers: IntersectionObserver[] = [];

  static observe(
    element: Element,
    callback: () => void,
    options: IntersectionObserverInit = { threshold: 0.1 }
  ): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback();
          observer.unobserve(entry.target);
        }
      });
    }, options);

    observer.observe(element);
    this.observers.push(observer);
  }

  static disconnectAll(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Bundle optimization utilities
export class BundleOptimizer {
  static async preloadCriticalAssets(assets: string[]): Promise<void> {
    assets.forEach(asset => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = asset;
      document.head.appendChild(link);
    });
  }

  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}