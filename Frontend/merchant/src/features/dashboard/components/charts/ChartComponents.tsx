/**
 * Dashboard Chart Components
 * 
 * Reusable chart components for data visualization
 */

'use client';

import React from 'react';
import { cn } from '@vayva/ui';
import type { TrendDataPoint } from '../../types';

export interface BaseChartProps {
  data: TrendDataPoint[];
  title?: string;
  description?: string;
  className?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  loading?: boolean;
}

/**
 * Simple Line Chart Component
 * Using SVG for lightweight rendering
 */
export function RevenueChart({
  data,
  title = 'Revenue Trend',
  description,
  className,
  height = 300,
  showGrid = true,
  loading = false,
}: BaseChartProps) {
  if (loading) {
    return (
      <div
        className={cn(
          'rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700',
          className
        )}
        style={{ height }}
      >
        <div className="h-full w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const padding = 40;
  const chartWidth = 100; // percentage
  const chartHeight = height - padding * 2;

  // Generate points for line
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - (d.value / maxValue) * 100;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div
      className={cn(
        'rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700',
        className
      )}
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>

      {/* Chart */}
      <div className="relative" style={{ height }}>
        <svg
          viewBox={`0 0 100 ${chartHeight}`}
          className="h-full w-full"
          preserveAspectRatio="none"
        >
          {/* Grid Lines */}
          {showGrid && (
            <>
              {[0, 25, 50, 75, 100].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="100"
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  className="text-gray-500"
                />
              ))}
            </>
          )}

          {/* Area Fill */}
          <polygon
            points={`0,${chartHeight} ${points} 100,${chartHeight}`}
            fill="url(#gradient)"
            opacity="0.2"
          />

          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-blue-600"
          />

          {/* Gradient Definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="currentColor" className="text-blue-600" />
              <stop offset="100%" stopColor="currentColor" className="text-blue-200" />
            </linearGradient>
          </defs>

          {/* Data Points */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - (d.value / maxValue) * 100;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="1.5"
                className="fill-white stroke-blue-600 dark:fill-gray-800"
                strokeWidth="1"
              />
            );
          })}
        </svg>

        {/* X-Axis Labels */}
        <div className="absolute -bottom-2 left-0 right-0 flex justify-between text-xs text-gray-500 dark:text-gray-400">
          {data.filter((_, i) => i % Math.ceil(data.length / 5) === 0).map((d, i) => (
            <span key={i}>{formatDate(d.date)}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Bar Chart Component
 */
export function OrderTrendChart({
  data,
  title = 'Orders Trend',
  description,
  className,
  height = 300,
  loading = false,
}: BaseChartProps) {
  if (loading) {
    return (
      <div
        className={cn(
          'rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700',
          className
        )}
        style={{ height }}
      >
        <div className="h-full w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.count || d.value), 1);

  return (
    <div
      className={cn(
        'rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700',
        className
      )}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>

      <div className="flex h-[300px] items-end gap-2">
        {data.map((d, i) => {
          const value = d.count || d.value;
          const barHeight = (value / maxValue) * 100;
          return (
            <div
              key={i}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div
                className="w-full rounded-t bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                style={{ height: `${barHeight}%` }}
                title={`${value} orders`}
              />
              <span className="rotate-45 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                {formatDate(d.date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Conversion Rate Chart (Area Chart)
 */
export function ConversionChart({
  data,
  title = 'Conversion Rate',
  description,
  className,
  height = 200,
  loading = false,
}: BaseChartProps) {
  if (loading) {
    return (
      <div
        className={cn(
          'rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700',
          className
        )}
        style={{ height }}
      >
        <div className="h-full w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700',
        className
      )}
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {data.length > 0 ? ((data[data.length - 1].value || 0)).toFixed(1) : '0'}%
        </span>
        <span className="text-sm text-green-600">
          +2.3% from last week
        </span>
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
          style={{ width: `${Math.min((data[data.length - 1]?.value || 0), 100)}%` }}
        />
      </div>
    </div>
  );
}

// Helper functions
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}
