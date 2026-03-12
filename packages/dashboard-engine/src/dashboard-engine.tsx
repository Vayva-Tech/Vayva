'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDashboardSettings } from '@vayva/settings';
import type { WidgetConfig } from '@vayva/settings';

// Import enhanced widget components
import { 
  EnhancedMetricCard, 
  ChartWidget, 
  TableWidget, 
  StatusWidget 
} from './components/enhanced-widgets';

// Widget registry mapping widget types to components
const WIDGET_COMPONENTS: Record<string, React.ComponentType<any>> = {
  // Enhanced metric cards
  'metric-card': EnhancedMetricCard,
  'kpi-card': EnhancedMetricCard,
  'revenue-metric': EnhancedMetricCard,
  'conversion-metric': EnhancedMetricCard,
  
  // Chart widgets
  'revenue-chart': ChartWidget,
  'performance-trends': ChartWidget,
  'traffic-chart': ChartWidget,
  'conversion-chart': ChartWidget,
  
  // Data tables
  'recent-orders': TableWidget,
  'top-products': TableWidget,
  'customer-list': TableWidget,
  'transaction-history': TableWidget,
  
  // Status monitors
  'system-status': StatusWidget,
  'server-health': StatusWidget,
  'api-monitor': StatusWidget,
  
  // Fallback for unknown types
  'default': EnhancedMetricCard,
};

interface DashboardEngineProps {
  /**
   * Custom widget components to register
   */
  customWidgets?: Record<string, React.ComponentType<any>>;
  
  /**
   * Callback when widget data is refreshed
   */
  onDataRefresh?: (widgetId: string, data: any) => void;
  
  /**
   * Loading state override
   */
  loading?: boolean;
  
  /**
   * Error state override
   */
  error?: string | null;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

export function DashboardEngine({
  customWidgets = {},
  onDataRefresh,
  loading: externalLoading,
  error: externalError,
  className = '',
}: DashboardEngineProps) {
  // Get dashboard settings from settings manager
  const {
    widgets: registeredWidgets,
    refreshInterval: globalRefreshInterval,
    autoRefreshEnabled,
  } = useDashboardSettings();

  const [widgetData, setWidgetData] = useState<Record<string, any>>({});
  const [widgetErrors, setWidgetErrors] = useState<Record<string, string>>({});
  const [widgetLoading, setWidgetLoading] = useState<Record<string, boolean>>({});
  const [lastRefreshTimes, setLastRefreshTimes] = useState<Record<string, Date>>({});

  // Merge custom widgets with default widget registry
  const widgetRegistry = useMemo(() => ({
    ...WIDGET_COMPONENTS,
    ...customWidgets,
  }), [customWidgets]);

  // Filter visible widgets based on settings
  const visibleWidgets = useMemo(() => {
    return registeredWidgets.filter((widget: WidgetConfig) => widget.visible);
  }, [registeredWidgets]);

  // Fetch widget data
  const fetchWidgetData = useCallback(async (widget: WidgetConfig) => {
    if (!widget.dataSource) return null;

    try {
      setWidgetLoading(prev => ({ ...prev, [widget.id]: true }));
      setWidgetErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[widget.id];
        return newErrors;
      });

      // Determine refresh interval (widget-specific or global)
      const refreshInterval = widget.refreshInterval > 0 
        ? widget.refreshInterval 
        : globalRefreshInterval;

      // Check if data is cached and still valid
      const lastRefresh = lastRefreshTimes[widget.id];
      const now = new Date();
      const cacheValid = lastRefresh && 
                        (now.getTime() - lastRefresh.getTime()) < (refreshInterval * 1000);

      if (cacheValid && widgetData[widget.id]) {
        setWidgetLoading(prev => ({ ...prev, [widget.id]: false }));
        return widgetData[widget.id];
      }

      // Fetch fresh data - now with real API support
      let data;
      if (widget.dataSource.startsWith('/')) {
        // Relative API path - use fetch
        const response = await fetch(widget.dataSource, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add auth headers if needed
            // 'Authorization': `Bearer ${token}`
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        data = await response.json();
      } else if (widget.dataSource.startsWith('http')) {
        // Absolute URL - fetch directly
        const response = await fetch(widget.dataSource);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        data = await response.json();
      } else {
        // Simulate data for demo purposes
        await new Promise(resolve => setTimeout(resolve, 500));
        data = {
          value: Math.floor(Math.random() * 10000),
          trend: Math.floor(Math.random() * 20) - 10,
          label: widget.title || widget.type,
          timestamp: new Date().toISOString()
        };
      }
      
      // Cache the data
      setWidgetData(prev => ({ ...prev, [widget.id]: data }));
      setLastRefreshTimes(prev => ({ ...prev, [widget.id]: now }));
      
      // Notify parent of data refresh
      onDataRefresh?.(widget.id, data);
      
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
      setWidgetErrors(prev => ({ ...prev, [widget.id]: errorMessage }));
      console.error(`[DashboardEngine] Failed to fetch data for widget ${widget.id}:`, error);
      return null;
    } finally {
      setWidgetLoading(prev => ({ ...prev, [widget.id]: false }));
    }
  }, [widgetData, lastRefreshTimes, globalRefreshInterval, onDataRefresh]);

