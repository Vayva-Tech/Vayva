import type { ReactNode } from "react";
import { cn } from "@vayva/ui";

export function SoftCard({
  title,
  rightSlot,
  children,
  className,
}: {
  title?: string;
  rightSlot?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-border/60 bg-background/70 backdrop-blur-xl shadow-card",
        className,
      )}
    >
      {(title || rightSlot) && (
        <div className="flex items-center justify-between px-6 pt-6">
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          {rightSlot}
        </div>
      )}
      <div className="px-6 pb-6 pt-4">{children}</div>
    </div>
  );
}
