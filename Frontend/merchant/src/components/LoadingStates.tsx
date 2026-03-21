import React from "react";
import { Spinner as Loader2 } from "@phosphor-icons/react/ssr";

// Full page loading spinner
export function PageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-500 mx-auto mb-4" />
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
}

// Inline loading spinner
export function InlineLoader({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-green-500`} />
    </div>
  );
}

// Card skeleton loader
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-100 p-6 animate-pulse">
      <div className="h-4 bg-border rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-border rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-border rounded w-2/3"></div>
    </div>
  );
}

// Table row skeleton loader
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-border rounded"></div>
        </td>
      ))}
    </tr>
  );
}

// List skeleton loader
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 animate-pulse">
          <div className="h-12 w-12 bg-border rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-border rounded w-3/4"></div>
            <div className="h-3 bg-border rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Product grid skeleton
export function ProductGridSkeleton({ items = 6 }: { items?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg border border-gray-100 overflow-hidden animate-pulse"
        >
          <div className="h-48 bg-border"></div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-border rounded w-3/4"></div>
            <div className="h-4 bg-border rounded w-1/2"></div>
            <div className="h-8 bg-border rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Empty state component
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-12">
      {Icon && (
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-white/40 p-3">
            <Icon className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
