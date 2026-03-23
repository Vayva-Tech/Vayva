/**
 * @vayva/simple-settings - Simple Settings for Dashboard Integration
 * 
 * Provides minimal settings management for dashboard functionality
 */

// Simple Settings Manager
export { SimpleSettingsManager, getSimpleSettingsManager, initializeSimpleSettingsManager } from './simple-settings-manager';
export type { SimpleSettings, WidgetConfig, DashboardSettings } from './simple-settings-manager';

// React Hooks
export { useSimpleDashboardSettings } from './use-simple-dashboard-settings';