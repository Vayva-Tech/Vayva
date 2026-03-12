// ============================================================================
// Dashboard Engine
// ============================================================================
// Core engine for managing industry-specific dashboards
// ============================================================================

import type {
  Alert,
  AlertRule,
  DashboardEngineConfig,
  DataSourceConfig,
  IndustrySlug,
  LayoutPreset,
  SuggestedAction,
  WidgetData,
  WidgetDefinition,
  WidgetProps,
  WidgetRegistryEntry,
  WidgetType,
} from "./types.js";

/**
 * DashboardEngine - Core engine for industry-specific dashboards
 *
 * Manages widget registration, data resolution, alert evaluation,
 * and layout management for industry dashboards.
 */
export class DashboardEngine {
  private widgets: Map<string, WidgetRegistryEntry> = new Map();
  private dataResolvers: Map<string, DataResolver> = new Map();
  private config: DashboardEngineConfig | null = null;

  /**
   * Register a widget component for a specific widget type
   */
  registerWidget(type: WidgetType, entry: WidgetRegistryEntry): void {
    this.widgets.set(type, entry);
  }

  /**
   * Get a registered widget by type
   */
  getWidget(type: WidgetType): WidgetRegistryEntry | undefined {
    return this.widgets.get(type);
  }

  /**
   * Check if a widget type is registered
   */
  hasWidget(type: WidgetType): boolean {
    return this.widgets.has(type);
  }

  /**
   * Set the dashboard configuration
   */
  setConfig(config: DashboardEngineConfig): void {
    this.config = config;
  }

  /**
   * Get the current dashboard configuration
   */
  getConfig(): DashboardEngineConfig | null {
    return this.config;
  }

  /**
   * Register a data resolver for a specific data source type
   */
  registerDataResolver(type: string, resolver: DataResolver): void {
    this.dataResolvers.set(type, resolver);
  }

  /**
   * Resolve data for a widget based on its data source configuration
   */
  async resolveDataSource(
    config: DataSourceConfig,
    context: DataResolutionContext
  ): Promise<WidgetData> {
    const resolver = this.dataResolvers.get(config.type);

    if (!resolver) {
      throw new Error(`No resolver registered for data source type: ${config.type}`);
    }

    return resolver.resolve(config, context);
  }

  /**
   * Evaluate alert rules against current data
   */
  evaluateAlertRules(data: Record<string, unknown>, rules: AlertRule[]): Alert[] {
    const alerts: Alert[] = [];

    for (const rule of rules) {
      if (!rule.enabled) continue;

      const value = this.getMetricValue(data, rule.condition.metric);
      const triggered = this.evaluateCondition(value, rule.condition);

      if (triggered) {
        alerts.push({
          id: `${rule.id}-${Date.now()}`,
          ruleId: rule.id,
          severity: rule.severity,
          message: this.formatAlertMessage(rule.message, value),
          triggeredAt: new Date(),
          data: { value, threshold: rule.condition.value },
        });
      }
    }

    return alerts;
  }

  /**
   * Get suggested actions based on current data and alert rules
   */
  getSuggestedActions(data: Record<string, unknown>, rules: AlertRule[]): SuggestedAction[] {
    const actions: SuggestedAction[] = [];

    for (const rule of rules) {
      if (!rule.enabled) continue;

      const value = this.getMetricValue(data, rule.condition.metric);
      const triggered = this.evaluateCondition(value, rule.condition);

      if (triggered && this.config) {
        const action = this.config.actions.find((a) => a.id === rule.id);
        if (action) {
          actions.push({
            id: `${rule.id}-action`,
            title: action.label,
            reason: this.formatAlertMessage(rule.message, value),
            severity: rule.severity,
            href: action.href,
            icon: action.icon,
          });
        }
      }
    }

    return actions;
  }

