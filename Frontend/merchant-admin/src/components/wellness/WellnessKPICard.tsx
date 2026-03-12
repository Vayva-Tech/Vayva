"use client";

import { TrendingUp, TrendingDown } from "@phosphor-icons/react/ssr";

interface KPICardProps {
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function WellnessKPICard({ 
  title, 
  value, 
  trend, 
  trendLabel = "vs last period",
  icon,
  className = ""
}: KPICardProps) {
  const isPositive = trend !== undefined ? trend >= 0 : true;
  
  return (
    <div className={`bg-card rounded-xl p-6 shadow-lg border ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon && <div className="text-primary">{icon}</div>}
      </div>
      
      <div className="mb-2">
        <div className="text-3xl font-bold text-foreground">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      </div>
      
      {trend !== undefined && (
        <div className="flex items-center gap-1">
          <div className={`flex items-center text-sm font-medium ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? (
              <TrendingUp className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1" />
            )}
            {isPositive ? '▲' : '▼'} {Math.abs(trend)}%
          </div>
          <span className="text-xs text-muted-foreground">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}