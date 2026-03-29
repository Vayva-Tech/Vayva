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
  trend,
  dailyAverage,
  metric,
  onPurchaseAddon,
}: UsageStat & { onPurchaseAddon?: () => void }) {
  const label = labelProp ?? METRIC_LABELS[metric] ?? metric;
  const isOverLimit = percentage >= 100;
  const isWarning = percentage >= 80 && !isOverLimit;
  const projectedOverLimit = projected > limit;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Icon 
            name={METRIC_ICONS[metric] as any || "Activity"} 
            className="w-5 h-5 text-gray-500" 
          />
          <span className="font-medium">{label}</span>
          {trend && (
            <span className={cn(
              "text-xs px-2 py-1 rounded-full",
              trend === 'increasing' ? "bg-red-100 text-red-800" :
              trend === 'decreasing' ? "bg-green-100 text-green-800" :
              "bg-gray-100 text-gray-800"
            )}>
              {trend === 'increasing' ? '↗' : trend === 'decreasing' ? '↘' : '→'}
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">
            {used.toLocaleString()} / {limit === Infinity ? '∞' : limit.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">
            {percentage.toFixed(1)}% used
            {dailyAverage && (
              <span className="ml-2">
                ({dailyAverage.toFixed(1)}/day avg)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div
          className={cn(
            "h-2.5 rounded-full transition-all duration-300",
            isOverLimit ? "bg-red-500" :
            isWarning ? "bg-orange-500" :
            "bg-green-500"
          )}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
        {projectedOverLimit && (
          <div
            className="h-2.5 bg-red-500 rounded-full -mt-2.5 transition-all duration-300"
            style={{ 
              width: `${Math.min(100, (projected / limit) * 100)}%`,
              marginLeft: `${Math.min(100, percentage)}%`
            }}
          />
        )}
      </div>

      {/* Action buttons and info */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-4">
          {projectedOverLimit && (
            <div className="flex items-center gap-1 text-orange-600">
              <Icon name="TrendingUp" className="w-4 h-4" />
              <span>Projected: {projected.toLocaleString()}</span>
            </div>
          )}
          {overage > 0 && (
            <div className="flex items-center gap-1 text-red-500">
              <Icon name="AlertTriangle" className="w-4 h-4" />
              <span>Overage: +{overage.toLocaleString()} (${formatCurrency(overageCost)})</span>
            </div>
          )}
        </div>
        
        {onPurchaseAddon && (isWarning || isOverLimit || projectedOverLimit) && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={onPurchaseAddon}
            className="text-xs"
          >
            <Icon name="Plus" className="w-3 h-3 mr-1" />
            Buy Addon (₦5,000)
          </Button>
        )}
      </div>
    </div>
  );
}

export function EnhancedUsageDashboard() {
  const [data, setData] = useState<UsageData | null>(null);
  const [predictions, setPredictions] = useState<ProUsagePrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentTier, canUseAI } = useIndustryAccess();

  useEffect(() => {
    fetchUsageData();
    if (currentTier === 'PRO') {
      fetchProPredictions();
    }
  }, [currentTier]);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      const result = await apiJson<UsageData>("/billing/quota-status");
      setData(result);
    } catch (error) {
      toast.error("Failed to load usage data");
    } finally {
      setLoading(false);
    }
  };

  const fetchProPredictions = async () => {
    try {
      const result = await apiJson<ProUsagePrediction[]>("/billing/predictions");
      setPredictions(result);
    } catch (error) {
      // Silently fail for non-critical feature
    }
  };

  const handlePurchaseAddon = async (metric: string) => {
    try {
      const result = await apiJson<{ success?: boolean }>("/billing/purchase-addon", {
        method: "POST",
        body: JSON.stringify({ metric, quantity: 1 })
      });
      
      if (result?.success) {
        toast.success("Addon purchased successfully!");
        fetchUsageData(); // Refresh data
      }
    } catch (error) {
      toast.error("Failed to purchase addon");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load usage data</p>
        <Button onClick={fetchUsageData} className="mt-4">Retry</Button>
      </div>
    );
  }

  // Show AI paywall for Free users trying to access AI features
  if (!canUseAI) {
    return <AIFeaturePaywall currentTier={currentTier} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Usage Dashboard</h2>
          <p className="text-gray-500">
            Track your resource usage with predictive analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchUsageData}>
            <Icon name="Refresh" className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {currentTier === 'PRO' && (
            <Button onClick={fetchProPredictions}>
              <Icon name="TrendingUp" className="w-4 h-4 mr-2" />
              Predictions
            </Button>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {data.recommendations && data.recommendations.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-orange-50 p-4">
          <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
            <Icon name="Lightbulb" className="w-5 h-5" />
            Smart Recommendations
          </h3>
          <ul className="space-y-1 text-orange-700">
            {data.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2">
                <span>•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Upgrade Recommendation */}
      {data.upgradeRecommended && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Plan Recommendation</h3>
          <p className="text-blue-700 mb-3">
            Based on your usage patterns, we recommend upgrading to the {data.upgradeRecommended} plan.
          </p>
          <Button className="bg-blue-500 hover:bg-blue-600">
            Upgrade to {data.upgradeRecommended}
          </Button>
        </div>
      )}

      {/* Pro Predictions Section */}
      {currentTier === 'PRO' && predictions.length > 0 && (
        <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
          <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
            <Icon name="TrendingUp" className="w-5 h-5" />
            AI-Powered Predictions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {predictions.map((prediction) => (
              <div 
                key={prediction.metric} 
                className={cn(
                  "p-3 rounded-lg border",
                  prediction.recommendedAction === 'upgrade_plan' ? "border-red-200 bg-red-50" :
                  prediction.recommendedAction === 'purchase_addon' ? "border-yellow-200 bg-yellow-50" :
                  "border-green-200 bg-green-50"
                )}
              >
                <div className="font-medium text-sm">
                  {METRIC_LABELS[prediction.metric] || prediction.metric}
                </div>
                <div className="text-xs mt-1">
                  {prediction.daysUntilLimit > 0 ? (
                    <>
                      <span className="text-gray-500">Reach limit in </span>
                      <span className="font-medium">{prediction.daysUntilLimit} days</span>
                    </>
                  ) : (
                    <span className="text-red-600 font-medium">Limit reached!</span>
                  )}
                </div>
                <div className="text-xs mt-1">
                  <span className="text-gray-500">Confidence: </span>
                  <span className="font-medium">{(prediction.confidence * 100).toFixed(0)}%</span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full mt-2 text-xs"
                  onClick={() => handlePurchaseAddon(prediction.metric)}
                >
                  {prediction.recommendedAction === 'purchase_addon' ? 'Buy Addon' : 'Upgrade Plan'}
                </Button>
              </div>
            ))}
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
            trend={stat.trend}
            dailyAverage={stat.dailyAverage}
            metric={stat.metric}
            onPurchaseAddon={() => handlePurchaseAddon(stat.metric)}
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