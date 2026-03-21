"use client";

import React from "react";

interface KPIRowProps {
  metrics: {
    revenue: {
      value: number;
      growth: number;
      transactions: number;
    };
    listings: {
      value: number;
      growth: number;
    };
    leads: {
      value: number;
      growth: number;
    };
    showings: {
      value: number;
      growth: number;
    };
    conversion: {
      value: number;
      growth: number;
    };
  };
}

export const KPIRow: React.FC<KPIRowProps> = ({ metrics }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const TrendIndicator: React.FC<{ growth: number }> = ({ growth }) => {
    const isPositive = growth >= 0;
    return (
      <div className={`trend-indicator ${isPositive ? 'up' : 'down'}`}>
        {isPositive ? '↑' : '↓'}
        {Math.abs(growth).toFixed(1)}%
      </div>
    );
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    growth: number;
    icon?: string;
  }> = ({ title, value, growth, icon }) => (
    <div className="metric-card flex-1 min-w-[200px]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[var(--re-text-secondary)] text-sm font-medium">
          {title}
        </span>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      
      <div className="text-3xl font-bold mb-2">{value}</div>
      
      <TrendIndicator growth={growth} />
      
      {/* Mini sparkline placeholder */}
      <div className="sparkline-container">
        <svg width="100%" height="40" viewBox="0 0 100 40" preserveAspectRatio="none">
          <path
            d={`M0,35 Q10,${35 - Math.random() * 20} 20,${35 - Math.random() * 20} T40,${35 - Math.random() * 20} T60,${35 - Math.random() * 20} T80,${35 - Math.random() * 20} T100,${35 - Math.random() * 20}`}
            fill="none"
            stroke="var(--re-accent-primary)"
            strokeWidth="2"
            opacity="0.5"
          />
        </svg>
      </div>
    </div>
  );

  return (
    <div className="flex gap-4 overflow-x-auto re-scrollbar mb-6">
      <MetricCard
        title="Revenue"
        value={formatCurrency(metrics.revenue.value)}
        growth={metrics.revenue.growth}
        icon="💰"
      />
      
      <MetricCard
        title="Listings"
        value={formatNumber(metrics.listings.value)}
        growth={metrics.listings.growth}
        icon="🏠"
      />
      
      <MetricCard
        title="Leads"
        value={formatNumber(metrics.leads.value)}
        growth={metrics.leads.growth}
        icon="👥"
      />
      
      <MetricCard
        title="Showings"
        value={formatNumber(metrics.showings.value)}
        growth={metrics.showings.growth}
        icon="📅"
      />
      
      <MetricCard
        title="Conversion"
        value={`${metrics.conversion.value.toFixed(1)}%`}
        growth={metrics.conversion.growth}
        icon="📊"
      />
    </div>
  );
};
