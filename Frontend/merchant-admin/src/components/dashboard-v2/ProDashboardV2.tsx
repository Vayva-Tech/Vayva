"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { Button, Icon, cn } from "@vayva/ui";
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
// Components
// ============================================================================

const KeyMetricCard = ({ metric }: { metric: MetricCard }) => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100">
    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
      {metric.label}
    </p>
    <p className="text-2xl font-bold text-slate-900 mb-1">{metric.value}</p>
    <p className={cn(
      "text-xs font-medium",
      metric.trend === "up" ? "text-emerald-600" : "text-rose-500"
    )}>
      {metric.change}
    </p>
  </div>
);

const TaskItem = ({ task }: { task: Task }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
      {task.icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-slate-900 truncate">{task.title}</p>
      <p className="text-xs text-slate-500 truncate">{task.subtitle}</p>
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
      {IconComponent && <IconComponent size={18} className="text-slate-500" />}
      <h3 className="font-semibold text-slate-900">{title}</h3>
    </div>
    {action}
  </div>
);

// ============================================================================
// Main Dashboard Component
// ============================================================================
export function ProDashboardV2() {
  const [activeTab, setActiveTab] = useState<"today" | "tomorrow">("today");
  const { merchant } = useAuth();
  const { store } = useStore();

  const { data: dashboardData, isLoading } = useSWR<{
    success: boolean;
    data: DashboardData;
  }>("/api/dashboard/pro-overview", fetcher, {
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

  const tasks = data?.tasks || [];
  const inventoryAlerts = data?.inventoryAlerts || [];
  const topCustomers = data?.topCustomers || [];
  const aiStats = data?.aiStats || { captured: 0, autoOrders: 0, avgResponse: "0s", satisfaction: 0 };
  const orderStatus = data?.orderStatus || { delivered: 0, processing: 0, pending: 0, cancelled: 0 };
  const totalOrders = orderStatus.delivered + orderStatus.processing + orderStatus.pending + orderStatus.cancelled;

  return (
    <div className="min-h-full">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-slate-500 mb-1">Manage and track your store</p>
          <h2 className="text-xl font-bold text-slate-900">Store Dashboard</h2>
        </div>
        <Button className="rounded-xl gap-2 bg-slate-900 hover:bg-slate-800">
          <Plus size={18} />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - My Tasks & AI Assistant */}
        <div className="col-span-3 space-y-6">
          {/* My Tasks */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <SectionHeader
              title="My Tasks"
              icon={CheckSquare}
              action={
                <button className="w-6 h-6 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                  <Plus size={14} className="text-slate-500" />
                </button>
              }
            />

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab("today")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                  activeTab === "today"
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:bg-slate-100"
                )}
              >
                Today
              </button>
              <button
                onClick={() => setActiveTab("tomorrow")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                  activeTab === "tomorrow"
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:bg-slate-100"
                )}
              >
                Tomorrow
              </button>
            </div>

            {/* Task List */}
            <div className="space-y-1">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                ))
              ) : tasks.length > 0 ? (
                tasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))
              ) : (
                <div className="text-center py-4 text-slate-500 text-sm">
                  No tasks for {activeTab}
                </div>
              )}
            </div>
          </div>

          {/* AI Assistant */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <SectionHeader
              title="AI Assistant"
              icon={Bot}
              action={
                <button className="w-6 h-6 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                  <Icon name="Sparkles" size={14} className="text-violet-500" />
                </button>
              }
            />

            <div className="grid grid-cols-2 gap-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-xl p-3 h-20 animate-pulse" />
                ))
              ) : (
                <>
                  <div className="bg-violet-50 rounded-xl p-3">
                    <p className="text-xs text-violet-600 mb-1">CAPTURED</p>
                    <p className="text-xl font-bold text-violet-700">{aiStats.captured}</p>
                    <p className="text-xs text-violet-500">conversations</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3">
                    <p className="text-xs text-emerald-600 mb-1">AUTO-ORDERS</p>
                    <p className="text-xl font-bold text-emerald-700">{aiStats.autoOrders}</p>
                    <p className="text-xs text-emerald-500">created</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3">
                    <p className="text-xs text-amber-600 mb-1">AVG RESPONSE</p>
                    <p className="text-xl font-bold text-amber-700">{aiStats.avgResponse}</p>
                  </div>
                  <div className="bg-rose-50 rounded-xl p-3">
                    <p className="text-xs text-rose-600 mb-1">SATISFACTION</p>
                    <p className="text-xl font-bold text-rose-700">{aiStats.satisfaction}%</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center Column - Main Metrics & Charts */}
        <div className="col-span-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-100 h-28 animate-pulse" />
              ))
            ) : metrics.length > 0 ? (
              metrics.map((metric, idx) => (
                <KeyMetricCard key={idx} metric={metric} />
              ))
            ) : (
              <div className="col-span-4 text-center py-8 text-slate-500">
                No metrics available
              </div>
            )}
          </div>

          {/* Revenue & AI Conversions Chart */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-slate-900">Revenue & AI Conversions</h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-500">Revenue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-violet-500" />
                  <span className="text-slate-500">AI Orders</span>
                </div>
              </div>
            </div>
            {/* Revenue Chart */}
            <div className="h-40 flex items-end gap-2">
              {data?.metrics?.revenue?.history ? (
                data.metrics.revenue.history.map((point: { date: string; value: number }, i: number) => {
                  const maxValue = Math.max(...(data.metrics.revenue.history?.map((p: { value: number }) => p.value) || []), 1);
                  const height1 = Math.min(100, (point.value / maxValue) * 80 + 20);
                  const height2 = Math.min(100, height1 * 0.6);
                  return (
                    <div key={i} className="flex-1 flex items-end gap-0.5">
                      <div 
                        className="flex-1 bg-emerald-400 rounded-t transition-all duration-500"
                        style={{ height: `${height1}%` }}
                        title={`Revenue: ${formatCurrency(point.value, currency)}`}
                      />
                      <div 
                        className="flex-1 bg-violet-400 rounded-t transition-all duration-500"
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
                        className="flex-1 bg-emerald-400/30 rounded-t"
                        style={{ height: `${height1}%` }}
                      />
                      <div 
                        className="flex-1 bg-violet-400/30 rounded-t"
                        style={{ height: `${height2}%` }}
                      />
                    </div>
                  );
                })
              )}
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span>J</span><span>F</span><span>M</span><span>A</span><span>M</span>
              <span>J</span><span>J</span><span>A</span><span>S</span><span>O</span>
              <span>N</span><span>D</span>
            </div>
          </div>

          {/* Orders Overview */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Orders Overview</h3>
              <button className="p-1 hover:bg-slate-100 rounded-lg">
                <ArrowUpRight size={16} className="text-slate-400" />
              </button>
            </div>
            <div className="flex items-center gap-8">
              {/* Donut Chart */}
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="157 251" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="12" strokeDasharray="63 251" strokeDashoffset="-157" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="12" strokeDasharray="25 251" strokeDashoffset="-220" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-slate-900">{isLoading ? "—" : totalOrders}</span>
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
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-sm text-slate-600">Delivered</span>
                      <span className="text-sm font-medium text-slate-900 ml-auto">{orderStatus.delivered}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-sm text-slate-600">Processing</span>
                      <span className="text-sm font-medium text-slate-900 ml-auto">{orderStatus.processing}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-sm text-slate-600">Pending</span>
                      <span className="text-sm font-medium text-slate-900 ml-auto">{orderStatus.pending}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <span className="text-sm text-slate-600">Cancelled</span>
                      <span className="text-sm font-medium text-slate-900 ml-auto">{orderStatus.cancelled}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* AI Performance */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">AI Performance</h3>
              <span className="px-2 py-1 bg-violet-100 text-violet-700 text-xs font-medium rounded-full flex items-center gap-1">
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
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare size={16} className="text-violet-500" />
                      <span className="text-xs text-slate-500 uppercase">Conversations</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{aiStats.captured}</p>
                    <p className="text-xs text-emerald-600">+24%</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp size={16} className="text-emerald-500" />
                      <span className="text-xs text-slate-500 uppercase">Auto-orders</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{aiStats.autoOrders}</p>
                    <p className="text-xs text-emerald-600">+31%</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="Clock" size={16} className="text-amber-500" />
                      <span className="text-xs text-slate-500 uppercase">Avg Response</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{aiStats.avgResponse}</p>
                    <p className="text-xs text-emerald-600">-0.3s</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="BarChart" size={16} className="text-rose-500" />
                      <span className="text-xs text-slate-500 uppercase">CSAT Score</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{aiStats.satisfaction}%</p>
                    <p className="text-xs text-emerald-600">+2%</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Recent Orders</h3>
              <button className="p-1 hover:bg-slate-100 rounded-lg">
                <ArrowUpRight size={16} className="text-slate-400" />
              </button>
            </div>
            <div className="text-sm text-slate-500 text-center py-8">
              Recent orders will appear here
            </div>
          </div>
        </div>

        {/* Right Column - AI Usage, Inventory, Customers */}
        <div className="col-span-3 space-y-6">
          {/* AI Usage */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">AI Usage</h3>
              <button className="p-1 hover:bg-slate-100 rounded-lg">
                <MoreHorizontal size={16} className="text-slate-400" />
              </button>
            </div>
            {/* Mini bar chart - AI Usage */}
            <div className="h-24 flex items-end gap-1 mb-3">
              {(data?.aiStats?.usageHistory || [65, 72, 58, 80, 68, 75, 70]).map((value: number, i: number) => {
                const maxVal = Math.max(...(data?.aiStats?.usageHistory || [80]), 1);
                const height = Math.min(100, (value / maxVal) * 90 + 10);
                return (
                  <div
                    key={i}
                    className="flex-1 bg-violet-400 rounded-t transition-all duration-500"
                    style={{ height: `${height}%`, opacity: 0.5 + (i * 0.08) }}
                    title={`Usage: ${value}%`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span>
              <span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
            <p className="text-xs text-slate-500">This week</p>
            <p className="text-sm font-medium text-violet-600">↗ +18%</p>
          </div>

          {/* Inventory Alerts */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <SectionHeader title="Inventory Alerts" icon={() => <Icon name="Package" size={18} className="text-slate-500" />} />

            <div className="flex gap-4 mb-4">
              <div>
                <p className="text-xs text-slate-500 uppercase">Low Stock</p>
                <p className="text-2xl font-bold text-amber-600">5</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Out</p>
                <p className="text-2xl font-bold text-rose-600">1</p>
              </div>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="h-8 bg-slate-100 rounded animate-pulse" />
                ))
              ) : inventoryAlerts.length > 0 ? (
                inventoryAlerts.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-sm text-slate-700">{item.name}</span>
                    <span className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      item.status === "out" 
                        ? "bg-rose-100 text-rose-700" 
                        : "bg-amber-100 text-amber-700"
                    )}>
                      {item.stock}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-500 text-sm">
                  No inventory alerts
                </div>
              )}
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <SectionHeader title="Top Customers" icon={Users} />

            <div className="flex gap-4 mb-4">
              <div>
                <p className="text-xs text-slate-500 uppercase">New</p>
                <p className="text-2xl font-bold text-slate-900">89</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Repeat</p>
                <p className="text-2xl font-bold text-emerald-600">34%</p>
              </div>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, idx) => (
                  <div key={idx} className="h-12 bg-slate-100 rounded animate-pulse" />
                ))
              ) : topCustomers.length > 0 ? (
                topCustomers.map((customer, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{customer.name}</p>
                      <p className="text-xs text-slate-500">{customer.orders} orders</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{customer.spent}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-slate-500 text-sm">
                  No customers yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
