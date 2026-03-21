"use client";

import React, { ReactNode } from "react";
import { ErrorBoundary as SharedErrorBoundary } from "@vayva/ui";
import * as Sentry from "@sentry/nextjs";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Merchant Admin specific wrapper for the shared ErrorBoundary
 * that adds Sentry reporting.
 */
export function ErrorBoundary({ children, fallback, name, onError }: Props) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });
    onError?.(error, errorInfo);
  };

  return (
    <SharedErrorBoundary name={name} fallback={fallback} onError={handleError}>
      {children}
    </SharedErrorBoundary>
  );
}

export { withErrorBoundary } from "@vayva/ui";
