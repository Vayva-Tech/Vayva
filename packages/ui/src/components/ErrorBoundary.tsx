// @ts-nocheck
"use client";

import * as React from "react";
import { Component, ErrorInfo, ReactNode } from "react";
import { Warning as AlertTriangle } from "@phosphor-icons/react/dist/ssr/Warning";
import { ArrowsClockwise as RefreshCcw } from "@phosphor-icons/react/dist/ssr/ArrowsClockwise";
import { Button } from "./Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `ErrorBoundary caught error in [${this.props.name || "Unknown Component"}]:`,
      error,
      errorInfo,
    );
    // Call custom error handler if provided (e.g., Sentry)
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-8 rounded-2xl border border-red-100 bg-red-50/50 flex flex-col items-center justify-center text-center space-y-6">
          <div className="p-4 bg-red-100 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-red-900">
              Something went wrong
            </h3>
            <p className="text-sm text-red-700/70 max-w-[280px] mx-auto">
              We couldn't load this {this.props.name || "section"}. Please try
              refreshing or resetting.
            </p>
          </div>

          {(process.env.NODE_ENV === "development" || this.props.showDetails) &&
            this.state.error && (
              <div className="w-full max-w-md p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-red-100 text-left overflow-hidden">
                <p className="text-[10px] font-mono text-red-800 break-all whitespace-pre-wrap">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 text-red-700 hover:bg-red-100/50"
              onClick={this.handleReset}
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white border-none"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap a component with an ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: Omit<Props, "children"> = {},
) {
  const componentName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";

  const WithErrorBoundary = (props: P): React.JSX.Element => {
    return (
      <ErrorBoundary name={componentName} {...options}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };

  WithErrorBoundary.displayName = `WithErrorBoundary(${componentName})`;

  return WithErrorBoundary;
}
