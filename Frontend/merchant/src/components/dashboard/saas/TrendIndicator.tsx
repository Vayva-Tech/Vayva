'use client';

import React, { memo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendIndicatorProps {
  trend: 'up' | 'down' | 'neutral';
  value: number;
  className?: string;
}

export const TrendIndicator = memo(function TrendIndicator({ 
  trend, 
  value,
  className = ''
}: TrendIndicatorProps) {
  const isPositive = trend === 'up';
  const isNeutral = trend === 'neutral';
  
  const colorClass = isNeutral
    ? 'text-gray-400'
    : isPositive
    ? 'text-green-600'
    : 'text-error';
  
  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <div className={`flex items-center gap-1 text-xs font-bold ${colorClass} ${className}`}>
      <Icon size={14} />
      <span>{Math.abs(value).toFixed(1)}%</span>
    </div>
  );
});
