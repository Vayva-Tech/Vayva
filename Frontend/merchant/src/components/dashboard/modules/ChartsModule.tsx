"use client";

import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight } from 'lucide-react';
import cn from 'clsx';

interface ChartDataPoint {
  date: string;
  value: number;
}

interface RevenueChartProps {
  data: ChartDataPoint[];
  title?: string;
  showTrend?: boolean;
  className?: string;
}

/**
 * Revenue Trend Chart - Visual revenue history
 * Extracted from UniversalProDashboardV2
 */
export function RevenueChart({
  data = [],
  title = 'Revenue Trends',
  showTrend = true,
  className,
}: RevenueChartProps) {
  if (data.length === 0) return null;
  
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const currentValue = data[data.length - 1]?.value || 0;
  const previousValue = data[0]?.value || 0;
  const change = ((currentValue - previousValue) / previousValue) * 100;
  const isPositive = change >= 0;
  
  return (
    <div className={cn('bg-white rounded-2xl shadow-sm border border-gray-100 p-5', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {showTrend && (
          <div className={cn(
            'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold',
            isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          )}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>
      
      {/* Simple bar chart visualization */}
      <div className="h-32 flex items-end gap-1">
        {data.map((point, idx) => {
          const height = ((point.value - minValue) / (maxValue - minValue)) * 100;
          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center gap-1 group"
            >
              <div className="relative w-full">
                <div
                  className={cn(
                    'w-full rounded-t transition-all duration-300',
                    isPositive ? 'bg-green-500' : 'bg-red-500',
                    'group-hover:opacity-80'
                  )}
                  style={{ height: `${Math.max(height, 4)}px` }}
                />
              </div>
              <span className="text-[9px] text-gray-400 rotate-0 truncate w-full text-center">
                {point.date}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Current Period</span>
          <span className="text-lg font-bold text-gray-900">
            ₦{currentValue.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Donut Chart - For proportions (order status, etc.)
 */
interface DonutChartProps {
  segments: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  total?: number;
  title?: string;
  className?: string;
}

export function DonutChart({
  segments = [],
  total,
  title,
  className,
}: DonutChartProps) {
  const sum = segments.reduce((acc, seg) => acc + seg.value, 0);
  const displayTotal = total ?? sum;
  
  let cumulativePercent = 0;
  
  return (
    <div className={cn('bg-white rounded-2xl shadow-sm border border-gray-100 p-5', className)}>
      {title && (
        <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <div className="flex items-center gap-4">
        {/* Simple CSS conic gradient donut */}
        <div className="relative w-24 h-24">
          <div
            className="w-full h-full rounded-full"
            style={{
              background: `conic-gradient(${segments.map(seg => {
                const percent = (seg.value / sum) * 100;
                const start = cumulativePercent;
                cumulativePercent += percent;
                return `${seg.color} ${start}% ${cumulativePercent}%`;
              }).join(', ')})`,
            }}
          />
          <div className="absolute inset-2 bg-white rounded-full" />
        </div>
        
        <div className="flex-1 space-y-1">
          {segments.map((segment, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-xs text-gray-600">{segment.label}</span>
              <span className="text-xs font-semibold text-gray-900 ml-auto">
                {segment.value}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 text-center">
        <span className="text-xs text-gray-500">Total</span>
        <p className="text-lg font-bold text-gray-900">{displayTotal.toLocaleString()}</p>
      </div>
    </div>
  );
}

/**
 * Order Status Breakdown - Common use case
 */
export function OrderStatusChart({
  delivered,
  processing,
  pending,
  cancelled,
  title = 'Order Status',
}: {
  delivered: number;
  processing: number;
  pending: number;
  cancelled: number;
  title?: string;
}) {
  const segments = [
    { label: 'Delivered', value: delivered, color: '#10b981' }, // green-500
    { label: 'Processing', value: processing, color: '#3b82f6' }, // blue-500
    { label: 'Pending', value: pending, color: '#f59e0b' }, // amber-500
    { label: 'Cancelled', value: cancelled, color: '#ef4444' }, // red-500
  ].filter(s => s.value > 0);
  
  return <DonutChart segments={segments} title={title} />;
}

/**
 * Industry-specific chart presets
 */
export const IndustryCharts = {
  restaurant: {
    revenueByHour: () => ({
      title: 'Revenue by Hour',
      data: [
        { date: '9AM', value: 15000 },
        { date: '12PM', value: 85000 },
        { date: '3PM', value: 35000 },
        { date: '6PM', value: 120000 },
        { date: '9PM', value: 65000 },
      ],
    }),
    tableOccupancy: () => ({
      title: 'Table Occupancy',
      segments: [
        { label: 'Occupied', value: 18, color: '#10b981' },
        { label: 'Available', value: 7, color: '#9ca3af' },
        { label: 'Reserved', value: 5, color: '#3b82f6' },
      ],
    }),
  },
  retail: {
    salesByCategory: () => ({
      title: 'Sales by Category',
      segments: [
        { label: 'Electronics', value: 45, color: '#3b82f6' },
        { label: 'Clothing', value: 30, color: '#10b981' },
        { label: 'Home', value: 15, color: '#f59e0b' },
        { label: 'Other', value: 10, color: '#6b7280' },
      ],
    }),
  },
};
