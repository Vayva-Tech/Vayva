// @ts-nocheck
// ============================================================================
// Custom Widget
// ============================================================================
// Renders custom widget content provided via configuration
// ============================================================================

import { BaseWidget } from "./base-widget";
import type { WidgetData, WidgetProps } from "../types";

interface CustomWidgetProps extends Omit<WidgetProps, "data"> {
  data?: WidgetData<unknown>;
}

/**
 * CustomWidget - Renders custom widget content
 *
 * This widget type allows for completely custom rendering
 * based on the widget configuration. The actual component
 * to render is specified in the widget config.
 */
export function CustomWidget({ widget, data, isLoading, error, onRefresh }: CustomWidgetProps) {
  const componentName = widget.component;

  return (
    <BaseWidget
      widget={widget}
      isLoading={isLoading}
      error={error}
      onRefresh={onRefresh}
      className="custom-widget"
    >
      <div className="custom-widget-content">
        {componentName ? (
          <div className="custom-component-placeholder">
            <p>Custom Component: {componentName}</p>
            {data?.data !== undefined && data?.data !== null && (
              <pre className="custom-widget-data">
                {JSON.stringify(data.data, null, 2)}
              </pre>
            )}
          </div>
        ) : (
          <p className="custom-widget-empty">
            No custom component specified
          </p>
        )}
      </div>
    </BaseWidget>
  );
}

CustomWidget.displayName = "CustomWidget";
