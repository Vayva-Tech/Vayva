"use client";

import React from "react";
import { cn , Icon, IconName } from "@vayva/ui";

interface OpsStatCardProps {
  label: string;
  value: string | number;
  icon?: IconName;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  description?: string;
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
  onClick?: () => void;
}

const variantStyles = {
  default: {
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  success: {
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  warning: {
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
  error: {
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  info: {
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
};

export function OpsStatCard({
  label,
  value,
  icon,
  trend,
  description,
  variant = "default",
  className,
  onClick,
}: OpsStatCardProps): React.JSX.Element {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-gray-200 p-6",
        onClick && "cursor-pointer hover:border-indigo-300 transition-colors",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 text-sm">
              <span
                className={cn(
                  "font-medium",
                  trend.positive ? "text-green-600" : "text-red-600"
                )}
              >
                {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-gray-400">{trend.label}</span>
            </div>
          )}
          {description && (
            <p className="text-xs text-gray-400 mt-1">{description}</p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              styles.iconBg
            )}
          >
            <Icon name={icon} className={cn("w-6 h-6", styles.iconColor)} />
          </div>
        )}
      </div>
    </div>
  );
}

interface OpsStatGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function OpsStatGrid({
  children,
  columns = 4,
  className,
}: OpsStatGridProps): React.JSX.Element {
  const gridCols = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-6", gridCols[columns], className)}>
      {children}
    </div>
  );
}

// Specialized stat cards for common use cases
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon: IconName;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  icon,
  className,
}: MetricCardProps): React.JSX.Element {
  return (
    <OpsStatCard
      label={title}
      value={value}
      icon={icon}
      trend={
        change
          ? {
              value: change.value,
              label: "vs last period",
              positive: change.isPositive,
            }
          : undefined
      }
      className={className}
    />
  );
}

interface HealthCardProps {
  title: string;
  status: "healthy" | "warning" | "critical" | "unknown";
  message?: string;
  lastChecked?: string;
  className?: string;
}

export function HealthCard({
  title,
  status,
  message,
  lastChecked,
  className,
}: HealthCardProps): React.JSX.Element {
  const statusConfig = {
    healthy: {
      icon: "CheckCircle" as IconName,
      variant: "success" as const,
      label: "Operational",
    },
    warning: {
      icon: "Warning" as IconName,
      variant: "warning" as const,
      label: "Degraded",
    },
    critical: {
      icon: "XCircle" as IconName,
      variant: "error" as const,
      label: "Critical",
    },
    unknown: {
      icon: "Question" as IconName,
      variant: "default" as const,
      label: "Unknown",
    },
  };

  const config = statusConfig[status];

  return (
    <OpsStatCard
      label={title}
      value={config.label}
      icon={config.icon}
      variant={config.variant}
      description={message || (lastChecked ? `Checked ${lastChecked}` : undefined)}
      className={className}
    />
  );
}
