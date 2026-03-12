// ============================================================================
// Widget Renderer
// ============================================================================
// Renders widgets based on their type using the widget registry
// ============================================================================

import { getWidgetRegistry } from "../widgets/registry.js";
import type { WidgetDefinition, WidgetData } from "../types.js";

interface WidgetRendererProps {
  widget: WidgetDefinition;
  data?: WidgetData;
  isLoading?: boolean;
  error?: Error;
  onRefresh?: () => void;
}

/**
 * WidgetRenderer - Renders a widget based on its type
 *
 * Looks up the widget component from the registry and renders it
 * with the appropriate props.
 *
 * @example
 * ```tsx
 * <WidgetRenderer
 *   widget={widgetDef}
 *   data={widgetData}
 *   isLoading={false}
 *   onRefresh={handleRefresh}
 * />
 * ```
 */
export function WidgetRenderer({
  widget,
  data,
  isLoading = false,
  error,
  onRefresh,
}: WidgetRendererProps) {
  const registry = getWidgetRegistry();
  const WidgetComponent = registry.get(widget.type);

  if (!WidgetComponent) {
    return (
      <div className="widget-error" role="alert">
        <p>Unknown widget type: {widget.type}</p>
      </div>
    );
  }

  return (
    <WidgetComponent
      widget={widget}
      data={data}
      isLoading={isLoading}
      error={error}
      onRefresh={onRefresh}
    />
  );
}

WidgetRenderer.displayName = "WidgetRenderer";
