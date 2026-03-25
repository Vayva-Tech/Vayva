"use client";

import Link from "next/link";
import { Button, Icon, SectionCard, type IconName } from "@vayva/ui";
import { SoftCard } from "./SoftCard";
import { formatCurrency } from "@vayva/shared";
import { KPIBlocks } from "./KPIBlocks";
import { QuickActions } from "./QuickActions";
import { DonutChart } from "./DonutChart";
import { IncomeExpenseChart } from "./IncomeExpenseChart";
import { InvoiceOverview } from "./InvoiceOverview";
import { CircleIconButton } from "./CircleIconButton";
import {
  PrimaryObjectHealth,
  LiveOperations,
  AlertsList,
  SuggestedActionsList
} from "./IndustryNativeSections";
import { DashboardSwitcher } from "./DashboardSwitcher";
import { AutopilotBanner } from "./AutopilotBanner";
import type {
  RecentOrderItem,
  OverviewMeeting,
  ActivityItem,
  InventoryAlertItem,
  TopCustomer,
  IncomeExpenseRow,
  InvoiceRow,
  TodoItem,
  IndustryOverviewDefinition,
  IndustryDashboardAlert,
  IndustrySuggestedAction,
  ProductHealthItem
} from "@/types/dashboard";
import type { IndustrySlug } from "@/lib/templates/types";
import type { DashboardThemeMode } from "@/config/dashboard-variants";

// ─── Live Ops Item ──────────────────────────────────────
export interface LiveOpsItem {
  key: string;
  label: string;
  value: number | string;
  icon: string;
  emptyText: string;
}

// ─── Props ──────────────────────────────────────────────
export interface DashboardV2ContentProps {
  // Header
  nativeTitle: string;
  nativeSubtitle: string;
  ctaLabel: string;
  ctaLink: string;
  baseIndustrySlug: IndustrySlug;
  activeView: string;
  onSwitchView: (view: string) => void;

  // Industry native
  isIndustryNative: boolean;
  industryOverviewLoading: boolean;
  inoDef: IndustryOverviewDefinition | null;
  primaryObjectLabel: string;
  inoHealth: {
    topSellingProducts?: ProductHealthItem[];
    lowStockProducts?: ProductHealthItem[];
    deadStockProducts?: ProductHealthItem[];
  };
  liveOpsItems: LiveOpsItem[];
  inoAlerts: IndustryDashboardAlert[];
  inoActions: IndustrySuggestedAction[];

  // Pipeline / Charts
  pipelineTitle: string;
  overviewLoading: boolean;
  donutData: { name: string; value: number; color: string }[];
  pipelineLegend: "inline" | "stacked_right";
  incomeVsExpense: IncomeExpenseRow[];
  incomeVsExpenseChart: "line" | "area";
  incomeVsExpenseDefinition: string;
  currency: string;

  // Invoice
  showInvoiceOverview: boolean;
  invoiceRows: InvoiceRow[];

  // Recent primary
  hasBookings: boolean;
  recentPrimaryLoading: boolean;
  recentPrimary: RecentOrderItem[];

  // Right rail
  tasks: TodoItem[];
  upcomingTitle: string;
  upcomingEmpty: string;
  meetings: OverviewMeeting[];
  activityLoading: boolean;
  activityData: ActivityItem[] | undefined;

  // Inventory
  hasInventory: boolean;
  inventoryIsCritical: boolean;
  inventoryLoading: boolean;
  inventoryAlerts: {
    lowCount?: number;
    outOfStockCount?: number;
    items?: InventoryAlertItem[];
  } | null;

  // Customer insights
  showCustomerInsights: boolean;
  customerInsightsLoading: boolean;
  customerInsights: {
    totals?: { newCustomers: number; repeatRate: number };
    topCustomers?: TopCustomer[];
  } | null;
  theme?: DashboardThemeMode;
}

import { AIAssistantBlock } from "./AIAssistantBlock";
import { TaskBoard } from "./TaskBoard";
import { AIUsageChart } from "./AIUsageChart";