  // Initialize widget data on mount and when widgets change
  useEffect(() => {
    visibleWidgets.forEach((widget: WidgetConfig) => {
      if (!widgetData[widget.id]) {
        fetchWidgetData(widget);
      }
    });
  }, [visibleWidgets, fetchWidgetData, widgetData]);

  // Set up auto-refresh intervals
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const intervals: NodeJS.Timeout[] = [];

    visibleWidgets.forEach((widget: WidgetConfig) => {
      const refreshInterval = widget.refreshInterval > 0 
        ? widget.refreshInterval 
        : globalRefreshInterval;

      if (refreshInterval > 0) {
        const interval = setInterval(() => {
          fetchWidgetData(widget);
        }, refreshInterval * 1000);

        intervals.push(interval);
      }
    });

    // Cleanup intervals on unmount or when dependencies change
    return () => {
      intervals.forEach(clearInterval);
    };
  }, [visibleWidgets, autoRefreshEnabled, globalRefreshInterval, fetchWidgetData]);

  // Render loading state
  if (externalLoading) {
    return (
      <div className={`dashboard-engine-loading flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (externalError) {
    return (
      <div className={`dashboard-engine-error p-8 text-center ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Dashboard Error</h3>
          <p className="text-red-600 mb-4">{externalError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Reload Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Render empty state
  if (visibleWidgets.length === 0) {
    return (
      <div className={`dashboard-engine-empty p-8 text-center ${className}`}>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-2xl mx-auto">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Widgets Configured</h3>
          <p className="text-gray-600 mb-6">
            Your dashboard is empty. Add some widgets to get started.
          </p>
          <button
            onClick={() => {
              // This would typically open the widget selector
              console.log('Open widget selector');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Widgets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-engine ${className}`}>
      {/* Dashboard Grid - Simple CSS Grid for now */}
      <div className="dashboard-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {visibleWidgets.map((widget: WidgetConfig) => {
          const WidgetComponent = widgetRegistry[widget.type] || widgetRegistry['default'];
          
          return (
            <WidgetComponent
              key={widget.id}
              widget={widget}
              data={widgetData[widget.id]}
              isLoading={widgetLoading[widget.id] || false}
              error={widgetErrors[widget.id]}
            />
          );
        })}
      </div>

      {/* Auto-refresh indicator */}
      {autoRefreshEnabled && (
        <div className="dashboard-refresh-indicator fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm shadow-lg">
          <div className="flex items-center gap-2">
            <div className="animate-pulse w-2 h-2 bg-white rounded-full"></div>
            <span>Auto-refresh enabled</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Export types for consumers
export type { DashboardEngineProps };