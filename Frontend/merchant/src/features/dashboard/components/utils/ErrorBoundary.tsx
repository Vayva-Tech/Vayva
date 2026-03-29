/**
 * Dashboard Error Boundary
 * 
 * Catches and displays errors in dashboard components
 */

'use client';

import React from 'react';
import { Button } from '@vayva/ui';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class DashboardErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[DashboardErrorBoundary]', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] w-full items-center justify-center rounded-lg border bg-gray-50 p-8 dark:bg-gray-800/50">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              Something went wrong
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              We couldn't load this part of the dashboard. Please try again.
            </p>
            {this.state.error && (
              <pre className="mt-4 max-w-md overflow-auto rounded bg-gray-100 p-2 text-left text-xs text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                {this.state.error.message}
              </pre>
            )}
            <Button
              onClick={this.handleRetry}
              variant="default"
              size="sm"
              className="mt-4"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Dashboard Suspense Component
 * 
 * Shows loading skeleton while lazy components load
 */
export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-lg border bg-gray-200 dark:bg-gray-700"
        />
      ))}
    </div>
  );
}

/**
 * KPICard Skeleton
 */
export function KPICardSkeleton() {
  return (
    <div className="rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-5 w-5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <div className="mt-4 h-8 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <div className="mt-4 flex items-center gap-2">
        <div className="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}

/**
 * Chart Skeleton
 */
export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div
      className="rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700"
      style={{ height }}
    >
      <div className="mb-4 h-6 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-full w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

/**
 * Table Skeleton
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-lg border bg-white p-6 dark:bg-gray-800 dark:border-gray-700">
      <div className="mb-4 h-6 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div
            key={i}
            className="h-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>
    </div>
  );
}
