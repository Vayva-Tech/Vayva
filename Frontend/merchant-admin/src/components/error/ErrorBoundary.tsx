"use client";

import { Component, ReactNode, ErrorInfo } from "react";
import { logger } from "@/lib/logger";
import { Button } from "@vayva/ui";
import { Warning, ArrowClockwise } from "@phosphor-icons/react/ssr";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * ErrorBoundary component that catches JavaScript errors
 * and displays a fallback UI instead of crashing the app
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error reporting service
    logger.error("[ErrorBoundary] Caught error:", { error, errorInfo });
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Send to error reporting (in production, this would go to Sentry/Datadog/etc)
    if (typeof window !== "undefined") {
      // Example: Send to analytics endpoint
      fetch("/api/error-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          url: window.location.href,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }),
      }).catch(() => {
        // Silent fail for error reporting
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  onRetry: () => void;
}

function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return (
    <div className="min-h-[300px] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Warning className="w-8 h-8 text-destructive" />
        </div>
        
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">
          We encountered an unexpected error. Our team has been notified and we&apos;re working to fix it.
        </p>

        {error && process.env.NODE_ENV === "development" && (
          <div className="mb-6 p-4 bg-muted rounded-lg text-left">
            <p className="text-sm font-mono text-destructive">{error.message}</p>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
          <Button onClick={onRetry}>
            <ArrowClockwise className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          If the problem persists, please contact support.
        </p>
      </div>
    </div>
  );
}

/**
 * Section-level error boundary for wrapping specific parts of the UI
 */
export function SectionErrorBoundary({
  children,
  title = "This section",
}: {
  children: ReactNode;
  title?: string;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-6 border border-destructive/20 rounded-xl bg-destructive/5">
          <div className="flex items-center gap-3">
            <Warning className="w-5 h-5 text-destructive" />
            <p className="text-sm">
              {title} failed to load.{" "}
              <button
                onClick={() => window.location.reload()}
                className="underline hover:no-underline text-destructive"
              >
                Refresh
              </button>
            </p>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
