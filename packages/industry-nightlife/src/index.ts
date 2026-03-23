// @ts-nocheck
/**
 * Nightlife Industry Package Index
 */

// Export dashboard component
export { NightlifeDashboard } from './components/NightlifeDashboard';
export type { NightlifeDashboardProps } from './components/NightlifeDashboard';

export const VERSION = '0.0.1';

export const PACKAGE_INFO = {
  name: '@vayva/industry-nightlife',
  version: VERSION,
  description: 'Vayva Nightlife Industry Engine',
  industries: ['nightlife', 'bar', 'club', 'entertainment-venue'],
} as const;