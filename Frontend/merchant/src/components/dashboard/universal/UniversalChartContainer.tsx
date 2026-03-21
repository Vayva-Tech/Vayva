'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useVayvaTheme } from '@/components/vayva-ui/VayvaThemeProvider';
import type { DesignCategory } from '@/components/vayva-ui/VayvaThemeProvider';

interface UniversalChartContainerProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  emptyState?: {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
  };
  height?: number | string;
  className?: string;
  designCategory?: DesignCategory;
  showHeader?: boolean;
  actions?: React.ReactNode;
}

/**
 * UniversalChartContainer - A flexible chart container that wraps Recharts components
 * Provides consistent styling and handling for loading, error, and empty states
 */
export function UniversalChartContainer({
  title,
  subtitle,
  children,
  loading = false,
  error = null,
  emptyState,
  height = 350,
  className,
  designCategory: externalDesignCategory,
  showHeader = true,
  actions
}: UniversalChartContainerProps) {
  const { designCategory: contextDesignCategory } = useVayvaTheme();
  const designCategory = externalDesignCategory || contextDesignCategory;

  // Get card styling classes
  const getCardClasses = () => {
    const baseClasses = "rounded-2xl border border-gray-100   overflow-hidden";
    
    switch (designCategory) {
      case 'glass':
        return cn(baseClasses, "bg-white/80 border-white/40");
      case 'bold':
        return cn(baseClasses, "bg-white border-2 border-black");
      case 'dark':
        return cn(baseClasses, "bg-gray-900/90 border-gray-700");
      case 'natural':
        return cn(baseClasses, "bg-orange-50/80 border-amber-200/60");
      case 'signature':
      default:
        return cn(baseClasses, "bg-white");
    }
  };

  const getHeaderClasses = () => {
    const baseClasses = "bg-white p-6 border-b border-gray-100";
    
    switch (designCategory) {
      case 'dark':
        return cn(baseClasses, "bg-gray-800/60 border-gray-700");
      case 'bold':
        return cn(baseClasses, "bg-gray-50 border-gray-300");
      default:
        return baseClasses;
    }
  };

  const getTitleClasses = () => {
    const baseClasses = "text-lg font-bold";
    
    switch (designCategory) {
      case 'dark':
        return cn(baseClasses, "text-white");
      case 'bold':
        return cn(baseClasses, "text-gray-900");
      default:
        return cn(baseClasses, "text-gray-900");
    }
  };

  const getSubtitleClasses = () => {
    const baseClasses = "text-sm";
    
    switch (designCategory) {
      case 'dark':
        return cn(baseClasses, "text-gray-300");
      case 'bold':
        return cn(baseClasses, "text-gray-700");
      default:
        return cn(baseClasses, "text-gray-500");
    }
  };

  const getContentClasses = () => {
    const baseClasses = "p-6";
    
    switch (designCategory) {
      case 'dark':
        return cn(baseClasses, "bg-gray-900/50");
      case 'bold':
        return cn(baseClasses, "bg-gray-50");
      default:
        return baseClasses;
    }
  };

  // Handle loading state
  if (loading) {
    return (
      <Card className={getCardClasses()}>
        {showHeader && (
          <CardHeader className={getHeaderClasses()}>
            <div className="space-y-2">
              <Skeleton className="h-6 w-48 rounded" />
              <Skeleton className="h-4 w-64 rounded" />
            </div>
          </CardHeader>
        )}
        <CardContent className={getContentClasses()}>
          <div 
            className="w-full rounded-2xl flex items-center justify-center"
            style={{ height }}
          >
            <Skeleton className="h-full w-full rounded-2xl" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Card className={getCardClasses()}>
        {showHeader && (
          <CardHeader className={getHeaderClasses()}>
            <div className="space-y-2">
              {title && <CardTitle className={getTitleClasses()}>{title}</CardTitle>}
              {subtitle && <p className={getSubtitleClasses()}>{subtitle}</p>}
            </div>
          </CardHeader>
        )}
        <CardContent className={cn(getContentClasses(), "flex flex-col items-center justify-center text-center gap-4")}>
          <div className="text-5xl">⚠️</div>
          <div>
            <h3 className={cn(
              "text-lg font-semibold mb-2",
              designCategory === 'dark' ? "text-white" : "text-gray-900"
            )}>
              Something went wrong
            </h3>
            <p className={cn(
              "text-sm max-w-md",
              designCategory === 'dark' ? "text-gray-300" : "text-gray-500"
            )}>
              {error}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-colors",
              designCategory === 'dark' 
                ? "bg-gray-800 text-white hover:bg-gray-700"
                : designCategory === 'bold'
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-green-500 text-white hover:bg-green-500"
            )}
          >
            Try Again
          </button>
        </CardContent>
      </Card>
    );
  }

  // Handle empty state
  if (emptyState) {
    return (
      <Card className={getCardClasses()}>
        {showHeader && (
          <CardHeader className={getHeaderClasses()}>
            <div className="space-y-2">
              {title && <CardTitle className={getTitleClasses()}>{title}</CardTitle>}
              {subtitle && <p className={getSubtitleClasses()}>{subtitle}</p>}
            </div>
          </CardHeader>
        )}
        <CardContent className={cn(getContentClasses(), "flex flex-col items-center justify-center text-center gap-4")}>
          <div className="text-5xl opacity-50">
            {emptyState.icon || '📊'}
          </div>
          <div>
            <h3 className={cn(
              "text-lg font-semibold mb-2",
              designCategory === 'dark' ? "text-white" : "text-gray-900"
            )}>
              {emptyState.title}
            </h3>
            {emptyState.description && (
              <p className={cn(
                "text-sm max-w-md",
                designCategory === 'dark' ? "text-gray-300" : "text-gray-500"
              )}>
                {emptyState.description}
              </p>
            )}
          </div>
          {emptyState.action}
        </CardContent>
      </Card>
    );
  }

  // Render chart content
  return (
    <Card className={cn(getCardClasses(), className)}>
      {(showHeader || actions) && (
        <CardHeader className={cn(getHeaderClasses(), "flex flex-row items-center justify-between")}>
          <div className="space-y-1">
            {title && <CardTitle className={getTitleClasses()}>{title}</CardTitle>}
            {subtitle && <p className={getSubtitleClasses()}>{subtitle}</p>}
          </div>
          {actions && <div>{actions}</div>}
        </CardHeader>
      )}
      <CardContent className={getContentClasses()}>
        <div style={{ height }}>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper hook for chart data management
export function useChartData<T>(
  fetchData: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchData();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, deps);

  const retry = React.useCallback(() => {
    setLoading(true);
    setError(null);
    fetchData()
      .then(setData)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load data'))
      .finally(() => setLoading(false));
  }, [fetchData]);

  return { data, loading, error, retry };
}

// Predefined empty states
export const ChartEmptyStates = {
  noData: {
    title: "No data available",
    description: "There's no data to display for the selected period",
    icon: "📉"
  },
  noSales: {
    title: "No sales yet",
    description: "Start selling to see your sales performance here",
    icon: "💰"
  },
  noTraffic: {
    title: "No traffic data",
    description: "Connect your analytics to see website traffic",
    icon: "🌐"
  },
  comingSoon: {
    title: "Coming soon",
    description: "This chart will be available in the next update",
    icon: "🚀"
  }
};