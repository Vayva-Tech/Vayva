"use client";

import { useEffect } from "react";
import { ErrorState } from "@vayva/ui";
import { reportError } from "@/lib/error";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { scope: "app/error", app: "storefront" });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background/40 backdrop-blur-sm">
      <div className="w-full max-w-md">
        <ErrorState
          title="Application Error"
          message={error.message || "An unexpected error occurred."}
          onRetry={reset}
        />
      </div>
    </div>
  );
}
