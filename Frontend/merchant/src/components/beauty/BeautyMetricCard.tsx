// @ts-nocheck
"use client";

import { Card, Badge, cn } from "@vayva/ui";
import { TrendChart } from "@vayva/industry-core";

interface BeautyMetricCardProps {
  title: string;
  value: string;
  trend?: number;
  icon: string;
  isLoading?: boolean;
}

export function BeautyMetricCard({
  title,
  value,
  trend = 0,
  icon,
  isLoading = false,
}: BeautyMetricCardProps) {
  const isPositive = trend >= 0;
  
  return (
    <Card className="glass-panel p-4 border border-white/10 hover:border-red-400/30 transition-all duration-300 metric-glow">
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/10 rounded w-24"></div>
          <div className="h-8 bg-white/10 rounded w-full"></div>
          <div className="h-4 bg-white/10 rounded w-16"></div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm font-medium">{title}</span>
            <Badge variant="secondary" className="bg-white/5 text-white border-white/10">
              <Icon name={icon} className="w-3 h-3" />
            </Badge>
          </div>
          
          <div className="text-2xl font-bold text-white mb-2">{value}</div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {trend !== 0 && (
                <>
                  <Icon
                    name={isPositive ? "TrendingUp" : "TrendingDown"}
                    className={cn(
                      "w-3 h-3",
                      isPositive ? "text-green-400" : "text-red-400"
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isPositive ? "text-green-400" : "text-red-400"
                    )}
                  >
                    {Math.abs(trend)}%
                  </span>
                </>
              )}
            </div>
            
            {/* Mini sparkline chart */}
            <div className="w-16 h-8 opacity-50">
              <SparklineChart
                data={[65, 72, 68, 75, 82, 88, 95]}
                color={isPositive ? "#10B981" : "#EF4444"}
              />
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
