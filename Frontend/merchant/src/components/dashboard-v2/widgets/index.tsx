/**
 * Dashboard Widget Components Library
 * 
 * Reusable, memoized widget components for ProDashboardV2
 * Extracted for better maintainability, testability, and performance
 */

"use client";

import React, { useMemo } from "react";
import { Icon, cn, Button } from "@vayva/ui";
import { formatCurrency } from "@vayva/shared";
import {
  CheckSquare,
  ShoppingBag,
  Bot,
  TrendingUp,
  Pencil,
  Maximize2,
  MoreHorizontal,
  Flag,
  Calendar,
  MessageSquare,
  GanttChart,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================
interface Task {
  id: string;
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  completed?: boolean;
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
    revenue: { value: number; change: number; trend: "up" | "down" };
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
  };
  orderStatus: {
    delivered: number;
    processing: number;
    pending: number;
    cancelled: number;
  };
}

// ============================================================================
// Shared UI Components
// ============================================================================

export const WidgetActions: React.FC = () => (
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

export const WidgetHeader: React.FC<{
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}> = ({ icon: IconComponent, title, subtitle }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <IconComponent size={18} className="text-gray-500" />
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
    </div>
    <WidgetActions />
  </div>
);

export const PriorityBadge: React.FC<{ priority: "urgent" | "normal" | "low" }> = ({ priority }) => {
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

export const AvatarGroup: React.FC<{ count?: number; extra?: number }> = ({ count = 2, extra = 0 }) => (
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

// ============================================================================
// Metric Card Component
// ============================================================================

interface MetricCardProps {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

export const MetricCard: React.FC<MetricCardProps> = React.memo(({ label, value, change, trend }) => (
  <div className="bg-white rounded-xl p-4 border border-gray-100">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={cn("flex items-center gap-1 text-xs font-medium", trend === "up" ? "text-green-600" : "text-red-600")}>
        <TrendingUp size={12} className={cn(trend === "down" && "rotate-180")} />
        {change}
      </div>
    </div>
  </div>
));

MetricCard.displayName = "MetricCard";

// ============================================================================
// Order Status Widget
// ============================================================================

export const OrderStatusWidget: React.FC<{
  data: DashboardData | undefined;
  isLoading: boolean;
}> = React.memo(({ data, isLoading }) => {
  const orderStatus = data?.orderStatus || { delivered: 0, processing: 0, pending: 0, cancelled: 0 };

  return (
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

          {/* Activity Bars */}
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
  );
});

OrderStatusWidget.displayName = "OrderStatusWidget";

// ============================================================================
// AI Stats Widget
// ============================================================================

export const AIStatsWidget: React.FC<{
  data: DashboardData | undefined;
  isLoading: boolean;
}> = React.memo(({ data, isLoading }) => {
  const aiStats = data?.aiStats || { captured: 0, autoOrders: 0, avgResponse: "0s", satisfaction: 0 };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <WidgetHeader icon={Bot} title="AI Agent" subtitle="Performance" />

      {isLoading ? (
        <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500">Captured Leads</p>
              <p className="text-2xl font-bold text-gray-900">{aiStats.captured}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Auto Orders</p>
              <p className="text-2xl font-bold text-gray-900">{aiStats.autoOrders}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Avg Response</p>
              <p className="text-2xl font-bold text-gray-900">{aiStats.avgResponse}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Satisfaction</p>
              <p className="text-2xl font-bold text-gray-900">{aiStats.satisfaction}%</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(aiStats.satisfaction, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {aiStats.satisfaction >= 80 ? "Excellent" : aiStats.satisfaction >= 60 ? "Good" : "Needs improvement"} performance
          </p>
        </>
      )}
    </div>
  );
});

AIStatsWidget.displayName = "AIStatsWidget";

// Export more widget components following the same pattern...
// (TimelineView, KanbanCard, etc. would be added here)
