"use client";

import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { INDUSTRY_CONFIG } from "@/config/industry";
import { IndustrySlug, IndustryConfig } from "@/lib/templates/types";

/**
 * Hook to retrieve the current industry configuration.
 * Prioritizes store-level configuration, then falls back to merchant-level, then default.
 */
export function useIndustry() {
  const { merchant } = useAuth();
  const { store } = useStore();

  const industrySlug = (store?.industrySlug ||
    merchant?.industrySlug ||
    "retail") as IndustrySlug;

  const config = (INDUSTRY_CONFIG[industrySlug] ||
    INDUSTRY_CONFIG["retail"]) as IndustryConfig;

  return {
    industrySlug,
    config,
    displayName: config.displayName,
  };
}
