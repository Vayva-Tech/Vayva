// ============================================================================
// Industry Dashboard Router
// ============================================================================
// Dynamically loads the correct industry dashboard component
// Phase 5: All 13 industries now have production-ready dashboards ✅
// Fallback to UniversalProDashboard for unsupported industries
// ============================================================================

'use client';

import React, { Suspense, lazy } from 'react';
import type { IndustrySlug } from '@vayva/industry-core';
import { UniversalProDashboard } from '@/components/dashboard/UniversalProDashboard';
import { IndustryDashboardPaywall } from '@/components/billing/IndustryDashboardPaywall';
import { useAccessControl } from '@/hooks/use-access-control';
import { canAccessIndustryDashboards } from '@/lib/access-control/tier-limits';

// Tier 1 Industry Dashboards (Lazy loaded for performance)
const RetailDashboard = lazy(() => import('@vayva/industry-retail').then(module => ({
  default: module.RetailDashboard
})));

const FoodDashboard = lazy(() => import('@vayva/industry-food').then(module => ({
  default: module.FoodDashboard
})));

const ServicesDashboard = lazy(() => import('@vayva/industry-services').then(module => ({
  default: module.ServicesDashboard
})));

// Phase 5 Industries - Production Ready ✅
const AutomotiveDashboard = lazy(() => import('@vayva/industry-automotive').then(module => ({
  default: module.AutomotiveDashboard
})));

const GroceryDashboard = lazy(() => import('@vayva/industry-grocery').then(module => ({
  default: module.GroceryDashboard
})));

const EventsDashboard = lazy(() => import('@vayva/industry-events').then(module => ({
  default: module.EventsDashboard
})));

const WholesaleDashboard = lazy(() => import('@vayva/industry-wholesale').then(module => ({
  default: module.WholesaleDashboard
})));

const NightlifeDashboard = lazy(() => import('@vayva/industry-nightlife').then(module => ({
  default: module.NightlifeDashboard
})));

const NonprofitDashboard = lazy(() => import('@vayva/industry-nonprofit').then(module => ({
  default: module.NonprofitDashboard
})));

const PetCareDashboard = lazy(() => import('@vayva/industry-petcare').then(module => ({
  default: module.PetCareDashboard
})));

const RealEstateDashboard = lazy(() => import('@vayva/industry-realestate').then(module => ({
  default: module.RealEstateDashboard
})));

const TravelDashboard = lazy(() => import('@vayva/industry-travel').then(module => ({
  default: module.TravelDashboard
})));

const SaaSDashboard = lazy(() => import('@vayva/industry-saas').then(module => ({
  default: module.SaaSDashboard
})));

const BlogMediaDashboard = lazy(() => import('@vayva/industry-blog-media').then(module => ({
  default: module.BlogMediaDashboard
})));

const AnalyticsDashboard = lazy(() => import('@vayva/industry-analytics').then(module => ({
  default: module.AnalyticsDashboard
})));

const LegalDashboard = lazy(() => import('@vayva/industry-legal').then(module => ({
  default: module.LegalDashboard
})));

const WellnessDashboard = lazy(() => import('@vayva/industry-wellness').then(module => ({
  default: module.WellnessDashboard
})));

const ProfessionalServicesDashboard = lazy(() => import('@vayva/industry-professional').then(module => ({
  default: module.ProfessionalServicesDashboard
})));

const CreativeDashboard = lazy(() => import('@vayva/industry-creative').then(module => ({
  default: module.CreativeDashboard
})));

const SpecializedDashboard = lazy(() => import('@vayva/industry-specialized').then(module => ({
  default: module.SpecializedDashboard
})));

export interface IndustryDashboardRouterProps {
  industry: IndustrySlug;
  variant?: string;
  userId: string;
  businessId: string;
  designCategory?: 'signature' | 'glass' | 'bold' | 'dark' | 'natural';
  planTier?: 'basic' | 'standard' | 'advanced' | 'pro';
  className?: string;
  currentTier?: string; // Add current tier prop
}

