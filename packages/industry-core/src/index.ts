// ============================================================================
// @vayva/industry-core
// ============================================================================
// Base abstractions and types for industry-specific dashboard engines
// ============================================================================

// Export all types
export * from "./types.js";

// Export dashboard types
export * from "./lib/dashboard/universal-types.js";

// Export engine
export { DashboardEngine } from "./engine.js";

// Export widgets
export * from "./widgets/index.js";

// Export hooks
export * from "./hooks/index.js";

// Export components
export * from "./components/index.js";

// Export engine resolver
export * from "./engine-resolver.js";
