/**
 * Accessibility Hooks and Utilities for Ops Console
 * 
 * Provides WCAG 2.1 AA compliant utilities for focus management,
 * screen reader announcements, and keyboard navigation.
 */

import { useEffect, useRef, useCallback, useState } from "react";

// ============================================================================
// Focus Management Hook
// ============================================================================

/**
 * Hook to trap focus within a modal/dialog element
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    // Store previously focused element
    previouslyFocusedRef.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    if (!container) return;

    // Find all focusable elements
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Restore focus
      previouslyFocusedRef.current?.focus();
    };
  }, [isActive]);

  return containerRef;
}

// ============================================================================
// Screen Reader Announcements
// ============================================================================

/**
 * Hook to announce messages to screen readers
 */
export function useAnnouncer() {
  const announce = useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", priority);
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement is read
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return { announce };
}

// ============================================================================
// Keyboard Navigation Hook
// ============================================================================

/**
 * Hook for arrow key navigation in lists
 */
export function useArrowNavigation(itemCount: number, onSelect: (index: number) => void) {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev < itemCount - 1 ? prev + 1 : 0;
          return next;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev > 0 ? prev - 1 : itemCount - 1;
          return next;
        });
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusedIndex >= 0) {
          onSelect(focusedIndex);
        }
        break;
      case "Home":
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case "End":
        e.preventDefault();
        setFocusedIndex(itemCount - 1);
        break;
    }
  }, [itemCount, focusedIndex, onSelect]);

  return { focusedIndex, handleKeyDown, setFocusedIndex };
}

// ============================================================================
// Reduced Motion Preference
// ============================================================================

/**
 * Hook to detect user's reduced motion preference
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

// ============================================================================
// Skip Link Component Props
// ============================================================================

export interface SkipLinkProps {
  targetId: string;
  label?: string;
}

// ============================================================================
// ARIA Attributes Helpers
// ============================================================================

/**
 * Generate ARIA attributes for a live region
 */
export function getLiveRegionProps(priority: "polite" | "assertive" = "polite"): {
  "aria-live": "polite" | "assertive";
  "aria-atomic": "true";
} {
  return {
    "aria-live": priority,
    "aria-atomic": "true",
  };
}

/**
 * Generate ARIA attributes for error messages
 */
export function getErrorProps(id: string): {
  id: string;
  role: "alert";
  "aria-live": "assertive";
} {
  return {
    id,
    role: "alert",
    "aria-live": "assertive",
  };
}

/**
 * Generate ARIA attributes for loading states
 */
export function getLoadingProps(isLoading: boolean): {
  "aria-busy": boolean;
  "aria-live": "polite";
} {
  return {
    "aria-busy": isLoading,
    "aria-live": "polite",
  };
}

// ============================================================================
// Focus Indicators
// ============================================================================

/**
 * CSS classes for visible focus indicators
 */
export const focusVisibleClasses = [
  "focus:outline-none",
  "focus:ring-2",
  "focus:ring-offset-2",
  "focus:ring-blue-500",
].join(" ");

/**
 * CSS classes for skip link styling
 */
export const skipLinkClasses = [
  "sr-only",
  "focus:not-sr-only",
  "focus:absolute",
  "focus:top-4",
  "focus:left-4",
  "focus:z-50",
  "focus:px-4",
  "focus:py-2",
  "focus:bg-white",
  "focus:text-black",
  "focus:rounded",
  "focus:shadow-lg",
  "focus:outline-none",
  "focus:ring-2",
  "focus:ring-blue-500",
].join(" ");

// ============================================================================
// Screen Reader Text
// ============================================================================

/**
 * CSS class for visually hidden but screen-reader accessible text
 */
export const srOnlyClass = "sr-only";

// ============================================================================
// Modal/Dialog ARIA Attributes
// ============================================================================

export interface ModalAriaProps {
  role: "dialog";
  "aria-modal": "true";
  "aria-labelledby": string;
}

export function getModalAriaProps(titleId: string): ModalAriaProps {
  return {
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": titleId,
  };
}
