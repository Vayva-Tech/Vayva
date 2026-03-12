/**
 * @vayva/industry-education
 * 
 * Education Industry Module for Vayva Platform
 * 
 * Provides course management, student progress tracking, enrollment handling,
 * instructor performance analytics, and certificate generation for educational
 * institutions and e-learning platforms.
 * 
 * @packageDocumentation
 */

// Main engine
export {
  EducationEngine,
  EducationEngineFactory,
  createDefaultEducationConfig,
  type EducationEngineConfig,
  type EducationFeatureId,
  type EducationEngineStatus,
} from './education.engine.js';

// Types
export * from './types/index';

// Features
export * from './features/index';

// Services
export { EducationDashboardService } from './services/index';
export * from './services/index';

// Components
export * from './components/index';

// Dashboard configuration
export * from './dashboard/index';

// Export React dashboard component
export { EducationDashboard } from './dashboard/EducationDashboard';
