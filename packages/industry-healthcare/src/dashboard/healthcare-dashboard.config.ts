import type { DashboardEngineConfig, WidgetDefinition } from '../types';

const APPOINTMENTS_TODAY_WIDGET: WidgetDefinition = {
  id: 'appointments-today',
  type: 'kpi-card',
  title: 'Appointments Today',
  industry: 'healthcare',
  dataSource: {
    type: 'analytics',
    query: 'appointments.today',
  },
  refreshInterval: 60,
};

const TOTAL_PATIENTS_WIDGET: WidgetDefinition = {
  id: 'total-patients',
  type: 'kpi-card',
  title: 'Total Patients',
  industry: 'healthcare',
  dataSource: {
    type: 'analytics',
    query: 'patients.total',
  },
  refreshInterval: 300,
};

const APPOINTMENT_FULFILLMENT_WIDGET: WidgetDefinition = {
  id: 'appointment-fulfillment',
  type: 'gauge',
  title: 'Appointment Fulfillment Rate',
  industry: 'healthcare',
  dataSource: {
    type: 'analytics',
    query: 'appointments.fulfillmentRate',
  },
  visualization: {
    type: 'gauge',
    options: { min: 0, max: 100, unit: '%', thresholds: [60, 80] },
  },
  refreshInterval: 300,
};

const REVENUE_TREND_WIDGET: WidgetDefinition = {
  id: 'revenue-trend',
  type: 'chart-line',
  title: 'Monthly Revenue',
  industry: 'healthcare',
  dataSource: {
    type: 'analytics',
    query: 'revenue.monthly',
  },
  visualization: {
    type: 'line',
    options: { currency: true, smooth: true },
  },
  refreshInterval: 3600,
};

const APPOINTMENT_TYPES_WIDGET: WidgetDefinition = {
  id: 'appointment-types',
  type: 'chart-pie',
  title: 'Appointment Types',
  industry: 'healthcare',
  dataSource: {
    type: 'analytics',
    query: 'appointments.byType',
  },
  visualization: {
    type: 'donut',
  },
  refreshInterval: 3600,
};

const WAIT_TIME_WIDGET: WidgetDefinition = {
  id: 'avg-wait-time',
  type: 'kpi-card',
  title: 'Avg Wait Time',
  industry: 'healthcare',
  dataSource: {
    type: 'analytics',
    query: 'appointments.averageWaitTime',
  },
  refreshInterval: 120,
};

const TOP_SPECIALTIES_WIDGET: WidgetDefinition = {
  id: 'top-specialties',
  type: 'chart-bar',
  title: 'Top Specialties',
  industry: 'healthcare',
  dataSource: {
    type: 'analytics',
    query: 'appointments.bySpecialty',
  },
  visualization: {
    type: 'horizontal-bar',
    options: { maxItems: 5 },
  },
  refreshInterval: 3600,
};

const TELEMEDICINE_UTILIZATION_WIDGET: WidgetDefinition = {
  id: 'telemedicine-utilization',
  type: 'kpi-card',
  title: 'Telemedicine Usage',
  industry: 'healthcare',
  dataSource: {
    type: 'analytics',
    query: 'appointments.telemedicineUtilization',
  },
  refreshInterval: 3600,
};

export const HEALTHCARE_DASHBOARD_CONFIG: DashboardEngineConfig = {
  industry: 'healthcare',
  widgets: [
    APPOINTMENTS_TODAY_WIDGET,
    TOTAL_PATIENTS_WIDGET,
    APPOINTMENT_FULFILLMENT_WIDGET,
    REVENUE_TREND_WIDGET,
    APPOINTMENT_TYPES_WIDGET,
    WAIT_TIME_WIDGET,
    TOP_SPECIALTIES_WIDGET,
    TELEMEDICINE_UTILIZATION_WIDGET,
  ],
  layouts: [
    {
      id: 'default',
      name: 'Healthcare Overview',
      breakpoints: {
        lg: [
          { i: 'appointments-today', x: 0, y: 0, w: 3, h: 2 },
          { i: 'total-patients', x: 3, y: 0, w: 3, h: 2 },
          { i: 'avg-wait-time', x: 6, y: 0, w: 3, h: 2 },
          { i: 'telemedicine-utilization', x: 9, y: 0, w: 3, h: 2 },
          { i: 'appointment-fulfillment', x: 0, y: 2, w: 4, h: 4 },
          { i: 'revenue-trend', x: 4, y: 2, w: 8, h: 4 },
          { i: 'appointment-types', x: 0, y: 6, w: 6, h: 4 },
          { i: 'top-specialties', x: 6, y: 6, w: 6, h: 4 },
        ],
      },
    },
  ],
  kpiCards: [
    { id: 'appointments-today', label: 'Appointments Today', format: 'number' },
    { id: 'total-patients', label: 'Total Patients', format: 'number' },
    { id: 'avg-wait-time', label: 'Avg Wait (min)', format: 'number' },
    { id: 'telemedicine-utilization', label: 'Telemedicine %', format: 'percent' },
  ],
  alertRules: [
    {
      id: 'low-fulfillment',
      condition: 'appointments.fulfillmentRate < threshold',
      threshold: 70,
      action: 'notify:operations',
    },
    {
      id: 'high-wait-time',
      condition: 'appointments.averageWaitTime > threshold',
      threshold: 30,
      action: 'notify:operations',
    },
  ],
  actions: [
    { id: 'new-appointment', label: 'New Appointment', icon: 'calendar-plus', action: 'navigate:/appointments/new' },
    { id: 'add-patient', label: 'Add Patient', icon: 'user-plus', action: 'navigate:/patients/new' },
    { id: 'view-today', label: "Today's Schedule", icon: 'calendar', action: 'navigate:/appointments/today' },
  ],
};

export function getHealthcareDashboardConfig(): DashboardEngineConfig {
  return HEALTHCARE_DASHBOARD_CONFIG;
}
