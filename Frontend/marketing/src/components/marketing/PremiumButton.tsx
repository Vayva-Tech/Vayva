"use client";

import React from "react";
import { Button, ButtonProps } from "@vayva/ui";
import { cn } from "@/lib/utils";

interface PremiumButtonProps extends ButtonProps {
  className?: string;
  children: React.ReactNode;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <Button
      className={cn(
        "relative overflow-hidden group transition-all duration-300",
        "bg-primary hover:bg-primary-hover text-white",
        "px-10 py-5 text-lg font-bold rounded-xl",
        "shadow-xl shadow-primary/20",
        "hover:scale-[1.02] active:scale-[0.98]",
        "cubic-bezier(0.2, 0.8, 0.2, 1)",
        className,
      )}
      {...props}
    >
      {/* Shimmer / Gradient Sweep Effect */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />

      {/* Soft Glow */}
      <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_0_20px_hsl(var(--primary)/0.4)] pointer-events-none" />

      {/* Inner Highlight */}
      <span className="absolute inset-0 border border-white/20 rounded-xl pointer-events-none" />

      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </Button>
  );
};
