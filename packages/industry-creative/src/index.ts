/**
 * Creative Industry Package Index
 */

// Export dashboard component
export { CreativeDashboard } from './components/CreativeDashboard';
export type { IndustryDashboardProps } from '@vayva/industry-core';

export const VERSION = '0.0.1';

export const PACKAGE_INFO = {
  name: '@vayva/industry-creative',
  version: VERSION,
  description: 'Vayva Creative Industry Engine',
  industries: ['creative', 'design-studio', 'creative-agency', 'artistic-portfolio'],
} as const;