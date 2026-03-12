import React from "react";
import { Icon } from "@vayva/ui";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div
      className={`animate-spin text-primary ${sizeClasses[size]} ${className}`}
    >
      <Icon name="Loader" size={size === "sm" ? 16 : size === "md" ? 32 : 48} />
    </div>
  );
}
