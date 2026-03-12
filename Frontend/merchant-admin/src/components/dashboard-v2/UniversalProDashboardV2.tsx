"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { Button, Icon, Card } from "@vayva/ui";
import cn from "clsx";
import { formatCurrency } from "@vayva/shared";
import { apiJson } from "@/lib/api-client-shared";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import {
  CheckSquare,
  Bot,
  TrendingUp,
  ArrowUpRight,
  MoreHorizontal,
  Plus,
  MessageSquare,
  Users,
} from "lucide-react";
import type { IndustrySlug } from '@vayva/industry-core';
import {
  getIndustryConfig,
  getAdaptiveHeaderTitle,
  getAdaptiveHeaderSubtitle,
  getAdaptivePrimaryAction,
  getAdaptiveMetrics,
  getAdaptiveTasks,
  getAdaptiveAILabels,
  getAdaptiveChartTitles,
  getAdaptiveRightPanelSections
} from "@/lib/utils/industry-adaptation";

// ============================================================================
// Types
// ============================================================================
interface Task {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  completed?: boolean;
}

interface MetricCard {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

interface InventoryAlert {
  name: string;
  stock: number;
  status: "low" | "out";
}

interface Customer {
  name: string;
  orders: number;
  spent: string;
}

interface DashboardData {
  metrics: {
    revenue: { value: number; change: number; trend: "up" | "down"; history?: { date: string; value: number }[] };
    orders: { value: number; change: number; trend: "up" | "down" };
    customers: { value: number; change: number; trend: "up" | "down" };
    conversion: { value: number; change: number; trend: "up" | "down" };
  };
  tasks: Task[];
  inventoryAlerts: InventoryAlert[];
  topCustomers: Customer[];
  aiStats: {
    captured: number;
    autoOrders: number;
    avgResponse: string;
    satisfaction: number;
    usageHistory?: number[];
  };
  orderStatus: {
    delivered: number;
    processing: number;
    pending: number;
    cancelled: number;
  };
}

const fetcher = <T,>(url: string) => apiJson<T>(url);

// ============================================================================
// Design Category Adaptive Components
// ============================================================================
const DesignAdaptiveKeyMetricCard = ({ 
  metric,
  designCategory 
}: { 
  metric: MetricCard;
  designCategory: DesignCategory;
}) => (
  <Card className={cn(
    "p-5 hover:shadow-md transition-shadow duration-200",
    getMetricCardClasses(designCategory)
  )}>
    <p className="text-xs font-medium uppercase tracking-wider mb-2 opacity-70">
      {metric.label}
    </p>
    <p className="text-2xl font-bold mb-1">{metric.value}</p>
    <p className={cn(
      "text-xs font-medium",
      metric.trend === "up" ? "text-success" : "text-danger"
    )}>
      {metric.change}
    </p>
  </Card>
);

const DesignAdaptiveSectionHeader = ({ 
  title, 
  action,
  icon: IconComponent,
  designCategory
}: { 
  title: string; 
  action?: React.ReactNode;
  icon?: React.ElementType;
  designCategory: DesignCategory;
}) => (
  <div className={cn(
    "flex items-center justify-between mb-4 p-4 -m-4 rounded-t-2xl",
    getSectionHeaderClasses(designCategory)
  )}>
    <div className="flex items-center gap-2">
      {IconComponent && <IconComponent size={18} className="opacity-70" />}
      <h3 className={cn("font-semibold", getSectionTitleClasses(designCategory))}>
        {title}
      </h3>
    </div>
    {action}
  </div>
);

const TaskItem = ({ task }: { task: Task }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-hover transition-colors cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2" tabIndex={0}>
    <div className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center shrink-0">
      {task.icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-text-primary truncate">{task.title}</p>
      <p className="text-xs text-text-secondary truncate">{task.subtitle}</p>
    </div>
  </div>
);

const SectionHeader = ({ 
  title, 
  action,
  icon: IconComponent 
}: { 
  title: string; 
  action?: React.ReactNode;
  icon?: React.ElementType;
}) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      {IconComponent && <IconComponent size={18} className="text-text-tertiary" />}
      <h3 className="font-semibold text-text-primary">{title}</h3>
    </div>
    {action}
  </div>
);

// ============================================================================
// Universal Pro Dashboard V2 - Industry Adaptive Version
// ============================================================================
interface UniversalProDashboardV2Props {
  industry: IndustrySlug;
  userId?: string;
  businessId?: string;
  designCategory?: DesignCategory;
  planTier?: string;
  className?: string;
}

export function UniversalProDashboardV2({
  industry,
  userId,
  businessId,
  designCategory: propDesignCategory,
  planTier = 'pro',
  className = ''
}: UniversalProDashboardV2Props) {
  // Auto-determine design category based on industry if not provided
  const autoDesignCategory = getDesignCategoryForIndustry(industry);
  const designCategory = propDesignCategory || autoDesignCategory;
  const [activeTab, setActiveTab] = useState<"today" | "tomorrow">("today");
  const { merchant } = useAuth();
  const { store } = useStore();
  
  // Get industry-specific configuration
  const industryConfig = getIndustryConfig(industry);
  const headerTitle = getAdaptiveHeaderTitle(industry);
  const headerSubtitle = getAdaptiveHeaderSubtitle(industry);
  const primaryAction = getAdaptivePrimaryAction(industry);
  const [metric1, metric2, metric3, metric4] = getAdaptiveMetrics(industry);
  const chartTitles = getAdaptiveChartTitles(industry);
  const aiLabels = getAdaptiveAILabels(industry);
  const rightPanelSections = getAdaptiveRightPanelSections(industry);

  const { data: dashboardData, isLoading, error } = useSWR<{
    success: boolean;
    data: DashboardData;
  }>("/api/dashboard/pro-overview", fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: false,
    errorRetryCount: 2,
  });

