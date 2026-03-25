"use client";

import React from "react";
import { UniversalProDashboard } from "../../../../../../Frontend/merchant/src/components/dashboard/UniversalProDashboard";

/**
 * ProDashboardMarketing - Uses the ACTUAL UniversalProDashboard component from merchant-admin
 * with automatic demo mode detection to showcase realistic dashboard data.
 * 
 * This ensures 100% visual and functional parity with the real merchant dashboard,
 * while providing compelling, realistic metrics that convert visitors.
 * 
 * How it works:
 * - Same component code as production merchant dashboard
 * - useRealTimeDashboard hook detects "marketing-demo" IDs
 * - Returns realistic pre-populated data instead of making API calls
 * - Shows a thriving store as social proof (₦2.4M revenue, 384 orders, etc.)
 * - All metrics are realistic and achievable for actual merchants
 */
export function ProDashboardMarketing() {
  // Retail industry - most relatable for most users
  const industry = "retail" as const;
  const variant = "pro" as const;
  const designCategory = "signature" as const;
  const planTier = "pro" as const;

  // Demo mode is automatically detected by the hook via these IDs
  return (
    <div className="w-full min-w-0 max-sm:overflow-x-auto max-sm:rounded-2xl max-sm:border max-sm:border-gray-200/70 max-sm:shadow-sm [-webkit-overflow-scrolling:touch]">
      <UniversalProDashboard
        industry={industry}
        variant={variant}
        userId="marketing-demo"
        businessId="marketing-demo"
        designCategory={designCategory}
        planTier={planTier}
      />
    </div>
  );
}

