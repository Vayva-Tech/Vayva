// ============================================================================
// Industry Dashboard Router
// ============================================================================
// Dynamically loads the correct industry dashboard component
// Falls back to UniversalProDashboard when no dedicated package UI exists
// ============================================================================

'use client';

import React, { Suspense, lazy } from 'react';
import type { IndustrySlug } from '@vayva/industry-core';
import type { PlanTier } from '@/lib/access-control/tier-limits';
import type { DashboardVariant } from '@/config/dashboard-universal-types';
import { UniversalProDashboard } from '@/components/dashboard/UniversalProDashboard';
import { IndustryDashboardPaywall } from '@/components/billing/IndustryDashboardPaywall';
import { useAccessControl } from '@/hooks/use-access-control';
import { canAccessIndustryDashboards } from '@/lib/access-control/tier-limits';

function normalizePlanTier(raw: string | undefined): PlanTier {
  const u = (raw ?? 'STARTER').toUpperCase();
  if (u === 'PRO_PLUS' || u === 'PRO+') return 'PRO_PLUS';
  if (u === 'PRO') return 'PRO';
  return 'STARTER';
}

function toDashboardVariant(v: string | undefined): DashboardVariant {
  const x = (v ?? 'pro').toLowerCase();
  if (x === 'basic' || x === 'standard' || x === 'advanced' || x === 'pro' || x === 'legacy') {
    return x;
  }
  return 'pro';
}

const RetailDashboard = lazy(() =>
  import('@vayva/industry-retail').then((m) => ({ default: m.RetailDashboard }))
);

const FoodDashboard = lazy(() =>
  import('@vayva/industry-food').then((m) => ({ default: m.FoodDashboard }))
);

const ServicesDashboard = lazy(() =>
  import('@vayva/industry-services').then((m) => ({ default: m.ServicesDashboard }))
);

const GroceryDashboard = lazy(() =>
  import('@vayva/industry-grocery').then((m) => ({ default: m.GroceryDashboard }))
);

const WholesaleDashboard = lazy(() =>
  import('@vayva/industry-wholesale').then((m) => ({ default: m.WholesaleDashboard }))
);

const NightlifeDashboard = lazy(() =>
  import('@vayva/industry-nightlife').then((m) => ({ default: m.NightlifeDashboard }))
);

const NonprofitDashboard = lazy(() =>
  import('@vayva/industry-nonprofit').then((m) => ({ default: m.NonprofitDashboard }))
);

const PetCareDashboard = lazy(() =>
  import('@vayva/industry-petcare').then((m) => ({ default: m.PetCareDashboard }))
);

const RealEstateDashboard = lazy(() =>
  import('@vayva/industry-realestate').then((m) => ({ default: m.RealEstateDashboard }))
);

const TravelDashboard = lazy(() =>
  import('@vayva/industry-travel').then((m) => ({ default: m.TravelDashboard }))
);

const SaaSDashboard = lazy(() =>
  import('@vayva/industry-saas').then((m) => ({ default: m.SaaSDashboard }))
);

const BlogMediaDashboard = lazy(() =>
  import("@/components/dashboard/industries/BlogMediaDashboard").then((m) => ({
    default: m.BlogMediaDashboard,
  }))
);

const AnalyticsDashboard = lazy(() =>
  import('@vayva/industry-analytics').then((m) => ({ default: m.AnalyticsDashboard }))
);

const LegalDashboard = lazy(() =>
  import('@vayva/industry-legal').then((m) => ({ default: m.LegalDashboard }))
);

const WellnessDashboard = lazy(() =>
  import('@vayva/industry-wellness').then((m) => ({ default: m.WellnessDashboard }))
);

const ProfessionalServicesDashboard = lazy(() =>
  import('@vayva/industry-professional').then((m) => ({
    default: m.ProfessionalServicesDashboard,
  }))
);

const CreativeDashboard = lazy(() =>
  import('@vayva/industry-creative').then((m) => ({ default: m.CreativeDashboard }))
);

const SpecializedDashboard = lazy(() =>
  import('@vayva/industry-specialized').then((m) => ({ default: m.SpecializedDashboard }))
);

export interface IndustryDashboardRouterProps {
  industry: IndustrySlug;
  variant?: string;
  userId: string;
  businessId: string;
  designCategory?: 'signature' | 'glass' | 'bold' | 'dark' | 'natural';
  planTier?: 'basic' | 'standard' | 'advanced' | 'pro';
  className?: string;
  currentTier?: string;
}

