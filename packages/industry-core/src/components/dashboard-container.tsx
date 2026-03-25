'use client';

// ============================================================================
// Dashboard Container
// ============================================================================
// Main container component for industry dashboards
// ============================================================================

import { createContext, useContext, type ReactNode } from "react";
import type { DashboardContextValue } from "../types";

// Create the dashboard context
const DashboardContext = createContext<DashboardContextValue | null>(null);

interface DashboardContainerProps {
  children: ReactNode;
  value: DashboardContextValue;
  className?: string;
}

/**
 * DashboardContainer - Main wrapper for industry dashboards
 *
 * Provides the dashboard context to all child components and
 * handles the overall layout structure.
 *
 * @example
 * ```tsx
 * <DashboardContainer value={dashboardContext}>
 *   <DashboardGrid />
 *   <AlertBanner />
 *   <QuickActionsPanel />
 * </DashboardContainer>
 * ```
 */
export function DashboardContainer({
  children,
  value,
  className = "",
}: DashboardContainerProps) {
  return (
    <DashboardContext.Provider value={value}>
      <div
        className={`vayva-dashboard vayva-dashboard-${value.industry} ${className}`}
        data-industry={value.industry}
        data-loading={value.isLoading}
      >
        {value.error && (
          <div className="dashboard-error-banner" role="alert">
            <p>Error loading dashboard: {value.error.message}</p>
          </div>
        )}
        {children}
      </div>
    </DashboardContext.Provider>
  );
}

DashboardContainer.displayName = "DashboardContainer";

/**
 * Hook to access the dashboard context
 */
export function useDashboard(): DashboardContextValue {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardContainer");
  }
  return context;
}
