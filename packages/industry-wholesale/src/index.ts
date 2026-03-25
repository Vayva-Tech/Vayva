/**
 * Wholesale Industry Package Index
 */

// Export dashboard component
export { WholesaleDashboard } from './components/WholesaleDashboard';
export type { IndustryDashboardProps } from '@vayva/industry-core';

export const VERSION = '0.0.1';

export const PACKAGE_INFO = {
  name: '@vayva/industry-wholesale',
  version: VERSION,
  description: 'Vayva Wholesale Industry Engine',
  industries: ['wholesale', 'b2b-distribution', 'supplier-network'],
} as const;