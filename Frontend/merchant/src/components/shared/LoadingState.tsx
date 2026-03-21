"use client";

import { Icon } from "@vayva/ui";

interface LoadingStateProps {
  message?: string;
  fullPage?: boolean;
}

export function LoadingState({ message = "Loading...", fullPage = false }: LoadingStateProps) {
  const containerClass = fullPage
    ? "flex items-center justify-center h-96"
    : "flex items-center justify-center h-64";

  return (
    <div className={containerClass}>
      <div className="text-center">
        <Icon
          name="Loader2"
          className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-3"
        />
        <p className="text-sm text-gray-400">{message}</p>
      </div>
    </div>
  );
}
