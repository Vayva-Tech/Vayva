import { cn } from "@vayva/ui";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  count?: number;
}

export function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-border dark:bg-text-secondary";

  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-md",
  };

  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              variantClasses[variant],
              width &&
                `w-[${typeof width === "number" ? `${width}px` : width}]`,
              height &&
                `h-[${typeof height === "number" ? `${height}px` : height}]`,
              className,
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        width && `w-[${typeof width === "number" ? `${width}px` : width}]`,
        height && `h-[${typeof height === "number" ? `${height}px` : height}]`,
        className,
      )}
    />
  );
}

// Preset Skeletons for common use cases
export function ProductCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <Skeleton variant="rectangular" height={200} className="w-full" />
      <Skeleton variant="text" className="w-3/4" />
      <Skeleton variant="text" className="w-1/2" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton variant="text" width={80} />
        <Skeleton variant="rectangular" width={100} height={36} />
      </div>
    </div>
  );
}

export function OrderRowSkeleton() {
  return (
    <div className="border-b py-4 flex items-center gap-4">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" className="w-1/4" />
        <Skeleton variant="text" className="w-1/3" />
      </div>
      <Skeleton variant="rectangular" width={80} height={24} />
      <Skeleton variant="rectangular" width={100} height={32} />
    </div>
  );
}

export function DashboardCardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton variant="text" width={120} />
        <Skeleton variant="circular" width={32} height={32} />
      </div>
      <Skeleton variant="text" width={100} height={32} />
      <Skeleton variant="text" width={80} className="mt-2" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <OrderRowSkeleton key={i} />
      ))}
    </div>
  );
}
