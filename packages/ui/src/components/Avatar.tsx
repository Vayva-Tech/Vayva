import * as React from "react";
import { cn } from "../utils";

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Avatar({
  src,
  alt,
  fallback,
  size = "md",
  className,
}: AvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
  };

  const [imageError, setImageError] = React.useState(false);

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100",
        sizeClasses[size],
        className,
      )}
    >
      {src && !imageError ? (
        <img
          src={src}
          alt={alt || "Avatar"}
          className="aspect-square h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-500 font-medium">
          {fallback
            ? fallback.slice(0, 2).toUpperCase()
            : alt?.slice(0, 2).toUpperCase() || "??"}
        </div>
      )}
    </div>
  );
}
