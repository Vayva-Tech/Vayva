'use client';

/**
 * Industry Dashboard Skeleton Component
 * Loading skeleton for all industry dashboards with progressive loading states
 */

import React from 'react';

export interface IndustryDashboardSkeletonProps {
  industry?: string;
  variant?: 'compact' | 'default' | 'expanded';
  showKPICards?: boolean;
  showCharts?: boolean;
  showAlerts?: boolean;
  className?: string;
}

export function IndustryDashboardSkeleton({
  industry = 'dashboard',
  variant = 'default',
  showKPICards = true,
  showCharts = true,
  showAlerts = true,
  className,
}: IndustryDashboardSkeletonProps) {
  const getGridCols = () => {
    switch (variant) {
      case 'compact':
        return 'grid-cols-2';
      case 'expanded':
        return 'grid-cols-4';
      default:
        return 'grid-cols-4';
    }
  };

  return (
    <div className={`w-full p-6 ${className || ''}`}>
      {/* Header Skeleton */}
      <div className="mb-8 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
            <div className="h-4 bg-gray-100 rounded w-64" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 rounded w-32" />
            <div className="h-10 bg-gray-200 rounded w-32" />
          </div>
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      {showKPICards && (
        <div className="mb-8 animate-pulse">
          <div className={`grid grid-cols-1 gap-4 sm:${getGridCols()} lg:${getGridCols()}`}>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow p-6 border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-8 w-8 bg-gray-200 rounded-full" />
                </div>
                <div className="h-8 bg-gray-200 rounded w-32 mb-2" />
                <div className="flex items-center gap-2">
                  <div className="h-3 bg-gray-100 rounded w-16" />
                  <div className="h-3 bg-green-100 rounded w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        {showCharts && (
          <div className="lg:col-span-2 space-y-6 animate-pulse">
            {/* Revenue Chart */}
            <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-gray-200 rounded w-40" />
                <div className="h-8 bg-gray-200 rounded w-24" />
              </div>
              <div className="h-64 bg-gray-100 rounded" />
              <div className="flex justify-between mt-4">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-12" />
                ))}
              </div>
            </div>

            {/* Trend Analysis */}
            <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-gray-200 rounded w-48" />
                <div className="h-8 bg-gray-200 rounded w-24" />
              </div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-4 bg-gray-200 rounded w-32" />
                    <div className="flex-1 h-2 bg-gray-100 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Alerts & Actions Section */}
        {showAlerts && (
          <div className="space-y-6 animate-pulse">
            {/* Alerts Panel */}
            <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 bg-gray-200 rounded" />
                <div className="h-6 bg-gray-200 rounded w-32" />
              </div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded"
                  >
                    <div className="h-4 w-4 bg-gray-300 rounded-full mt-0.5" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                      <div className="h-3 bg-gray-100 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Actions */}
            <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 bg-gray-200 rounded" />
                <div className="h-6 bg-gray-200 rounded w-40" />
              </div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 border border-gray-100 rounded"
                  >
                    <div className="h-10 w-10 bg-gray-200 rounded" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                      <div className="h-3 bg-gray-100 rounded w-3/4 mb-2" />
                      <div className="h-6 bg-gray-200 rounded w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                    <div className="h-4 bg-gray-100 rounded w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading Indicator */}
      <div className="fixed bottom-6 right-6 animate-pulse">
        <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200 flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500" />
          <span className="text-sm text-gray-600">Loading {industry} dashboard...</span>
        </div>
      </div>
    </div>
  );
}

export default IndustryDashboardSkeleton;
