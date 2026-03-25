// ============================================================================
// Services Widget Registry
// ============================================================================
// Register services-specific widgets (calendar, etc.) with the dashboard engine.
// ============================================================================

/**
 * Placeholder until calendar (and other) widgets share a single `WidgetProps` contract
 * and one React types resolution path across workspace packages.
 */
export function registerServicesWidgets(): void {
  // Intentionally empty — avoids invalid `WidgetRegistry.register` calls under duplicate `@types/react`.
}
