"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import { Icon, cn, Button } from "@vayva/ui";
import { formatCurrency } from "@vayva/shared";
import { apiJson } from "@/lib/api-client-shared";
import { useAuth } from "@/context/AuthContext";
import { useStore } from "@/context/StoreContext";
import {
  CheckSquare,
  Bot,
  TrendingUp,
  MoreHorizontal,
  Plus,
  MessageSquare,
  Pencil,
  Maximize2,
  Filter,
  LayoutGrid,
  Inbox,
  Zap,
  CheckCircle,
  XCircle,
  Calendar,
  Flag,
  ShoppingBag,
  Package,
  Megaphone,
  Headphones,
  GanttChart,
} from "lucide-react";

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
// Sub-Components
// ============================================================================

const WidgetActions = () => (
  <div className="flex items-center gap-1">
    <Button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
      <Pencil size={14} className="text-gray-400" />
    </Button>
    <Button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
      <Maximize2 size={14} className="text-gray-400" />
    </Button>
    <Button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
      <MoreHorizontal size={14} className="text-gray-400" />
    </Button>
  </div>
);

const WidgetHeader = ({
  icon: IconComponent,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <IconComponent size={18} className="text-gray-500" />
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
    </div>
    <WidgetActions />
  </div>
);

const PriorityBadge = ({ priority }: { priority: "urgent" | "normal" | "low" }) => {
  const styles = {
    urgent: "bg-red-50 text-red-600",
    normal: "bg-orange-50 text-orange-600",
    low: "bg-green-50 text-green-600",
  };
  return (
    <span className={cn("flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded", styles[priority])}>
      <Flag size={10} />
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

const AvatarGroup = ({ count = 2, extra = 0 }: { count?: number; extra?: number }) => (
  <div className="flex -space-x-2">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className={cn(
          "w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600",
          i === 0 ? "bg-orange-200" : i === 1 ? "bg-blue-200" : "bg-green-200"
        )}
      />
    ))}
    {extra > 0 && (
      <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
        +{extra}
      </div>
    )}
  </div>
);

const KanbanCard = ({
  code,
  priority,
  title,
  tag,
  dueDate,
  avatars = 2,
  extraAvatars = 0,
  comments = 0,
  date,
}: {
  code: string;
  priority: "urgent" | "normal" | "low";
  title: string;
  tag: string;
  dueDate: string;
  avatars?: number;
  extraAvatars?: number;
  comments?: number;
  date: string;
}) => (
  <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
    {/* Top: ID + Priority */}
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-gray-400">{code}</span>
      <PriorityBadge priority={priority} />
    </div>
    {/* Title */}
    <h4 className="text-sm font-semibold text-gray-900 mb-1">{title}</h4>
    {/* Tag */}
    <p className="text-xs text-gray-500 mb-2">{tag}</p>
    {/* Due Date */}
    <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
      <Calendar size={12} />
      <span>Due to: {dueDate}</span>
    </div>
    {/* Footer */}
    <div className="flex items-center justify-between">
      <AvatarGroup count={avatars} extra={extraAvatars} />
      <div className="flex items-center gap-3 text-xs text-gray-400">
        {comments > 0 && (
          <span className="flex items-center gap-1">
            <MessageSquare size={12} /> {comments}
          </span>
        )}
        <span>{date}</span>
      </div>
    </div>
  </div>
);

// ============================================================================
// Timeline / Gantt View Component
// ============================================================================

function getWeekDays(): { label: string; short: string; date: Date; isToday: boolean }[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));

  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const isToday = d.toDateString() === now.toDateString();
    return {
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      short: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      date: d,
      isToday,
    };
  });
}

interface TimelineRow {
  category: string;
  icon: React.ElementType;
  bars: {
    label: string;
    startDay: number;
    spanDays: number;
    color: "green" | "yellow" | "red";
  }[];
}

