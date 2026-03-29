/**
 * Plan-Based Dashboard Layouts
 * 
 * Different dashboard variants based on subscription tier
 */

'use client';

import React from 'react';
import { cn } from '@vayva/ui';
import { DashboardShell } from './core/DashboardShell';
import { useSubscription } from '@/features/subscription/hooks/useSubscription';
import type { PlanTier } from '@/features/subscription/types';

export interface PlanDashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

/**
 * Free/Starter Dashboard Layout
 * Basic features, upgrade prompts
 */
export function FreeDashboardLayout({
  children,
  title,
  description,
  actions,
}: PlanDashboardLayoutProps) {
  const { upgradePlan } = useSubscription();

  return (
    <DashboardShell title={title} description={description} actions={actions}>
      {/* Upgrade Banner for Free users */}
      <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              Upgrade to Pro
            </h3>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              Unlock advanced analytics, real-time updates, and AI insights
            </p>
          </div>
          <button
            onClick={() => upgradePlan('pro')}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            View Plans
          </button>
        </div>
      </div>

      {/* Limited Feature Set */}
      <div className={cn(children ? '' : 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4')}>
        {children}
      </div>
    </DashboardShell>
  );
}

/**
 * Pro Dashboard Layout
 * Full feature set with advanced analytics
 */
export function ProDashboardLayout({
  children,
  title,
  description,
  actions,
}: PlanDashboardLayoutProps) {
  return (
    <DashboardShell title={title} description={description} actions={actions}>
      {/* Full Feature Grid */}
      <div className={cn(children ? '' : 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4')}>
        {children}
      </div>
    </DashboardShell>
  );
}

/**
 * Pro+ Dashboard Layout
 * Premium features, white-label, predictive analytics
 */
export function ProPlusDashboardLayout({
  children,
  title,
  description,
  actions,
}: PlanDashboardLayoutProps) {
  return (
    <DashboardShell title={title} description={description} actions={actions}>
      {/* Enhanced Features + Predictive Analytics */}
      <div className={cn(children ? '' : 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4')}>
        {children}
      </div>
    </DashboardShell>
  );
}

/**
 * Auto-select layout based on plan
 */
export function AdaptiveDashboardLayout({
  children,
  title,
  description,
  actions,
}: PlanDashboardLayoutProps) {
  const { currentPlan } = useSubscription();

  const planTier: PlanTier = currentPlan?.tier || 'starter';

  switch (planTier) {
    case 'pro_plus':
      return (
        <ProPlusDashboardLayout
          title={title}
          description={description}
          actions={actions}
        >
          {children}
        </ProPlusDashboardLayout>
      );
    case 'pro':
      return (
        <ProDashboardLayout
          title={title}
          description={description}
          actions={actions}
        >
          {children}
        </ProDashboardLayout>
      );
    default:
      return (
        <FreeDashboardLayout
          title={title}
          description={description}
          actions={actions}
        >
          {children}
        </FreeDashboardLayout>
      );
  }
}
