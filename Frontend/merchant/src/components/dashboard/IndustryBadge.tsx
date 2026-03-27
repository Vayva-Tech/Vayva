"use client";

import { useMemo } from "react";
import { getIndustryConfig } from "@/config/industry-archetypes";
import type { IndustrySlug } from "@/lib/templates/types";

interface IndustryBadgeProps {
  industrySlug?: string | null;
  className?: string;
  showDescription?: boolean;
}

export function IndustryBadge({ 
  industrySlug, 
  className = "",
  showDescription = false 
}: IndustryBadgeProps) {
  const industryConfig = useMemo(() => {
    if (!industrySlug) return null;
    try {
      return getIndustryConfig(industrySlug as IndustrySlug);
    } catch {
      return null;
    }
  }, [industrySlug]);

  if (!industrySlug || !industryConfig) {
    return null;
  }

  const displayName = industryConfig.displayName || industryConfig.name || industrySlug;
  const icon = industryConfig.icon || "Package";

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-200 text-emerald-700">
        <span className="w-4 h-4 mr-1.5">{icon}</span>
        <span className="font-semibold">{displayName}</span>
      </span>
      {showDescription && industryConfig.description && (
        <span className="text-xs text-gray-500 max-w-xs truncate" title={industryConfig.description}>
          {industryConfig.description}
        </span>
      )}
    </div>
  );
}
