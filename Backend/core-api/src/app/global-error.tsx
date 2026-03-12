"use client";

import { RescueOverlay } from "@/components/rescue/RescueOverlay";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    // Log fatal error to our system
    // We import logger dynamically or use console if outside context, but here we can import.
    // However, global-error is special. Let's try to keep it simple.
  }, [error]);

  return (
    <html>
      <body>
        <RescueOverlay error={error} reset={reset} />
      </body>
    </html>
  );
}
