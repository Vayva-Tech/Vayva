/**
 * Template Registry - Re-export from unified template-gallery
 * 
 * This file now re-exports all templates and utilities from the unified 
 * template-gallery at /template-gallery/index.ts to ensure a single
 * source of truth for all templates across the platform.
 * 
 * For backward compatibility, this file still exports the same types and
 * utilities, but they now come from the unified gallery.
 */

// Re-export everything from unified template-gallery
export {
  // Core types
  type TemplateGalleryItem,
  
  // Template data
  ALL_TEMPLATES,
  TEMPLATE_CATEGORIES,
  
  // Helper functions
  getTemplateById,
  getTemplatesByCategory,
  getTemplatesByPlan,
} from "@/template-gallery";

// Legacy backward-compatible exports
export const TEMPLATE_CATEGORIES_LIST = [
  { slug: "retail", displayName: "Retail & E-commerce" },
  { slug: "food", displayName: "Food & Beverage" },
  { slug: "service", displayName: "Services" },
  { slug: "creative", displayName: "Creative & Portfolio" },
  { slug: "digital", displayName: "Digital & Tech" },
  { slug: "real-estate", displayName: "Real Estate" },
  { slug: "events", displayName: "Events & Entertainment" },
  { slug: "education", displayName: "Education" },
  { slug: "automotive", displayName: "Automotive" },
  { slug: "nonprofit", displayName: "Nonprofit" },
  { slug: "health", displayName: "Health & Wellness" },
  { slug: "b2b", displayName: "B2B & Wholesale" },
  { slug: "travel", displayName: "Travel & Hospitality" },
  { slug: "marketplace", displayName: "Marketplaces" },
];

// Legacy function for getting normalized templates (now redirects to unified gallery)
export function getNormalizedTemplates() {
  // Re-export from unified gallery for backward compatibility
  return ALL_TEMPLATES.filter((t: { status: string }) => t.status === "active");
}

// Legacy function for getting templates by category (now redirects to unified gallery)  
export function getTemplatesByCategoryLegacy(categorySlug: string) {
  return ALL_TEMPLATES.filter(
    (t: { status: string; category: string; industry: string }) => 
      t.status === "active" && 
      (t.category.toLowerCase() === categorySlug.toLowerCase() ||
       t.industry === categorySlug)
  );
}

// Legacy template count
export const TOTAL_TEMPLATES_COUNT = 54;

// Legacy category count
export const TOTAL_CATEGORIES_COUNT = 14;

// Template registry for lookup by ID (for backward compatibility with routes using TEMPLATE_REGISTRY[templateId])
import { ALL_TEMPLATES } from "@/template-gallery";
export const TEMPLATE_REGISTRY: Record<string, typeof ALL_TEMPLATES[0]> = ALL_TEMPLATES.reduce((acc, template) => {
  acc[template.id] = template;
  return acc;
}, {} as Record<string, typeof ALL_TEMPLATES[0]>);
