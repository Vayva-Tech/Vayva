"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@vayva/ui";
import { logger } from "@vayva/shared";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class OnboardingErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: undefined,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("[ONBOARDING_ERROR_BOUNDARY]", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      app: "merchant",
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  private handleSupport = () => {
    window.location.href = "/support";
  };

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-50 p-6">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-emerald-100">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-2xl">😕</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Something went wrong
                </h1>
                <p className="text-gray-600 mb-6">
                  We encountered an error while loading your onboarding. Don't worry, your progress is saved.
                </p>
                
                {this.state.error && (
                  <details className="mb-6 text-left bg-gray-50 rounded-lg p-4">
                    <summary className="font-semibold text-sm text-gray-700 cursor-pointer mb-2">
                      Error Details
                    </summary>
                    <pre className="text-xs text-red-600 whitespace-pre-wrap overflow-auto max-h-40">
                      {this.state.error.toString()}
                    </pre>
                  </details>
                )}

                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={this.handleRetry}
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
                  >
                    🔄 Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={this.handleSupport}
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default OnboardingErrorBoundary;
