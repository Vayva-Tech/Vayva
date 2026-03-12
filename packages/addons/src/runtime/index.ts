/**
 * Vayva Add-On Runtime - Core execution engine for add-ons
 * 
 * Provides sandboxed execution environment for third-party and internal add-ons
 * with secure isolation, permission management, and lifecycle hooks.
 */

// Export all runtime modules
export { AddOnSandbox } from './sandbox';
export { PermissionManager, AddOnPermission } from './permissions';
export { LifecycleManager, AddOnLifecycleHooks } from './lifecycle';
export { AddOnErrorBoundary } from './error-boundary';

// Re-export types for convenience
export type { SandboxConfig } from './sandbox';
export type { PermissionSet } from './permissions';
export type { LifecycleState } from './lifecycle';
