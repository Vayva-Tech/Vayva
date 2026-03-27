/**
 * Component Error State - Fallback UI for failed components
 * Provides user-friendly error message with retry functionality
 */

'use client';

import React from 'react';
import { Button } from '@vayva/ui/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ComponentErrorStateProps {
  onRetry?: () => void;
  errorMessage?: string;
}

export function ComponentErrorState({ onRetry, errorMessage }: ComponentErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
      <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
      <h4 className="text-sm font-semibold text-gray-900 mb-1">Failed to Load</h4>
      {errorMessage && (
        <p className="text-xs text-gray-600 mb-3 max-w-xs">{errorMessage}</p>
      )}
      {!errorMessage && (
        <p className="text-xs text-gray-600 mb-3">
          This component encountered an error and couldn&apos;t load.
        </p>
      )}
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </Button>
      )}
    </div>
  );
}
