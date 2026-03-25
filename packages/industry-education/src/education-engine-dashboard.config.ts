import type { DashboardEngineConfig, WidgetDefinition } from '@vayva/industry-core';

const EDU_INDUSTRY = 'education' as const;

const COURSES_OVERVIEW_WIDGET: WidgetDefinition = {
  id: 'education-courses-overview',
  type: 'table',
  title: 'Courses overview',
  industry: EDU_INDUSTRY,
  dataSource: { type: 'analytics', query: 'education.courses.overview' },
  refreshInterval: 600,
};

const ENROLLMENTS_WIDGET: WidgetDefinition = {
  id: 'education-enrollments',
  type: 'kpi-card',
  title: 'Enrollments',
  industry: EDU_INDUSTRY,
  dataSource: { type: 'analytics', query: 'education.enrollments' },
  refreshInterval: 300,
};

export const EDUCATION_ENGINE_DASHBOARD_CONFIG: DashboardEngineConfig = {
  industry: EDU_INDUSTRY,
  title: 'Education',
  subtitle: 'Courses, learners, and outcomes',
  primaryObjectLabel: 'Course',
  defaultTimeHorizon: 'month',
  sections: [
    'primary_object_health',
    'live_operations',
    'decision_kpis',
    'bottlenecks_alerts',
    'suggested_actions',
  ],
  layouts: [],
  kpiCards: [],
  alertRules: [],
  actions: [],
  failureModes: [],
  widgets: [COURSES_OVERVIEW_WIDGET, ENROLLMENTS_WIDGET],
};
