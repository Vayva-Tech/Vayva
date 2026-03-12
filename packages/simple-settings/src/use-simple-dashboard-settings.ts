import { useState, useEffect } from 'react';
import { getSimpleSettingsManager } from './simple-settings-manager.js';
import type { DashboardSettings, WidgetConfig } from './simple-settings-manager.js';

/**
 * React Hook: useSimpleDashboardSettings
 * 
 * Simplified hook for dashboard settings integration
 */
export function useSimpleDashboardSettings() {
  const [manager] = useState(() => getSimpleSettingsManager());
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [layoutLocked, setLayoutLocked] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(300);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  useEffect(() => {
    // Initialize with current settings
    setWidgets(manager.getWidgets());
    setLayoutLocked(manager.getDashboardSettings().layout.locked);
    setRefreshInterval(manager.getRefreshInterval());
    setAutoRefreshEnabled(manager.isAutoRefreshEnabled());
  }, [manager]);

  const updateWidgetPosition = (widgetId: string, position: { x: number; y: number; w: number; h: number }) => {
    manager.updateWidgetPosition(widgetId, position);
    setWidgets([...manager.getWidgets()]);
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    manager.toggleWidgetVisibility(widgetId);
    setWidgets([...manager.getWidgets()]);
  };

  const lockLayout = () => {
    manager.setLayoutLocked(true);
    setLayoutLocked(true);
  };

  const unlockLayout = () => {
    manager.setLayoutLocked(false);
    setLayoutLocked(false);
  };

  const setGlobalRefreshInterval = (interval: number) => {
    manager.setRefreshInterval(interval);
    setRefreshInterval(interval);
  };

  const toggleAutoRefresh = () => {
    const newValue = !manager.isAutoRefreshEnabled();
    manager.updateDashboardSettings({ 
      refresh: { 
        ...manager.getDashboardSettings().refresh, 
        autoRefreshEnabled: newValue 
      } 
    });
    setAutoRefreshEnabled(newValue);
  };

  return {
    // Dashboard settings
    dashboard: manager.getDashboardSettings(),
    
    // Widgets
    widgets,
    updateWidgetPosition,
    toggleWidgetVisibility,
    
    // Layout
    layoutLocked,
    lockLayout,
    unlockLayout,
    
    // Refresh
    autoRefreshEnabled,
    refreshInterval,
    setGlobalRefreshInterval,
    toggleAutoRefresh,
  };
}