/**
 * Unified Dashboard Provider
 * Central management for dashboard state, access control, and feature flags
 */

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useStore } from '@/providers/store-provider';
import { FeatureFlags } from '@/lib/feature-flags';
import { 
  PlanTier, 
  TIER_LIMITS, 
  isFeatureAvailable, 
  getMaxItems, 
  hasExceededQuota,
  getRemainingQuota
} from '@/lib/access-control/tier-limits';

interface DashboardContextType {
  // Current state
  currentTier: PlanTier;
  industry: string;
  
  // Feature access
  isFeatureEnabled: (feature: keyof typeof TIER_LIMITS.FREE) => boolean;
  getMaxItems: (feature: keyof typeof TIER_LIMITS.FREE) => number | 'unlimited';
  hasExceededQuota: (feature: keyof typeof TIER_LIMITS.FREE, currentUsage: number) => boolean;
  getRemainingQuota: (feature: keyof typeof TIER_LIMITS.FREE, currentUsage: number) => number;
  
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
  const [currentTier, setCurrentTier] = useState<PlanTier>('FREE');
  const [dashboardType, setDashboardType] = useState<'universal' | 'industry-native'>('universal');
  const [activeView, setActiveView] = useState<string>(store?.industrySlug || 'retail');
  
  // Initialize feature flags
  const featureFlags = FeatureFlags.getInstance();

  // Update tier when store changes
  useEffect(() => {
    if (store?.subscription?.plan) {
      const planKey = store.subscription.plan.key.toUpperCase();
      if (planKey === 'FREE' || planKey === 'STARTER' || planKey === 'PRO') {
        setCurrentTier(planKey as PlanTier);
        featureFlags.initialize(planKey as PlanTier);
      } else {
        setCurrentTier('FREE');
        featureFlags.initialize('FREE');
      }
    } else {
      setCurrentTier('FREE');
      featureFlags.initialize('FREE');
    }
  }, [store?.subscription?.plan]);

  // Initialize dashboard preferences from localStorage
  useEffect(() => {
    const savedType = localStorage.getItem('dashboard-type') as 'universal' | 'industry-native' | null;
    const savedView = localStorage.getItem('dashboard-view');
    
    if (savedType) setDashboardType(savedType);
    if (savedView) setActiveView(savedView);
    else if (store?.industrySlug) setActiveView(store.industrySlug);
  }, [store?.industrySlug]);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('dashboard-type', dashboardType);
  }, [dashboardType]);

  useEffect(() => {
    localStorage.setItem('dashboard-view', activeView);
  }, [activeView]);

  const contextValue: DashboardContextType = {
    // Current state
    currentTier,
    industry: store?.industrySlug || 'default',
    
    // Feature access
    isFeatureEnabled: (feature) => isFeatureAvailable(currentTier, feature),
    getMaxItems: (feature) => getMaxItems(currentTier, feature),
    hasExceededQuota: (feature, currentUsage) => hasExceededQuota(currentTier, feature, currentUsage),
    getRemainingQuota: (feature, currentUsage) => getRemainingQuota(currentTier, feature, currentUsage),
    
    // Feature flags
    featureFlags,
    
    // Upgrade information
    canUpgrade: currentTier !== 'PRO',
    upgradeUrl: '/dashboard/billing',
    
    // Dashboard preferences
    dashboardType,
    setDashboardType,
    activeView,
    setActiveView
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