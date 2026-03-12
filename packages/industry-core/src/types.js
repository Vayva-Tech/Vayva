// Industry Core Types

// Industry Types
export const IndustrySlug = [
  "retail",
  "fashion", 
  "electronics",
  "beauty",
  "grocery",
  "one_product",
  "food",
  "services",
  "b2b",
  "events",
  "nightlife",
  "automotive",
  "travel_hospitality",
  "real_estate",
  "digital",
  "nonprofit",
  "education",
  "blog_media",
  "analytics",
  "creative_portfolio",
  "restaurant",
  "healthcare"
];

// Widget Types
export const WidgetType = [
  "kpi-card",
  "chart-line",
  "chart-bar", 
  "chart-pie",
  "table",
  "calendar",
  "map",
  "kanban",
  "timeline",
  "heatmap",
  "gauge",
  "list",
  "custom"
];

// Dashboard Engine Config
export class DashboardEngineConfig {
  constructor(config = {}) {
    this.industry = config.industry || "retail";
    this.title = config.title || "Dashboard";
    this.subtitle = config.subtitle || "";
    this.primaryObjectLabel = config.primaryObjectLabel || "Item";
    this.defaultTimeHorizon = config.defaultTimeHorizon || "last_30_days";
    this.sections = config.sections || [];
    this.widgets = config.widgets || [];
    this.layouts = config.layouts || [];
    this.kpiCards = config.kpiCards || [];
    this.alertRules = config.alertRules || [];
    this.actions = config.actions || [];
    this.failureModes = config.failureModes || [];
  }
}

// Widget Definition
export class WidgetDefinition {
  constructor(widget = {}) {
    this.id = widget.id || "";
    this.type = widget.type || "kpi-card";
    this.title = widget.title || "";
    this.industry = widget.industry || "retail";
    this.component = widget.component || "";
    this.dataSource = widget.dataSource || { type: "static" };
    this.visualization = widget.visualization || {};
    this.refreshInterval = widget.refreshInterval || 300;
    this.permissions = widget.permissions || [];
  }
}

// Data Source Config
export class DataSourceConfig {
  constructor(config = {}) {
    this.type = config.type || "static";
    this.query = config.query || "";
    this.queries = config.queries || [];
    this.params = config.params || {};
    this.channel = config.channel || "";
    this.entity = config.entity || "";
  }
}

// Layout Item
export class LayoutItem {
  constructor(item = {}) {
    this.i = item.i || "";
    this.x = item.x || 0;
    this.y = item.y || 0;
    this.w = item.w || 1;
    this.h = item.h || 1;
  }
}

// Layout Preset
export class LayoutPreset {
  constructor(preset = {}) {
    this.id = preset.id || "";
    this.name = preset.name || "";
    this.breakpoints = preset.breakpoints || {};
  }
}

// KPI Card Definition
export class KPICardDefinition {
  constructor(card = {}) {
    this.id = card.id || "";
    this.label = card.label || "";
    this.format = card.format || "number";
    this.invert = card.invert || false;
    this.alertThreshold = card.alertThreshold || 0;
  }
}

// Alert Rule
export class AlertRule {
  constructor(rule = {}) {
    this.id = rule.id || "";
    this.condition = rule.condition || "";
    this.threshold = rule.threshold || 0;
    this.action = rule.action || "";
  }
}

// Quick Action
export class QuickAction {
  constructor(action = {}) {
    this.id = action.id || "";
    this.label = action.label || "";
    this.icon = action.icon || "";
    this.action = action.action || "";
  }
}

// Permission
export class Permission {
  constructor(permission = {}) {
    this.resource = permission.resource || "";
    this.action = permission.action || "";
  }
}