  /**
   * Validate a layout configuration
   */
  validateLayout(layout: LayoutPreset, widgets: WidgetDefinition[]): boolean {
    const widgetIds = new Set(widgets.map((w) => w.id));

    for (const breakpoint of Object.values(layout.breakpoints)) {
      if (!breakpoint) continue;

      for (const item of breakpoint) {
        if (!widgetIds.has(item.i)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Get default layout for a set of widgets
   */
  getDefaultLayout(widgets: WidgetDefinition[]): LayoutPreset {
    const items = widgets.map((widget, index) => ({
      i: widget.id,
      x: (index % 3) * 4,
      y: Math.floor(index / 3) * 4,
      w: 4,
      h: 4,
    }));

    return {
      id: "default",
      name: "Default Layout",
      breakpoints: {
        lg: items,
        md: items,
        sm: items.map((item) => ({ ...item, w: 6 })),
        xs: items.map((item) => ({ ...item, w: 12 })),
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Private Helpers
  // ---------------------------------------------------------------------------

  private getMetricValue(data: Record<string, unknown>, metric: string): number {
    const value = data[metric];
    return typeof value === "number" ? value : 0;
  }

  private evaluateCondition(
    value: number,
    condition: AlertRule["condition"]
  ): boolean {
    switch (condition.operator) {
      case "gt":
        return value > condition.value;
      case "lt":
        return value < condition.value;
      case "eq":
        return value === condition.value;
      case "gte":
        return value >= condition.value;
      case "lte":
        return value <= condition.value;
      default:
        return false;
    }
  }

  private formatAlertMessage(message: string, value: unknown): string {
    return message.replace(/\{value\}/g, String(value));
  }
}

// ============================================================================
// Data Resolver Interface
// ============================================================================

export interface DataResolver {
  resolve(
    config: DataSourceConfig,
    context: DataResolutionContext
  ): Promise<WidgetData>;
}

export interface DataResolutionContext {
  storeId: string;
  industry: IndustrySlug;
  userId?: string;
  permissions?: string[];
}

// ============================================================================
// Static Data Resolver
// ============================================================================

export class StaticDataResolver implements DataResolver {
  async resolve(
    config: DataSourceConfig,
    _context: DataResolutionContext
  ): Promise<WidgetData> {
    return {
      widgetId: config.query || "static",
      data: config.params || {},
      cachedAt: new Date(),
    };
  }
}

// ============================================================================
// Entity Data Resolver
// ============================================================================

export class EntityDataResolver implements DataResolver {
  async resolve(
    config: DataSourceConfig,
    context: DataResolutionContext
  ): Promise<WidgetData> {
    // This would integrate with the actual database/Prisma client
    // For now, return a placeholder
    return {
      widgetId: config.entity || "entity",
      data: {
        entity: config.entity,
        filter: config.filter,
        storeId: context.storeId,
      },
      cachedAt: new Date(),
    };
  }
}

// ============================================================================
// Analytics Data Resolver
// ============================================================================

export class AnalyticsDataResolver implements DataResolver {
  async resolve(
    config: DataSourceConfig,
    context: DataResolutionContext
  ): Promise<WidgetData> {
    // This would integrate with the analytics service
    // For now, return a placeholder
    return {
      widgetId: config.query || "analytics",
      data: {
        query: config.query,
        params: config.params,
        storeId: context.storeId,
      },
      cachedAt: new Date(),
    };
  }
}

// ============================================================================
// Realtime Data Resolver
// ============================================================================

export class RealtimeDataResolver implements DataResolver {
  async resolve(
    config: DataSourceConfig,
    context: DataResolutionContext
  ): Promise<WidgetData> {
    // This would integrate with the realtime service (WebSocket/Redis)
    // For now, return a placeholder
    return {
      widgetId: config.channel || "realtime",
      data: {
        channel: config.channel,
        storeId: context.storeId,
      },
      cachedAt: new Date(),
    };
  }
}

// ============================================================================
// Composite Data Resolver
// ============================================================================

export class CompositeDataResolver implements DataResolver {
  async resolve(
    config: DataSourceConfig,
    context: DataResolutionContext
  ): Promise<WidgetData> {
    // This would combine multiple queries
    // For now, return a placeholder
    return {
      widgetId: "composite",
      data: {
        queries: config.queries,
        storeId: context.storeId,
      },
      cachedAt: new Date(),
    };
  }
}
