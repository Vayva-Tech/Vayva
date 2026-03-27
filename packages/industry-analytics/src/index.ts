// Industry Analytics Package - Generalized for all industries

// Engine
export { AnalyticsEngine } from './analytics.engine';
export type { AnalyticsEngineConfig } from './analytics.engine';

// Types
export * from './types';

// Services
export * from './services';

// Dashboard config only (dashboard component has too many dependencies)
export { ANALYTICS_DASHBOARD_CONFIG } from './dashboard/analytics-dashboard.config';

export const VERSION = '0.1.0';
