/**
 * Pet Care Industry Package
 * 
 * Complete pet care industry solution including:
 * - Patient Records & Health Tracking
 * - Appointment Scheduling
 * - Service Management
 * - Inventory for Pet Supplies
 * - Customer Management
 */

// Main engine
export { PetCareEngine } from './petcare.engine';

// Types
export * from './types';

// Services
export * from './services';

export const VERSION = '0.1.0';

export const PACKAGE_INFO = {
  name: '@vayva/industry-petcare',
  version: VERSION,
  description: 'Vayva Pet Care Industry Engine - Complete Pet Services Platform',
  industries: ['petcare', 'veterinary', 'pet-grooming', 'pet-services'],
} as const;