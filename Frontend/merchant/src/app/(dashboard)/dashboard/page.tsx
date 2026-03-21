// @ts-nocheck
"use client";

import {
  Gear as Settings,
  CaretRight as ArrowRight,
  WarningCircle as AlertCircle,
  Lifebuoy as LifeBuoy,
} from "@phosphor-icons/react/ssr";

import useSWR from "swr";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import { INDUSTRY_CONFIG } from "@/config/industry";
import {
  resolveDashboardPlanTier,
  resolveDashboardVariantSpec,
  type DashboardPlanTier,
} from "@/config/dashboard-variants";
import { IndustrySlug } from "@/lib/templates/types";
import { Button } from "@vayva/ui";
import { apiJson } from "@/lib/api-client-shared";
import { hasIndustryNativeDashboard } from "@/config/industry-dashboard-definitions";
import {
  DashboardV2Content,
  type LiveOpsItem,
} from "@/components/dashboard-v2/DashboardV2Content";
import { DashboardLegacyContent } from "@/components/dashboard-v2/DashboardLegacyContent";
import { ProDashboardV2 } from "@/components/dashboard-v2/ProDashboardV2";
import { UpgradePrompt, useTrialPrompt } from "@/components/dashboard/UpgradePrompt";
import type {
  MerchantMeData,
  DashboardIndustryOverviewData,
  RecentOrderItem,
  OverviewMeeting,
  IncomeExpenseRow,
  InvoiceRow,
  TodoItem,
  DashboardAggregateData,
} from "@/types/dashboard";

const fetcher = <T,>(url: string) => apiJson<T>(url);

type RangeKey = "today" | "week" | "month";

