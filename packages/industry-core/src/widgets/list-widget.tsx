// ============================================================================
// List Widget
// ============================================================================
// Displays a list of items with optional icons and actions
// ============================================================================

import { BaseWidget } from "./base-widget.js";
import type { WidgetData, WidgetProps } from "../types.js";

interface ListItem {
  id: string;
  label: string;
  value?: string;
  icon?: string;
  status?: "success" | "warning" | "error" | "info";
  href?: string;
}

interface ListWidgetProps extends Omit<WidgetProps, "data"> {
  data?: WidgetData<ListItem[]>;
}

/**
 * ListWidget - Displays a list of items
 *
 * Supports icons, status indicators, and clickable items.
 */
export function ListWidget({ widget, data, isLoading, error, onRefresh }: ListWidgetProps) {
  const listData: ListItem[] = data?.data || [];

  const getStatusClass = (status?: string): string => {
    switch (status) {
      case "success":
        return "status-success";
      case "warning":
        return "status-warning";
      case "error":
        return "status-error";
      case "info":
        return "status-info";
      default:
        return "";
    }
  };

  const renderItem = (item: ListItem) => {
    const content = (
      <>
        {item.icon && <span className="list-item-icon">{item.icon}</span>}
        <span className="list-item-label">{item.label}</span>
        {item.value && <span className="list-item-value">{item.value}</span>}
      </>
    );

    if (item.href) {
      return (
        <a
          href={item.href}
          className={`list-item ${getStatusClass(item.status)}`}
        >
          {content}
        </a>
      );
    }

    return (
      <div className={`list-item ${getStatusClass(item.status)}`}>
        {content}
      </div>
    );
  };

  return (
    <BaseWidget
      widget={widget}
      isLoading={isLoading}
      error={error}
      onRefresh={onRefresh}
      className="list-widget"
    >
      <div className="list-container">
        {listData.length === 0 ? (
          <p className="list-empty">
            {(widget.config?.emptyText as string) || "No items"}
          </p>
        ) : (
          <ul className="widget-list">
            {listData.map((item) => (
              <li key={item.id}>{renderItem(item)}</li>
            ))}
          </ul>
        )}
      </div>
    </BaseWidget>
  );
}

ListWidget.displayName = "ListWidget";
