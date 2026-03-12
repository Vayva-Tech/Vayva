/**
 * Dashboard Integration Wrapper
 * Bridges the new unified system with existing dashboard infrastructure
 */

'use client';

import { useEffect } from 'react';
import { DashboardProvider, useDashboard } from "@/providers/dashboard-provider";
import { FeatureFlags } from '@/lib/feature-flags';

interface DashboardWrapperProps {
  children: React.ReactNode;
  initialIndustry: string;
}

function DashboardContentWrapper({ children, initialIndustry }: DashboardWrapperProps) {
  const { featureFlags, currentTier } = useDashboard();

  // Initialize feature flags when tier changes
  useEffect(() => {
    featureFlags.initialize(currentTier);
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