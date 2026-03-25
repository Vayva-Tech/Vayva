import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rounded" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className = "",
  variant = "text",
  width,
  height,
}: SkeletonProps): React.JSX.Element {
  const baseStyles = "animate-pulse bg-gray-200";
  
  const variantStyles = {
    text: "rounded",
    circular: "rounded-full",
    rounded: "rounded-lg",
    rectangular: "rounded-md",
  };

  const style: React.CSSProperties = {
    width,
    height,
    minWidth: width,
    minHeight: height,
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

// Common skeleton patterns
export function TextSkeleton({ lines = 1 }: { lines?: number }): React.JSX.Element {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={i === lines - 1 ? "w-3/4" : "w-full"}
          height="1rem"
        />
      ))}
    </div>
  );
}

export function CardSkeleton(): React.JSX.Element {
  return (
    <div className="rounded-xl border border-gray-200 p-6">
      <Skeleton variant="circular" width="48px" height="48px" className="mb-4" />
      <TextSkeleton lines={2} />
    </div>
  );
}
