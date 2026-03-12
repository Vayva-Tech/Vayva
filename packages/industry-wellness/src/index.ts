/**
 * Wellness Industry Package Index
 */

// Export dashboard component
export { WellnessDashboard } from './components/WellnessDashboard.js';
export type { IndustryDashboardProps } from '@vayva/industry-core';

export const VERSION = '0.0.1';

export const PACKAGE_INFO = {
  name: '@vayva/industry-wellness',
  version: VERSION,
  description: 'Vayva Wellness Industry Engine',
  industries: ['wellness', 'spa', 'fitness', 'health-center'],
} as const;