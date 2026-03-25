'use client';

import React from 'react';

export interface PercentileGaugeProps {
  value: number;
  label: string;
  maxValue?: number;
  thresholds?: {
    low: number;
    medium: number;
    high: number;
  };
  className?: string;
}

export function PercentileGauge({
  value,
  label,
  maxValue = 100,
  thresholds = { low: 30, medium: 70, high: 90 },
  className = '',
}: PercentileGaugeProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  
  const getColor = () => {
    if (percentage >= thresholds.high) return 'text-green-600';
    if (percentage >= thresholds.medium) return 'text-yellow-600';
    if (percentage >= thresholds.low) return 'text-orange-600';
    return 'text-red-600';
  };

  const getBgColor = () => {
    if (percentage >= thresholds.high) return 'bg-green-500';
    if (percentage >= thresholds.medium) return 'bg-yellow-500';
    if (percentage >= thresholds.low) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className={`text-center ${className}`}>
      <div className="relative pt-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className={`text-sm font-bold ${getColor()}`}>{value}/{maxValue}</span>
        </div>
        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
          <div 
            style={{ width: `${percentage}%` }}
            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getBgColor()}`}
          ></div>
        </div>
        <div className="mt-1 text-xs text-gray-500">
          {percentage.toFixed(1)}% percentile
        </div>
      </div>
    </div>
  );
}