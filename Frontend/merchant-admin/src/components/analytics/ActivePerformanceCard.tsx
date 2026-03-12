/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-hooks/rules-of-hooks */
import React from "react";
import { Icon, cn } from "@vayva/ui";
import { formatCurrency } from "@vayva/shared";
import { ActivePerformance } from "@/types/analytics";

export const ActivePerformanceCard = ({
  data,
}: {
  data: ActivePerformance;
}) => {
  const Metric = ({
    label,
    value,
    delta,
    prefix = "",
    suffix = "",
  }: {
    label: string;
    value: string | number;
    delta?: number;
    prefix?: string;
    suffix?: string;
  }) => (
    <div className="p-4 bg-white/40 rounded-xl border border-border/40">
      <p className="text-xs text-text-tertiary font-medium mb-1">{label}</p>
      <div className="flex items-end gap-2">
        <span className="text-xl font-heading font-bold text-text-primary">
          {prefix}
          {value}
          {suffix}
        </span>
        {delta !== undefined && (
          <span
            className={cn(
              "text-xs font-bold mb-1 flex items-center",
              delta >= 0 ? "text-green-600" : "text-red-500",
            )}
          >
            <Icon
              name={delta >= 0 ? "TrendingUp" : "TrendingDown"}
              size={12}
              className="mr-0.5"
            />
            {Math.abs(delta)}%
          </span>
        )}
      </div>
    </div>
  );

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="bg-background border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-text-primary">
            Active Template Health
          </h3>
          <p className="text-xs text-text-tertiary">
            Based on speed, conversion, and usability.
          </p>
        </div>
        <div className="text-center">
          <div
            className={cn(
              "text-3xl font-heading font-bold",
              getHealthColor(data.health_score),
            )}
          >
            {data.health_score}
          </div>
          <div className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
            Score
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric
          label="Conversion Rate"
          value={data.metrics.conversion_rate}
          delta={data.delta.conversion_rate}
          suffix="%"
        />
        <Metric
          label="Revenue"
          value={formatCurrency(data.metrics.revenue).replace("₦", "")}
          delta={data.delta.revenue}
          prefix="₦"
        />
        <Metric
          label="Orders"
          value={data.metrics.orders}
          delta={data.delta.orders}
        />
        <Metric
          label="Avg Order Value"
          value={formatCurrency(data.metrics.aov || 0).replace("₦", "")}
          delta={data.delta.aov}
          prefix="₦"
        />
      </div>
    </div>
  );
};
