/**
 * Industry-Specific Onboarding Presets
 * 
 * Configuration for industry-specific onboarding flows.
 */

import type { IndustryPreset } from "../types/onboarding";

export const INDUSTRY_PRESETS: Record<string, IndustryPreset> = {
  retail: {
    slug: "retail",
    recommendedTools: ["inventory", "orders", "analytics", "discounts"],
    defaultPolicies: ["shipping", "returns", "privacy", "terms"],
    kpis: ["revenue", "orders", "conversion-rate", "average-order-value"],
  },
  fashion: {
    slug: "fashion",
    recommendedTools: ["inventory", "size-guide", "trend-analysis", "lookbook"],
    defaultPolicies: ["shipping", "returns", "exchanges", "sizing"],
    kpis: ["revenue", "orders", "sizing-queries", "return-rate"],
  },
  grocery: {
    slug: "grocery",
    recommendedTools: [
      "inventory",
      "expiry-tracking",
      "delivery-scheduling",
      "subscription-boxes",
    ],
    defaultPolicies: ["delivery", "freshness-guarantee", "returns"],
    kpis: ["revenue", "orders", "waste-percentage", "delivery-time"],
  },
  beauty: {
    slug: "beauty",
    recommendedTools: [
      "appointments",
      "services",
      "client-management",
      "reminders",
    ],
    defaultPolicies: ["cancellation", "late-arrival", "no-show"],
    kpis: ["bookings", "revenue", "client-retention", "avg-service-duration"],
  },
  food: {
    slug: "food",
    recommendedTools: [
      "kitchen-display",
      "delivery-routing",
      "inventory",
      "table-reservation",
    ],
    defaultPolicies: ["delivery", "allergens", "refunds"],
    kpis: ["orders", "avg-delivery-time", "food-waste", "table-turnover"],
  },
  "real-estate": {
    slug: "real-estate",
    recommendedTools: ["listings", "agent-management", "crm", "virtual-tours"],
    defaultPolicies: ["privacy", "terms", "commission"],
    kpis: ["listings", "leads", "conversions", "avg-deal-value"],
  },
  education: {
    slug: "education",
    recommendedTools: ["courses", "enrollments", "certificates", "quizzes"],
    defaultPolicies: ["refund", "completion", "privacy"],
    kpis: ["enrollments", "completion-rate", "revenue", "student-satisfaction"],
  },
  healthcare: {
    slug: "healthcare",
    recommendedTools: [
      "appointments",
      "patient-records",
      "telemedicine",
      "prescriptions",
    ],
    defaultPolicies: ["hipaa-compliance", "privacy", "cancellation"],
    kpis: ["appointments", "patient-satisfaction", "revenue", "wait-time"],
  },
  automotive: {
    slug: "automotive",
    recommendedTools: [
      "service-booking",
      "parts-inventory",
      "crm",
      "reminders",
    ],
    defaultPolicies: ["warranty", "service-guarantee", "privacy"],
    kpis: ["service-bookings", "parts-sales", "customer-retention", "revenue"],
  },
  nonprofit: {
    slug: "nonprofit",
    recommendedTools: ["donations", "events", "volunteers", "campaigns"],
    defaultPolicies: ["privacy", "refund", "terms"],
    kpis: ["donations", "active-volunteers", "events", "campaign-success"],
  },
  b2b: {
    slug: "b2b",
    recommendedTools: ["rfq", "bulk-orders", "credit-management", "contracts"],
    defaultPolicies: ["payment-terms", "shipping", "privacy", "credit"],
    kpis: ["rfqs", "bulk-orders", "credit-utilization", "revenue"],
  },
};

// Get preset by slug
export function getIndustryPreset(slug: string): IndustryPreset | undefined {
  return INDUSTRY_PRESETS[slug];
}

// Get all presets
export function getAllIndustryPresets(): IndustryPreset[] {
  return Object.values(INDUSTRY_PRESETS);
}

// Check if industry exists
export function hasIndustryPreset(slug: string): boolean {
  return slug in INDUSTRY_PRESETS;
}
