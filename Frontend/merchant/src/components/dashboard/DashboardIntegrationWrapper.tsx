/**
 * Dashboard Integration Wrapper
 * Bridges the new unified system with existing dashboard infrastructure
 */

'use client';

import { useEffect } from 'react';
import {
  DashboardProvider,
  useDashboard,
} from "@/providers/dashboard-provider";
import type { PlanTier } from "@/lib/access-control/tier-limits";
import { FeatureFlags } from '@/lib/feature-flags';

interface DashboardWrapperProps {
  children: React.ReactNode;
  initialIndustry: string;
}

function DashboardContentWrapper({ children, initialIndustry }: DashboardWrapperProps) {
  const { featureFlags, currentTier } = useDashboard();

  // Initialize feature flags when tier changes (all users start with STARTER)
  useEffect(() => {
    const tier: PlanTier = currentTier as PlanTier;
    featureFlags.initialize(tier);
  }, [currentTier, featureFlags]);

  return <>{children}</>;
}

export function DashboardIntegrationWrapper({ 
  children, 
  initialIndustry 
}: DashboardWrapperProps) {
  return (
    <DashboardProvider>
      <DashboardContentWrapper initialIndustry={initialIndustry}>
        {children}
      </DashboardContentWrapper>
    </DashboardProvider>
  );
}