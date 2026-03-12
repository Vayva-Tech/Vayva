import { RETAIL_TEMPLATES } from "./retail";
import { SERVICE_TEMPLATES } from "./service";
import { FOOD_TEMPLATES } from "./food";
import { SPECIALIZED_TEMPLATES } from "./specialized";
import type { TemplateConfig } from "./types";

// Deprecated for backward compat if needed, but we prefer checking IndustrySlug
export enum TemplateCategory {
  RETAIL = "Retail",
  SERVICE = "Service",
  FOOD = "Food",
  DIGITAL = "Digital",
  EVENTS = "Events",
  EDUCATION = "Education",
  B2B = "B2B",
  MARKETPLACE = "Marketplace",
  NONPROFIT = "Nonprofit",
  REAL_ESTATE = "Real Estate",
  CREATIVE = "Creative & Portfolio",
  AUTOMOTIVE = "Automotive",
  TRAVEL = "Travel & Hospitality",
  BLOG = "Blog & Media",
}

export const TEMPLATE_REGISTRY: Record<string, TemplateConfig> = {
  ...RETAIL_TEMPLATES,
  ...SERVICE_TEMPLATES,
  ...FOOD_TEMPLATES,
  ...SPECIALIZED_TEMPLATES,
};

export function getNormalizedTemplates() {
  return Object.values(TEMPLATE_REGISTRY).filter(
    (t) => t.status !== "deprecated",
  );
}

export const TEMPLATE_CATEGORIES = [
  { slug: "fashion-clothing", displayName: "Fashion", isActive: true },
  { slug: "electronics-gadgets", displayName: "Electronics", isActive: true },
  {
    slug: "beauty-wellness-home",
    displayName: "Beauty & Home",
    isActive: true,
  },
  { slug: "food-restaurant", displayName: "Food & Drink", isActive: true },
  { slug: "services-appointments", displayName: "Services", isActive: true },
  { slug: "digital-products", displayName: "Digital", isActive: true },
  { slug: "events-ticketing", displayName: "Events", isActive: true },
  { slug: "education-courses", displayName: "Education", isActive: true },
  { slug: "wholesale-b2b", displayName: "Wholesale (B2B)", isActive: true },
  { slug: "marketplace", displayName: "Marketplace", isActive: true },
  { slug: "donations-fundraising", displayName: "Non-profit", isActive: true },
  { slug: "real-estate", displayName: "Real Estate", isActive: true },
  {
    slug: "nightlife",
    displayName: "Nightlife & Entertainment",
    isActive: true,
  },
].map((c) => ({
  ...c,
  // Helper to find templates for this category
  recommendedTemplates: Object.values(TEMPLATE_REGISTRY)
    .filter((t) => t.industry === c.slug)
    .map((t) => t.templateId),
}));

export const TEMPLATES = Object.values(TEMPLATE_REGISTRY).map((t) => ({
  id: t.templateId,
  name: t.displayName,
  slug: t.slug,
  category: t.industry, // Use industry slug as category for now to match types
  tier: t.requiredPlan,
  description: t.compare?.headline || "",
  bestFor: t.compare?.bestFor?.[0] || "Merchants",
  workflows: t.compare?.keyModules || [],
  setupTime: "5 minutes",
  volume: "any",
  teamSize: "any",
  configures: [],
  customizable: [],
  previewImage:
    t.preview?.thumbnailUrl || "/marketing/templates/simple-retail.png",
  creates: {
    pages: [],
    sections: [],
    objects: [],
  },
}));

export function getTemplateBySlug(slug: string) {
  return TEMPLATES.find((t) => t.slug === slug);
}

export function isTierAccessible(userTier: string, requiredTier: string) {
  const tierHierarchy = {
    free: 0,
    growth: 1,
    pro: 2,
  };
  return (
    (tierHierarchy[userTier as keyof typeof tierHierarchy] ?? 0) >=
    (tierHierarchy[requiredTier as keyof typeof tierHierarchy] ?? 0)
  );
}
