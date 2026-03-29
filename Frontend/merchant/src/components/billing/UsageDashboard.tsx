"use client";

import React, { useEffect, useState } from "react";
import { Icon, Button, cn } from "@vayva/ui";
import { formatCurrency } from "@vayva/shared";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";
import { useIndustryAccess } from "@/hooks/use-industry-access";
import { AIFeaturePaywall } from "./AIFeaturePaywall";

interface UsageStat {
  metric: string;
  /** Display label; falls back to METRIC_LABELS[metric] when omitted */
  label?: string;
  used: number;
  limit: number;
  percentage: number;
  projected: number;
  overage: number;
  overageCost: number;
  trend?: 'increasing' | 'decreasing' | 'stable';
  dailyAverage?: number;
}

interface ProjectedOverage {
  metric: string;
  projectedOverage: number;
  projectedCost: number;
}

interface UsageData {
  stats: UsageStat[];
  projectedOverages: ProjectedOverage[];
  hasOverages: boolean;
  totalOverageCost: number;
  recommendations: string[];
  upgradeRecommended: string | null;
}

interface ProUsagePrediction {
  metric: string;
  daysUntilLimit: number;
  recommendedAction: 'monitor' | 'purchase_addon' | 'upgrade_plan';
  confidence: number;
}

const METRIC_LABELS: Record<string, string> = {
  AI_TOKENS: "AI Tokens",
  WHATSAPP_MESSAGES: "WhatsApp Messages",
  WHATSAPP_MEDIA: "WhatsApp Media",
  STORAGE_GB: "Storage (GB)",
  API_CALLS: "API Calls",
  BANDWIDTH_GB: "Bandwidth (GB)",
};

const METRIC_ICONS: Record<string, string> = {
  AI_TOKENS: "Brain",
  WHATSAPP_MESSAGES: "ChatCircle",
  WHATSAPP_MEDIA: "Image",
  STORAGE_GB: "HardDrive",
  API_CALLS: "Code",
  BANDWIDTH_GB: "Globe",
};

function UsageProgress({
  label: labelProp,
  used,
  limit,
  percentage,
  projected,
  overage,
  overageCost,
  metric,
}: UsageStat) {
  const label = labelProp ?? METRIC_LABELS[metric] ?? metric;
  const isOverLimit = percentage >= 100;
  const isWarning = percentage >= 80 && !isOverLimit;
  const projectedOverLimit = projected > limit;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{label}</span>
          {isOverLimit && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500 text-red-500 font-medium">
              Over Limit
            </span>
          )}
          {isWarning && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">
              Warning
            </span>
          )}
        </div>
        <span className="text-sm text-gray-500">
          {used.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>

      <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isOverLimit
              ? "bg-red-500"
              : isWarning
              ? "bg-orange-500"
              : "bg-green-500"
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">{percentage}% used</span>
        {projectedOverLimit && (
          <span className="text-orange-600 font-medium">
            Projected: {projected.toLocaleString()}
          </span>
        )}
      </div>

      {overage > 0 && (
        <div className="flex items-center justify-between text-xs bg-red-500 rounded-lg px-3 py-2">
          <span className="text-red-500">
            Overage: {overage.toLocaleString()} units
          </span>
          <span className="text-red-500 font-medium">
            +{formatCurrency(overageCost)}
          </span>
        </div>
      )}
    </div>
  );
}

export function UsageDashboard() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      setLoading(true);
      const response = await apiJson<UsageData>("/merchant/billing/usage");
      setData(response);
    } catch (error) {
      console.error("[USAGE_DASHBOARD_ERROR]", error);
      toast.error("Failed to load usage data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-[20px] border border-gray-100 bg-white  p-6">
        <div className="flex items-center justify-center py-12">
          <Icon name="Spinner" className="animate-spin w-6 h-6 text-gray-400" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-[20px] border border-gray-100 bg-white  p-6">
        <div className="text-center py-8 text-gray-400">
          Failed to load usage data
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Usage & Limits</h2>
          <p className="text-sm text-gray-500">
            Monitor your resource usage and plan limits
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchUsage}
          className="gap-2"
        >
          <Icon name="ArrowClockwise" size={14} />
          Refresh
        </Button>
      </div>

      {/* Overage Alert */}
      {data.hasOverages && (
        <div className="bg-red-500 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
          <Icon
            name="WarningOctagon"
            className="text-red-500 shrink-0 mt-0.5"
            size={18}
          />
          <div className="flex-1">
            <h4 className="font-bold text-red-500 text-sm">
              Usage Overages Detected
            </h4>
            <p className="text-sm text-red-500/80 mt-0.5">
              You have exceeded your plan limits. Additional charges of{" "}
              <strong>{formatCurrency(data.totalOverageCost)}</strong> will be
              added to your next invoice.
            </p>
          </div>
        </div>
      )}

      {/* Projected Overages Warning */}
      {data.projectedOverages.length > 0 && !data.hasOverages && (
        <div className="bg-orange-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <Icon
            name="Warning"
            className="text-orange-600 shrink-0 mt-0.5"
            size={18}
          />
          <div className="flex-1">
            <h4 className="font-bold text-amber-800 text-sm">
              Projected Overage Alert
            </h4>
            <p className="text-sm text-orange-700 mt-0.5">
              Based on current usage, you may exceed your limits by month end.
              Consider upgrading to avoid overage charges.
            </p>
            <div className="mt-2 space-y-1">
              {data.projectedOverages.map((po) => (
                <div
                  key={po.metric}
                  className="text-xs text-orange-700 flex items-center gap-2"
                >
                  <span>{METRIC_LABELS[po.metric] || po.metric}:</span>
                  <span className="font-medium">
                    +{po.projectedOverage.toLocaleString()} units
                  </span>
                  <span>({formatCurrency(po.projectedCost)})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Usage Stats */}
      <div className="rounded-[20px] border border-gray-100 bg-white  p-6 space-y-6">
        {data.stats.map((stat) => (
          <UsageProgress
            key={stat.metric}
            label={METRIC_LABELS[stat.metric] || stat.metric}
            used={stat.used}
            limit={stat.limit}
            percentage={stat.percentage}
            projected={stat.projected}
            overage={stat.overage}
            overageCost={stat.overageCost}
            metric={stat.metric}
          />
        ))}
      </div>

      {/* Overage Pricing Info */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
        <h4 className="text-sm font-bold text-gray-900 mb-2">
          Overage Pricing
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
          <div>AI Tokens: ₦0.005/token</div>
          <div>WhatsApp Messages: ₦2.90/message</div>
          <div>WhatsApp Media: ₦5.00/media</div>
          <div>Storage: ₦100/GB</div>
        </div>
      </div>
    </div>
  );
}
