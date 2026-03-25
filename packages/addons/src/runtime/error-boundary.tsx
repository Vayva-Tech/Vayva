/**
 * Add-On Error Boundary - Isolates add-on crashes from host application
 * 
 * Wraps add-on components to catch errors and display fallback UI,
 * preventing individual add-on failures from breaking the entire page.
 */
'use client';

import { Button } from "@vayva/ui";
import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface AddOnErrorBoundaryProps {
  /** Add-on instance identifier for error reporting */
  instanceId: string;
  /** Add-on name for display */
  addOnName: string;
  /** Content to render when add-on loads successfully */
  children: ReactNode;
  /** Optional custom fallback component */
  fallback?: ReactNode;
  /** Called when error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether to auto-retry on error */
  autoRetry?: boolean;
  /** Max retry attempts */
  maxRetries?: number;
}

interface AddOnErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
  isRetrying: boolean;
}

export class AddOnErrorBoundary extends Component<
  AddOnErrorBoundaryProps,
  AddOnErrorBoundaryState
> {
  constructor(props: AddOnErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AddOnErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error
    console.error(
      `[AddOnErrorBoundary] ${this.props.instanceId} crashed:`,
      error,
      errorInfo
    );

    // Call error handler
    this.props.onError?.(error, errorInfo);

    // Auto-retry if enabled
    if (this.props.autoRetry && this.state.retryCount < (this.props.maxRetries || 3)) {
      this.handleRetry();
    }
  }

  handleRetry = (): void => {
    this.setState({ isRetrying: true });

    // Small delay before retry to allow transient errors to resolve
    setTimeout(() => {
      this.setState((prevState) => ({
        hasError: false,
        error: null,
        retryCount: prevState.retryCount + 1,
        isRetrying: false,
      }));
    }, 1000);
  };

  handleDisable = (): void => {
    // Emit event to parent to disable this add-on
    const event = new CustomEvent('addon:disable', {
      detail: { instanceId: this.props.instanceId },
    });
    window.dispatchEvent(event);
  };

  render(): ReactNode {
    const { hasError, error, isRetrying } = this.state;
    const { children, fallback, addOnName } = this.props;

    if (isRetrying) {
      return (
        <div className="addon-error-boundary addon-error-boundary--retrying">
          <div className="addon-error-boundary__spinner" />
          <p className="addon-error-boundary__text">Retrying {addOnName}...</p>
        </div>
      );
    }

    if (hasError) {
      // Custom fallback
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="addon-error-boundary addon-error-boundary--error">
          <div className="addon-error-boundary__icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="addon-error-boundary__title">{addOnName} failed to load</p>
          <p className="addon-error-boundary__message">
            {error?.message || 'An unexpected error occurred'}
          </p>
          <div className="addon-error-boundary__actions">
            <Button
              className="addon-error-boundary__retry"
              onClick={this.handleRetry}
              type="button"
            >
              Try Again
            </Button>
            <Button
              className="addon-error-boundary__disable"
              onClick={this.handleDisable}
              type="button"
            >
              Disable
            </Button>
          </div>
        </div>
      );
    }

    return children;
  }
}

/**
 * Hook version for functional components
 */
export function useAddOnErrorHandler(
  instanceId: string,
  onError?: (error: Error) => void
): { handleError: (error: Error) => void; hasError: boolean } {
  const [hasError, setHasError] = React.useState(false);

  const handleError = React.useCallback(
    (error: Error) => {
      console.error(`[AddOn] ${instanceId} error:`, error);
      setHasError(true);
      onError?.(error);
    },
    [instanceId, onError]
  );

  return { handleError, hasError };
}
