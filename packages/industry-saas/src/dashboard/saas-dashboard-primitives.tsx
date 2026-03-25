'use client';

import React, { useCallback, useState } from 'react';
import type { DashboardVariant, IndustrySlug } from '@vayva/industry-core';

export function useUniversalDashboard(_args: {
  industry: IndustrySlug;
  variant: DashboardVariant;
  userId: string;
  businessId: string;
}) {
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    setLoading(true);
    window.setTimeout(() => setLoading(false), 250);
  }, []);

  return {
    data: {},
    config: {},
    loading,
    error: null as Error | null,
    lastUpdated: new Date(),
    refresh,
    isValidating: loading,
  };
}

export interface UniversalMetricCardProps {
  title: string;
  value: string;
  change?: { value: number; isPositive: boolean };
  icon?: React.ReactNode;
  loading?: boolean;
}

export function UniversalMetricCard({
  title,
  value,
  change,
  icon,
  loading,
}: UniversalMetricCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {loading ? '…' : value}
          </p>
          {change != null && !loading && (
            <p
              className={`mt-1 text-xs font-medium ${
                change.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {change.isPositive ? '+' : ''}
              {change.value}%
            </p>
          )}
        </div>
        {icon ? <div className="shrink-0 opacity-90">{icon}</div> : null}
      </div>
    </div>
  );
}

export interface UniversalSectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function UniversalSectionHeader({
  title,
  subtitle,
  icon,
}: UniversalSectionHeaderProps) {
  return (
    <div className="flex items-start gap-3">
      {icon ? <div className="mt-0.5 shrink-0">{icon}</div> : null}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

/** Placeholder for chart regions; SaaS dashboard uses static demo data today. */
export function UniversalChartContainer({
  title,
  children,
  className = '',
}: {
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-gray-100 bg-white p-4 shadow-sm ${className}`}
    >
      {title ? (
        <h3 className="mb-3 text-sm font-semibold text-gray-800">{title}</h3>
      ) : null}
      {children}
    </div>
  );
}
