"use client";

import React from "react";
import { cn , Button } from "@vayva/ui";
import { WarningCircle as AlertCircle, ArrowClockwise as RotateCcw } from "@phosphor-icons/react";

interface ErrorStateProps {
  title?: string;
  description?: string;
  error?: Error | string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load the data. Please try again.",
  error,
  onRetry,
  className,
}: ErrorStateProps): React.JSX.Element {
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle className="h-7 w-7 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-2">{description}</p>
      {errorMessage && (
        <p className="text-xs text-gray-400 font-mono max-w-sm mb-4">
          {errorMessage}
        </p>
      )}
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

interface PageErrorProps {
  error: Error;
  reset: () => void;
}

export function PageError({ error, reset }: PageErrorProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
          <AlertCircle className="h-7 w-7 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Page Error</h2>
        <p className="text-sm text-gray-600">
          Something went wrong loading this page. Try refreshing or contact
          engineering if it persists.
        </p>
        {error.message && (
          <p className="text-xs text-gray-400 font-mono">{error.message}</p>
        )}
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="primary">
            Retry
          </Button>
          <Button variant="outline" asChild>
            <a href="/ops">Go to Dashboard</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
