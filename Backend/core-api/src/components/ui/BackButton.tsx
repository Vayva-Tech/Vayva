"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button, cn } from "@vayva/ui";
import { ArrowLeft } from "@phosphor-icons/react/ssr";

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
}

/**
 * Standardized Back Button for consistent navigation across the merchant dashboard.
 * Supports both router.back() and explicit href links.
 */
export function BackButton({
  href,
  label = "Back",
  className,
  variant = "ghost",
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleBack}
      className={cn("gap-2 px-3 h-9 rounded-xl", className)}
      aria-label={label}
    >
      <ArrowLeft size={18} />
      {label && <span className="font-semibold">{label}</span>}
    </Button>
  );
}
