// @ts-nocheck
// ============================================================================
// Table Widget
// ============================================================================
// Displays data in a tabular format with sorting
// ============================================================================

import { BaseWidget } from "./base-widget";
import type { TableColumn, TableRow, WidgetData, WidgetProps } from "../types";

interface TableData {
  columns: TableColumn[];
  rows: TableRow[];
}

interface TableWidgetProps extends Omit<WidgetProps, "data"> {
  data?: WidgetData<TableData>;
}

/**
 * TableWidget - Displays data in a table format
 *
 * Supports column definitions, formatting, and sorting.
 */
export function TableWidget({ widget, data, isLoading, error, onRefresh }: TableWidgetProps) {
  const tableData = data?.data || { columns: [], rows: [] };

  const formatCellValue = (value: unknown, format?: string): string => {
    if (value === null || value === undefined) return "-";

    switch (format) {
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(Number(value));
      case "percent":
        return `${Number(value).toFixed(1)}%`;
      case "number":
        return new Intl.NumberFormat("en-US").format(Number(value));
      default:
        return String(value);
    }
  };

  return (
    <BaseWidget
      widget={widget}
      isLoading={isLoading}
      error={error}
      onRefresh={onRefresh}
      className="table-widget"
    >
      <div className="table-container">
        {tableData.rows.length === 0 ? (
          <p className="table-empty">No data available</p>
        ) : (
          <table className="widget-table">
            <thead>
              <tr>
                {tableData.columns.map((column) => (
                  <th
                    key={column.key}
                    className={column.sortable ? "sortable" : ""}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.rows.map((row) => (
                <tr key={row.id}>
                  {tableData.columns.map((column) => (
                    <td key={`${row.id}-${column.key}`}>
                      {formatCellValue(row[column.key], column.format)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </BaseWidget>
  );
}

TableWidget.displayName = "TableWidget";
