'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useVayvaTheme } from '@/components/vayva-ui/VayvaThemeProvider';
import type { DesignCategory } from '@/components/vayva-ui/VayvaThemeProvider';

export interface UniversalMetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
  className?: string;
  designCategory?: DesignCategory;
  onClick?: () => void;
  status?: 'default' | 'success' | 'warning' | 'error';
  'aria-label'?: string;
}

/**
 * UniversalMetricCard - A flexible metric card component that adapts to different design categories
 * Supports all 5 design categories: signature, glass, bold, dark, natural
 */
export function UniversalMetricCard({
  title,
  value,
  change,
  icon: Icon,
  trend,
  loading = false,
  className,
  designCategory: externalDesignCategory,
  onClick,
  status = 'default',
  'aria-label': ariaLabel
}: UniversalMetricCardProps) {
  const { designCategory: contextDesignCategory } = useVayvaTheme();
  const designCategory = externalDesignCategory || contextDesignCategory;

  // Get styling classes based on design category
  const getCardClasses = () => {
    const baseClasses =
      "group p-5 border-gray-100 hover:shadow-md transition-shadow duration-200 rounded-2xl";
    
    switch (designCategory) {
      case 'glass':
        return cn(baseClasses, "bg-white border border-gray-100");
      case 'bold':
        return cn(baseClasses, "bg-white border-2 border-black hover:border-gray-800");
      case 'dark':
        return cn(baseClasses, "bg-white border border-gray-100 text-gray-900");
      case 'natural':
        return cn(baseClasses, "bg-orange-50/80 hover:bg-orange-100/80 border border-amber-200/60");
      case 'signature':
      default:
        return cn(baseClasses, "bg-white border border-gray-100");
    }
  };

  const getTitleClasses = () => {
    const baseClasses = "text-xs font-medium text-gray-400 uppercase tracking-wider mb-2";
    
    switch (designCategory) {
      case 'dark':
        return cn(baseClasses, "text-gray-400");
      case 'bold':
        return cn(baseClasses, "text-gray-900");
      default:
        return baseClasses;
    }
  };

  const getValueClasses = () => {
    const baseClasses = "text-2xl font-bold text-gray-900 mb-1";
    
    switch (designCategory) {
      case 'dark':
        return cn(baseClasses, "text-gray-900");
      case 'bold':
        return cn(baseClasses, "text-gray-900");
      default:
        return baseClasses;
    }
  };

  const getIconContainerClasses = () => {
    const baseClasses = "p-2 rounded-lg transition-colors";
    
    switch (status) {
      case 'success':
        switch (designCategory) {
          case 'dark':
            return cn(baseClasses, "bg-green-100 text-green-600 group-hover:bg-green-500 group-hover:text-white");
          case 'bold':
            return cn(baseClasses, "bg-green-100 text-green-800 border-2 border-green-300");
          default:
            return cn(baseClasses, "bg-green-100/80 text-green-600 group-hover:bg-green-500 group-hover:text-white");
        }
      case 'warning':
        switch (designCategory) {
          case 'dark':
            return cn(baseClasses, "bg-orange-100 text-amber-600 group-hover:bg-orange-500 group-hover:text-white");
          case 'bold':
            return cn(baseClasses, "bg-orange-100 text-amber-800 border-2 border-amber-300");
          default:
            return cn(baseClasses, "bg-orange-100/80 text-orange-600 group-hover:bg-orange-500 group-hover:text-white");
        }
      case 'error':
        switch (designCategory) {
          case 'dark':
            return cn(baseClasses, "bg-red-100 text-red-600 group-hover:bg-red-500 group-hover:text-white");
          case 'bold':
            return cn(baseClasses, "bg-red-100 text-red-800 border-2 border-red-300");
          default:
            return cn(baseClasses, "bg-red-100/80 text-red-600 group-hover:bg-red-500 group-hover:text-white");
        }
      default:
        switch (designCategory) {
          case 'dark':
            return cn(baseClasses, "bg-gray-100 text-gray-400 group-hover:bg-gray-200");
          case 'bold':
            return cn(baseClasses, "bg-gray-100 text-gray-700 border-2 border-gray-300");
          default:
            return cn(baseClasses, "bg-gray-50 text-gray-600 group-hover:bg-gray-100");
        }
    }
  };

  const sparkValue = (() => {
    const v = change?.value ?? 0;
    if (!Number.isFinite(v)) return 0;
    return Math.max(0, Math.min(100, Math.round(Math.abs(v))));
  })();

  const showSpark = Boolean(change) || Boolean(trend);

  const getChangeClasses = () => {
    if (!change) return "";
    
    const baseClasses = "text-xs font-medium";
    
    if (change.isPositive) {
      switch (designCategory) {
        case 'dark':
          return cn(baseClasses, "text-green-600");
        case 'bold':
          return cn(baseClasses, "text-green-800");
        default:
          return cn(baseClasses, "text-green-600");
      }
    } else {
      switch (designCategory) {
        case 'dark':
          return cn(baseClasses, "text-red-600");
        case 'bold':
          return cn(baseClasses, "text-red-800");
        default:
          return cn(baseClasses, "text-danger");
      }
    }
  };

  if (loading) {
    return (
      <Card className={getCardClasses()}>
        <div className="space-y-3">
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-7 w-20 rounded" />
          <Skeleton className="h-3 w-12 rounded" />
        </div>
      </Card>
    );
  }

  const cardAriaLabel = ariaLabel || `${title}: ${value}${change ? `, ${change.isPositive ? 'up' : 'down'} ${Math.abs(change.value)}%` : ''}`;
  
  return (
    <Card 
      className={cn(getCardClasses(), className)}
      onClick={onClick}
      role={onClick ? 'button' : 'region'}
      tabIndex={onClick ? 0 : undefined}
      aria-label={cardAriaLabel}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <p className={getTitleClasses()}>
            {title}
          </p>
          {Icon ? (
            <div className={getIconContainerClasses()} aria-hidden="true">
              {Icon}
            </div>
          ) : null}
        </div>

        <p className={getValueClasses()}>
          {value}
        </p>

        {(change || trend) ? (
          <div className="flex items-center justify-between gap-3">
            <p className={getChangeClasses()}>
              {change 
                ? `${change.isPositive ? '↗' : '↘'} ${Math.abs(change.value)}%${change.label ? ` ${change.label}` : ''}`
                : `${trend === 'up' ? '↗' : '↘'} ${trend}`
              }
            </p>
            {showSpark ? (
              <div className="h-1.5 w-20 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full",
                    change?.isPositive ? "bg-green-500/70" : "bg-red-500/60"
                  )}
                  style={{ width: `${Math.max(8, sparkValue)}%` }}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </Card>
  );
}