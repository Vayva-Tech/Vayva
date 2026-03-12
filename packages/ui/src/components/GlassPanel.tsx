import * as React from "react";

import { cn } from "../utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: "low" | "medium" | "high";
}

export function GlassPanel({
  className,
  intensity = "medium",
  ...props
}: GlassPanelProps) {
  const intensityMap = {
    low: "bg-white/50 backdrop-blur-md border-border/40",
    medium: "bg-white/70 backdrop-blur-xl border-border/50",
    high: "bg-white/85 backdrop-blur-2xl border-border/60",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border shadow-glass",
        intensityMap[intensity],
        className,
      )}
      {...props}
    />
  );
}
