"use client";

import {
  WarningCircle as AlertCircle,
  ArrowCounterClockwise as RefreshCw,
} from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";
import { cn } from "@/lib/utils";

interface PageErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function PageError({
  title = "Something went wrong",
  message = "We couldn't load this page. Please try again.",
  onRetry,
  className,
}: PageErrorProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center min-h-[300px] px-6",
        className,
      )}
      role="alert"
    >
      <div className="flex flex-col items-center text-center max-w-md space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="h-7 w-7 text-red-500" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{message}</p>
        </div>
        {onRetry && (
          <Button variant="outline" onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}
