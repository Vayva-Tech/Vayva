// @ts-nocheck
'use client';

import React from 'react';

export interface MetricCardProps {
  /** Unique identifier for the metric card */
  id: string;
  
  /** Display title/label for the metric */
  title: string;
  
  /** The value to display */
  value: number | string;
  
  /** Formatting options for the value */
  format?: 'number' | 'currency' | 'percentage' | 'compact' | 'decimal';
  
  /** Currency code for currency formatting (default: USD) */
  currency?: string;
  
  /** Number of decimal places for numeric values */
  decimals?: number;
  
  /** Trend information for comparison */
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  
  /** Time period for comparison (e.g., "vs last month") */
  comparisonPeriod?: string;
  
  /** Threshold value that triggers alert styling */
  alertThreshold?: number;
  
  /** Whether to invert the trend coloring logic */
  invertTrend?: boolean;
  
  /** Icon component to display */
  icon?: React.ComponentType<{className?: string}>;
  
  /** Loading state */
  loading?: boolean;
  
  /** Card size variant */
  size?: 'small' | 'medium' | 'large';
  
  /** Design category for styling */
  designCategory?: 'light' | 'dark' | 'bold';
  
  /** Additional CSS classes */
  className?: string;
  
  /** Click handler */
  onClick?: () => void;
}

export function MetricCard({
  id,
  title,
  value,
  format = 'number',
  currency = 'USD',
  decimals = 2,
  trend,
  comparisonPeriod = 'vs previous period',
  alertThreshold,
  invertTrend = false,
  icon: Icon,
  loading = false,
  size = 'medium',
  designCategory = 'light',
  className = '',
  onClick,
}: MetricCardProps) {
  // Format the value based on type and format options
  const formattedValue = formatValue(value, format, currency, decimals);
  
  // Check if value meets alert threshold
  const isAlert = alertThreshold !== undefined && 
                  typeof value === 'number' && 
                  value < alertThreshold;

  // Determine trend direction with inversion logic
  const trendDirection = trend?.direction || 'neutral';
  const effectiveTrend = invertTrend 
    ? trendDirection === 'up' ? 'down' : trendDirection === 'down' ? 'up' : 'neutral'
    : trendDirection;

  // Size-based styling
  const sizeClasses = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  };

  // Design category styling
  const designClasses = {
    light: 'bg-white border border-gray-200',
    dark: 'bg-gray-900 border border-gray-700',
    bold: 'bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200',
  };

  const textClasses = {
    light: {
      title: 'text-gray-500',
      value: 'text-gray-900',
      trend: 'text-gray-600',
      comparison: 'text-gray-500',
    },
    dark: {
      title: 'text-gray-400',
      value: 'text-white',
      trend: 'text-gray-300',
      comparison: 'text-gray-400',
    },
    bold: {
      title: 'text-blue-600',
      value: 'text-gray-900',
      trend: 'text-blue-700',
      comparison: 'text-blue-600',
    },
  };

  const trendColors = {
    up: designCategory === 'dark' ? 'text-emerald-400' : 'text-green-600',
    down: designCategory === 'dark' ? 'text-rose-400' : 'text-red-600',
    neutral: designCategory === 'dark' ? 'text-gray-400' : 'text-gray-600',
  };

  if (loading) {
    return (
      <div className={`${designClasses[designCategory]} rounded-lg shadow ${sizeClasses[size]} ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${designClasses[designCategory]} rounded-lg shadow ${sizeClasses[size]} ${className} ${isAlert ? 'ring-2 ring-red-500' : ''} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {Icon && (
            <div className={`p-2 rounded-lg ${designCategory === 'dark' ? 'bg-gray-800' : designCategory === 'bold' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <Icon className={`w-5 h-5 ${textClasses[designCategory].title}`} />
            </div>
          )}
          <h3 className={`text-sm font-medium ${textClasses[designCategory].title}`}>{title}</h3>
        </div>
        
        {trend && (
          <span className={`flex items-center text-sm font-medium ${trendColors[effectiveTrend]}`}>
            {effectiveTrend === 'up' && (
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            )}
            {effectiveTrend === 'down' && (
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
            <span>{Math.abs(trend.value)}{trend.label || '%'}</span>
          </span>
        )}
      </div>
      
      <div className="mt-3">
        <span className={`font-bold ${size === 'large' ? 'text-4xl' : size === 'small' ? 'text-2xl' : 'text-3xl'} ${textClasses[designCategory].value}`}>
          {formattedValue}
        </span>
      </div>
      
      {trend && (
        <div className={`mt-2 text-xs ${textClasses[designCategory].comparison}`}>
          {comparisonPeriod}
        </div>
      )}
    </div>
  );
}

function formatValue(
  value: number | string, 
  format: string, 
  currency: string, 
  decimals: number
): string {
  if (typeof value === 'string') return value;
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(value);
    
    case 'percentage':
      return `${value.toFixed(decimals)}%`;
    
    case 'compact':
      return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: decimals,
      }).format(value);
    
    case 'decimal':
      return value.toFixed(decimals);
    
    default:
      return new Intl.NumberFormat('en-US').format(value);
  }
}