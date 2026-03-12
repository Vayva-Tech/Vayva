"use client";

import { useEffect } from "react";
import { logger } from "@vayva/shared";
import { Button } from "@vayva/ui";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Auth Error Boundary caught error", {
      error: error.message,
      digest: error.digest,
      app: "merchant",
    });
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-transparent">
      <div className="max-w-md w-full bg-background rounded-lg border border-border p-8 shadow-sm text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
          ⚠️
        </div>
        <h2 className="text-2xl font-bold text-black mb-4">
          Something went wrong
        </h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          We encountered an error while trying to process your request. This has
          been logged and we're looking into it.
        </p>
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => reset()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground py-3 font-semibold"
          >
            Try again
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
            className="border-border py-3 font-semibold"
          >
            Go back home
          </Button>
        </div>
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-red-50 text-red-700 text-xs text-left rounded overflow-auto max-h-40 font-mono">
            <p className="font-bold mb-2">Error Detail (Dev Only):</p>
            {error.message}
            <div className="mt-2 text-[10px] opacity-70">{error.stack}</div>
          </div>
        )}
      </div>
    </div>
  );
}
