/**
 * Performance Monitoring Utilities
 * 
 * Provides utilities for monitoring Core Web Vitals and other performance metrics.
 * Integrates with Cloudflare Analytics and browser Performance API.
 */

import { useEffect, useState, useCallback } from "react";

// Core Web Vitals thresholds
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },      // Largest Contentful Paint (ms)
  FID: { good: 100, poor: 300 },        // First Input Delay (ms)
  CLS: { good: 0.1, poor: 0.25 },       // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 },      // First Contentful Paint (ms)
  TTFB: { good: 600, poor: 1000 },      // Time to First Byte (ms)
  INP: { good: 200, poor: 500 },        // Interaction to Next Paint (ms)
};

type MetricName = keyof typeof THRESHOLDS;
type MetricRating = "good" | "needs-improvement" | "poor";

export interface PerformanceMetric {
  name: MetricName;
  value: number;
  rating: MetricRating;
  timestamp: number;
  url: string;
}

/**
 * Get rating for a metric value
 */
function getRating(name: MetricName, value: number): MetricRating {
  const threshold = THRESHOLDS[name];
  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
}

/**
 * Report metric to analytics endpoint
 */
async function reportMetric(metric: PerformanceMetric): Promise<void> {
  // Send to analytics (non-blocking)
  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    navigator.sendBeacon(
      "/api/analytics/performance",
      JSON.stringify(metric)
    );
  }

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.warn(`[Performance] ${metric.name}: ${metric.value} (${metric.rating})`);
  }

  // Report to Cloudflare Web Vitals if available
  if (typeof window !== "undefined" && (window as any).__cf_web_vitals) {
    (window as any).__cf_web_vitals(metric);
  }
}

/**
 * Measure Largest Contentful Paint (LCP)
 */
export function measureLCP(): Promise<PerformanceMetric> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
      resolve({
        name: "LCP",
        value: 0,
        rating: "poor",
        timestamp: Date.now(),
        url: "",
      });
      return;
    }

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
        renderTime?: number;
        loadTime?: number;
      };
      const value = lastEntry.renderTime || lastEntry.loadTime || lastEntry.startTime;
      
      const metric: PerformanceMetric = {
        name: "LCP",
        value,
        rating: getRating("LCP", value),
        timestamp: Date.now(),
        url: window.location.href,
      };

      reportMetric(metric);
      resolve(metric);
    });

    observer.observe({ entryTypes: ["largest-contentful-paint"] });

    // Timeout after 10 seconds
    setTimeout(() => {
      observer.disconnect();
      resolve({
        name: "LCP",
        value: 0,
        rating: "poor",
        timestamp: Date.now(),
        url: window.location.href,
      });
    }, 10000);
  });
}

/**
 * Measure First Input Delay (FID)
 */
export function measureFID(): Promise<PerformanceMetric> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
      resolve({
        name: "FID",
        value: 0,
        rating: "poor",
        timestamp: Date.now(),
        url: "",
      });
      return;
    }

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const firstEntry = entries[0] as PerformanceEntry & { processingStart: number };
      const value = firstEntry.processingStart - firstEntry.startTime;

      const metric: PerformanceMetric = {
        name: "FID",
        value,
        rating: getRating("FID", value),
        timestamp: Date.now(),
        url: window.location.href,
      };

      reportMetric(metric);
      resolve(metric);
    });

    observer.observe({ entryTypes: ["first-input"] });

    // Timeout after 10 seconds
    setTimeout(() => {
      observer.disconnect();
      resolve({
        name: "FID",
        value: 0,
        rating: "poor",
        timestamp: Date.now(),
        url: window.location.href,
      });
    }, 10000);
  });
}

/**
 * Measure Cumulative Layout Shift (CLS)
 */
export function measureCLS(): Promise<PerformanceMetric> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
      resolve({
        name: "CLS",
        value: 0,
        rating: "good",
        timestamp: Date.now(),
        url: "",
      });
      return;
    }

    let clsValue = 0;
    let sessionValue = 0;
    let sessionEntries: PerformanceEntry[] = [];

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as PerformanceEntry[];

      entries.forEach((entry) => {
        // Only count layout shifts without recent user input
        if (!(entry as any).hadRecentInput) {
          const firstSessionEntry = sessionEntries[0];
          const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

          // Start a new session if it's been more than 1 second since the last shift
          if (
            sessionValue &&
            firstSessionEntry &&
            entry.startTime - lastSessionEntry.startTime > 1000
          ) {
            clsValue += sessionValue;
            sessionValue = 0;
            sessionEntries = [];
          }

          sessionValue += (entry as any).value;
          sessionEntries.push(entry);
        }
      });
    });

    observer.observe({ entryTypes: ["layout-shift"] });

    // Report final CLS value when page is hidden
    const reportCLS = () => {
      const totalCLS = clsValue + sessionValue;
      const metric: PerformanceMetric = {
        name: "CLS",
        value: totalCLS,
        rating: getRating("CLS", totalCLS),
        timestamp: Date.now(),
        url: window.location.href,
      };

      reportMetric(metric);
      resolve(metric);
      observer.disconnect();
    };

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        reportCLS();
      }
    });

    // Also report on page unload
    window.addEventListener("pagehide", reportCLS);

    // Timeout after 30 seconds
    setTimeout(() => {
      reportCLS();
    }, 30000);
  });
}

/**
 * Measure First Contentful Paint (FCP)
 */
