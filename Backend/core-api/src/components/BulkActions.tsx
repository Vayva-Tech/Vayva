"use client";

import React from "react";
import { Button } from "@vayva/ui";
import {
  Trash as Trash2,
  DownloadSimple as Download,
  CheckSquare,
  Square,
} from "@phosphor-icons/react/ssr";

interface BulkAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?:
    | "primary"
    | "secondary"
    | "link"
    | "destructive"
    | "ghost"
    | "outline";
  disabled?: boolean;
}

interface BulkActionsProps {
  selectedCount: number;
  totalCount: number;
  allSelected: boolean;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  actions: BulkAction[];
}

export function BulkActions({
  selectedCount,
  totalCount,
  allSelected,
  onSelectAll,
  onDeselectAll,
  actions,
}: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="flex items-center gap-2 text-sm font-medium text-blue-900 hover:text-blue-700 hover:bg-blue-100/50 transition-colors h-auto p-2"
          aria-label={allSelected ? "Deselect all items" : "Select all items"}
        >
          {allSelected ? (
            <CheckSquare className="h-5 w-5" />
          ) : (
            <Square className="h-5 w-5" />
          )}
          <span>
            {selectedCount} of {totalCount} selected
          </span>
        </Button>

        {!allSelected && selectedCount < totalCount && (
          <Button
            variant="link"
            onClick={onSelectAll}
            className="text-sm text-blue-600 hover:text-blue-800 underline h-auto p-0"
            aria-label="Select all items on this page"
          >
            Select all {totalCount}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || "outline"}
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled}
            className="flex items-center gap-2"
            aria-label={action.label}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

// Preset bulk actions for common use cases
export const bulkDeleteAction = (onDelete: () => void): BulkAction => ({
  label: "Delete",
  icon: <Trash2 className="h-4 w-4" />,
  onClick: onDelete,
  variant: "destructive",
});

export const bulkExportAction = (onExport: () => void): BulkAction => ({
  label: "Export",
  icon: <Download className="h-4 w-4" />,
  onClick: onExport,
  variant: "outline",
});