export function IndustryDashboardRouter({
  industry,
  variant = 'default',
  userId,
  businessId,
  designCategory = 'signature',
  planTier = 'standard',
  className,
  currentTier: propTier,
}: IndustryDashboardRouterProps) {
  const { currentTier: hookTier } = useAccessControl();
  const billingTier = normalizePlanTier(propTier ?? hookTier);
  const hasAccess = canAccessIndustryDashboards(billingTier);

  const dv = toDashboardVariant(variant);

  const shellProps = {
    userId,
    businessId,
    designCategory,
    planTier,
    className,
  };

  const engineProps = {
    ...shellProps,
    industry,
    variant: dv,
  };

  if (!hasAccess) {
    return (
      <IndustryDashboardPaywall currentTier={billingTier} industry={industry} />
    );
  }

  const LoadingFallback = () => (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4" />
        <p className="text-gray-500">Loading {industry} dashboard...</p>
      </div>
    </div>
  );

  const routeKey = industry as string;

  switch (routeKey) {
    case 'retail':
    case 'fashion':
    case 'electronics':
    case 'one_product':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <RetailDashboard {...engineProps} />
        </Suspense>
      );

    case 'food':
    case 'restaurant':
    case 'meal-kit':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <FoodDashboard {...engineProps} />
        </Suspense>
      );

    case 'services':
    case 'real_estate':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <ServicesDashboard {...engineProps} />
        </Suspense>
      );

    case 'events':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <UniversalProDashboard
            industry="events"
            variant={dv}
            userId={userId}
            businessId={businessId}
            designCategory={designCategory}
            planTier={planTier}
            className={className}
          />
        </Suspense>
      );

    case 'automotive':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <UniversalProDashboard
            industry="automotive"
            variant={dv}
            userId={userId}
            businessId={businessId}
            designCategory={designCategory}
            planTier={planTier}
            className={className}
          />
        </Suspense>
      );

    case 'grocery':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <GroceryDashboard {...shellProps} />
        </Suspense>
      );

    case 'wholesale':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <WholesaleDashboard {...shellProps} />
        </Suspense>
      );

    case 'nightlife':
    case 'bar':
    case 'club':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <NightlifeDashboard {...shellProps} />
        </Suspense>
      );

    case 'nonprofit':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <NonprofitDashboard
            industry={industry}
            variant={dv}
            userId={userId}
            businessId={businessId}
            className={className}
          />
        </Suspense>
      );

    case 'petcare':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <PetCareDashboard {...shellProps} />
        </Suspense>
      );

    case 'realestate':
    case 'property_management':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <RealEstateDashboard {...shellProps} />
        </Suspense>
      );

    case 'travel':
    case 'travel_hospitality':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <TravelDashboard className={className} />
        </Suspense>
      );

    case 'saas':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <SaaSDashboard {...engineProps} />
        </Suspense>
      );

    case 'blogmedia':
    case 'blog_media':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <BlogMediaDashboard {...shellProps} />
        </Suspense>
      );

    case 'analytics':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <AnalyticsDashboard {...shellProps} />
        </Suspense>
      );

    case 'legal':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <LegalDashboard {...shellProps} />
        </Suspense>
      );

    case 'wellness':
    case 'spa':
    case 'fitness':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <WellnessDashboard {...shellProps} />
        </Suspense>
      );

    case 'professional':
    case 'consulting':
    case 'accounting':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <ProfessionalServicesDashboard {...shellProps} />
        </Suspense>
      );

    case 'creative':
    case 'design_studio':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <CreativeDashboard {...shellProps} />
        </Suspense>
      );

    case 'specialized':
    case 'custom_solutions':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <SpecializedDashboard {...shellProps} />
        </Suspense>
      );

    default:
      return (
        <Suspense fallback={<LoadingFallback />}>
          <UniversalProDashboard
            industry={industry}
            variant={dv}
            userId={userId}
            businessId={businessId}
            designCategory={designCategory}
            planTier={planTier}
            className={className}
          />
        </Suspense>
      );
  }
}

export function LegacyDashboardFallback({
  userId,
  businessId,
}: {
  userId: string;
  businessId: string;
}) {
  return (
    <UniversalProDashboard
      industry="retail"
      userId={userId}
      businessId={businessId}
      variant="legacy"
    />
  );
}