export function DashboardV2Content(props: DashboardV2ContentProps) {
  const {
    nativeTitle,
    nativeSubtitle,
    ctaLabel,
    ctaLink,
    baseIndustrySlug,
    activeView,
    onSwitchView,
    isIndustryNative,
    industryOverviewLoading,
    primaryObjectLabel,
    inoHealth,
    liveOpsItems,
    inoAlerts,
    inoActions,
    pipelineTitle,
    donutData,
    pipelineLegend,
    incomeVsExpense,
    incomeVsExpenseChart,
    incomeVsExpenseDefinition,
    currency,
    showInvoiceOverview,
    invoiceRows,
    recentPrimary,
    upcomingTitle,
    upcomingEmpty,
    meetings,
    activityData,
    theme = "light",
  } = props;

  const isMint = theme === "mint";

  if (isMint) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Rail: AI & Tasks */}
        <div className="lg:col-span-3 space-y-6 flex flex-col">
          <AIAssistantBlock conversations={12} conversions={4} />
          <TaskBoard
            tasks={[
              {
                id: "1",
                title: "Review new orders",
                category: "Sales",
                status: "pending",
              },
              {
                id: "2",
                title: "Update inventory for Shirts",
                category: "Catalog",
                status: "completed",
              },
              {
                id: "3",
                title: "Schedule pickup for #1092",
                category: "Shipping",
                status: "pending",
              },
            ]}
          />
        </div>

        {/* Main Pillar: Content */}
        <div className="lg:col-span-6 space-y-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-black text-text-primary tracking-tight">
              Good Morning.
            </h1>
            <p className="text-text-secondary font-medium">
              Here's what's happening today.
            </p>
          </div>

          <KPIBlocks />

          <SoftCard
            title="Sales Pipeline"
            rightSlot={
              <CircleIconButton
                icon={"ArrowUpRight" as IconName}
                label="Open"
              />
            }
          >
            <DonutChart data={donutData} legendStyle="inline" />
          </SoftCard>

          <SoftCard
            title="Recent Orders"
            rightSlot={
              <CircleIconButton
                icon={"ArrowUpRight" as IconName}
                label="Open"
              />
            }
          >
            <div className="space-y-3">
              {recentPrimary.slice(0, 5).map((o) => (
                <div
                  key={o.id}
                  className="p-3 bg-background/40 border border-border/40 rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-text-primary">
                      #{o.orderNumber || o.id.slice(0, 8)}
                    </div>
                    <div className="text-[10px] text-text-tertiary">
                      {o.customer?.name || "Customer"}
                    </div>
                  </div>
                  <div className="text-xs font-black text-text-primary">
                    {formatCurrency(Number(o.total), currency)}
                  </div>
                </div>
              ))}
              {recentPrimary.length === 0 && (
                <div className="text-center py-4 text-xs text-text-tertiary">
                  No recent orders
                </div>
              )}
            </div>
          </SoftCard>
        </div>

        {/* Right Rail: Usage & Activity */}
        <div className="lg:col-span-3 space-y-6">
          <SoftCard title="AI Usage">
            <div className="text-center mb-4">
              <div className="text-3xl font-black text-emerald-600">84%</div>
              <div className="text-[10px] uppercase font-bold text-text-tertiary">
                Efficiency Score
              </div>
            </div>
            <AIUsageChart
              data={[
                { label: "Mon", value: 40 },
                { label: "Tue", value: 65 },
                { label: "Wed", value: 45 },
                { label: "Thu", value: 90 },
                { label: "Fri", value: 75 },
              ]}
            />
          </SoftCard>

          <QuickActions />

          <SoftCard title="Recent Activity">
            <div className="space-y-4">
              {(activityData || []).slice(0, 4).map((a) => (
                <div key={a.id} className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-text-primary line-clamp-1">
                      {a.type}
                    </div>
                    <div className="text-[10px] text-text-tertiary">
                      {a.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SoftCard>
        </div>
      </div>
    );
  }

  // Standard Dashboard Layout (Balanced 2-column)
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            {nativeTitle}
          </h1>
          <p className="text-text-secondary font-medium">{nativeSubtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <DashboardSwitcher
            baseIndustrySlug={baseIndustrySlug}
            activeView={activeView}
            onSwitch={onSwitchView}
          />
          <Link href={ctaLink}>
            <Button className="rounded-2xl px-6">
              <Icon name="Plus" className="mr-2 h-4 w-4" />
              {ctaLabel}
            </Button>
          </Link>
        </div>
      </div>

      <AutopilotBanner />

      <KPIBlocks />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SectionCard title={pipelineTitle}>
              <DonutChart data={donutData} legendStyle={pipelineLegend} />
            </SectionCard>

            <SectionCard
              title="Performance"
              description={incomeVsExpenseDefinition}
            >
              <IncomeExpenseChart
                data={incomeVsExpense}
                chart={incomeVsExpenseChart}
                currency={currency}
              />
            </SectionCard>
          </div>

          {isIndustryNative && (
            <div className="grid grid-cols-1 gap-8">
              <PrimaryObjectHealth
                label={primaryObjectLabel}
                topSelling={inoHealth.topSellingProducts || []}
                lowStock={inoHealth.lowStockProducts || []}
                deadStock={inoHealth.deadStockProducts || []}
                isLoading={industryOverviewLoading}
              />
              <LiveOperations
                title="Live Operations"
                items={liveOpsItems}
                isLoading={industryOverviewLoading}
              />
            </div>
          )}

          {showInvoiceOverview && (
            <InvoiceOverview rows={invoiceRows} currency={currency} />
          )}

          <SectionCard title="Recent Orders">
            <div className="space-y-4">
              {recentPrimary.slice(0, 5).map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between p-4 bg-background/40 hover:bg-background/60 rounded-2xl border border-border/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Icon name="ShoppingBag" size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-text-primary">
                        #{o.orderNumber || o.id.slice(0, 8)}
                      </div>
                      <div className="text-xs text-text-tertiary">
                        {o.customer?.name || "New Customer"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-text-primary">
                      {formatCurrency(Number(o.total), currency)}
                    </div>
                    <div className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider">
                      {o.status}
                    </div>
                  </div>
                </div>
              ))}
              {recentPrimary.length === 0 && (
                <div className="text-center py-10">
                  <Icon
                    name="SearchX"
                    size={32}
                    className="mx-auto text-text-tertiary mb-3 opacity-20"
                  />
                  <p className="text-sm text-text-tertiary">
                    No recent orders found
                  </p>
                </div>
              )}
              <Button
                variant="ghost"
                className="w-full text-xs font-semibold py-6 text-text-tertiary hover:text-primary"
              >
                View All Orders{" "}
                <Icon name="ArrowRight" size={14} className="ml-2" />
              </Button>
            </div>
          </SectionCard>
        </div>

        {/* Right Rail */}
        <div className="lg:col-span-4 space-y-8">
          <QuickActions />

          <AlertsList alerts={inoAlerts} isLoading={industryOverviewLoading} />

          <SuggestedActionsList
            actions={inoActions}
            isLoading={industryOverviewLoading}
          />

          <SectionCard title="Calendar" description={upcomingTitle}>
            <div className="space-y-4">
              {meetings.length > 0 ? (
                meetings.map((m) => (
                  <div key={m.id} className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex flex-col items-center justify-center text-primary shrink-0">
                      <span className="text-[10px] font-black uppercase leading-tight">
                        Feb
                      </span>
                      <span className="text-lg font-black leading-tight">
                        12
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-text-primary truncate">
                        {m.title}
                      </div>
                      <div className="text-xs text-text-tertiary">{m.time}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-text-tertiary italic">
                    {upcomingEmpty}
                  </p>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Activity">
            <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-border/40">
              {(activityData || []).slice(0, 6).map((a) => (
                <div key={a.id} className="flex gap-4 relative">
                  <div className="w-4 h-4 rounded-full bg-background border-2 border-primary mt-1 shrink-0 z-10" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-text-primary">
                      {a.type}
                    </div>
                    <div className="text-[10px] text-text-tertiary">
                      {a.time}
                    </div>
                    {a.message && (
                      <p className="text-[10px] text-text-secondary mt-1 line-clamp-2">
                        {a.message}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
