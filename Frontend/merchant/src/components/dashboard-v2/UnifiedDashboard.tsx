"use client";

import React from 'react';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { DashboardSkeleton } from './DashboardSkeleton';
import { useUnifiedDashboardData } from '@/hooks/useUnifiedDashboard';
import { useModuleVisibility } from '@/hooks/useModuleVisibility';
import { FeatureGate } from '@/components/features/FeatureGate';
import type { DashboardPlanTier } from '@/config/dashboard-variants';

export interface UnifiedDashboardProps {
  industry: string;
  planTier: DashboardPlanTier;
  designCategory?: string;
  children?: React.ReactNode;
}

/**
 * UnifiedDashboard - Single source of truth for all Vayva dashboards
 * 
 * Features:
 * - Modular widget system (pluggable components)
 * - Industry-aware module filtering
 * - Plan-based feature gating
 * - Unified data layer (single API call)
 * - Loading skeletons integrated
 * - Error boundaries
 * 
 * @see DASHBOARD_UNIFICATION_UI_UX_INTEGRATED_PLAN.md
 */
export function UnifiedDashboard({
  industry,
  planTier,
  designCategory,
  children,
}: UnifiedDashboardProps) {
  // Get visible modules for this industry/plan combination
  const visibleModules = useModuleVisibility(industry, planTier);
  
  // Unified data fetching - single API call for all dashboard data
  const {
    metrics,
    tasks,
    alerts,
    insights,
    isLoading,
    error,
    refresh,
  } = useUnifiedDashboardData(industry);
  
  // Show skeleton while loading
  if (isLoading) {
    return <DashboardSkeleton count={4} size="lg" />;
  }
  
  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to load dashboard
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen space-y-6 pb-10">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs items={[{ label: 'Dashboard' }]} />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight capitalize">
            {industry.replace(/-/g, ' ')} Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {getIndustrySubtitle(industry)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
      
      {/* Modular Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metrics Module - Always visible */}
        <MetricsModule data={metrics} />
        
        {/* Tasks Module - Always visible */}
        <TasksModule data={tasks} />
        
        {/* PRO+ Features */}
        <FeatureGate minPlan="PRO_PLUS">
          <AdvancedAnalyticsModule data={insights} />
        </FeatureGate>
        
        {/* PRO Features */}
        <FeatureGate minPlan="PRO">
          <MarketingAutomationModule />
        </FeatureGate>
      </div>
      
      {/* Industry-Specific Layer */}
      <IndustryWidgetLayer
        industry={industry}
        data={insights}
        visibleModules={visibleModules}
      />
      
      {/* Additional Content (children) */}
      {children}
    </div>
  );
}

// Helper Functions

function getIndustrySubtitle(industry: string): string {
  const subtitles: Record<string, string> = {
    'restaurant': 'Manage your restaurant operations',
    'beauty-wellness': 'Track appointments and client care',
    'healthcare': 'Patient care and practice management',
    'retail': 'Sales, inventory, and customer insights',
    'grocery': 'Fresh inventory and quick checkout',
    'professional-services': 'Client projects and time tracking',
    'education': 'Course management and student progress',
    'automotive': 'Service scheduling and parts inventory',
  };
  
  return subtitles[industry] || 'Monitor your business performance';
}

// Placeholder Module Components (to be replaced with real implementations)

function MetricsModule({ data }: { data: any }) {
  return (
    <div className="col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Metrics</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Revenue</span>
          <span className="text-lg font-bold text-gray-900">
            ₦{(data?.revenue || 0).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Orders</span>
          <span className="text-lg font-bold text-gray-900">
            {data?.orders || 0}
          </span>
        </div>
      </div>
    </div>
  );
}

function TasksModule({ data }: { data: any }) {
  return (
    <div className="col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Pending Tasks</h3>
      <div className="space-y-2">
        {data?.tasks?.slice(0, 3).map((task: any, idx: number) => (
          <div key={idx} className="flex items-start gap-2">
            <input
              type="checkbox"
              className="mt-1 rounded border-gray-300 text-green-500 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">{task.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdvancedAnalyticsModule({ data }: { data: any }) {
  return (
    <div className="col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Advanced Analytics
      </h3>
      <p className="text-xs text-gray-500">
        AI-powered insights and predictions
      </p>
      {/* TODO: Implement advanced charts */}
    </div>
  );
}

function MarketingAutomationModule() {
  return (
    <div className="col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Marketing Automation
      </h3>
      <p className="text-xs text-gray-500">
        Automated campaigns and customer segmentation
      </p>
      {/* TODO: Implement marketing widgets */}
    </div>
  );
}

function IndustryWidgetLayer({
  industry,
  data,
  visibleModules,
}: {
  industry: string;
  data: any;
  visibleModules: string[];
}) {
  // Dynamic import based on industry
  // This will be expanded with real industry components
  
  const industryComponents: Record<string, React.FC<any>> = {
    'restaurant': () => <div>Restaurant KDS & Table Management</div>,
    'beauty-wellness': () => <div>Beauty Appointment Calendar</div>,
    'healthcare': () => <div>Healthcare Patient Schedule</div>,
    'retail': () => <div>Retail POS Overview</div>,
  };
  
  const IndustryComponent = industryComponents[industry];
  
  if (!IndustryComponent) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
        {industry.replace(/-/g, ' ')} Tools
      </h3>
      <IndustryComponent data={data} />
    </div>
  );
}
