// ============================================================================
// Base Widget
// ============================================================================
// Base widget component with common functionality for all widgets
// ============================================================================

import type { ReactNode } from "react";
import type { WidgetProps } from "../types.js";

interface BaseWidgetProps extends WidgetProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
  onRefresh?: () => void;
}

/**
 * BaseWidget - Common wrapper for all dashboard widgets
 *
 * Provides consistent styling, loading states, error handling,
 * and refresh functionality for all widget types.
 */
export function BaseWidget({
  widget,
  children,
  className = "",
  header,
  footer,
  isLoading = false,
  error,
  onRefresh,
}: BaseWidgetProps) {
  return (
    <div
      className={`vayva-widget vayva-widget-${widget.type} ${className}`}
      data-widget-id={widget.id}
      data-widget-type={widget.type}
    >
      {/* Widget Header */}
      {(widget.title || header || onRefresh) && (
        <div className="vayva-widget-header">
          {widget.title && !header && (
            <h3 className="vayva-widget-title">{widget.title}</h3>
          )}
          {header}
          {onRefresh && (
            <button
              type="button"
              className="vayva-widget-refresh"
              onClick={onRefresh}
              disabled={isLoading}
              aria-label="Refresh widget"
            >
              {isLoading ? "Loading..." : "Refresh"}
            </button>
          )}
        </div>
      )}

      {/* Widget Content */}
      <div className="vayva-widget-content">
        {isLoading && (
          <div className="vayva-widget-loading" role="status" aria-live="polite">
            <span>Loading...</span>
          </div>
        )}

        {error && !isLoading && (
          <div className="vayva-widget-error" role="alert">
            <p>Error loading widget: {error.message}</p>
          </div>
        )}

        {!isLoading && !error && children}
      </div>

      {/* Widget Footer */}
      {footer && <div className="vayva-widget-footer">{footer}</div>}
    </div>
  );
}

BaseWidget.displayName = "BaseWidget";
