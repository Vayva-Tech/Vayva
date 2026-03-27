"use client";

import { IndustryDashboardRouter } from "@/components/dashboard/IndustryDashboardRouter";
import { PageEmpty } from "@/components/layout/PageEmpty";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { ChartLine } from "@phosphor-icons/react/ssr";
import { IndustryBadge } from "@/components/dashboard/IndustryBadge";

export default function DashboardPage() {
  const { user, merchant, isLoading } = useAuth();
  const { store } = useStore();

  if (isLoading) return null;

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
