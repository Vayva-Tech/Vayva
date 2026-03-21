import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@vayva/ui";

interface SoftCardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  rightSlot?: ReactNode;
  children: ReactNode;
  className?: string;
  loading?: boolean;
}

export function SoftCard({
  title,
  rightSlot,
  children,
  className,
  loading = false,
  ...props
}: SoftCardProps) {
  if (loading) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-gray-100 bg-white p-6",
          className,
        )}
        {...props}
      >
        <div className="space-y-4">
          {title && (
            <div className="h-4 w-24 bg-white-2/50 rounded animate-pulse" />
          )}
          <div className="h-20 bg-white-2/50 rounded-xl animate-pulse" />
          <div className="h-20 bg-white-2/50 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-100 bg-white",
        className,
      )}
      {...props}
    >
      {(title || rightSlot) && (
        <div className="flex items-center justify-between px-6 pt-6">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {rightSlot}
        </div>
      )}
      <div className="px-6 pb-6 pt-4">{children}</div>
    </div>
  );
}
