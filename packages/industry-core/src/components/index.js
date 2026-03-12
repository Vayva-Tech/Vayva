// Components Index

// Container components
export class DashboardContainer {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return `<div class="dashboard-container">${this.props.children || ''}</div>`;
  }
}

export class WidgetRenderer {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return `<div>Widget: ${this.props.widgetId}</div>`;
  }
}

export class DashboardGrid {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return `<div class="dashboard-grid">${this.props.children || ''}</div>`;
  }
}

export class AlertBanner {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return `<div class="alert-banner">${this.props.message || 'Alert'}</div>`;
  }
}

export class QuickActionsPanel {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return `<div class="quick-actions-panel">${this.props.children || ''}</div>`;
  }
}

// UI Components
export class MetricCard {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return `
      <div class="metric-card">
        <h3>${this.props.title || 'Metric'}</h3>
        <p class="value">${this.props.value || 0}</p>
        <p class="change">${this.props.change || ''}</p>
      </div>
    `;
  }
}

export class TrendChart {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return `<div>Trend Chart: ${this.props.title || 'Trend'}</div>`;
  }
}

export class StatusBadge {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return `<span class="status-badge ${this.props.variant || 'default'}">${this.props.children || ''}</span>`;
  }
}

export class PercentileGauge {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return `<div>Percentile Gauge: ${this.props.value || 0}%</div>`;
  }
}

export class ComparisonTable {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return `<div>Comparison Table</div>`;
  }
}

export class SmartSearchInput {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return `<input type="search" placeholder="${this.props.placeholder || 'Search...'}" />`;
  }
}

export class DateRangePicker {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return `<div>Date Range Picker</div>`;
  }
}

export class MultiSelectDropdown {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return `<select multiple>${this.props.children || ''}</select>`;
  }
}

export class SortableTable {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return `<div>Sortable Table</div>`;
  }
}

export class BulkActionToolbar {
  constructor(props) {
    this.props = props;
  }
  
  render() {
    return `<div>Bulk Action Toolbar</div>`;
  }
}