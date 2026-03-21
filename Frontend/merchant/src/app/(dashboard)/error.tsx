"use client";

import { useEffect } from "react";
import { Button } from "@vayva/ui";
import {
  Warning as AlertTriangle,
  ArrowCounterClockwise as RefreshCcw,
} from "@phosphor-icons/react/ssr";
import { logger } from "@/lib/logger";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception using our structured logger
    logger.error("Dashboard Crash", error, {
      digest: error.digest,
      component: "DashboardError",
    });
  }, [error]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-300">
      <div className="mb-6 rounded-full bg-red-50 p-6 ring-1 ring-red-100 dark:bg-red-900/20 dark:ring-red-900/40">
        <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
      </div>

      <h2 className="mb-2 text-2xl font-semibold tracking-tight">
        Something went wrong
      </h2>

      <p className="mb-8 max-w-sm text-gray-500">
        We encountered an error loading your dashboard. This has been logged for
        our engineering team.
      </p>

      <div className="flex gap-4">
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Reload Page
        </Button>
        <Button onClick={() => reset()}>Try Again</Button>
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 w-full max-w-xl overflow-hidden rounded bg-gray-100 p-4 text-left font-mono text-xs">
          <p className="mb-2 font-bold text-red-500">Dev Error Details:</p>
          <pre className="whitespace-pre-wrap break-words">{error.message}</pre>
          {error.stack && (
            <pre className="mt-2 whitespace-pre-wrap break-words opacity-50">
              {error.stack}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