/**
 * Industry Dashboard Router
 * 
 * Automatically selects the correct dashboard component based on industry slug.
 * Falls back to UniversalProDashboard for unsupported industries.
 * Falls back to ProDashboardV2 for legacy/unknown industries.
 */
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
  // Get current tier from access control hook if not provided
  const { currentTier: hookTier } = useAccessControl();
  const currentTier = (propTier?.toUpperCase() as 'FREE' | 'STARTER' | 'PRO') || hookTier;

  // Check if user can access industry dashboards
  const hasAccess = canAccessIndustryDashboards(currentTier);

  // Common props for all dashboards
  const commonProps = {
    industry,
    variant,
    userId,
    businessId,
    designCategory,
    planTier,
    className,
  };

  // If user doesn't have access to industry dashboards, show paywall
  if (!hasAccess) {
    return (
      <IndustryDashboardPaywall 
        currentTier={currentTier}
        industry={industry}
      />
    );
  }

  // Loading fallback component
  const LoadingFallback = () => (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading {industry} dashboard...</p>
      </div>
    </div>
  );

  // Error fallback component
  const ErrorFallback = ({ error }: { error: Error }) => (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center max-w-md">
        <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    </div>
  );

  // Route to appropriate dashboard based on industry
  switch (industry) {
    // ========================================================================
    // Tier 1: Core Business Models (Fully Implemented)
    // ========================================================================
    
    case 'retail':
    case 'fashion':
    case 'electronics':
    case 'grocery':
    case 'one_product':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <RetailDashboard {...commonProps} />
        </Suspense>
      );

    case 'food':
    case 'restaurant':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <FoodDashboard {...commonProps} />
        </Suspense>
      );

    case 'services':
    case 'real_estate':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <ServicesDashboard {...commonProps} />
        </Suspense>
      );

    // ========================================================================
    // Phase 5 Industries - Production Ready ✅
    // ========================================================================
    
    case 'events':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <EventsDashboard {...commonProps} />
        </Suspense>
      );

    case 'automotive':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <AutomotiveDashboard {...commonProps} />
        </Suspense>
      );

    case 'grocery':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <GroceryDashboard {...commonProps} />
        </Suspense>
      );

    case 'wholesale':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <WholesaleDashboard {...commonProps} />
        </Suspense>
      );

    case 'nightlife':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <NightlifeDashboard {...commonProps} />
        </Suspense>
      );

    case 'nonprofit':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <NonprofitDashboard {...commonProps} />
        </Suspense>
      );

    case 'petcare':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <PetCareDashboard {...commonProps} />
        </Suspense>
      );

    case 'realestate':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <RealEstateDashboard {...commonProps} />
        </Suspense>
      );

    case 'travel':
    case 'travel_hospitality':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <TravelDashboard {...commonProps} />
        </Suspense>
      );

    case 'saas':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <SaaSDashboard {...commonProps} />
        </Suspense>
      );

    case 'blogmedia':
    case 'blog_media':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <BlogMediaDashboard {...commonProps} />
        </Suspense>
      );

    case 'analytics':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <AnalyticsDashboard {...commonProps} />
        </Suspense>
      );

    case 'legal':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <LegalDashboard {...commonProps} />
        </Suspense>
      );

    case 'wellness':
    case 'spa':
    case 'fitness':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <WellnessDashboard {...commonProps} />
        </Suspense>
      );

    case 'professional':
    case 'consulting':
    case 'accounting':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <ProfessionalServicesDashboard {...commonProps} />
        </Suspense>
      );

    case 'realestate':
    case 'property_management':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <RealEstateDashboard {...commonProps} />
        </Suspense>
      );

    case 'nightlife':
    case 'bar':
    case 'club':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <NightlifeDashboard {...commonProps} />
        </Suspense>
      );

    case 'creative':
    case 'design_studio':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <CreativeDashboard {...commonProps} />
        </Suspense>
      );

    case 'specialized':
    case 'custom_solutions':
      return (
        <Suspense fallback={<LoadingFallback />}>
          <SpecializedDashboard {...commonProps} />
        </Suspense>
      );

    // ========================================================================
    // Fallback: Use UniversalProDashboard for other industries
    // ========================================================================
    
    default:
      // For any industry without a dedicated dashboard, use the universal one
      return (
        <Suspense fallback={<LoadingFallback />}>
          <UniversalProDashboard
            industry={industry}
            variant={variant}
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

/**
 * Legacy Fallback Router
 * Used when industry is unknown or merchant has no industry set
 */
export function LegacyDashboardFallback({
  userId,
  businessId,
}: {
  userId: string;
  businessId: string;
}) {
  // Fallback to UniversalProDashboard for legacy cases
  return (
    <UniversalProDashboard
      industry="retail"
      userId={userId}
      businessId={businessId}
      variant="legacy"
    />
  );
}
