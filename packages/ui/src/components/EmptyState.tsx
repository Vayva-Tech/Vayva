// @ts-nocheck
import * as React from "react";

import { Package } from "@phosphor-icons/react/dist/ssr/Package";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ElementType;
  variant?: "default" | "compact";
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Package,
  variant = "default",
}: EmptyStateProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className={`flex flex-col items-center justify-center ${isCompact ? "p-4" : "p-12"} text-center border border-dashed border-gray-200 rounded-2xl bg-gradient-to-b from-white to-gray-50/50 shadow-sm transition-all hover:border-gray-300`}
    >
      <div
        className={`${isCompact ? "w-10 h-10" : "w-16 h-16"} bg-white rounded-2xl flex items-center justify-center border border-gray-100 mb-6 shadow-md transition-transform hover:scale-110`}
      >
        <Icon className="text-gray-400" size={isCompact ? 20 : 32} />
      </div>
      <h3
        className={`${isCompact ? "text-base" : "text-xl"} font-bold text-gray-900 mb-2`}
      >
        {title}
      </h3>
      <p
        className={`${isCompact ? "text-xs" : "text-sm"} text-gray-500 max-w-sm mb-8 leading-relaxed`}
      >
        {description}
      </p>
      {action && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {action}
        </div>
      )}
    </div>
  );
}
