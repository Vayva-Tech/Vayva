'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useVayvaTheme } from '@/components/vayva-ui/VayvaThemeProvider';
import type { DesignCategory } from '@/components/vayva-ui/VayvaThemeProvider';

export interface UniversalTaskItemProps {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  dueDate?: string;
  onClick?: () => void;
  onToggle?: (id: string, completed: boolean) => void;
  loading?: boolean;
  className?: string;
  designCategory?: DesignCategory;
  compact?: boolean;
}

/**
 * UniversalTaskItem - A flexible task item component that adapts to different design categories
 * Supports priority levels, completion states, and various visual styles
 */
export function UniversalTaskItem({
  id,
  title,
  subtitle,
  icon: Icon,
  completed = false,
  priority = 'medium',
  category,
  dueDate,
  onClick,
  onToggle,
  loading = false,
  className,
  designCategory: externalDesignCategory,
  compact = false
}: UniversalTaskItemProps) {
  const { designCategory: contextDesignCategory } = useVayvaTheme();
  const designCategory = externalDesignCategory || contextDesignCategory;

  // Get priority styling
  const getPriorityColor = () => {
    switch (priority) {
      case 'critical':
        switch (designCategory) {
          case 'dark':
            return 'bg-red-100 text-red-600 border-red-200';
          case 'bold':
            return 'bg-red-900 text-white border-red-300';
          default:
            return 'bg-red-100/80 text-red-700 border-red-200/60';
        }
      case 'high':
        switch (designCategory) {
          case 'dark':
            return 'bg-orange-100 text-orange-600 border-orange-200';
          case 'bold':
            return 'bg-orange-900 text-white border-orange-300';
          default:
            return 'bg-orange-100/80 text-orange-700 border-orange-200/60';
        }
      case 'low':
        switch (designCategory) {
          case 'dark':
            return 'bg-gray-100 text-gray-600 border-gray-200';
          case 'bold':
            return 'bg-gray-100 text-gray-800 border-gray-300';
          default:
            return 'bg-gray-100/80 text-gray-600 border-gray-200/60';
        }
      case 'medium':
      default:
        switch (designCategory) {
          case 'dark':
            return 'bg-blue-100 text-blue-600 border-blue-200';
          case 'bold':
            return 'bg-blue-900 text-white border-blue-300';
          default:
            return 'bg-blue-100/80 text-blue-700 border-blue-200/60';
        }
    }
  };

  // Get container styling
  const getContainerClasses = () => {
    const baseClasses = "flex items-start gap-3 p-3 rounded-xl transition-colors cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2";
    
    switch (designCategory) {
      case 'glass':
        return cn(
          baseClasses,
          completed
            ? "bg-gray-50 border border-gray-100"
            : "hover:bg-gray-50 border border-gray-100"
        );
      case 'bold':
        return cn(
          baseClasses,
          "border-2",
          completed 
            ? "bg-gray-100 border-gray-400" 
            : "hover:bg-gray-50 border-black"
        );
      case 'dark':
        return cn(
          baseClasses,
          completed
            ? "bg-gray-50 border border-gray-100"
            : "hover:bg-gray-50 border border-gray-100"
        );
      case 'natural':
        return cn(
          baseClasses,
          completed 
            ? "bg-orange-100/60 border border-amber-200/60" 
            : "hover:bg-orange-100/80 border border-amber-200/80"
        );
      case 'signature':
      default:
        return cn(
          baseClasses,
          completed 
            ? "bg-white border border-gray-100" 
            : "hover:bg-white border border-gray-100"
        );
    }
  };

  // Get focus ring color
  const getFocusRingColor = () => {
    switch (designCategory) {
      case 'bold':
        return 'focus-within:ring-black';
      case 'dark':
        return 'focus-within:ring-gray-500';
      case 'natural':
        return 'focus-within:ring-amber-500';
      case 'signature':
      default:
        return 'focus-within:ring-green-500';
    }
  };

  // Get text styling
  const getTitleClasses = () => {
    const baseClasses = "text-sm font-medium truncate";
    
    if (completed) {
      switch (designCategory) {
        case 'dark':
          return cn(baseClasses, "text-gray-400 line-through");
        case 'bold':
          return cn(baseClasses, "text-gray-500 line-through");
        default:
          return cn(baseClasses, "text-gray-500 line-through");
      }
    } else {
      switch (designCategory) {
        case 'dark':
          return cn(baseClasses, "text-gray-900");
        case 'bold':
          return cn(baseClasses, "text-gray-900");
        default:
          return cn(baseClasses, "text-gray-900");
      }
    }
  };

  const getSubtitleClasses = () => {
    const baseClasses = "text-xs truncate";
    
    if (completed) {
      switch (designCategory) {
        case 'dark':
          return cn(baseClasses, "text-gray-400 line-through");
        case 'bold':
          return cn(baseClasses, "text-gray-400 line-through");
        default:
          return cn(baseClasses, "text-gray-400 line-through");
      }
    } else {
      switch (designCategory) {
        case 'dark':
          return cn(baseClasses, "text-gray-400");
        case 'bold':
          return cn(baseClasses, "text-gray-600");
        default:
          return cn(baseClasses, "text-gray-500");
      }
    }
  };

  const getIconContainerClasses = () => {
    const baseClasses = "w-8 h-8 rounded-lg flex items-center justify-center shrink-0";
    
    switch (designCategory) {
      case 'glass':
        return cn(baseClasses, "bg-gray-50 border border-gray-100");
      case 'bold':
        return cn(baseClasses, "bg-green-500 text-white border-green-600");
      case 'dark':
        return cn(baseClasses, "bg-gray-100 text-gray-600");
      case 'natural':
        return cn(baseClasses, "bg-amber-200/80 text-amber-800");
      case 'signature':
      default:
        return cn(baseClasses, "bg-white border border-gray-100");
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle?.(id, !completed);
  };

  const handleClick = () => {
    onClick?.();
  };

  if (loading) {
    return (
      <div className={cn(getContainerClasses(), "opacity-50", className)}>
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className={compact ? "h-8 w-8 rounded-lg" : "h-10 w-10 rounded-lg"} />
        <div className="flex-1 min-w-0 space-y-1">
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        getContainerClasses(),
        getFocusRingColor(),
        className
      )}
      onClick={handleClick}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <Checkbox
        checked={completed}
        onCheckedChange={() => {}}
        onClick={handleToggle}
        className={cn(
          "mt-0.5",
          designCategory === 'dark' && "border-gray-300 data-[state=checked]:bg-gray-600 data-[state=checked]:text-white",
          designCategory === 'bold' && "border-2 border-black data-[state=checked]:bg-black data-[state=checked]:text-white"
        )}
      />
      
      {Icon && (
        <div className={getIconContainerClasses()}>
          {Icon}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <p className={getTitleClasses()}>{title}</p>
        {subtitle && (
          <p className={getSubtitleClasses()}>{subtitle}</p>
        )}
      </div>
      
      <div className="flex items-center gap-2 shrink-0">
        {dueDate && (
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            completed
              ? designCategory === 'dark'
                ? "text-gray-500"
                : "text-gray-400"
              : new Date(dueDate) < new Date()
                ? designCategory === 'dark'
                  ? "text-red-400"
                  : designCategory === 'bold'
                    ? "text-red-800"
                    : "text-red-600"
                : designCategory === 'dark'
                  ? "text-gray-400"
                  : "text-gray-500"
          )}>
            {new Date(dueDate).toLocaleDateString()}
          </span>
        )}
        
        {category && (
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs font-medium border",
              designCategory === 'dark' ? "border-gray-200 text-gray-400" : "border-gray-100",
              completed && (designCategory === 'dark' ? "text-gray-400" : "text-gray-400")
            )}
          >
            {category}
          </Badge>
        )}
        
        <Badge 
          variant="outline" 
          className={cn(
            "text-xs font-medium border whitespace-nowrap",
            getPriorityColor(),
            completed && "opacity-60"
          )}
        >
          {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </Badge>
      </div>
    </div>
  );
}