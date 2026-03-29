"use client";

import { IndustryDashboardRouter } from "@/components/dashboard/IndustryDashboardRouter";
import { PageEmpty } from "@/components/layout/PageEmpty";
import { KpiGridSkeleton } from "@/components/dashboard/KpiSkeleton";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { ChartLine } from "@phosphor-icons/react/ssr";
import { IndustryBadge } from "@/components/dashboard/IndustryBadge";

export default function DashboardPage() {
  const { user, merchant, isLoading } = useAuth();
  const { store } = useStore();

  if (isLoading) {
    return (
      <div className="min-h-screen space-y-6 pb-10">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
        
        {/* KPI skeletons */}
        <KpiGridSkeleton count={4} size="md" />
        
        {/* Main content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
            <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
            <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Use type guard for industry slug - fallback to 'retail' as default
  const industry = merchant?.industrySlug || store?.industrySlug || "retail";
  const userId = user?.id;
  const businessId = user?.storeId || merchant?.storeId || store?.id;

  if (!userId || !businessId) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-8">
        <PageEmpty
          icon={ChartLine}
          title="Dashboard unavailable"
          description="We could not load your merchant session yet. Please refresh this page."
        />
      </div>
    );
  }

  return (
    <div>
      {/* Industry badge removed - now shown only in navigation sidebar to avoid duplication */}
      <IndustryDashboardRouter industry={industry} userId={userId} businessId={businessId} />
    </div>
  );
}
