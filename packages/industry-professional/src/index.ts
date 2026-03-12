/**
 * Professional Services Industry Package Index
 */

// Export dashboard component
export { ProfessionalServicesDashboard } from './components/ProfessionalServicesDashboard.js';
export type { IndustryDashboardProps } from '@vayva/industry-core';

export const VERSION = '0.0.1';

export const PACKAGE_INFO = {
  name: '@vayva/industry-professional',
  version: VERSION,
  description: 'Vayva Professional Services Industry Engine',
  industries: ['professional', 'consulting', 'accounting', 'legal-services'],
} as const;