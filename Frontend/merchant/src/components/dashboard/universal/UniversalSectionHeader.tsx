// @ts-nocheck
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useVayvaTheme } from '@/components/vayva-ui/VayvaThemeProvider';
import type { DesignCategory } from '@/components/vayva-ui/VayvaThemeProvider';

interface UniversalSectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  actionText?: string;
  onActionClick?: () => void;
  loading?: boolean;
  className?: string;
  designCategory?: DesignCategory;
  variant?: 'default' | 'compact' | 'minimal';
  'aria-label'?: string;
  'aria-describedby'?: string;
}

/**
 * UniversalSectionHeader - A flexible section header component that adapts to different design categories
 * Provides consistent section labeling with optional actions and icons
 */
export function UniversalSectionHeader({
  title,
  subtitle,
  icon: Icon,
  action,
  actionText,
  onActionClick,
  loading = false,
  className,
  designCategory: externalDesignCategory,
  variant = 'default',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy
}: UniversalSectionHeaderProps) {
  const { designCategory: contextDesignCategory } = useVayvaTheme();
  const designCategory = externalDesignCategory || contextDesignCategory;

  const getContainerClasses = () => {
    return "flex items-center justify-between mb-4";
  };

  const getTitleClasses = () => {
    const baseClasses = "font-semibold text-gray-900";
    
    switch (designCategory) {
      case 'dark':
        return cn(baseClasses, "text-white");
      case 'bold':
        return cn(baseClasses, "text-gray-900");
      default:
        return baseClasses;
    }
  };

  const getSubtitleClasses = () => {
    const baseClasses = "text-gray-500 ml-2";
    
    switch (designCategory) {
      case 'dark':
        return cn(baseClasses, "text-gray-300");
      case 'bold':
        return cn(baseClasses, "text-gray-700");
      default:
        return baseClasses;
    }
  };

  const getIconClasses = () => {
    const baseClasses = "text-gray-400";
    
    switch (designCategory) {
      case 'dark':
        return cn(baseClasses, "text-gray-300");
      case 'bold':
        return cn(baseClasses, "text-gray-700");
      default:
        return baseClasses;
    }
  };

  if (loading) {
    return (
      <div className={cn(getContainerClasses(), className)}>
        <div className={getTextContainerClasses()}>
          <Skeleton className="h-6 w-48 rounded" />
          <Skeleton className="h-4 w-64 mt-1 rounded" />
        </div>
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
    );
  }

  const headerAriaLabel = ariaLabel || `${title}${subtitle ? `: ${subtitle}` : ''}`;
  
  return (
    <div 
      className={cn(getContainerClasses(), className)}
      role="region"
      aria-label={headerAriaLabel}
      aria-describedby={ariaDescribedBy}
    >
      <div className="flex items-center gap-2">
        {Icon && (
          <div 
            className={getIconClasses()}
            aria-hidden="true"
          >
            {Icon}
          </div>
        )}
        <h3 className={getTitleClasses()}>
          {title}
        </h3>
        {subtitle && (
          <span className={getSubtitleClasses()}>
            {subtitle}
          </span>
        )}
      </div>
      
      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
      
      {actionText && onActionClick && (
        <Button
          onClick={onActionClick}
          size="sm"
          variant="outline"
          aria-label={`Action for ${title}: ${actionText}`}
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}