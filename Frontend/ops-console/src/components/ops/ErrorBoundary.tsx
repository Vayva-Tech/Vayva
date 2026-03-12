"use client";

import React from "react";
import { Button } from "@vayva/ui";
import { ErrorState } from "./ErrorState";

interface OpsErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface OpsErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class OpsErrorBoundary extends React.Component<
  OpsErrorBoundaryProps,
  OpsErrorBoundaryState
> {
  constructor(props: OpsErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): OpsErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[OpsErrorBoundary] Caught error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorState
          title="Something went wrong"
          description={
            this.state.error?.message ||
            "An unexpected error occurred. Please try again."
          }
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

// Specialized error boundaries for specific sections
export function PageErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <OpsErrorBoundary
      fallback={
        <div className="p-8">
          <ErrorState
            title="Page Error"
            description="Failed to load this page. Please refresh or try again later."
            onRetry={() => window.location.reload()}
          />
        </div>
      }
    >
      {children}
    </OpsErrorBoundary>
  );
}

export function SectionErrorBoundary({
  children,
  sectionName,
}: {
  children: React.ReactNode;
  sectionName?: string;
}): React.JSX.Element {
  return (
    <OpsErrorBoundary
      fallback={
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
          <h3 className="text-sm font-semibold text-red-800 mb-2">
            {sectionName ? `${sectionName} Error` : "Section Error"}
          </h3>
          <p className="text-xs text-red-600">
            This section failed to load. Try refreshing the page.
          </p>
        </div>
      }
    >
      {children}
    </OpsErrorBoundary>
  );
}

// Async error handler hook
export function useAsyncErrorHandler() {
  const handleError = React.useCallback(
    (error: unknown, context?: string) => {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "An unexpected error occurred";

      console.error(
        `[OpsError] ${context ? `[${context}] ` : ""}${message}`,
        error
      );

      // Could integrate with error reporting service here
      // e.g., Sentry, LogRocket, etc.
    },
    []
  );

  const wrapAsync = React.useCallback(
    <T extends (...args: unknown[]) => Promise<unknown>>(
      fn: T,
      context?: string
    ): ((...args: Parameters<T>) => Promise<ReturnType<T> | undefined>) => {
      return async (...args: Parameters<T>) => {
        try {
          return (await fn(...args)) as ReturnType<T>;
        } catch (error) {
          handleError(error, context);
          return undefined;
        }
      };
    },
    [handleError]
  );

  return { handleError, wrapAsync };
}
