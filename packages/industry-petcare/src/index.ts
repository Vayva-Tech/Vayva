/**
 * Pet Care Industry Package Index
 */

// Export dashboard component
export { PetCareDashboard } from './components/PetCareDashboard';
export type { IndustryDashboardProps } from '@vayva/industry-core';

export const VERSION = '0.0.1';

export const PACKAGE_INFO = {
  name: '@vayva/industry-petcare',
  version: VERSION,
  description: 'Vayva Pet Care Industry Engine',
  industries: ['petcare', 'veterinary', 'pet-grooming', 'pet-services'],
} as const;