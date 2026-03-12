"use client";

import { useEffect } from "react";
import { RescueOverlay } from "@/components/rescue/RescueOverlay";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  useEffect(() => {
    console.error("Marketing Global Error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <RescueOverlay error={error} reset={reset} />
      </body>
    </html>
  );
}
