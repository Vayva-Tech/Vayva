import { useSettings } from './use-settings';
import type { DashboardSettings } from '../index.simplified';

export function useDashboardSettings() {
  const { settings, updateDashboardSettings, saveAllSettings } = useSettings();
  const dashboard = settings.dashboard;

  // Widget management
  const addWidget = async (widget: any) => {
    const newWidget = {
      id: widget.id || `widget-${Date.now()}`,
      type: widget.type || 'custom',
      position: { x: 0, y: 0, w: 6, h: 3 },
      config: widget.config || {},
    };

    await updateDashboardSettings({
      widgets: {
        ...dashboard.widgets,
        registry: [...dashboard.widgets.registry, newWidget],
      },
    });

    return newWidget;
  };

  const removeWidget = async (widgetId: string) => {
    await updateDashboardSettings({
      widgets: {
        ...dashboard.widgets,
        registry: dashboard.widgets.registry.filter((w: any) => w.id !== widgetId),
      },
    });
  };

  const updateWidget = async (widgetId: string, updates: any) => {
    await updateDashboardSettings({
      widgets: {
        ...dashboard.widgets,
        registry: dashboard.widgets.registry.map((w: any) =>
          w.id === widgetId ? { ...w, ...updates } : w
        ),
      },
    });
  };

  const toggleWidgetVisibility = async (widgetId: string) => {
    const widget = dashboard.widgets.registry.find((w: any) => w.id === widgetId);
    if (widget) {
      const currentConfig = widget.config || {};
      await updateWidget(widgetId, { config: { ...currentConfig, visible: !(currentConfig as any).visible } });
    }
  };

  // Layout management
  const setActiveLayout = async (presetId: string) => {
    await updateDashboardSettings({
      layout: presetId as any,
    });
  };

  const lockLayout = async () => {
    await updateDashboardSettings({
      layout: 'grid' as any,
    });
  };

  const unlockLayout = async () => {
    await updateDashboardSettings({
      layout: 'grid' as any,
    });
  };

  // Refresh settings
  const setRefreshInterval = async (seconds: number) => {
    await updateDashboardSettings({
      refreshInterval: seconds,
    });
  };

  const toggleAutoRefresh = async () => {
    await updateDashboardSettings({
      refreshInterval: dashboard.refreshInterval > 0 ? 0 : 300000,
    });
  };

  return {
    // Dashboard settings
    dashboard,
    
    // Widgets
    widgets: dashboard.widgets.registry,
    addWidget,
    removeWidget,
    updateWidget,
    toggleWidgetVisibility,
    
    // Layout
    activeLayout: dashboard.layout,
    layoutLocked: false,
    setActiveLayout,
    lockLayout,
    unlockLayout,
    
    // Refresh
    autoRefreshEnabled: dashboard.refreshInterval > 0,
    refreshInterval: dashboard.refreshInterval,
    setRefreshInterval,
    toggleAutoRefresh,
    
    // Save
    saveDashboard: saveAllSettings,
  };
}
