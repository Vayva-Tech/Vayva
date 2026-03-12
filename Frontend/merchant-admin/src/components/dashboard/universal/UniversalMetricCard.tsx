'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useVayvaTheme } from '@/components/vayva-ui/VayvaThemeProvider';
import type { DesignCategory } from '@/components/vayva-ui/VayvaThemeProvider';

interface UniversalMetricCardProps {
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
    const baseClasses = "p-5 border-border hover:shadow-md transition-shadow duration-200 rounded-xl";
    
    switch (designCategory) {
      case 'glass':
        return cn(baseClasses, "bg-white/80 hover:bg-white/90 border border-white/40");
      case 'bold':
        return cn(baseClasses, "bg-white border-2 border-black hover:border-gray-800");
      case 'dark':
        return cn(baseClasses, "bg-gray-900/90 border border-gray-700 hover:bg-gray-800/90 text-white");
      case 'natural':
        return cn(baseClasses, "bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/60");
      case 'signature':
      default:
        return cn(baseClasses, "bg-background border border-border/60");
    }
  };

  const getTitleClasses = () => {
    const baseClasses = "text-xs font-medium text-text-tertiary uppercase tracking-wider mb-2";
    
    switch (designCategory) {
      case 'dark':
        return cn(baseClasses, "text-gray-300");
      case 'bold':
        return cn(baseClasses, "text-gray-900");
      default:
        return baseClasses;
    }
  };

  const getValueClasses = () => {
    const baseClasses = "text-2xl font-bold text-text-primary mb-1";
    
    switch (designCategory) {
      case 'dark':
        return cn(baseClasses, "text-white");
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
            return cn(baseClasses, "bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white");
          case 'bold':
            return cn(baseClasses, "bg-emerald-100 text-emerald-800 border-2 border-emerald-300");
          default:
            return cn(baseClasses, "bg-emerald-100/80 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white");
        }
      case 'warning':
        switch (designCategory) {
          case 'dark':
            return cn(baseClasses, "bg-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-white");
          case 'bold':
            return cn(baseClasses, "bg-amber-100 text-amber-800 border-2 border-amber-300");
          default:
            return cn(baseClasses, "bg-amber-100/80 text-amber-600 group-hover:bg-amber-500 group-hover:text-white");
        }
      case 'error':
        switch (designCategory) {
          case 'dark':
            return cn(baseClasses, "bg-rose-500/20 text-rose-400 group-hover:bg-rose-500 group-hover:text-white");
          case 'bold':
            return cn(baseClasses, "bg-rose-100 text-rose-800 border-2 border-rose-300");
          default:
            return cn(baseClasses, "bg-rose-100/80 text-rose-600 group-hover:bg-rose-500 group-hover:text-white");
        }
      default:
        switch (designCategory) {
          case 'dark':
            return cn(baseClasses, "bg-gray-700/50 text-gray-300 group-hover:bg-gray-600 group-hover:text-white");
          case 'bold':
            return cn(baseClasses, "bg-gray-100 text-gray-700 border-2 border-gray-300");
          default:
            return cn(baseClasses, "bg-background/30 text-text-secondary group-hover:bg-background/40");
        }
    }
  };

  const getChangeClasses = () => {
    if (!change) return "";
    
    const baseClasses = "text-xs font-medium";
    
    if (change.isPositive) {
      switch (designCategory) {
        case 'dark':
          return cn(baseClasses, "text-emerald-400");
        case 'bold':
          return cn(baseClasses, "text-emerald-800");
        default:
          return cn(baseClasses, "text-success");
      }
    } else {
      switch (designCategory) {
        case 'dark':
          return cn(baseClasses, "text-rose-400");
        case 'bold':
          return cn(baseClasses, "text-rose-800");
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
        <p className={getTitleClasses()}>
          {title}
        </p>
        <p className={getValueClasses()}>
          {value}
        </p>
        {(change || trend) && (
          <p className={getChangeClasses()}>
            {change 
              ? `${change.isPositive ? '↗' : '↘'} ${Math.abs(change.value)}%${change.label ? ` ${change.label}` : ''}`
              : `${trend === 'up' ? '↗' : '↘'} ${trend}`
            }
          </p>
        )}
      </div>
    </Card>
  );
}