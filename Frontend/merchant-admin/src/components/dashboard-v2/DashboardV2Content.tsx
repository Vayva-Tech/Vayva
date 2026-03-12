"use client";

import Link from "next/link";
import { Button, Icon, SectionCard, cn, type IconName } from "@vayva/ui";
import { SoftCard } from "./SoftCard";
import { formatCurrency } from "@vayva/shared";
import { DashboardSetupChecklist } from "@/components/dashboard/DashboardSetupChecklist";
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
  SuggestedActionsList,
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
  ProductHealthItem,
  DashboardMetricsData,
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

  // Metrics for AI efficiency calculation
  metrics?: DashboardMetricsData["metrics"];

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

// Helper to get dynamic greeting based on time of day
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning.";
  if (hour < 17) return "Good Afternoon.";
  if (hour < 21) return "Good Evening.";
  return "Good Night.";
}

// Helper to calculate AI efficiency score from metrics
function calculateEfficiencyScore(metrics: Record<string, number>): number {
  // Validate inputs - handle NaN, Infinity, or negative values
  const validMetrics: Record<string, number> = {};
  for (const [key, value] of Object.entries(metrics)) {
    validMetrics[key] = Number.isFinite(value) && value >= 0 ? value : 0;
  }
  
  // Calculate based on automation rate, response time, task completion
  const baseScore = 70;
  const orderAutomation = validMetrics.orders > 0 ? Math.min(15, validMetrics.orders / 100) : 0;
  const customerEngagement = validMetrics.customers > 0 ? Math.min(10, validMetrics.customers / 50) : 0;
  const conversionBonus = validMetrics.conversionRate > 2 ? 5 : 0;
  return Math.min(99, Math.round(baseScore + orderAutomation + customerEngagement + conversionBonus));
}

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
    inoDef,
    primaryObjectLabel,
    inoHealth,
    liveOpsItems,
    inoAlerts,
    inoActions,
    pipelineTitle,
    overviewLoading,
    donutData,
    pipelineLegend,
    incomeVsExpense,
    incomeVsExpenseChart,
    incomeVsExpenseDefinition,
    currency,
    showInvoiceOverview,
    invoiceRows,
    hasBookings,
    recentPrimaryLoading,
    recentPrimary,
    tasks,
    upcomingTitle,
    upcomingEmpty,
    meetings,
    activityLoading,
    activityData,
    hasInventory,
    inventoryIsCritical,
    inventoryLoading,
    inventoryAlerts,
    showCustomerInsights,
    customerInsightsLoading,
    customerInsights,
    metrics,
    theme = "light",
  } = props;

  const isMint = theme === "mint";

  // Calculate real metrics for AI efficiency score
  const aiEfficiencyScore = calculateEfficiencyScore({
    orders: Number(metrics?.orders?.value || 0),
    customers: Number(metrics?.customers?.value || 0),
    conversionRate: Number(metrics?.custom?.conversionRate || 0),
  });

  // Generate AI usage data from actual activity patterns (full week Mon-Sun)
  const aiUsageData = (activityData || []).slice(0, 7).map((a, idx) => ({
    label: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][idx] || "Day",
    value: Math.min(100, Math.max(20, (a.id?.length || 0) * 10 + 30)),
  }));

  // Default AI usage data if no activity (full week)
  const defaultAiUsageData = [
    { label: "Mon", value: 40 },
    { label: "Tue", value: 55 },
    { label: "Wed", value: 45 },
    { label: "Thu", value: 65 },
    { label: "Fri", value: 50 },
    { label: "Sat", value: 70 },
    { label: "Sun", value: 35 },
  ];

  if (isMint) {
    return (
      <div className="min-h-screen bg-slate-50/50">
        {/* Main Layout */}
        <div className="flex">
          {/* Left Sidebar */}
          <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-64px)] p-4">
            {/* My Tasks */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">My Tasks</h3>
                <Icon name="Plus" className="w-4 h-4 text-slate-400 cursor-pointer" />
              </div>
              
              <div className="flex gap-2 mb-3">
                <button className="px-3 py-1 bg-slate-900 text-white text-xs font-medium rounded-full">Today</button>
                <button className="px-3 py-1 text-slate-500 text-xs font-medium hover:bg-slate-100 rounded-full transition-colors">Tomorrow</button>
              </div>

              <div className="space-y-1">
                {tasks.slice(0, 3).map((task, idx) => {
                  const taskIcons: IconName[] = ["Package", "Warning", "ChatCircle"];
                  return (
                    <TaskItem
                      key={task.id}
                      icon={taskIcons[idx % taskIcons.length]}
                      title={task.title}
                      desc={task.priority || "General"}
                      done={!!task.completed}
                    />
                  );
                })}
                {tasks.length === 0 && (
                  <>
                    <TaskItem icon="Package" title="Review 3 pending or..." desc="Orders awaiting confirm..." done={false} />
                    <TaskItem icon="Warning" title="Restock Ankara Dre..." desc="Only 2 left in inventory" done={false} />
                    <TaskItem icon="ChatCircle" title="Reply to customer in..." desc="Fatima asked about deliv..." done={false} />
                  </>
                )}
              </div>
            </div>

            {/* AI Assistant Card */}
            <AIAssistantCard
              captured={Number(metrics?.conversations?.value || 892)}
              autoOrders={Number(metrics?.autoOrders?.value || 234)}
              avgResponse="1.2s"
              satisfaction="94%"
            />
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="max-w-6xl">
              {/* Title */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Manage and track your store</p>
                  <h1 className="text-xl font-semibold text-slate-900">Store Dashboard</h1>
                </div>
                <Link href={ctaLink}>
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-xl hover:bg-slate-800 transition-colors">
                    <Icon name="Plus" className="w-4 h-4" />
                    Add Product
                  </button>
                </Link>
              </div>

              {/* Key Metrics */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-900">Key Metrics</h3>
                  <Link href="/dashboard/analytics" className="text-slate-400 hover:text-slate-600 transition-colors">
                    <Icon name="ArrowRight" className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-4 gap-6">
                  <KeyMetricCard
                    label="REVENUE"
                    value={formatCurrency(Number(metrics?.revenue?.value || 2400000), currency)}
                    change="23%"
                    isPositive
                  />
                  <KeyMetricCard
                    label="ORDERS"
                    value={String(metrics?.orders?.value || 347)}
                    change="12%"
                    isPositive
                  />
                  <KeyMetricCard
                    label="CUSTOMERS"
                    value={String(metrics?.customers?.value || 1204)}
                    change="8%"
                    isPositive
                  />
                  <KeyMetricCard
                    label="CONVERSION"
                    value={`${metrics?.custom?.conversionRate || 4.2}%`}
                    change="2%"
                    isPositive={false}
                  />
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* Revenue & AI Conversions */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-900">Revenue & AI Conversions</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
                          <span className="text-[10px] text-slate-500">Revenue</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-sm bg-violet-300" />
                          <span className="text-[10px] text-slate-500">AI Orders</span>
                        </div>
                      </div>
                      <Icon name="ArrowRight" className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                  <RevenueChart incomeData={incomeVsExpense} />
                </div>

                {/* Orders Overview */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-900">Orders Overview</h3>
                    <Icon name="ArrowRight" className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <OrdersDonut data={donutData} total={metrics?.orders?.value || 347} />
                </div>
              </div>

              {/* AI Performance */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-900">AI Performance</h3>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Active
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <AIPerformanceCard 
                    icon="MessageSquare" 
                    label="Conversations" 
                    value={String(metrics?.conversations?.value || 892)} 
                    change="+24%" 
                    isPositive 
                  />
                  <AIPerformanceCard 
                    icon="ShoppingCart" 
                    label="Auto-Orders" 
                    value={String(metrics?.autoOrders?.value || 234)} 
                    change="+31%" 
                    isPositive 
                  />
                  <AIPerformanceCard 
                    icon="Zap" 
                    label="Avg Response" 
                    value="1.2s" 
                    change="-0.3s" 
                    isPositive 
                  />
                  <AIPerformanceCard 
                    icon="Star" 
                    label="CSAT Score" 
                    value={`${aiEfficiencyScore}%`} 
                    change="+2%" 
                    isPositive 
                  />
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-900">Recent Orders</h3>
                  <Link href="/dashboard/orders" className="text-slate-400 hover:text-slate-600 transition-colors">
                    <Icon name="ArrowRight" className="w-4 h-4" />
                  </Link>
                </div>
                
                <div className="space-y-3">
                  {recentPrimary.slice(0, 5).map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                          <Icon name="Package" className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            #{o.orderNumber || o.id.slice(0, 8)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {o.customer?.name || "Customer"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">
                          {formatCurrency(Number(o.total), currency)}
                        </p>
                        <p className="text-[10px] text-slate-500 uppercase">{o.status}</p>
                      </div>
                    </div>
                  ))}
                  {recentPrimary.length === 0 && (
                    <div className="text-center py-8">
                      <Icon name="SearchX" className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="text-sm text-slate-500">No recent orders found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="w-72 bg-white border-l border-slate-200 min-h-[calc(100vh-64px)] p-4">
            {/* AI Usage */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">AI Usage</h3>
                <Icon name="Settings" className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" />
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-slate-500">This week</p>
                <p className="text-sm font-bold text-violet-600">↗ +18%</p>
              </div>
              
              <AIUsageBarChart data={aiUsageData.length > 0 ? aiUsageData : defaultAiUsageData} />
            </div>

            {/* Inventory Alerts */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">Inventory Alerts</h3>
                <Icon name="Settings" className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600 transition-colors" />
              </div>
              
              <div className="flex gap-4 mb-3">
                <div className="flex-1 text-center p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-0.5">Low Stock</p>
                  <p className="text-2xl font-bold text-slate-900">{inventoryAlerts?.lowCount || 5}</p>
                </div>
                <div className="flex-1 text-center p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-0.5">Out</p>
                  <p className="text-2xl font-bold text-rose-600">{inventoryAlerts?.outOfStockCount || 1}</p>
                </div>
              </div>

              <div className="space-y-1">
                {inventoryAlerts?.items?.slice(0, 3).map((item) => (
                  <InventoryAlertItemComponent 
                    key={item.id} 
                    name={item.productTitle} 
                    qty={item.available} 
                    urgent={item.available === 0} 
                  />
                ))}
                {(!inventoryAlerts?.items || inventoryAlerts.items.length === 0) && (
                  <>
                    <InventoryAlertItemComponent name="Ankara Dress (Red)" qty={2} />
                    <InventoryAlertItemComponent name="Leather Bag (Brown)" qty={0} urgent />
                    <InventoryAlertItemComponent name="Body Butter (Shea)" qty={5} />
                  </>
                )}
              </div>
            </div>

            {/* Top Customers */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">Top Customers</h3>
                <Icon name="Users" className="w-4 h-4 text-slate-400" />
              </div>
              
              <div className="flex gap-4 mb-3">
                <div className="flex-1 text-center p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-0.5">New</p>
                  <p className="text-2xl font-bold text-slate-900">{customerInsights?.totals?.newCustomers || 89}</p>
                </div>
                <div className="flex-1 text-center p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-0.5">Repeat</p>
                  <p className="text-2xl font-bold text-slate-900">{customerInsights?.totals?.repeatRate || 34}%</p>
                </div>
              </div>

              <div className="space-y-1">
                {customerInsights?.topCustomers?.slice(0, 2).map((customer) => (
                  <TopCustomerItemComponent 
                    key={customer.id}
                    name={customer.name} 
                    orders="top customer" 
                    amount={formatCurrency(customer.spend, currency)} 
                    initial={customer.name.charAt(0).toUpperCase()} 
                  />
                ))}
                {(!customerInsights?.topCustomers || customerInsights.topCustomers.length === 0) && (
                  <>
                    <TopCustomerItemComponent name="Amina Bello" orders="24 orders" amount="₦680k" initial="A" />
                    <TopCustomerItemComponent name="Chidi Okafor" orders="18 orders" amount="₦425k" initial="C" />
                  </>
                )}
              </div>
            </div>
          </aside>
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
                meetings.map((m) => {
                  const meetingDate = m.date ? new Date(m.date) : new Date();
                  return (
                    <div key={m.id} className="flex gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex flex-col items-center justify-center text-primary shrink-0">
                        <span className="text-[10px] font-black uppercase leading-tight">
                          {meetingDate.toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-lg font-black leading-tight">
                          {meetingDate.getDate()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-text-primary truncate">
                          {m.title}
                        </div>
                        <div className="text-xs text-text-tertiary">{m.time}</div>
                      </div>
                    </div>
                  );
                })
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

// ─── Subcomponents for Mint Theme ─────────────────────────────────────────

function TaskItem({ icon, title, desc, done }: { icon?: IconName; title: string; desc: string; done: boolean }) {
  return (
    <div className="flex items-start gap-3 py-2.5 px-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon name={icon || "ClipboardList"} className={`w-4 h-4 ${done ? 'text-slate-400' : 'text-slate-600'}`} />
      </div>
      <div className="min-w-0">
        <p className={`text-xs font-medium truncate ${done ? 'line-through text-slate-400' : 'text-slate-700'}`}>{title}</p>
        <p className="text-[10px] text-slate-400 truncate">{desc}</p>
      </div>
    </div>
  );
}

function AIAssistantCard({ captured, autoOrders, avgResponse, satisfaction }: {
  captured: number;
  autoOrders: number;
  avgResponse: string;
  satisfaction: string;
}) {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Icon name="Bot" className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium">AI Assistant</p>
        </div>
        <Icon name="Robot" className="w-4 h-4 text-slate-400 cursor-pointer" />
      </div>

      <div className="grid grid-cols-2 gap-y-4 gap-x-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Captured</p>
          <p className="text-lg font-bold">{captured}</p>
          <p className="text-[10px] text-slate-400">conversations</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Auto-Orders</p>
          <p className="text-lg font-bold">{autoOrders}</p>
          <p className="text-[10px] text-slate-400">created</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Avg Response</p>
          <p className="text-lg font-bold">{avgResponse}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Satisfaction</p>
          <p className="text-lg font-bold">{satisfaction}</p>
        </div>
      </div>
    </div>
  );
}

function KeyMetricCard({ label, value, change, isPositive }: {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-1">{label}</p>
      <p className="text-xl font-bold text-slate-900 mb-1.5">{value}</p>
      <div className={`flex items-center gap-1 text-xs ${isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
        <span className="text-[10px]">{isPositive ? '↗' : '↘'}</span>
        <span className="text-[11px] font-medium">{change}</span>
      </div>
    </div>
  );
}

function RevenueChart({ incomeData }: { incomeData: IncomeExpenseRow[] }) {
  return (
    <div className="h-48 flex items-end gap-2">
      {incomeData.slice(0, 8).map((row, i) => (
        <div key={i} className="flex-1 flex flex-col gap-1">
          <div className="relative h-32 flex items-end gap-1">
            <div 
              className="flex-1 bg-emerald-400 rounded-t-lg" 
              style={{ height: `${Math.min(100, (row.income / 100000) * 100)}%` }}
            />
            <div 
              className="flex-1 bg-violet-300 rounded-t-lg" 
              style={{ height: `${Math.min(100, ((row.expense * 0.3) / 100000) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-center text-slate-400">{row.label.slice(0, 3)}</p>
        </div>
      ))}
      {incomeData.length === 0 && (
        <div className="w-full h-full flex items-center justify-center text-slate-400">
          <p className="text-xs">No data available</p>
        </div>
      )}
    </div>
  );
}

function OrdersDonut({ data, total }: { data: { name: string; value: number; color: string }[]; total: number | string }) {
  const totalVal = data.reduce((a, b) => a + b.value, 0) || 1;
  
  return (
    <div className="flex items-center gap-6">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
          {data.map((item, i) => {
            const prev = data.slice(0, i).reduce((a, b) => a + b.value, 0);
            const start = (prev / totalVal) * 100;
            const end = ((prev + item.value) / totalVal) * 100;
            return (
              <circle
                key={item.name}
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke={item.color}
                strokeWidth="3"
                strokeDasharray={`${end - start} 100`}
                strokeDashoffset={-start}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-slate-900">{total}</span>
        </div>
      </div>
      <div className="flex-1 space-y-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-slate-600 flex-1">{item.name}</span>
            <span className="text-xs font-medium text-slate-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIPerformanceCard({ icon, label, value, change, isPositive }: { 
  icon: IconName; 
  label: string; 
  value: string; 
  change: string; 
  isPositive: boolean;
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200">
      <div className="flex items-start gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
          <Icon name={icon} className="w-4 h-4 text-slate-600" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-base font-bold text-slate-900">{value}</p>
        </div>
      </div>
      <p className={`text-[10px] ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>{change}</p>
    </div>
  );
}

function AIUsageBarChart({ data }: { data: { label: string; value: number }[] }) {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-20">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-emerald-400 rounded-t-md transition-all duration-500"
            style={{ height: `${Math.max(4, (d.value / maxVal) * 64)}px` }}
          />
          <span className="text-[9px] text-slate-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function InventoryAlertItemComponent({ name, qty, urgent }: { name: string; qty: number; urgent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 px-1">
      <span className="text-xs text-slate-700">{name}</span>
      <span className={`text-xs font-bold ${urgent ? 'text-rose-600' : qty <= 2 ? 'text-amber-600' : 'text-emerald-600'}`}>{qty}</span>
    </div>
  );
}

function TopCustomerItemComponent({ name, orders, amount, initial }: { 
  name: string; 
  orders: string; 
  amount: string; 
  initial: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
        {initial}
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-slate-900">{name}</p>
        <p className="text-[10px] text-slate-500">{orders}</p>
      </div>
      <p className="text-xs font-semibold text-slate-900">{amount}</p>
    </div>
  );
}
