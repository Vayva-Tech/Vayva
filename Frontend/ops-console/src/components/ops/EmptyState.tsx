"use client";

import React from "react";
import { cn, Button } from "@vayva/ui";
import {
  MagnifyingGlass as Search,
  Package,
  FileX,
  WarningCircle as AlertCircle,
  CheckCircle,
} from "@phosphor-icons/react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  variant?: "default" | "search" | "error" | "success";
}

const variantConfig = {
  default: {
    icon: <Package className="h-12 w-12 text-gray-300" />,
    title: "No items found",
    description: "There are no items to display at this time.",
  },
  search: {
    icon: <Search className="h-12 w-12 text-gray-300" />,
    title: "No results found",
    description: "Try adjusting your search or filters to find what you're looking for.",
  },
  error: {
    icon: <AlertCircle className="h-12 w-12 text-red-300" />,
    title: "Something went wrong",
    description: "We couldn't load the data. Please try again later.",
  },
  success: {
    icon: <CheckCircle className="h-12 w-12 text-green-300" />,
    title: "All caught up",
    description: "You're all set! There are no pending items.",
  },
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
  variant = "default",
}: EmptyStateProps): React.JSX.Element {
  const config = variantConfig[variant];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <div className="mb-4">{icon || config.icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {title || config.title}
      </h3>
      <p className="text-sm text-gray-500 max-w-sm mb-4">
        {description || config.description}
      </p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

interface DataTableEmptyProps {
  searchQuery?: string;
  filterCount?: number;
  onClearFilters?: () => void;
  className?: string;
}

export function DataTableEmpty({
  searchQuery,
  filterCount,
  onClearFilters,
  className,
}: DataTableEmptyProps): React.JSX.Element {
  const hasFilters = searchQuery || (filterCount && filterCount > 0);

  return (
    <EmptyState
      variant={hasFilters ? "search" : "default"}
      title={hasFilters ? "No matching results" : "No items found"}
      description={
        hasFilters
          ? `Try adjusting${searchQuery ? ` your search "${searchQuery}"` : ""}${
              filterCount && filterCount > 0
                ? `${searchQuery ? " or" : ""} your filters`
                : ""
            }`
          : "There are no items to display at this time."
      }
      action={
        hasFilters && onClearFilters ? (
          <Button
            onClick={onClearFilters}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Clear all filters
          </Button>
        ) : undefined
      }
      className={className}
    />
  );
}