export function measureFCP(): Promise<PerformanceMetric> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
      resolve({
        name: "FCP",
        value: 0,
        rating: "poor",
        timestamp: Date.now(),
        url: "",
      });
      return;
    }

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const firstEntry = entries[0];
      const value = firstEntry.startTime;

      const metric: PerformanceMetric = {
        name: "FCP",
        value,
        rating: getRating("FCP", value),
        timestamp: Date.now(),
        url: window.location.href,
      };

      reportMetric(metric);
      resolve(metric);
    });

    observer.observe({ entryTypes: ["paint"] });

    // Timeout after 10 seconds
    setTimeout(() => {
      observer.disconnect();
      resolve({
        name: "FCP",
        value: 0,
        rating: "poor",
        timestamp: Date.now(),
        url: window.location.href,
      });
    }, 10000);
  });
}

/**
 * Measure Time to First Byte (TTFB)
 */
export function measureTTFB(): PerformanceMetric | null {
  if (typeof window === "undefined" || !window.performance) {
    return null;
  }

  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
  if (!navigation) return null;

  const value = navigation.responseStart - navigation.startTime;

  const metric: PerformanceMetric = {
    name: "TTFB",
    value,
    rating: getRating("TTFB", value),
    timestamp: Date.now(),
    url: window.location.href,
  };

  reportMetric(metric);
  return metric;
}

/**
 * Measure Interaction to Next Paint (INP)
 */
export function measureINP(): Promise<PerformanceMetric> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
      resolve({
        name: "INP",
        value: 0,
        rating: "poor",
        timestamp: Date.now(),
        url: "",
      });
      return;
    }

    let maxDuration = 0;

    const observer = new PerformanceObserver((list) => {
      type EventTimingEntry = PerformanceEntry & { processingEnd?: number };
      const entries = list.getEntries() as EventTimingEntry[];

      entries.forEach((entry) => {
        const processingEnd = entry.processingEnd ?? entry.startTime;
        const duration = processingEnd - entry.startTime;
        if (duration > maxDuration) {
          maxDuration = duration;
        }
      });
    });

    observer.observe({ entryTypes: ["event"] });

    // Report after 30 seconds of interaction
    setTimeout(() => {
      const metric: PerformanceMetric = {
        name: "INP",
        value: maxDuration,
        rating: getRating("INP", maxDuration),
        timestamp: Date.now(),
        url: window.location.href,
      };

      reportMetric(metric);
      resolve(metric);
      observer.disconnect();
    }, 30000);
  });
}

/**
 * Measure all Core Web Vitals
 */
export async function measureCoreWebVitals(): Promise<{
  LCP: PerformanceMetric;
  FID: PerformanceMetric;
  CLS: PerformanceMetric;
  FCP: PerformanceMetric;
  TTFB: PerformanceMetric | null;
}> {
  const [LCP, FID, CLS, FCP] = await Promise.all([
    measureLCP(),
    measureFID(),
    measureCLS(),
    measureFCP(),
  ]);

  const TTFB = measureTTFB();

  return { LCP, FID, CLS, FCP, TTFB };
}

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<Record<string, PerformanceMetric>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Measure TTFB immediately
    const ttfb = measureTTFB();
    if (ttfb) {
      setMetrics((prev) => ({ ...prev, TTFB: ttfb }));
    }

    // Measure other metrics
    measureFCP().then((fcp) => {
      setMetrics((prev) => ({ ...prev, FCP: fcp }));
    });

    measureLCP().then((lcp) => {
      setMetrics((prev) => ({ ...prev, LCP: lcp }));
    });

    measureFID().then((fid) => {
      setMetrics((prev) => ({ ...prev, FID: fid }));
    });

    measureCLS().then((cls) => {
      setMetrics((prev) => ({ ...prev, CLS: cls }));
    });
  }, []);

  const getOverallScore = useCallback(() => {
    const scores = Object.values(metrics);
    if (scores.length === 0) return null;

    const goodCount = scores.filter((m) => m.rating === "good").length;
    return {
      score: Math.round((goodCount / scores.length) * 100),
      total: scores.length,
      good: goodCount,
    };
  }, [metrics]);

  return { metrics, getOverallScore };
}

/**
 * Preload critical resources
 */
export function preloadResource(
  href: string,
  as: "image" | "script" | "style" | "font" | "fetch",
  type?: string,
  crossOrigin?: boolean
): void {
  if (typeof document === "undefined") return;

  const link = document.createElement("link");
  link.rel = "preload";
  link.href = href;
  link.as = as;
  if (type) link.type = type;
  if (crossOrigin) link.crossOrigin = "anonymous";

  document.head.appendChild(link);
}

/**
 * Prefetch resources for next navigation
 */
export function prefetchResource(href: string): void {
  if (typeof document === "undefined") return;

  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = href;

  document.head.appendChild(link);
}

/**
 * Get performance insights and recommendations
 */
export function getPerformanceInsights(metrics: Record<string, PerformanceMetric>): string[] {
  const insights: string[] = [];

  if (metrics.LCP?.rating === "poor") {
    insights.push("LCP is slow. Optimize images and reduce server response time.");
  }

  if (metrics.FID?.rating === "poor") {
    insights.push("FID is high. Reduce JavaScript execution time and break up long tasks.");
  }

  if (metrics.CLS?.rating === "poor") {
    insights.push("CLS is high. Reserve space for dynamic content and avoid inserting content above existing content.");
  }

  if (metrics.TTFB?.rating === "poor") {
    insights.push("TTFB is slow. Consider using a CDN and optimizing server response time.");
  }

  return insights;
}

export default {
  measureLCP,
  measureFID,
  measureCLS,
  measureFCP,
  measureTTFB,
  measureINP,
  measureCoreWebVitals,
  usePerformanceMonitoring,
  preloadResource,
  prefetchResource,
  getPerformanceInsights,
};
