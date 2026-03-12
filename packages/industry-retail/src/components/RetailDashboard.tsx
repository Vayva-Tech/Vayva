// ============================================================================
// Retail Dashboard Component
// ============================================================================
// Main dashboard component for retail industry
// ============================================================================

import React, { useEffect } from "react";
import { useDashboardEngine } from "@vayva/industry-core";
import { UniversalProDashboard } from "@/components/dashboard/UniversalProDashboard";
import { retailDashboardConfig } from "../dashboard/config";
import { registerRetailWidgets } from "../widgets/registry";

export interface RetailDashboardProps {
  industry: string;
  variant?: string;
  userId: string;
  businessId: string;
  designCategory?: "signature" | "glass" | "bold" | "dark" | "natural";
  planTier?: "basic" | "standard" | "advanced" | "pro";
}

export function RetailDashboard({
  industry,
  variant = "default",
  userId,
  businessId,
  designCategory = "signature",
  planTier = "standard",
}: RetailDashboardProps) {
  // Register retail-specific widgets on mount
  useEffect(() => {
    registerRetailWidgets();
  }, []);

  const {
    state,
    loading,
    error,
    refreshMetrics,
    subscribeToUpdates,
  } = useDashboardEngine({
    industry: "retail",
    config: retailDashboardConfig,
    userId,
    businessId,
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToUpdates();
    return () => unsubscribe();
  }, [subscribeToUpdates]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading retail dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <button
            onClick={refreshMetrics}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <UniversalProDashboard
      industry="retail"
      variant={variant}
      config={retailDashboardConfig}
      state={state}
      designCategory={designCategory}
      planTier={planTier}
    />
  );
}
