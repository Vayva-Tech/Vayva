"use client";

import React from "react";
import { cn } from "@vayva/ui";
import { Funnel, X } from "@phosphor-icons/react/ssr";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterField {
  key: string;
  label: string;
  type: "select" | "search" | "date" | "status";
  options?: FilterOption[];
  placeholder?: string;
}

interface OpsFiltersProps {
  fields: FilterField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onReset: () => void;
  className?: string;
}

export function OpsFilters({
  fields,
  values,
  onChange,
  onReset,
  className,
}: OpsFiltersProps): React.JSX.Element {
  const hasActiveFilters = Object.values(values).some((v) => v && v !== "all" && v !== "ALL");

  return (
    <div className={cn("bg-gray-50 rounded-xl p-4 space-y-4", className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Funnel className="w-4 h-4" />
        Filters
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="ml-auto text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {fields.map((field) => (
          <div key={field.key} className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase">
              {field.label}
            </label>
            
            {field.type === "select" && field.options && (
              <select
                value={values[field.key] || "all"}
                onChange={(e) => onChange(field.key, e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}

            {field.type === "search" && (
              <input
                type="text"
                value={values[field.key] || ""}
                onChange={(e) => onChange(field.key, e.target.value)}
                placeholder={field.placeholder || "Search..."}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}

            {field.type === "status" && (
              <select
                value={values[field.key] || "ALL"}
                onChange={(e) => onChange(field.key, e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="VERIFIED">Verified</option>
                <option value="REJECTED">Rejected</option>
                <option value="UNDER_REVIEW">Under Review</option>
              </select>
            )}

            {field.type === "date" && (
              <input
                type="date"
                value={values[field.key] || ""}
                onChange={(e) => onChange(field.key, e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export type { FilterField, FilterOption };
