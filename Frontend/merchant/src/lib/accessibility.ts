/**
 * Accessibility Utilities for Merchant Dashboard
 * Ensures WCAG 2.1 AA compliance
 */

import React from "react";

/**
 * ARIA live region announcer for screen readers
 */
export function announce(message: string, priority: "polite" | "assertive" = "polite"): void {
  const el = document.createElement("div");
  el.setAttribute("role", "status");
  el.setAttribute("aria-live", priority);
  el.setAttribute("aria-atomic", "true");
  el.className = "sr-only";
  el.textContent = message;
  document.body.appendChild(el);
  
  setTimeout(() => {
    document.body.removeChild(el);
  }, 1000);
}

/**
 * Focus trap for modals and dialogs
 */
export function useFocusTrap(isActive: boolean): React.RefObject<HTMLDivElement> {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener("keydown", handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener("keydown", handleTabKey);
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Check color contrast ratio
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex);
    const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
    
    const [rs, gs, bs] = [r, g, b].map((c) => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Validate accessibility compliance for a component
 */
export function validateAccessibility(element: HTMLElement): Array<{
  issue: string;
  severity: "critical" | "warning" | "info";
  suggestion: string;
}> {
  const issues: Array<{
    issue: string;
    severity: "critical" | "warning" | "info";
    suggestion: string;
  }> = [];

  // Check for missing alt text on images
  const images = element.querySelectorAll("img");
  images.forEach((img) => {
    if (!img.hasAttribute("alt")) {
      issues.push({
        issue: `Image missing alt attribute`,
        severity: "critical",
        suggestion: "Add descriptive alt text to the image",
      });
    }
  });

  // Check for form labels
  const inputs = element.querySelectorAll("input:not([type='hidden']), textarea, select");
  inputs.forEach((input) => {
    const id = input.getAttribute("id");
    const label = id ? element.querySelector(`label[for="${id}"]`) : null;
    const ariaLabel = input.getAttribute("aria-label");
    const ariaLabelledBy = input.getAttribute("aria-labelledby");

    if (!label && !ariaLabel && !ariaLabelledBy) {
      issues.push({
        issue: `Form input missing label`,
        severity: "critical",
        suggestion: "Add a label or aria-label to the input",
      });
    }
  });

  // Check for button text
  const buttons = element.querySelectorAll("button");
  buttons.forEach((button) => {
    if (!button.textContent?.trim() && !button.getAttribute("aria-label")) {
      issues.push({
        issue: `Button missing accessible name`,
        severity: "critical",
        suggestion: "Add text content or aria-label to the button",
      });
    }
  });

  // Check heading hierarchy
  const headings = element.querySelectorAll("h1, h2, h3, h4, h5, h6");
  let lastLevel = 0;
  headings.forEach((heading) => {
    const level = parseInt(heading.tagName.charAt(1));
    if (level > lastLevel + 1) {
      issues.push({
        issue: `Heading hierarchy skipped from H${lastLevel} to H${level}`,
        severity: "warning",
        suggestion: "Use sequential heading levels",
      });
    }
    lastLevel = level;
  });

  // Check for link text
  const links = element.querySelectorAll("a");
  links.forEach((link) => {
    const text = link.textContent?.trim() || link.getAttribute("aria-label");
    if (!text) {
      issues.push({
        issue: `Link missing accessible text`,
        severity: "critical",
        suggestion: "Add descriptive text to the link",
      });
    } else if (text.toLowerCase().includes("click here") || text.toLowerCase().includes("read more")) {
      issues.push({
        issue: `Non-descriptive link text: "${text}"`,
        severity: "warning",
        suggestion: "Use descriptive link text that makes sense out of context",
      });
    }
  });

  return issues;
}

/**
 * Helper to convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Accessible modal hook
 */
export function useAccessibleModal(
  isOpen: boolean,
  onClose: () => void,
  title: string
) {
  const modalRef = useFocusTrap(isOpen);

  React.useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
      
      // Announce modal to screen readers
      announce(`${title} dialog opened`);
      
      // Handle escape key
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "";
        announce(`${title} dialog closed`);
      };
    }
  }, [isOpen, onClose, title]);

  return modalRef;
}

/**
 * Generate accessible ID for form elements
 */
export function generateAriaId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}
