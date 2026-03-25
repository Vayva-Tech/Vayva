"use client";

import React from "react";
import { cn } from "@/lib/utils";

const TRACK =
  "flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 pt-1 px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x";

type MarketingSnapRowProps = {
  children: React.ReactNode;
  /** Screen-reader / optional visible hint above the row */
  ariaLabel: string;
  hint?: string;
  hintSub?: string;
  className?: string;
  trackClassName?: string;
  /** Dot indicators matching child count — pass same length as items */
  showDots?: boolean;
  dotCount?: number;
};

/**
 * Horizontal snap-scroll row for mobile. Pair with {@link MarketingSnapItem}.
 * Hide with `md:hidden` on the wrapper; show a `hidden md:grid` desktop layout alongside.
 */
export function MarketingSnapRow({
  children,
  ariaLabel,
  hint,
  hintSub,
  className,
  trackClassName,
  showDots,
  dotCount,
}: MarketingSnapRowProps): React.JSX.Element {
  return (
    <div className={cn("w-full min-w-0", className)}>
      {hint ? (
        <>
          <p className="text-center text-sm font-medium text-slate-600 mb-0.5 px-4">
            {hint}
          </p>
          {hintSub ? (
            <p className="text-center text-xs text-slate-400 mb-3 px-4">
              {hintSub}
            </p>
          ) : (
            <div className="h-3 shrink-0" aria-hidden />
          )}
        </>
      ) : null}
      <div
        className={cn(TRACK, trackClassName)}
        style={{ WebkitOverflowScrolling: "touch" }}
        role="region"
        aria-label={ariaLabel}
      >
        {children}
      </div>
      {showDots && dotCount != null && dotCount > 0 ? (
        <div
          className="flex justify-center gap-1.5 pt-1"
          aria-hidden
        >
          {Array.from({ length: dotCount }).map((_, i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-emerald-200"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

type MarketingSnapItemProps = {
  children: React.ReactNode;
  className?: string;
  /** Default: one panel per viewport width minus padding */
  width?: "full" | "narrow";
};

export function MarketingSnapItem({
  children,
  className,
  width = "full",
}: MarketingSnapItemProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "snap-center shrink-0",
        width === "full"
          ? "w-[min(100%,calc(100vw-2rem))] max-w-[420px]"
          : "w-[min(100%,calc(100vw-3rem))] max-w-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}
