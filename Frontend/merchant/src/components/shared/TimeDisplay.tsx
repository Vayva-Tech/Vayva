"use client";

import { useState, useEffect } from "react";

interface TimeDisplayProps {
  date: string | Date | number;
  format?: "time" | "date" | "datetime";
  className?: string;
  suppressHydrationWarning?: boolean;
}

/**
 * Safely displays formatted time/date in Client Components to avoid
 * Next.js hydration mismatches.
 */
export function TimeDisplay({
  date,
  format = "time",
  className,
  suppressHydrationWarning = true,
}: TimeDisplayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  if (!mounted) {
    // Return a skeleton or just an empty span during SSR
    return <span className={className}>...</span>;
  }

  const d = new Date(date);

  let formatted = "";
  if (format === "time") {
    formatted = d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (format === "date") {
    formatted = d.toLocaleDateString();
  } else {
    formatted = `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  return (
    <span
      className={className}
      suppressHydrationWarning={suppressHydrationWarning}
    >
      {formatted}
    </span>
  );
}
