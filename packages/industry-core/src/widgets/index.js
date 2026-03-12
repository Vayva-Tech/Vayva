// Widgets Index

// Base widget components
export class BaseWidget {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return `<div>Base Widget</div>`;
  }
}

export class KPICardWidget {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return `
      <div class="kpi-card">
        <h3>${this.props.title || 'KPI Card'}</h3>
        <p>${this.props.value || 0}</p>
      </div>
    `;
  }
}

export class ChartWidget {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return `<div>Chart Widget: ${this.props.title || 'Chart'}</div>`;
  }
}

export class TableWidget {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return `<div>Table Widget: ${this.props.title || 'Table'}</div>`;
  }
}

export class ListWidget {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return `<div>List Widget: ${this.props.title || 'List'}</div>`;
  }
}

export class CustomWidget {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return `<div>Custom Widget</div>`;
  }
}

export class HeatmapWidget {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return `<div>Heatmap Widget: ${this.props.title || 'Heatmap'}</div>`;
  }
}

export class GaugeWidget {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return `<div>Gauge Widget: ${this.props.title || 'Gauge'}</div>`;
  }
}

export class CalendarWidget {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return `<div>Calendar Widget: ${this.props.title || 'Calendar'}</div>`;
  }
}

export class TimelineWidget {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return `<div>Timeline Widget: ${this.props.title || 'Timeline'}</div>`;
  }
}

export class KanbanWidget {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return `<div>Kanban Widget: ${this.props.title || 'Kanban'}</div>`;
  }
}

// Widget Registry
export class WidgetRegistry {
  constructor() {
    this.widgets = new Map();
    this.registerDefaultWidgets();
  }
  
  register(type, component, metadata = {}) {
    this.widgets.set(type, { component, metadata });
  }
  
  get(type) {
    return this.widgets.get(type);
  }
  
  getAll() {
    return Array.from(this.widgets.entries()).map(([type, widget]) => ({
      type,
      ...widget
    }));
  }
  
  registerDefaultWidgets() {
    this.register('kpi-card', KPICardWidget);
    this.register('chart-line', ChartWidget);
    this.register('chart-bar', ChartWidget);
    this.register('chart-pie', ChartWidget);
    this.register('table', TableWidget);
    this.register('list', ListWidget);
    this.register('custom', CustomWidget);
    this.register('heatmap', HeatmapWidget);
    this.register('gauge', GaugeWidget);
    this.register('calendar', CalendarWidget);
    this.register('timeline', TimelineWidget);
    this.register('kanban', KanbanWidget);
  }
}

// Export widget types
export const HeatmapCell = {};
export const HeatmapData = {};
export const GaugeData = {};
export const SparklineKPIData = {};
export const ComparePeriod = {};
export const CompareKPIData = {};
export const CalendarBooking = {};
export const CalendarWidgetProps = {};
export const TimelineEvent = {};
export const TimelineWidgetProps = {};
export const KanbanCard = {};
export const KanbanColumn = {};
export const KanbanWidgetProps = {};

// Variant widgets
export class SparklineKPICard {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return `<div>Sparkline KPI Card</div>`;
  }
}

export class CompareKPICard {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return `<div>Compare KPI Card</div>`;
  }
}