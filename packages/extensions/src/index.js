/**
 * Vayva Extensions Package
 *
 * Template extensibility with controlled composition.
 */
// Extension points
export { ExtensionPoint, ExtensionPointRegistry, getExtensionPoint, getExtensionPointsByCategory, isValidExtensionPoint, } from "./extension-points";
// Add-on types
export { InitialAddOns, getAddOn, getAddOnsByType, getAddOnsByExtensionPoint, getCompatibleAddOns, } from "./addon-types";
// Compatibility
export { CompatibilityChecker } from "./compatibility";
// Lifecycle
export { LifecycleManager, LifecycleRules } from "./lifecycle";