export default function DashboardPage() {
  const { merchant } = useAuth();
  const { store } = useStore();
  const searchParams = useSearchParams();
  const rangeKey = ((searchParams.get("range") as RangeKey | null) ||
    "month") as RangeKey;
  const baseIndustrySlug = (store?.industrySlug ||
    merchant?.industrySlug ||
    "retail") as IndustrySlug;
  const [activeView, setActiveView] = useState<string>(baseIndustrySlug);
  const industrySlugForFetch = (activeView as IndustrySlug) || baseIndustrySlug;
  const configForFetch =
    INDUSTRY_CONFIG[industrySlugForFetch] || INDUSTRY_CONFIG.retail;
  const hasBookingsForFetch = Boolean(
    configForFetch?.features?.bookings ||
    configForFetch?.features?.reservations ||
    configForFetch?.features?.viewings,
  );

  const { data: aggregateResponse, isLoading: aggregateLoading } = useSWR<{
    success: boolean;
    data: DashboardAggregateData;
  }>(
    `/api/dashboard/aggregate?range=${rangeKey}`,
    fetcher<{ success: boolean; data: DashboardAggregateData }>,
    {
      refreshInterval: 30000, // Refresh every 30s
    },
  );

  const aggregateData = aggregateResponse?.data;

  const { data: authData } = useSWR<MerchantMeData>(
    "/api/auth/merchant/me",
    fetcher<MerchantMeData>,
  );
  const overviewData = aggregateData?.overviewData;
  const overviewLoading = aggregateLoading;
  const todosAlertsData = aggregateData?.todosAlertsData;
  const recentPrimaryData = aggregateData?.recentPrimaryData;
  const recentPrimaryLoading = aggregateLoading;
  // Map activity from aggregate
  const activityData = aggregateData?.activityData;
  const activityLoading = aggregateLoading;

  const metricsData = aggregateData?.metricsData;
  const metricsLoading = aggregateLoading;

  const inventoryAlertsData = aggregateData?.inventoryAlertsData;
  const inventoryLoading = aggregateLoading;

  const customerInsightsData = aggregateData?.customerInsightsData;
  const customerInsightsLoading = aggregateLoading;

  const isIndustryNative = hasIndustryNativeDashboard(industrySlugForFetch);
  const { data: industryOverviewData, isLoading: industryOverviewLoading } =
    useSWR<DashboardIndustryOverviewData>(
      isIndustryNative ? "/api/dashboard/industry-overview" : null,
      fetcher<DashboardIndustryOverviewData>,
    );

  // Hoist derived values and hooks before early returns (Rules of Hooks)
  const metrics = metricsData?.metrics || {};
  const mePayload = authData?.data || authData;
  const dashboardPlanTier =
    mePayload?.features?.dashboard?.planTier ||
    resolveDashboardPlanTier(mePayload?.merchant?.plan);

  const trialStartDate = useMemo(() => {
    const isFreePlan = mePayload?.merchant?.plan === "FREE" || dashboardPlanTier === "basic";
    const createdAt = (mePayload?.merchant as any)?.createdAt;
    if (isFreePlan && createdAt) {
      return new Date(createdAt);
    }
    return null;
  }, [mePayload, dashboardPlanTier]);

  const trialPrompt = useTrialPrompt(trialStartDate, {
    orders: Number(metrics?.orders?.value || 0),
    revenue: Number(metrics?.revenue?.value || 0),
    customers: Number(metrics?.customers?.value || 0),
  });

  if (!merchant)
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-white rounded-xl animate-pulse mb-2" />
        <div className="h-4 w-64 bg-white rounded-xl animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 bg-white rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );

  // Redirect if no industry set
  if (!merchant.industrySlug) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4">
          <Settings size={28} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Complete your store setup
        </h2>
        <p className="text-sm text-gray-700 max-w-md mb-6">
          Select your industry in Settings to unlock your personalized
          dashboard, product catalog, and order management.
        </p>
        <Link href="/dashboard/settings/profile">
          <Button className="rounded-xl px-6">
            <ArrowRight className="mr-2 h-4 w-4" />
            Go to Settings
          </Button>
        </Link>
      </div>
    );
  }

  const industrySlug = (store?.industrySlug || merchant.industrySlug) as IndustrySlug;
  const config = INDUSTRY_CONFIG[industrySlug];

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500 flex items-center justify-center mb-4">
          <AlertCircle size={28} className="text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-gray-700 max-w-md mb-6">
          We couldn&apos;t load your dashboard configuration. Try updating your
          industry in Settings, or contact support if the issue persists.
        </p>
        <div className="flex gap-3">
          <Link href="/dashboard/settings/profile">
            <Button variant="outline" className="rounded-xl px-5">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
          <Link href="/dashboard/support">
            <Button className="rounded-xl px-5">
              <LifeBuoy className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Determine Main CTA
  const ctaLabel = `Create ${config?.primaryObject?.replace(/_/g, " ")}`;
  let ctaLink = `/dashboard/products/new`; // Safe default

  for (const mod of config.modules) {
    const route = config.moduleRoutes?.[mod]?.create;
    if (route) {
      ctaLink = route;
      break;
    }
  }

  if (ctaLink === "/dashboard/products/new") {
    const map: Record<string, string> = {
      service: "/dashboard/services/new",
      event: "/dashboard/events/new",
      course: "/dashboard/courses/new",
      listing: "/dashboard/listings/new",
      post: "/dashboard/posts/new",
      project: "/dashboard/projects/new",
      campaign: "/dashboard/campaigns/new",
      menu_item: "/dashboard/menu-items/new",
      digital_asset: "/dashboard/digital-assets/new",
    };
    if (map[config.primaryObject]) {
      ctaLink = map[config.primaryObject];
    }
  }

  // Dashboard V2 flag: env var overrides feature flag for gradual rollout
  const isDashboardV2Enabled =
    process.env?.NEXT_PUBLIC_DASHBOARD_V2_ENABLED === "true" ||
    mePayload?.features?.dashboard?.v2Enabled === true;

  const dashboardCosmeticVariant =
    mePayload?.features?.dashboard?.cosmeticVariant || null;

  const overview = overviewData?.data || overviewData?.overview || null;
  const todosAlerts = todosAlertsData?.data || todosAlertsData;
  const tasks: TodoItem[] = todosAlerts?.todos || [];

  const hasBookings = hasBookingsForFetch;

  // Dashboard V2: Modern KPI blocks, todos/alerts, and quick actions
  if (isDashboardV2Enabled) {
    // All features available - subscription gating removed
    const variant = resolveDashboardVariantSpec({
      industrySlug: industrySlugForFetch,
      tier: dashboardPlanTier as DashboardPlanTier,
      dashboardCosmeticVariant,
      storeFeatures: {
        invoicesEnabled: true,
      },
    });

    const statusCounts: Record<string, number> = overview?.statusCounts || {};
    const donutData = (variant?.pipeline?.segments || []).map(
      (seg: { label: string; statuses?: string[]; color: string }) => {
        let v = 0;
        for (const s of (seg as any).statuses || []) {
          v += Number(statusCounts?.[String(s)] || 0);
        }
        return { name: seg.label, value: v, color: seg.color };
      },
    );
    const totalByStatus = Object.values(statusCounts).reduce((sum: any, v: any) => sum + Number(v || 0),
      0,
    );
    const assigned = donutData.reduce((sum: any, d: any) => sum + Number(d.value || 0),
      0,
    );
    const unassigned = Math.max(0, totalByStatus - assigned);
    if (unassigned > 0) {
      donutData.push({ name: "Other", value: unassigned, color: "#CBD5E1" });
    }

    const incomeVsExpense: IncomeExpenseRow[] = overview?.incomeVsExpense || [];
    const invoiceRows: InvoiceRow[] = overview?.invoiceRows || [];
    const invoiceOverviewRows: InvoiceRow[] =
      overview?.invoiceOverviewRows || [];
    const selectedInvoiceRows =
      variant?.invoiceOverview?.source === "invoices"
        ? invoiceOverviewRows
        : invoiceRows;
    const meetings: OverviewMeeting[] = overview?.meetings || [];

    const recentPrimary: RecentOrderItem[] =
      recentPrimaryData?.data?.orders ||
      recentPrimaryData?.data?.bookings ||
      recentPrimaryData?.orders ||
      recentPrimaryData?.bookings ||
      [];
    const inventoryAlerts =
      inventoryAlertsData?.data || inventoryAlertsData || null;
    const customerInsights =
      customerInsightsData?.data || customerInsightsData || null;

    const hasInventory = Boolean(config?.features?.inventory);

    const inventoryRailMode = variant.rightRail?.inventoryAlerts;
    const inventoryCriticalLow = Number(
      variant.rightRail?.inventoryCriticalLowCount || 1,
    );
    const inventoryIsCritical =
      inventoryRailMode === "always"
        ? true
        : inventoryRailMode === "hidden"
          ? false
          : Boolean(
              inventoryAlerts &&
              (Number(inventoryAlerts.outOfStockCount || 0) > 0 ||
                Number(inventoryAlerts.lowCount || 0) >= inventoryCriticalLow),
            );

    const customerInsightsMode = variant.rightRail?.customerInsights || "full";
    const showCustomerInsights = customerInsightsMode !== "hidden";
    const showInvoiceOverview =
      variant?.capabilities?.hasInvoiceOverview !== false;

    const ino = industryOverviewData?.data || null;
    const inoDef = ino?.definition || null;
    const inoHealth = ino?.primaryObjectHealth || {};
    const inoLiveOps = ino?.liveOperations || {};
    const inoAlerts = ino?.alerts || [];
    const inoActions = ino?.suggestedActions || [];

    const nativeTitle = inoDef?.title || "Store Dashboard";
    const nativeSubtitle = inoDef?.subtitle || "Manage and track your store";

    // Build live ops items from definition fields
    const liveOpsItems: LiveOpsItem[] = (() => {
      if (!isIndustryNative || !inoDef) return [];
      const fieldMap: Record<
        string,
        { value: string | number | undefined | null; icon: string; emptyText: string }
      > = {
        pendingFulfillment: {
          value: inoLiveOps.pendingFulfillment,
          icon: "Package",
          emptyText: "All fulfilled",
        },
        delayedShipments: {
          value: inoLiveOps.delayedShipments,
          icon: "Clock",
          emptyText: "No delays",
        },
        returnsInitiated: {
          value: inoLiveOps.returnsInitiated,
          icon: "RotateCcw",
          emptyText: "No returns",
        },
        ordersInQueue: {
          value: inoLiveOps.ordersInQueue,
          icon: "ClipboardList",
          emptyText: "Queue clear",
        },
        avgPrepTime: {
          value: inoLiveOps.avgPrepTime,
          icon: "Timer",
          emptyText: "—",
        },
        kitchenBacklog: {
          value: inoLiveOps.kitchenBacklog,
          icon: "AlertTriangle",
          emptyText: "No backlog",
        },
        todaysBookings: {
          value: inoLiveOps.todaysBookings,
          icon: "Calendar",
          emptyText: "No bookings today",
        },
        cancellationsToday: {
          value: inoLiveOps.cancellationsToday,
          icon: "XCircle",
          emptyText: "No cancellations",
        },
        noShowsToday: {
          value: inoLiveOps.noShowsToday,
          icon: "UserX",
          emptyText: "No no-shows",
        },
        pendingQuotesCount: {
          value: inoLiveOps.pendingQuotesCount,
          icon: "FileText",
          emptyText: "No pending quotes",
        },
        overdueInvoices: {
          value: inoLiveOps.overdueInvoices,
          icon: "AlertTriangle",
          emptyText: "None overdue",
        },
        checkedInToday: {
          value: inoLiveOps.checkedInToday,
          icon: "UserCheck",
          emptyText: "No check-ins yet",
        },
        ticketsRemaining: {
          value: inoLiveOps.ticketsRemaining,
          icon: "Ticket",
          emptyText: "Sold out",
        },
        ticketsSoldToday: {
          value: inoLiveOps.ticketsSoldToday,
          icon: "Ticket",
          emptyText: "No sales yet",
        },
        activeListings: {
          value: inoLiveOps.activeListings,
          icon: "Car",
          emptyText: "No listings",
        },
        checkoutsToday: {
          value: inoLiveOps.checkoutsToday,
          icon: "LogOut",
          emptyText: "No check-outs",
        },
        salesToday: {
          value: inoLiveOps.salesToday,
          icon: "ShoppingBag",
          emptyText: "No sales yet",
        },
        activeAssets: {
          value: inoLiveOps.activeAssets,
          icon: "FileText",
          emptyText: "No assets",
        },
        donationsToday: {
          value: inoLiveOps.donationsToday,
          icon: "Heart",
          emptyText: "No donations yet",
        },
        newDonors: {
          value: inoLiveOps.newDonors,
          icon: "UserPlus",
          emptyText: "No new donors",
        },
        activeCampaigns: {
          value: inoLiveOps.activeCampaigns,
          icon: "Flag",
          emptyText: "No campaigns",
        },
        activeLearners: {
          value: inoLiveOps.activeLearners,
          icon: "Users",
          emptyText: "No active learners",
        },
        postsThisWeek: {
          value: inoLiveOps.postsThisWeek,
          icon: "FileText",
          emptyText: "No posts yet",
        },
        subscriberCount: {
          value: inoLiveOps.subscriberCount,
          icon: "Users",
          emptyText: "No subscribers",
        },
        activeProjects: {
          value: inoLiveOps.activeProjects,
          icon: "Palette",
          emptyText: "No projects",
        },
        pendingInquiries: {
          value: inoLiveOps.pendingInquiries,
          icon: "MessageSquare",
          emptyText: "No inquiries",
        },
        disputesOpen: {
          value: inoLiveOps.disputesOpen,
          icon: "ShieldAlert",
          emptyText: "No disputes",
        },
      };
      const industryKey = inoDef?.sections?.includes("live_operations")
        ? industrySlugForFetch
        : null;
      if (!industryKey) return [];
      const keysByIndustry: Record<string, string[]> = {
        retail: ["pendingFulfillment", "delayedShipments", "returnsInitiated"],
        fashion: ["pendingFulfillment", "delayedShipments", "returnsInitiated"],
        electronics: [
          "pendingFulfillment",
          "delayedShipments",
          "returnsInitiated",
        ],
        beauty: ["pendingFulfillment", "delayedShipments", "returnsInitiated"],
        grocery: ["pendingFulfillment", "delayedShipments", "returnsInitiated"],
        one_product: [
          "pendingFulfillment",
          "delayedShipments",
          "returnsInitiated",
        ],
        food: ["ordersInQueue", "avgPrepTime", "kitchenBacklog"],
        services: ["todaysBookings", "cancellationsToday", "noShowsToday"],
        b2b: ["pendingQuotesCount", "pendingFulfillment", "overdueInvoices"],
        events: ["checkedInToday", "ticketsRemaining", "pendingFulfillment"],
        nightlife: ["checkedInToday", "ticketsRemaining", "todaysBookings"],
        automotive: ["todaysBookings", "pendingFulfillment", "activeListings"],
        travel_hospitality: [
          "todaysBookings",
          "cancellationsToday",
          "checkoutsToday",
        ],
        real_estate: ["todaysBookings", "cancellationsToday", "noShowsToday"],
        digital: ["salesToday", "activeAssets", "pendingFulfillment"],
        nonprofit: ["donationsToday", "newDonors", "activeCampaigns"],
        education: ["todaysBookings", "activeLearners", "cancellationsToday"],
        blog_media: ["postsThisWeek", "subscriberCount", "salesToday"],
        creative_portfolio: [
          "activeProjects",
          "pendingInquiries",
          "salesToday",
        ],
        marketplace: ["pendingFulfillment", "activeListings", "disputesOpen"],
      };
      const keys = keysByIndustry[industryKey] || [];
      return keys.map((k) => {
        const f = fieldMap[k];
        return {
          key: k,
          label: k
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (s: string) => s.toUpperCase()),
          value: f?.value ?? 0,
          icon: f?.icon || "Activity",
          emptyText: f?.emptyText || "",
        };
      });
    })();

    const currency = store?.currency || "NGN";

    // Use ProDashboardV2 for advanced/pro tier users
    if (dashboardPlanTier === "advanced") {
      return <ProDashboardV2 />;
    }

    return (
      <>
        {trialPrompt.show && (
          <UpgradePrompt
            daysRemaining={trialPrompt.daysRemaining}
            promptType={trialPrompt.type}
            stats={{
              orders: Number(metrics?.orders?.value || 0),
              revenue: Number(metrics?.revenue?.value || 0),
              customers: Number(metrics?.customers?.value || 0),
            }}
          />
        )}
        <DashboardV2Content
          nativeTitle={nativeTitle}
          nativeSubtitle={nativeSubtitle}
          ctaLabel={ctaLabel}
          ctaLink={ctaLink}
          baseIndustrySlug={baseIndustrySlug}
          activeView={activeView}
          onSwitchView={setActiveView}
          isIndustryNative={isIndustryNative}
          industryOverviewLoading={industryOverviewLoading}
          inoDef={inoDef}
          primaryObjectLabel={config?.primaryObject?.replace(/_/g, " ")}
          inoHealth={inoHealth}
          liveOpsItems={liveOpsItems}
          inoAlerts={inoAlerts}
          inoActions={inoActions}
          pipelineTitle={hasBookings ? "Bookings Overview" : "Orders Overview"}
          overviewLoading={overviewLoading}
          donutData={donutData}
          pipelineLegend={variant?.pipeline?.legend}
          incomeVsExpense={incomeVsExpense}
          incomeVsExpenseChart={variant?.incomeVsExpense?.chart}
          incomeVsExpenseDefinition={variant?.incomeVsExpense?.expenseDefinition}
          currency={currency}
          showInvoiceOverview={showInvoiceOverview}
          invoiceRows={selectedInvoiceRows}
          hasBookings={hasBookings}
          recentPrimaryLoading={recentPrimaryLoading}
          recentPrimary={recentPrimary}
          tasks={tasks}
          upcomingTitle={hasBookings ? "Upcoming" : "Recent Activity"}
          upcomingEmpty={
            hasBookings ? "No upcoming bookings." : "No recent activity."
          }
          meetings={meetings}
          activityLoading={activityLoading}
          activityData={activityData}
          hasInventory={hasInventory}
          inventoryIsCritical={inventoryIsCritical}
          inventoryLoading={inventoryLoading}
          inventoryAlerts={inventoryAlerts}
          showCustomerInsights={showCustomerInsights}
          customerInsightsLoading={customerInsightsLoading}
          customerInsights={customerInsights}
          metrics={metricsData?.metrics}
          theme={variant.theme}
        />
      </>
    );
  }

  // Legacy Dashboard
  return (
    <DashboardLegacyContent
      storeName={store?.name || "Your Store"}
      industryDisplayName={String(config.displayName || "")}
      industrySlug={industrySlug}
      ctaLabel={ctaLabel}
      ctaLink={ctaLink}
      currency={store?.currency || "NGN"}
      metricsLoading={metricsLoading}
      metrics={metrics}
      dashboardWidgets={
        (config.dashboardWidgets || []) as {
          id: string;
          title: string;
          type: string;
          w?: number;
          dataSource?: string;
        }[]
      }
      enabledExtensionIds={
        (merchant as unknown as { enabledExtensionIds?: string[] })
          .enabledExtensionIds || []
      }
    />
  );
}
