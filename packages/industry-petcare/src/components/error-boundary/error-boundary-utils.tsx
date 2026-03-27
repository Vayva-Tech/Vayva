/**
 * Error Boundary Utilities for Industry Dashboards
 * Inline implementation - avoids circular dependencies
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

// Simple console logger fallback to avoid dependency issues
const logger = {
  error: (message: string, ...args: any[]) => {
    console.error(message, ...args);
  },
};

interface DashboardErrorBoundaryProps {
  children: ReactNode;
  serviceName: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  retryEnabled?: boolean;
  maxRetries?: number;
}

interface DashboardErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
  isRetrying: boolean;
}

export class DashboardErrorBoundary extends Component<
  DashboardErrorBoundaryProps,
  DashboardErrorBoundaryState
> {
  private retryTimeout: NodeJS.Timeout | null = null;

  public state: DashboardErrorBoundaryState = {
    hasError: false,
    error: null,
    retryCount: 0,
    isRetrying: false,
  };

  public static getDerivedStateFromError(error: Error): DashboardErrorBoundaryState {
    return {
      hasError: true,
      error,
      retryCount: 0,
      isRetrying: false,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { serviceName, onError } = this.props;

    logger.error('[DASHBOARD_ERROR_BOUNDARY]', {
      serviceName,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    this.setState({ error });

    if (onError) {
      onError(error, errorInfo);
    }
  }

  public render() {
    const { hasError, error } = this.state;
    const { children, fallback, serviceName } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div
          className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-6"
          role="alert"
          aria-label={`${serviceName} error`}
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h3 className="mb-2 text-lg font-semibold text-red-900">
            {serviceName} Failed to Load
          </h3>

          <p className="mb-4 text-sm text-red-700">
            {error?.message || 'An unexpected error occurred'}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return children;
  }
}

export function withDashboardErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: { serviceName: string; fallback?: ReactNode }
) {
  const { serviceName, fallback } = options;

  return function WithErrorBoundary(props: P) {
    return (
      <DashboardErrorBoundary serviceName={serviceName} fallback={fallback}>
        <WrappedComponent {...props} />
      </DashboardErrorBoundary>
    );
  };
}

export function createSectionErrorBoundary(sectionName: string) {
  return function SectionErrorBoundary({ children }: { children: ReactNode }) {
    return (
      <DashboardErrorBoundary serviceName={sectionName}>
        {children}
      </DashboardErrorBoundary>
    );
  };
}

export const SectionErrorBoundaries = {
  StatsGrid: createSectionErrorBoundary('StatsGrid'),
  DataTable: createSectionErrorBoundary('DataTable'),
  Chart: createSectionErrorBoundary('Chart'),
  MetricCard: createSectionErrorBoundary('MetricCard'),
  Form: createSectionErrorBoundary('Form'),
  List: createSectionErrorBoundary('List'),
  Gallery: createSectionErrorBoundary('Gallery'),
  Timeline: createSectionErrorBoundary('Timeline'),
  Kanban: createSectionErrorBoundary('Kanban'),
  Calendar: createSectionErrorBoundary('Calendar'),
};
