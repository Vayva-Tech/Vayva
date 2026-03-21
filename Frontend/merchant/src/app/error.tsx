"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";
import { RescueOverlay } from "@/components/rescue/RescueOverlay";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Client Error Boundary Caught Error", error, {
      digest: error.digest,
    });
  }, [error]);

  return <RescueOverlay error={error} reset={reset} />;
}
