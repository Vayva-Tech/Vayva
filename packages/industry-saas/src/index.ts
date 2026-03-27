/**
 * SaaS Industry Package
 * 
 * Complete SaaS platform solution including:
 * - Subscription Management
 * - Billing & Invoicing
 * - User Management
 * - Analytics & Reporting
 * - Feature Flags
 */

// Main engine
export { SaaSEngine } from './saas.engine';

// Types
export * from './types';

// Services  
export * from './services';

// Dashboard
export * from './dashboard';

export const VERSION = '0.1.0';

export const PACKAGE_INFO = {
  name: '@vayva/industry-saas',
  version: VERSION,
  description: 'Vayva SaaS Industry Engine - Complete SaaS Platform',
  industries: ['saas', 'software', 'cloud-services', 'subscription'],
} as const;