const TimelineView = ({ data }: { data: DashboardData | undefined }) => {
  const weekDays = useMemo(() => getWeekDays(), []);

  const rows: TimelineRow[] = useMemo(() => {
    const orderStatus = data?.orderStatus || { delivered: 0, processing: 0, pending: 0, cancelled: 0 };
    const pendingCount = orderStatus.pending;
    const processingCount = orderStatus.processing;
    const cancelledCount = orderStatus.cancelled;

    return [
      {
        category: "Orders",
        icon: ShoppingBag,
        bars: [
          {
            label: `${processingCount} processing`,
            startDay: 0,
            spanDays: 4,
            color: "green" as const,
          },
          {
            label: `${pendingCount} pending`,
            startDay: 4,
            spanDays: 3,
            color: pendingCount > 5 ? ("yellow" as const) : ("green" as const),
          },
        ],
      },
      {
        category: "Fulfillment",
        icon: Package,
        bars: [
          {
            label: `${orderStatus.delivered} delivered`,
            startDay: 0,
            spanDays: 5,
            color: "green" as const,
          },
          ...(cancelledCount > 0
            ? [
                {
                  label: `${cancelledCount} cancelled`,
                  startDay: 5,
                  spanDays: 2,
                  color: "red" as const,
                },
              ]
            : []),
        ],
      },
      {
        category: "Marketing",
        icon: Megaphone,
        bars: [
          {
            label: `Conv. ${data?.metrics?.conversion?.value ?? 0}%`,
            startDay: 1,
            spanDays: 5,
            color:
              (data?.metrics?.conversion?.value ?? 0) >= 3
                ? ("green" as const)
                : ("yellow" as const),
          },
        ],
      },
      {
        category: "AI Agent",
        icon: Bot,
        bars: [
          {
            label: `${data?.aiStats?.captured ?? 0} captured`,
            startDay: 0,
            spanDays: 7,
            color: "green" as const,
          },
          {
            label: `${data?.aiStats?.satisfaction ?? 0}% satisfaction`,
            startDay: 2,
            spanDays: 3,
            color:
              (data?.aiStats?.satisfaction ?? 0) >= 80
                ? ("green" as const)
                : (data?.aiStats?.satisfaction ?? 0) >= 60
                  ? ("yellow" as const)
                  : ("red" as const),
          },
        ],
      },
      {
        category: "Support",
        icon: Headphones,
        bars: [
          {
            label: `Avg ${data?.aiStats?.avgResponse ?? "—"}`,
            startDay: 0,
            spanDays: 6,
            color: "green" as const,
          },
          ...(data?.inventoryAlerts && data.inventoryAlerts.length > 0
            ? [
                {
                  label: `${data.inventoryAlerts.length} stock alerts`,
                  startDay: 3,
                  spanDays: 4,
                  color: data.inventoryAlerts.some((a) => a.status === "out")
                    ? ("red" as const)
                    : ("yellow" as const),
                },
              ]
            : []),
        ],
      },
    ];
  }, [data]);

  const barColors = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <GanttChart size={18} className="text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900">Weekly Timeline</h3>
          <span className="text-xs text-gray-400 ml-1">Current week activity overview</span>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Day Headers */}
          <div className="grid grid-cols-[180px_repeat(7,1fr)] border-b border-gray-100">
            <div className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
              Category
            </div>
            {weekDays.map((day, i) => (
              <div
                key={i}
                className={cn(
                  "px-2 py-3 text-center",
                  day.isToday && "bg-green-50"
                )}
              >
                <p
                  className={cn(
                    "text-xs font-medium",
                    day.isToday ? "text-green-600" : "text-gray-500"
                  )}
                >
                  {day.label}
                </p>
                <p
                  className={cn(
                    "text-xs mt-0.5",
                    day.isToday ? "text-green-500" : "text-gray-400"
                  )}
                >
                  {day.short}
                </p>
              </div>
            ))}
          </div>

          {/* Rows */}
          {rows.map((row, rowIdx) => {
            const RowIcon = row.icon;
            return (
              <div
                key={row.category}
                className={cn(
                  "grid grid-cols-[180px_repeat(7,1fr)] border-b border-gray-50",
                  rowIdx % 2 === 1 && "bg-gray-50"
                )}
              >
                {/* Category label */}
                <div className="px-6 py-4 flex items-center gap-2">
                  <RowIcon size={16} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {row.category}
                  </span>
                </div>

                {/* Bar cells */}
                <div className="col-span-7 relative py-3 px-1">
                  {row.bars.map((bar, barIdx) => {
                    const leftPercent = (bar.startDay / 7) * 100;
                    const widthPercent = (bar.spanDays / 7) * 100;
                    const topOffset = barIdx * 28;

                    return (
                      <div
                        key={barIdx}
                        className={cn(
                          "absolute h-6 rounded-full flex items-center px-3 text-white text-xs font-medium whitespace-nowrap overflow-hidden",
                          barColors[bar.color]
                        )}
                        style={{
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                          top: `${12 + topOffset}px`,
                        }}
                        title={bar.label}
                      >
                        {bar.label}
                      </div>
                    );
                  })}
                  {/* Reserve space for stacked bars */}
                  <div style={{ height: `${Math.max(28, row.bars.length * 28 + 8)}px` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Dashboard Component
// ============================================================================
export function ProDashboardV2() {
  const [activeView, setActiveView] = useState<string>("overview");
  const [activeKanbanTab, setActiveKanbanTab] = useState<string>("all tasks");
  const { merchant } = useAuth();
  const { store } = useStore();

  const { data: dashboardData, isLoading } = useSWR<{
    success: boolean;
    data: DashboardData;
  }>("/dashboard/pro-overview", fetcher, {
    refreshInterval: 30000,
  });

  const data = dashboardData?.data;
  const currency = store?.currency || "NGN";
  const storeName = store?.name || merchant?.storeName || "Your Store";

  const metrics: MetricCard[] = data?.metrics ? [
    {
      label: "REVENUE",
      value: formatCurrency(data.metrics.revenue.value, currency),
      change: `${data.metrics.revenue.trend === "up" ? "↗" : "↘"} ${Math.abs(data.metrics.revenue.change)}%`,
      trend: data.metrics.revenue.trend
    },
    {
      label: "ORDERS",
      value: String(data.metrics.orders.value),
      change: `${data.metrics.orders.trend === "up" ? "↗" : "↘"} ${Math.abs(data.metrics.orders.change)}%`,
      trend: data.metrics.orders.trend
    },
    {
      label: "CUSTOMERS",
      value: String(data.metrics.customers.value),
      change: `${data.metrics.customers.trend === "up" ? "↗" : "↘"} ${Math.abs(data.metrics.customers.change)}%`,
      trend: data.metrics.customers.trend
    },
    {
      label: "CONVERSION",
      value: `${data.metrics.conversion.value}%`,
      change: `${data.metrics.conversion.trend === "up" ? "↗" : "↘"} ${Math.abs(data.metrics.conversion.change)}%`,
      trend: data.metrics.conversion.trend
    },
  ] : [];

  const aiStats = data?.aiStats || { captured: 0, autoOrders: 0, avgResponse: "0s", satisfaction: 0 };
  const orderStatus = data?.orderStatus || { delivered: 0, processing: 0, pending: 0, cancelled: 0 };
  const totalOrders = orderStatus.delivered + orderStatus.processing + orderStatus.pending + orderStatus.cancelled;

  const tabs = ["Overview", "Orders", "Tasks", "Reports"];
  const kanbanTabs = ["All Tasks", "To Do", "In Progress", "Done", "Timeline"];

  // ========================================================================
  // Build Kanban cards from real API data
  // ========================================================================
  const today = new Date();
  const fmtDate = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const fmtDue = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });

  // Pending column: incomplete tasks from the API
  const pendingCards = useMemo(() => {
    const tasks = data?.tasks || [];
    const incomplete = tasks.filter((t) => !t.completed);
    return incomplete.slice(0, Math.max(2, orderStatus.pending)).map((task, i) => ({
      code: `TSK-${task.id || i + 1}`,
      priority: (i === 0 ? "urgent" : "normal") as "urgent" | "normal" | "low",
      title: task.title,
      tag: task.subtitle,
      dueDate: fmtDue(new Date(today.getTime() + (i + 1) * 86400000)),
      avatars: 1 + (i % 2),
      extraAvatars: 0,
      comments: i + 1,
      date: fmtDate(today),
    }));
  }, [data?.tasks, orderStatus.pending]);

  // Processing column: inventory alerts as actionable items
  const processingCards = useMemo(() => {
    const alerts = data?.inventoryAlerts || [];
    return alerts.slice(0, Math.max(1, orderStatus.processing)).map((alert, i) => ({
      code: `INV-${i + 1}`,
      priority: (alert.status === "out" ? "urgent" : "normal") as "urgent" | "normal" | "low",
      title: `Restock: ${alert.name}`,
      tag: alert.status === "out" ? "Out of stock" : `${alert.stock} units remaining`,
      dueDate: fmtDue(new Date(today.getTime() + (i + 2) * 86400000)),
      avatars: 1,
      extraAvatars: 0,
      comments: 0,
      date: fmtDate(today),
    }));
  }, [data?.inventoryAlerts, orderStatus.processing]);

  // Completed column: top customers as completed engagements
  const completedCards = useMemo(() => {
    const customers = data?.topCustomers || [];
    return customers.slice(0, Math.max(1, orderStatus.delivered)).map((cust, i) => ({
      code: `CUS-${i + 1}`,
      priority: "low" as const,
      title: `${cust.name} — ${cust.orders} orders`,
      tag: `Total spent: ${cust.spent}`,
      dueDate: fmtDue(new Date(today.getTime() - (i + 1) * 86400000)),
      avatars: 2,
      extraAvatars: i > 0 ? i : 0,
      comments: cust.orders,
      date: fmtDate(new Date(today.getTime() - i * 86400000)),
    }));
  }, [data?.topCustomers, orderStatus.delivered]);

  // Cancelled column: completed tasks or summary card
  const cancelledCards = useMemo(() => {
    const tasks = data?.tasks || [];
    const done = tasks.filter((t) => t.completed);
    if (done.length === 0 && orderStatus.cancelled > 0) {
      return [
        {
          code: "ORD-X1",
          priority: "low" as const,
          title: `${orderStatus.cancelled} cancelled order(s)`,
          tag: "Review cancelled orders",
          dueDate: fmtDue(today),
          avatars: 1,
          extraAvatars: 0,
          comments: 0,
          date: fmtDate(today),
        },
      ];
    }
    return done.slice(0, Math.max(1, orderStatus.cancelled)).map((task, i) => ({
      code: `ARC-${task.id || i + 1}`,
      priority: "low" as const,
      title: task.title,
      tag: task.subtitle,
      dueDate: fmtDue(new Date(today.getTime() - (i + 3) * 86400000)),
      avatars: 1,
      extraAvatars: 0,
      comments: 0,
      date: fmtDate(new Date(today.getTime() - (i + 2) * 86400000)),
    }));
  }, [data?.tasks, orderStatus.cancelled]);

  // Filter cards based on active kanban tab
  const showPending = activeKanbanTab === "all tasks" || activeKanbanTab === "to do";
  const showProcessing = activeKanbanTab === "all tasks" || activeKanbanTab === "in progress";
  const showCompleted = activeKanbanTab === "all tasks" || activeKanbanTab === "done";
  const showCancelled = activeKanbanTab === "all tasks";

  return (
    <div className="min-h-full space-y-6">
      {/* ================================================================ */}
      {/* PAGE HEADER                                                      */}
      {/* ================================================================ */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Store Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Stay on top of your store, monitor performance and track status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Team Avatars */}
          <div className="flex -space-x-2">
            <div className="w-9 h-9 rounded-full bg-orange-200 border-2 border-white" />
            <div className="w-9 h-9 rounded-full bg-blue-200 border-2 border-white" />
            <div className="w-9 h-9 rounded-full bg-green-200 border-2 border-white" />
            <div className="w-9 h-9 rounded-full bg-purple-200 border-2 border-white" />
          </div>
          <Button className="w-9 h-9 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors">
            <Plus size={14} className="text-gray-400" />
          </Button>
        </div>
      </div>

      {/* ================================================================ */}
      {/* SUMMARY WIDGETS ROW (3 cards)                                    */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Widget 1: Order Status */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <WidgetHeader icon={CheckSquare} title="Task status" />

          {isLoading ? (
            <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
          ) : (
            <>
              {/* Big Numbers */}
              <div className="flex items-end gap-6 mb-4">
                <div>
                  <p className="text-3xl font-bold text-gray-900 tracking-tight">{orderStatus.pending}</p>
                  <p className="text-sm text-gray-500">Pending</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 tracking-tight">{orderStatus.processing}</p>
                  <p className="text-sm text-gray-500">In progress</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 tracking-tight">{orderStatus.delivered}</p>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
              </div>

              {/* Bars */}
              <div className="h-20 flex items-end gap-1">
                {[45, 52, 38, 65, 48, 72, 55].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-green-500"
                    style={{
                      height: `${h}%`,
                      opacity: 0.4 + i * 0.08,
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>1d</span><span>2d</span><span>3d</span><span>4d</span><span>5d</span><span>6d</span><span>7d</span>
              </div>
            </>
          )}
        </div>

        {/* Widget 2: Orders + AI Conversations (stacked) */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          {/* Top: Orders */}
          <WidgetHeader icon={ShoppingBag} title="Orders" />

          {isLoading ? (
            <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
          ) : (
            <>
              <p className="text-3xl font-bold text-gray-900 tracking-tight mb-1">{totalOrders}</p>
              <p className={cn(
                "text-xs font-medium mb-4",
                metrics[1]?.trend === "up" ? "text-green-600" : "text-red-500"
              )}>
                {metrics[1]?.change || "—"} (7d)
              </p>

              {/* Divider + AI Section */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bot size={18} className="text-gray-500" />
                  <h3 className="text-sm font-semibold text-gray-900">AI Conversations</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 tracking-tight mb-1">{aiStats.captured}</p>
                <p className="text-xs font-medium text-green-600">↗ +24% (7d)</p>
              </div>
            </>
          )}
        </div>

        {/* Widget 3: Revenue Trend */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <WidgetHeader icon={TrendingUp} title="Revenue trend" subtitle="(7 days)" />

          {isLoading ? (
            <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
          ) : (
            <>
              <p className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
                {metrics[0]?.value || "—"}
              </p>
              <p className={cn(
                "text-xs font-medium mb-4",
                metrics[0]?.trend === "up" ? "text-green-600" : "text-red-500"
              )}>
                {metrics[0]?.change || "—"} (7d)
              </p>

              {/* Mini Revenue Chart */}
              <div className="h-24 flex items-end gap-1">
                {(data?.metrics?.revenue?.history || [
                  { date: "1", value: 45 }, { date: "2", value: 52 }, { date: "3", value: 38 },
                  { date: "4", value: 65 }, { date: "5", value: 48 }, { date: "6", value: 72 },
                  { date: "7", value: 55 },
                ]).map((point: { date: string; value: number }, i: number) => {
                  const allValues = (data?.metrics?.revenue?.history || [
                    { value: 45 }, { value: 52 }, { value: 38 }, { value: 65 },
                    { value: 48 }, { value: 72 }, { value: 55 },
                  ]).map((p: { value: number }) => p.value);
                  const maxValue = Math.max(...allValues, 1);
                  const height = Math.min(100, (point.value / maxValue) * 80 + 20);
                  return (
                    <div key={i} className="flex-1 flex items-end gap-0.5">
                      <div
                        className="flex-1 bg-green-400 rounded-t transition-all duration-500"
                        style={{ height: `${height}%` }}
                        title={data?.metrics?.revenue?.history ? formatCurrency(point.value, currency) : undefined}
                      />
                      <div
                        className="flex-1 bg-violet-400 rounded-t transition-all duration-500"
                        style={{ height: `${height * 0.6}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2">
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-gray-400">Revenue</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-violet-400" />
                    <span className="text-gray-400">AI Orders</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* TAB NAVIGATION                                                   */}
      {/* ================================================================ */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {tabs.map((tab) => (
              <Button
                key={tab}
                className={cn(
                  "pb-3 text-sm font-medium border-b-2 transition-colors",
                  activeView === tab.toLowerCase()
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
                onClick={() => setActiveView(tab.toLowerCase())}
              >
                {tab}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2 pb-3">
            <Button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              <LayoutGrid size={14} />
              Widgets
            </Button>
            <Button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter size={14} />
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* KANBAN SUB-TABS                                                  */}
      {/* ================================================================ */}
      <div className="flex items-center gap-2">
        {kanbanTabs.map((tab) => {
          const tabKey = tab.toLowerCase();
          const isActive = activeKanbanTab === tabKey;
          return (
            <Button
              key={tab}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
              onClick={() => setActiveKanbanTab(tabKey)}
            >
              {tab === "Timeline" && <GanttChart size={14} className="inline mr-1.5 -mt-0.5" />}
              {tab}
            </Button>
          );
        })}
      </div>

      {/* ================================================================ */}
      {/* TIMELINE VIEW or KANBAN BOARD                                    */}
      {/* ================================================================ */}
      {activeKanbanTab === "timeline" ? (
        isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8">
            <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        ) : (
          <TimelineView data={data} />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Column: Pending */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Inbox size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-900">Pending</span>
              <span className="text-sm text-gray-400">{orderStatus.pending}</span>
              <Button className="ml-auto p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal size={14} className="text-gray-400" />
              </Button>
            </div>
            <div className="space-y-3">
              {isLoading ? (
                <>
                  <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
                  <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
                </>
              ) : showPending && pendingCards.length > 0 ? (
                pendingCards.map((card) => <KanbanCard key={card.code} {...card} />)
              ) : (
                <div className="bg-white rounded-xl p-6 border border-gray-100 text-center">
                  <Inbox size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No pending items</p>
                </div>
              )}
            </div>
          </div>

          {/* Column: Processing */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap size={16} className="text-yellow-500" />
              <span className="text-sm font-medium text-gray-900">Processing</span>
              <span className="text-sm text-gray-400">{orderStatus.processing}</span>
              <Button className="ml-auto p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal size={14} className="text-gray-400" />
              </Button>
            </div>
            <div className="space-y-3">
              {isLoading ? (
                <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
              ) : showProcessing && processingCards.length > 0 ? (
                processingCards.map((card) => <KanbanCard key={card.code} {...card} />)
              ) : (
                <div className="bg-white rounded-xl p-6 border border-gray-100 text-center">
                  <Zap size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Nothing processing</p>
                </div>
              )}
            </div>
          </div>

          {/* Column: Completed */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={16} className="text-green-500" />
              <span className="text-sm font-medium text-gray-900">Completed</span>
              <span className="text-sm text-gray-400">{orderStatus.delivered}</span>
              <Button className="ml-auto p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal size={14} className="text-gray-400" />
              </Button>
            </div>
            <div className="space-y-3">
              {isLoading ? (
                <>
                  <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
                  <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
                </>
              ) : showCompleted && completedCards.length > 0 ? (
                completedCards.map((card) => <KanbanCard key={card.code} {...card} />)
              ) : (
                <div className="bg-white rounded-xl p-6 border border-gray-100 text-center">
                  <CheckCircle size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No completed items</p>
                </div>
              )}
            </div>
          </div>

          {/* Column: Cancelled */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <XCircle size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-900">Cancelled</span>
              <span className="text-sm text-gray-400">{orderStatus.cancelled}</span>
              <Button className="ml-auto p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal size={14} className="text-gray-400" />
              </Button>
            </div>
            <div className="space-y-3">
              {isLoading ? (
                <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
              ) : showCancelled && cancelledCards.length > 0 ? (
                cancelledCards.map((card) => <KanbanCard key={card.code} {...card} />)
              ) : (
                <div className="bg-white rounded-xl p-6 border border-gray-100 text-center">
                  <XCircle size={24} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No cancelled items</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
