// @ts-nocheck
/**
 * Specialized Industry Package Index
 */

// Export dashboard component
export { SpecializedDashboard } from './components/SpecializedDashboard';
export type { IndustryDashboardProps } from '@vayva/industry-core';

export const VERSION = '0.0.1';

export const PACKAGE_INFO = {
  name: '@vayva/industry-specialized',
  version: VERSION,
  description: 'Vayva Specialized Industry Engine',
  industries: ['specialized', 'custom-solutions', 'niche-business'],
} as const;