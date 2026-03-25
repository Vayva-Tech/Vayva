/**
 * Comprehensive Error Boundary Component
 * Provides robust error handling for dashboard components
 */
'use client';

import { Button } from "@vayva/ui";
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@vayva/shared';
import { Warning as AlertTriangle, ArrowsClockwise as RefreshCw, House as Home } from '@phosphor-icons/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  serviceName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0
  };

  private retryTimeout: NodeJS.Timeout | null = null;

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      retryCount: 0
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('[ERROR_BOUNDARY] Caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      serviceName: this.props.serviceName || 'Unknown'
    });

    this.setState({
      error,
      errorInfo
    });

    // Notify parent handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Auto-retry after delay
    this.scheduleRetry();
  }

  private scheduleRetry = () => {
    if (this.state.retryCount < 3) {
      const delay = Math.min(1000 * Math.pow(2, this.state.retryCount), 10000); // Exponential backoff
      
      this.retryTimeout = setTimeout(() => {
        this.handleRetry();
      }, delay);
    }
  };

  private handleRetry = () => {
    logger.info('[ERROR_BOUNDARY] Retrying...', {
      retryCount: this.state.retryCount + 1,
      serviceName: this.props.serviceName
    });

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  private handleManualRetry = () => {
    // Clear any pending auto-retry
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    
    this.handleRetry();
  };

  private handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  public componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-500 mb-6">
                We're sorry, but we encountered an error loading this section. 
                Our team has been notified and is working to fix it.
              </p>
              
              {this.state.retryCount > 0 && (
                <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-500">
                    Attempt {this.state.retryCount} of 3
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleManualRetry}
                disabled={this.state.retryCount >= 3}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="w-4 h-4" />
                {this.state.retryCount >= 3 ? 'Max Retries Reached' : 'Try Again'}
              </Button>
              
              <Button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Home className="w-4 h-4" />
                Return to Dashboard
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm font-medium text-gray-500 cursor-pointer">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    logger.error('[USE_ERROR_HANDLER] Error caught:', error);
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const ErrorDisplay = React.useMemo(() => {
    if (!error) return null;
    
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-800">An error occurred</h3>
            <p className="text-red-700 text-sm mt-1">{error.message}</p>
            <Button
              onClick={clearError}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    );
  }, [error, clearError]);

  return { handleError, clearError, ErrorDisplay, hasError: !!error };
}