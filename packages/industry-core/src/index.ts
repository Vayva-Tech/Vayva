// ============================================================================
// @vayva/industry-core
// ============================================================================
// Base abstractions and types for industry-specific dashboard engines
// ============================================================================

// Export all types
export * from "./types";

// Export dashboard types
export * from "./lib/dashboard/universal-types";

// Export engine
export { DashboardEngine } from "./engine";
export { IndustryEngine, type Feature } from "./industry-engine-base";
export type {
  DataResolver,
  DataResolutionContext,
} from "./engine";

// Export widgets
export * from "./widgets/index";

// Export hooks
export * from "./hooks/index";

// Export components
export * from "./components/index";

// Export engine resolver
export * from "./engine-resolver";
