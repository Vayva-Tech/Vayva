/**
 * Unified Dashboard Provider
 * Central management for dashboard state, access control, and feature flags
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useStore } from '@/providers/store-provider';
import { FeatureFlags } from '@/lib/feature-flags';
import {
  type PlanTier,
  type TierLimits,
  isFeatureAvailable,
  getMaxItems,
  hasExceededQuota,
  getRemainingQuota,
} from '@/lib/access-control/tier-limits';

/** Session / display tier (FREE is not a billing PlanTier but is used in UI). */
export type DashboardSessionTier = PlanTier | 'FREE';

function effectivePlanTierForLimits(tier: DashboardSessionTier): PlanTier {
  return tier === 'FREE' ? 'STARTER' : tier;
}

interface DashboardContextType {
  // Current state
  currentTier: DashboardSessionTier;
  industry: string;

  // Feature access
  isFeatureEnabled: (feature: keyof TierLimits) => boolean;
  getMaxItems: (feature: keyof TierLimits) => number | 'unlimited';
  hasExceededQuota: (feature: keyof TierLimits, currentUsage: number) => boolean;
  getRemainingQuota: (feature: keyof TierLimits, currentUsage: number) => number;

  // Feature flags
  featureFlags: FeatureFlags;

  // Upgrade information
  canUpgrade: boolean;
  upgradeUrl: string;

  // Dashboard preferences
  dashboardType: 'universal' | 'industry-native';
  setDashboardType: (type: 'universal' | 'industry-native') => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { store } = useStore();
  const [currentTier, setCurrentTier] = useState<DashboardSessionTier>('FREE');
  const [dashboardType, setDashboardType] = useState<'universal' | 'industry-native'>('universal');
  const [activeView, setActiveView] = useState<string>(store?.industrySlug ?? 'retail');

  const featureFlags = FeatureFlags.getInstance();

  useEffect(() => {
    const flags = FeatureFlags.getInstance();
    const plan = store?.plan;
    if (plan === 'PRO') {
      setCurrentTier('PRO');
      flags.initialize('PRO');
      return;
    }
    if (plan === 'STARTER') {
      setCurrentTier('STARTER');
      flags.initialize('STARTER');
      return;
    }
    setCurrentTier('FREE');
    flags.initialize('STARTER');
  }, [store?.plan]);

  useEffect(() => {
    const savedType = localStorage.getItem('dashboard-type') as 'universal' | 'industry-native' | null;
    const savedView = localStorage.getItem('dashboard-view');

    if (savedType) setDashboardType(savedType);
    if (savedView) setActiveView(savedView);
    else if (store?.industrySlug) setActiveView(store.industrySlug);
  }, [store?.industrySlug]);

  useEffect(() => {
    localStorage.setItem('dashboard-type', dashboardType);
  }, [dashboardType]);

  useEffect(() => {
    localStorage.setItem('dashboard-view', activeView);
  }, [activeView]);

  const limitsTier = effectivePlanTierForLimits(currentTier);

  const contextValue: DashboardContextType = {
    currentTier,
    industry: store?.industrySlug ?? 'default',

    isFeatureEnabled: (feature) => isFeatureAvailable(limitsTier, feature),
    getMaxItems: (feature) => getMaxItems(limitsTier, feature),
    hasExceededQuota: (feature, currentUsage) =>
      hasExceededQuota(limitsTier, feature, currentUsage),
    getRemainingQuota: (feature, currentUsage) =>
      getRemainingQuota(limitsTier, feature, currentUsage),

    featureFlags,

    canUpgrade: currentTier !== 'PRO' && currentTier !== 'PRO_PLUS',
    upgradeUrl: '/dashboard/billing',

    dashboardType,
    setDashboardType,
    activeView,
    setActiveView,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

/**
 * Higher-order component for dashboard-aware components
 */
export function withDashboard<P extends object>(
  WrappedComponent: React.ComponentType<P & { dashboard: DashboardContextType }>
) {
  return function DashboardAwareComponent(props: P) {
    const dashboard = useDashboard();
    return <WrappedComponent {...props} dashboard={dashboard} />;
  };
}
