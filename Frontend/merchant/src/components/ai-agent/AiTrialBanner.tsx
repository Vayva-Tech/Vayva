"use client";

import React from "react";

interface AiTrialBannerProps {
  variant?: "block" | "inline";
  className?: string;
}

export function AiTrialBanner({
  variant = "block",
  className,
}: AiTrialBannerProps) {
  const baseClasses =
    variant === "inline"
      ? "inline-flex rounded-md border border-amber-200 bg-orange-50 px-3 py-1.5 text-[11px] text-amber-800"
      : "rounded-lg border border-amber-200 bg-orange-50 px-3 py-2 text-xs text-amber-800";

  const classes = className ? `${baseClasses} ${className}` : baseClasses;

  return (
    <div className={classes}>
      During your 7-day free trial, your AI assistant uses a default persona and
      some features are limited. Upgrade to a paid plan in{" "}
      <a
        href="/dashboard/settings/billing"
        className="font-semibold underline underline-offset-2"
      >
        Billing
      </a>{" "}
      to fully customize identity, tone and behavior.
    </div>
  );
}
