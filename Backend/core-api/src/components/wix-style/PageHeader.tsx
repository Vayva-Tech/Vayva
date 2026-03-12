"use client";

import React from "react";
import { Button, Icon, type IconName, cn } from "@vayva/ui";

interface PageHeaderProps {
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    icon: IconName;
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
  };
  secondaryAction?: {
    label: string;
    icon: IconName;
    onClick: () => void;
  };
  className?: string;
}

export function PageHeader({
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10",
        className,
      )}
    >
      <div className="space-y-1.5">
        <h1 className="text-3xl font-black text-text-primary tracking-tight">
          {title}
        </h1>
        <p className="text-sm font-medium text-text-secondary max-w-xl leading-relaxed">
          {description}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {secondaryAction && (
          <Button
            variant="outline"
            onClick={secondaryAction.onClick}
            className="rounded-2xl h-12 px-6 gap-2 border-border/60 hover:bg-white/40 hover:border-border transition-all active:scale-95"
          >
            <Icon name={secondaryAction.icon} size={18} />
            <span className="font-bold">{secondaryAction.label}</span>
          </Button>
        )}

        {primaryAction && (
          <Button
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled || primaryAction.loading}
            className="rounded-2xl h-12 px-8 gap-3 bg-text-primary text-text-inverse hover:bg-zinc-800 transition-all shadow-xl hover:shadow-primary/10 active:scale-95"
          >
            {primaryAction.loading ? (
              <Icon name="Loader2" size={18} className="animate-spin" />
            ) : (
              <Icon name={primaryAction.icon} size={18} />
            )}
            <span className="font-bold">{primaryAction.label}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
