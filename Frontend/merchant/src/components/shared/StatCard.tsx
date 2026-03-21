"use client";

import { Card } from "@/components/ui/card";
import type { Icon } from "@phosphor-icons/react";

export interface StatItem {
  label: string;
  value: string;
  icon: Icon;
  trend?: string;
  trendUp?: boolean;
}

interface StatCardProps {
  stat: StatItem;
}

export function StatCard({ stat }: StatCardProps) {
  const Icon = stat.icon;
  const trendColor = stat.trendUp === undefined 
    ? "text-gray-500" 
    : stat.trendUp 
      ? "text-status-success" 
      : "text-status-danger";

  return (
    <Card className="p-4 h-full">
      <div className="flex items-center gap-3">
        <div 
          className="p-2 rounded-lg bg-gray-50"
          aria-hidden="true"
        >
          <Icon className="h-5 w-5 text-gray-900" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 truncate">{stat.label}</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-semibold text-gray-900">
              {stat.value}
            </p>
            {stat.trend && (
              <span className={`text-xs font-medium ${trendColor}`}>
                {stat.trend}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

interface StatGridProps {
  stats: StatItem[];
}

export function StatGrid({ stats }: StatGridProps) {
  return (
    <div 
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
      role="region"
      aria-label="Statistics"
    >
      {stats.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </div>
  );
}
