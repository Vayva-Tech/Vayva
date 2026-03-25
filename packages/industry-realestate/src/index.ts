/**
 * Real Estate Industry Package Index
 */

// Export dashboard component
export { RealEstateDashboard } from './components/RealEstateDashboard';
export type { IndustryDashboardProps } from '@vayva/industry-core';

export const VERSION = '0.0.1';

export const PACKAGE_INFO = {
  name: '@vayva/industry-realestate',
  version: VERSION,
  description: 'Vayva Real Estate Industry Engine',
  industries: ['realestate', 'property-management', 'real-estate-agency'],
} as const;