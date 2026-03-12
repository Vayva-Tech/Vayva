// ============================================================================
// THEME UTILITY FUNCTIONS
// ============================================================================
// Helper functions for applying and managing design categories
// ============================================================================

import type { DesignCategory } from "@/components/vayva-ui/VayvaThemeProvider";
import { 
  getDesignCategoryForIndustry, 
  getDefaultPresetForCategory 
} from "@/config/industry-design-categories";

/**
 * Apply a design category to the document
 * Sets CSS variables and data attributes for dynamic theming
 */
export function applyDesignCategory(category: DesignCategory): void {
  // Set data attribute for CSS selectors
  document.documentElement.setAttribute("data-design-category", category);
  
  // Store in localStorage for persistence
  localStorage.setItem("vayva-design-category", category);
  
  // Apply CSS variables based on category
  const root = document.documentElement;
  
  switch (category) {
    case "glass":
      root.style.setProperty("--card-bg", "rgba(255, 255, 255, 0.85)");
      root.style.setProperty("--card-border", "rgba(255, 255, 255, 0.4)");
      root.style.setProperty("--backdrop-blur", "20px");
      break;
      
    case "dark":
      root.style.setProperty("--bg-primary", "#0D0D0D");
      root.style.setProperty("--text-primary", "#E5E7EB");
      root.style.setProperty("--text-secondary", "#9CA3AF");
      break;
      
    case "bold":
      root.style.setProperty("--border-width", "2px");
      root.style.setProperty("--border-color", "#000000");
      break;
      
    case "natural":
      root.style.setProperty("--bg-gradient", "linear-gradient(180deg, #FEFCE8 0%, #FEF3C7 100%)");
      root.style.setProperty("--accent-color", "#D97706");
      break;
      
    case "signature":
    default:
      root.style.setProperty("--bg-primary", "#F9FAFB");
      root.style.setProperty("--text-primary", "#1F2937");
      root.style.setProperty("--text-secondary", "#6B7280");
      break;
  }
}

/**
 * Apply theme based on industry slug
 * Automatically selects the appropriate design category
 */
export function applyThemeForIndustry(industrySlug: string): void {
  const designCategory = getDesignCategoryForIndustry(industrySlug);
  const preset = getDefaultPresetForCategory(designCategory);
  
  applyDesignCategory(designCategory);
  localStorage.setItem("vayva-theme-preset", preset);
}

/**
 * Get current design category from localStorage or default
 */
export function getCurrentDesignCategory(): DesignCategory {
  return (localStorage.getItem("vayva-design-category") as DesignCategory) || "signature";
}

/**
 * Reset to default theme
 */
export function resetToDefaultTheme(): void {
  localStorage.removeItem("vayva-design-category");
  localStorage.removeItem("vayva-theme-preset");
  document.documentElement.removeAttribute("data-design-category");
  document.documentElement.removeAttribute("data-theme-preset");
  
  // Reset CSS variables
  const root = document.documentElement;
  root.style.removeProperty("--card-bg");
  root.style.removeProperty("--card-border");
  root.style.removeProperty("--backdrop-blur");
  root.style.removeProperty("--bg-primary");
  root.style.removeProperty("--text-primary");
  root.style.removeProperty("--text-secondary");
  root.style.removeProperty("--border-width");
  root.style.removeProperty("--border-color");
  root.style.removeProperty("--bg-gradient");
  root.style.removeProperty("--accent-color");
}

/**
 * Get CSS classes for a design category
 */
export function getDesignCategoryClasses(category: DesignCategory): string {
  switch (category) {
    case "glass":
      return "bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50";
    case "dark":
      return "bg-gray-900 text-gray-100";
    case "bold":
      return "bg-white";
    case "natural":
      return "bg-gradient-to-b from-amber-50 to-yellow-50";
    case "signature":
    default:
      return "bg-gray-50";
  }
}

/**
 * Get preview style for design category selection UI
 */
export function getDesignCategoryPreviewStyle(category: DesignCategory): React.CSSProperties {
  switch (category) {
    case "glass":
      return {
        background: "linear-gradient(135deg, #F472B6 0%, #FDB4A4 100%)",
        color: "white",
      };
    case "dark":
      return {
        background: "#1F2937",
        color: "#E5E7EB",
      };
    case "bold":
      return {
        background: "linear-gradient(135deg, #F97316 0%, #FB923C 100%)",
        color: "white",
        border: "2px solid #000000",
      };
    case "natural":
      return {
        background: "#D97706",
        color: "white",
      };
    case "signature":
    default:
      return {
        background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
        color: "white",
      };
  }
}