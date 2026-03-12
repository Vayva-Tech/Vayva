"use client";

import { useEffect, useState, useRef, ReactNode, RefObject } from "react";
import { logger } from "@/lib/logger";

/**
 * Accessibility Audit Component
 * 
 * In development mode, loads @axe-core/react to automatically
 * scan for accessibility issues and log them to console.
 * 
 * Usage: Add to your root layout or app provider
 */
export function AccessibilityAudit({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    // Dynamically import axe-core to avoid bundling in production
    const runAxe = async () => {
      try {
        const React = await import("react");
        const ReactDOM = await import("react-dom");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const axeModule = await import("@axe-core/react") as unknown as { default: (react: typeof import("react"), reactDOM: typeof import("react-dom"), delay: number, config: unknown, callback: (err: Error, results: unknown) => void) => void };
        
        // Run axe on the document
        axeModule.default(React, ReactDOM, 1000, undefined, (err: Error, results: unknown) => {
          if (err) {
            logger.error("[A11Y] Axe runtime error", { error: err.message });
            return;
          }
          
          if (results) {
            logger.info("[A11Y] Accessibility scan completed", { results });
          }
        });
      } catch {
        // Silent fail if axe-core not installed
        logger.info("@axe-core/react not available, skipping a11y audit");
      }
    };

    runAxe();
  }, []);

  return <>{children}</>;
}

/**
 * High contrast mode detection and CSS class application
 */
export function useHighContrastMode() {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-contrast: more)");
    // Defer initial setState to avoid cascading renders
    queueMicrotask(() => setIsHighContrast(mediaQuery.matches));

    const handler = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return isHighContrast;
}

/**
 * Announces status changes to screen readers
 */
export function LiveRegion({ 
  children, 
  politeness = "polite",
  className = "" 
}: { 
  children: React.ReactNode;
  politeness?: "polite" | "assertive" | "off";
  className?: string;
}) {
  return (
    <div 
      aria-live={politeness}
      aria-atomic="true"
      className={`sr-only ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Skip link for keyboard navigation
 */
export function SkipLink({ targetId }: { targetId: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white
                 focus:rounded focus:font-medium"
    >
      Skip to main content
    </a>
  );
}

/**
 * Focus trap for modals and dialogs
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [containerRef]);
}

/**
 * Keyboard navigation utilities
 */
export const keyboardNavigation = {
  // Handle arrow key navigation in lists
  handleArrowKeys: (
    event: React.KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onSelect: (index: number) => void
  ) => {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight": {
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % items.length;
        items[nextIndex]?.focus();
        onSelect(nextIndex);
        break;
      }
      case "ArrowUp":
      case "ArrowLeft": {
        event.preventDefault();
        const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        items[prevIndex]?.focus();
        onSelect(prevIndex);
        break;
      }
      case "Home":
        event.preventDefault();
        items[0]?.focus();
        onSelect(0);
        break;
      case "End":
        event.preventDefault();
        items[items.length - 1]?.focus();
        onSelect(items.length - 1);
        break;
    }
  },

  // Trap focus within container
  trapFocus: (container: HTMLElement) => {
    const focusable = container.querySelectorAll<HTMLElement>(
      'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };

    container.addEventListener("keydown", handleTab);
    first?.focus();

    return () => container.removeEventListener("keydown", handleTab);
  },
};

/**
 * Color contrast utilities
 */
export const contrastUtils = {
  // Calculate relative luminance
  getLuminance: (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  // Calculate contrast ratio between two colors
  getContrastRatio: (color1: string, color2: string): number => {
    const hexToRgb = (hex: string): [number, number, number] => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
          ]
        : [0, 0, 0];
    };

    const [r1, g1, b1] = hexToRgb(color1);
    const [r2, g2, b2] = hexToRgb(color2);

    const l1 = contrastUtils.getLuminance(r1, g1, b1);
    const l2 = contrastUtils.getLuminance(r2, g2, b2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  },

  // Check if contrast meets WCAG AA standards
  meetsWCAGAA: (foreground: string, background: string, largeText = false): boolean => {
    const ratio = contrastUtils.getContrastRatio(foreground, background);
    return largeText ? ratio >= 3 : ratio >= 4.5;
  },

  // Check if contrast meets WCAG AAA standards
  meetsWCAGAAA: (foreground: string, background: string, largeText = false): boolean => {
    const ratio = contrastUtils.getContrastRatio(foreground, background);
    return largeText ? ratio >= 4.5 : ratio >= 7;
  },
};

/**
 * ARIA utilities for common patterns
 */
export const ariaUtils = {
  // Generate unique IDs for ARIA relationships
  generateId: (prefix = "vayva"): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Format numbers for screen readers
  formatNumberForScreenReader: (num: number, locale = "en-NG"): string => {
    return new Intl.NumberFormat(locale).format(num);
  },

  // Format currency for screen readers
  formatCurrencyForScreenReader: (
    amount: number,
    currency = "NGN",
    locale = "en-NG"
  ): string => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  },

  // Describe data table for screen readers
  describeDataTable: (headers: string[], rowCount: number): string => {
    return `Table with ${headers.length} columns: ${headers.join(", ")}. ${rowCount} rows of data.`;
  },
};