  const data = dashboardData?.data;
  const currency = store?.currency || "NGN";
  const storeName = store?.name || merchant?.storeName || "Your Business";

  // Handle loading state
  if (isLoading) {
    return (
      <div className={`min-h-full p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mb-2"></div>
            <div className="h-6 w-48 bg-slate-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-slate-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-12 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Handle error state
  if (error || !dashboardData?.success) {
    return (
      <div className={`min-h-full p-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="text-red-600 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-1">Unable to load dashboard</h3>
          <p className="text-red-600 mb-4">We're having trouble loading your dashboard data. Please try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Generate adaptive metrics based on industry
  const metrics: MetricCard[] = data?.metrics ? [
    { 
      label: metric1, 
      value: formatCurrency(data.metrics.revenue.value, currency), 
      change: `${data.metrics.revenue.trend === "up" ? "↗" : "↘"} ${Math.abs(data.metrics.revenue.change)}%`, 
      trend: data.metrics.revenue.trend 
    },
    { 
      label: metric2, 
      value: String(data.metrics.orders.value), 
      change: `${data.metrics.orders.trend === "up" ? "↗" : "↘"} ${Math.abs(data.metrics.orders.change)}%`, 
      trend: data.metrics.orders.trend 
    },
    { 
      label: metric3, 
      value: String(data.metrics.customers.value), 
      change: `${data.metrics.customers.trend === "up" ? "↗" : "↘"} ${Math.abs(data.metrics.customers.change)}%`, 
      trend: data.metrics.customers.trend 
    },
    { 
      label: metric4, 
      value: `${data.metrics.conversion.value}%`, 
      change: `${data.metrics.conversion.trend === "up" ? "↗" : "↘"} ${Math.abs(data.metrics.conversion.change)}%`, 
      trend: data.metrics.conversion.trend 
    },
  ] : [];

  const tasks = data?.tasks || [];
  const inventoryAlerts = data?.inventoryAlerts || [];
  const topCustomers = data?.topCustomers || [];
  const aiStats = data?.aiStats || { captured: 0, autoOrders: 0, avgResponse: "0s", satisfaction: 0 };
  const orderStatus = data?.orderStatus || { delivered: 0, processing: 0, pending: 0, cancelled: 0 };
  const totalOrders = orderStatus.delivered + orderStatus.processing + orderStatus.pending + orderStatus.cancelled;

  return (
    <div className={`min-h-full ${className}`}>
      {/* Page Header - Industry Adaptive */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-text-secondary mb-1">{headerSubtitle}</p>
          <h2 className="text-xl font-bold text-text-primary">{headerTitle}</h2>
        </div>
        <Button className="rounded-xl gap-2 bg-primary hover:bg-primary-hover">
          <Plus size={18} />
          {primaryAction.label}
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - My Tasks & AI Assistant */}
        <div className="col-span-3 space-y-6">
          {/* My Tasks - Industry Adaptive */}
          <Card className={cn("p-5", getMetricCardClasses(designCategory))}>
            <DesignAdaptiveSectionHeader
              title="My Tasks"
              icon={CheckSquare}
              designCategory={designCategory}
              action={
                <button className="w-6 h-6 rounded-lg hover:bg-opacity-20 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Add task">
                  <Plus size={14} className="opacity-70" />
                </button>
              }
            />

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab("today")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
                  activeTab === "today"
                    ? "bg-primary text-primary-foreground"
                    : "text-text-secondary hover:bg-surface-hover"
                )}
                aria-selected={activeTab === "today"}
                role="tab"
              >
                Today
              </button>
              <button
                onClick={() => setActiveTab("tomorrow")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary",
                  activeTab === "tomorrow"
                    ? "bg-primary text-primary-foreground"
                    : "text-text-secondary hover:bg-surface-hover"
                )}
                aria-selected={activeTab === "tomorrow"}
                role="tab"
              >
                Tomorrow
              </button>
            </div>

            {/* Task List - Could be made more industry-specific */}
            <div className="space-y-1">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="h-16 bg-surface-subtle rounded-xl animate-pulse" />
                ))
              ) : tasks.length > 0 ? (
                tasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))
              ) : (
                <div className="text-center py-4 text-text-secondary text-sm" role="status">
                  No tasks for {activeTab}
                </div>
              )}
            </div>
          </Card>

          {/* AI Assistant - Industry Adaptive Labels */}
          <Card className="p-5 border-border">
            <SectionHeader
              title="AI Assistant"
              icon={Bot}
              action={
                <button className="w-6 h-6 rounded-lg hover:bg-surface-hover flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Configure AI">
                  <Icon name="Sparkles" size={14} className="text-primary" />
                </button>
              }
            />

            <div className="grid grid-cols-2 gap-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="bg-surface-subtle rounded-xl p-3 h-20 animate-pulse" />
                ))
              ) : (
                <>
                  <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                    <p className="text-xs text-primary mb-1">CAPTURED</p>
                    <p className="text-xl font-bold text-primary">{aiStats.captured}</p>
                    <p className="text-xs text-primary/70">{aiLabels.captured}</p>
                  </div>
                  <div className="bg-success/5 rounded-xl p-3 border border-success/10">
                    <p className="text-xs text-success mb-1">AUTO-ORDERS</p>
                    <p className="text-xl font-bold text-success">{aiStats.autoOrders}</p>
                    <p className="text-xs text-success/70">{aiLabels.autoOrders}</p>
                  </div>
                  <div className="bg-warning/5 rounded-xl p-3 border border-warning/10">
                    <p className="text-xs text-warning mb-1">{aiLabels.avgResponse}</p>
                    <p className="text-xl font-bold text-warning">{aiStats.avgResponse}</p>
                  </div>
                  <div className="bg-danger/5 rounded-xl p-3 border border-danger/10">
                    <p className="text-xs text-danger mb-1">{aiLabels.satisfaction}</p>
                    <p className="text-xl font-bold text-danger">{aiStats.satisfaction}%</p>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Center Column - Main Metrics & Charts */}
        <div className="col-span-6 space-y-6">
          {/* Key Metrics - Industry Adaptive */}
          <div className="grid grid-cols-4 gap-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <Card key={idx} className={cn("p-5 h-28 animate-pulse", getMetricCardClasses(designCategory))}> </Card>
              ))
            ) : metrics.length > 0 ? (
              metrics.map((metric, idx) => (
                <DesignAdaptiveKeyMetricCard key={idx} metric={metric} designCategory={designCategory} />
              ))
            ) : (
              <div className="col-span-4 text-center py-8 opacity-70" role="status">
                No metrics available
              </div>
            )}
          </div>

          {/* Revenue & AI Conversions Chart - Industry Adaptive Title */}
          <Card className={cn("p-5", getMetricCardClasses(designCategory))}>
            <DesignAdaptiveSectionHeader
              title={chartTitles.main}
              designCategory={designCategory}
              action={
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="opacity-70">{chartTitles.legend1}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    <span className="opacity-70">{chartTitles.legend2}</span>
                  </div>
                </div>
              }
            />
            {/* Chart implementation remains the same */}
            <div className="h-40 flex items-end gap-2">
              {data?.metrics?.revenue?.history ? (
                data.metrics.revenue.history.map((point: { date: string; value: number }, i: number) => {
                  const maxValue = Math.max(...(data.metrics.revenue.history?.map((p: { value: number }) => p.value) || []), 1);
                  const height1 = Math.min(100, (point.value / maxValue) * 80 + 20);
                  const height2 = Math.min(100, height1 * 0.6);
                  return (
                    <div key={i} className="flex-1 flex items-end gap-0.5">
                      <div 
                        className="flex-1 bg-primary/40 rounded-t transition-all duration-500 hover:opacity-80"
                        style={{ height: `${height1}%` }}
                        title={`Revenue: ${formatCurrency(point.value, currency)}`}
                      />
                      <div 
                        className="flex-1 bg-success/40 rounded-t transition-all duration-500 hover:opacity-80"
                        style={{ height: `${height2}%` }}
                      />
                    </div>
                  );
                })
              ) : (
                Array.from({ length: 14 }).map((_, i) => {
                  const sampleData = [45, 52, 38, 65, 48, 72, 55, 60, 45, 58, 42, 68, 50, 62];
                  const height1 = sampleData[i] || 40;
                  const height2 = height1 * 0.6;
                  return (
                    <div key={i} className="flex-1 flex items-end gap-0.5">
                      <div 
                        className="flex-1 bg-primary/20 rounded-t"
                        style={{ height: `${height1}%` }}
                      />
                      <div 
                        className="flex-1 bg-success/20 rounded-t"
                        style={{ height: `${height2}%` }}
                      />
                    </div>
                  );
                })
              )}
            </div>
            <div className="flex justify-between mt-2 text-xs text-text-tertiary">
              <span>J</span><span>F</span><span>M</span><span>A</span><span>M</span>
              <span>J</span><span>J</span><span>A</span><span>S</span><span>O</span>
              <span>N</span><span>D</span>
            </div>
          </Card>

          {/* Orders Overview - Remains consistent across industries */}
          <Card className={cn("p-5", getMetricCardClasses(designCategory))}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={cn("font-semibold", getSectionTitleClasses(designCategory))}>Orders Overview</h3>
              <button className="p-1 hover:bg-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" aria-label="View all orders">
                <ArrowUpRight size={16} className="opacity-70" />
              </button>
            </div>
            <div className="flex items-center gap-8">
              {/* Donut Chart */}
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E5E5" strokeWidth="12" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#10B981" strokeWidth="12" strokeDasharray="157 251" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#3B82F6" strokeWidth="12" strokeDasharray="63 251" strokeDashoffset="-157" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#F59E0B" strokeWidth="12" strokeDasharray="25 251" strokeDashoffset="-220" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-text-primary">{isLoading ? "—" : totalOrders}</span>
                </div>
              </div>
              {/* Legend */}
              <div className="space-y-3">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="h-6 bg-slate-100 rounded animate-pulse" />
                  ))
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-success" />
                      <span className="text-sm text-text-secondary">Delivered</span>
                      <span className="text-sm font-medium text-text-primary ml-auto">{orderStatus.delivered}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-info" />
                      <span className="text-sm text-text-secondary">Processing</span>
                      <span className="text-sm font-medium text-text-primary ml-auto">{orderStatus.processing}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-warning" />
                      <span className="text-sm text-text-secondary">Pending</span>
                      <span className="text-sm font-medium text-text-primary ml-auto">{orderStatus.pending}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-text-tertiary" />
                      <span className="text-sm text-text-secondary">Cancelled</span>
                      <span className="text-sm font-medium text-text-primary ml-auto">{orderStatus.cancelled}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - AI Performance & Customers */}
        <div className="col-span-3 space-y-6">
          {/* AI Performance - Remains consistent */}
          <Card className={cn("p-5", getMetricCardClasses(designCategory))}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className={cn("font-semibold", getSectionTitleClasses(designCategory))}>AI Performance</h3>
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full flex items-center gap-1">
                  <Icon name="Sparkles" size={12} />
                  Active
                </span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl h-24 animate-pulse" />
                  ))
                ) : (
                  <>
                    <div className="p-4 bg-surface-subtle rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare size={16} className="text-primary" />
                        <span className="text-xs text-text-secondary uppercase">Conversations</span>
                      </div>
                      <p className="text-2xl font-bold text-text-primary">{aiStats.captured}</p>
                      <p className="text-xs text-success">+24%</p>
                    </div>
                    <div className="p-4 bg-surface-subtle rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={16} className="text-success" />
                        <span className="text-xs text-text-secondary uppercase">Auto-orders</span>
                      </div>
                      <p className="text-2xl font-bold text-text-primary">{aiStats.autoOrders}</p>
                      <p className="text-xs text-success">+31%</p>
                    </div>
                    <div className="p-4 bg-surface-subtle rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name="Clock" size={16} className="text-warning" />
                        <span className="text-xs text-text-secondary uppercase">Avg Response</span>
                      </div>
                      <p className="text-2xl font-bold text-text-primary">{aiStats.avgResponse}</p>
                      <p className="text-xs text-success">-0.3s</p>
                    </div>
                    <div className="p-4 bg-surface-subtle rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name="BarChart" size={16} className="text-danger" />
                        <span className="text-xs text-text-secondary uppercase">CSAT Score</span>
                      </div>
                      <p className="text-2xl font-bold text-text-primary">{aiStats.satisfaction}%</p>
                      <p className="text-xs text-success">+2%</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Additional industry-specific panels would go here */}
          {/* For now, keeping the core structure similar but could be extended */}

        </div>
      </div>
    </div>
  );
}