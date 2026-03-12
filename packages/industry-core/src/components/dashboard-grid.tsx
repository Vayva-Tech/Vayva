// ============================================================================
// Dashboard Grid
// ============================================================================
// Responsive grid layout for dashboard widgets
// ============================================================================

import { useCallback, useState } from "react";
import { WidgetRenderer } from "./widget-renderer.js";
import { useDashboard } from "./dashboard-container.js";
import type { LayoutItem, WidgetDefinition } from "../types.js";

interface DashboardGridProps {
  widgets: WidgetDefinition[];
  layout: LayoutItem[];
  className?: string;
  editable?: boolean;
  onLayoutChange?: (layout: LayoutItem[]) => void;
}

/**
 * DashboardGrid - Responsive grid for dashboard widgets
 *
 * Renders widgets in a grid layout based on the provided layout configuration.
 * Supports editing mode for rearranging widgets.
 *
 * @example
 * ```tsx
 * <DashboardGrid
 *   widgets={config.widgets}
 *   layout={layout.breakpoints.lg}
 *   editable={true}
 *   onLayoutChange={handleLayoutChange}
 * />
 * ```
 */
export function DashboardGrid({
  widgets,
  layout,
  className = "",
  editable = false,
  onLayoutChange,
}: DashboardGridProps) {
  const { isLoading } = useDashboard();
  const [widgetData] = useState<Record<string, unknown>>({});
  const [widgetErrors] = useState<Record<string, Error>>({});

  const handleRefresh = useCallback((widgetId: string) => {
    // This would trigger a data refresh for the specific widget
    console.log("Refreshing widget:", widgetId);
  }, []);

  // Create a map of widget definitions by ID for quick lookup
  const widgetMap = new Map(widgets.map((w) => [w.id, w]));

  return (
    <div
      className={`dashboard-grid ${editable ? "editable" : ""} ${className}`}
      role="region"
      aria-label="Dashboard widgets"
    >
      {layout.map((item) => {
        const widget = widgetMap.get(item.i);
        if (!widget) {
          return null;
        }

        return (
          <div
            key={widget.id}
            className="dashboard-grid-item"
            style={{
              gridColumn: `span ${item.w}`,
              gridRow: `span ${item.h}`,
            }}
            data-widget-id={widget.id}
            data-widget-type={widget.type}
          >
            <WidgetRenderer
              widget={widget}
              data={widgetData[widget.id] as never}
              isLoading={isLoading}
              error={widgetErrors[widget.id]}
              onRefresh={() => handleRefresh(widget.id)}
            />
          </div>
        );
      })}
    </div>
  );
}

DashboardGrid.displayName = "DashboardGrid";
