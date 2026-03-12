/**
 * Vayva Extensions Package
 *
 * Template extensibility with controlled composition.
 */

// Extension points
export {
  ExtensionPoint,
  ExtensionPointRegistry,
  getExtensionPoint,
  getExtensionPointsByCategory,
  isValidExtensionPoint,
} from "./extension-points";
export type { ExtensionPointDefinition } from "./extension-points";

// Add-on types
export {
  InitialAddOns,
  getAddOn,
  getAddOnsByType,
  getAddOnsByExtensionPoint,
  getCompatibleAddOns,
} from "./addon-types";
export type { AddOnMetadata, AddOnType, PlanTier } from "./addon-types";

// Compatibility
export { CompatibilityChecker } from "./compatibility";
export type { CompatibilityCheck } from "./compatibility";

// Lifecycle
export { LifecycleManager, LifecycleRules } from "./lifecycle";
export type { EnableResult, DisableResult } from "./lifecycle";
