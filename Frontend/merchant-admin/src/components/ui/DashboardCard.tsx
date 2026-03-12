"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

export function DashboardCard({
  children,
  className,
  padding = "md",
}: DashboardCardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-5",
    lg: "p-6",
  };

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-100",
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

interface DashboardCardHeaderProps {
  title: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
  className?: string;
}

export function DashboardCardHeader({
  title,
  icon: IconComponent,
  action,
  className,
}: DashboardCardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      <div className="flex items-center gap-2">
        {IconComponent && <IconComponent size={18} className="text-slate-500" />}
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
      {action}
    </div>
  );
}

interface DashboardMetricCardProps {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function DashboardMetricCard({
  label,
  value,
  change,
  trend = "neutral",
  className,
}: DashboardMetricCardProps) {
  return (
    <DashboardCard className={className}>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
      {change && (
        <p
          className={cn(
            "text-xs font-medium",
            trend === "up" && "text-emerald-600",
            trend === "down" && "text-rose-500",
            trend === "neutral" && "text-slate-500"
          )}
        >
          {change}
        </p>
      )}
    </DashboardCard>
  );
}

interface DashboardPageHeaderProps {
  subtitle?: string;
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export function DashboardPageHeader({
  subtitle,
  title,
  action,
  className,
}: DashboardPageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-6", className)}>
      <div>
        {subtitle && (
          <p className="text-sm text-slate-500 mb-1">{subtitle}</p>
        )}
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      </div>
      {action}
    </div>
  );
}

interface DashboardGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4 | 12;
}

export function DashboardGrid({
  children,
  className,
  columns = 12,
}: DashboardGridProps) {
  return (
    <div className={cn("grid grid-cols-12 gap-6", className)}>{children}</div>
  );
}

interface DashboardColumnProps {
  children: React.ReactNode;
  className?: string;
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
}

export function DashboardColumn({
  children,
  className,
  span = 12,
}: DashboardColumnProps) {
  return <div className={cn(`col-span-${span}`, className)}>{children}</div>;
}
