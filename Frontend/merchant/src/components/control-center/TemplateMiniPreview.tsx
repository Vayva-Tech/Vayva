"use client";

import React from "react";
import { cn } from "@vayva/ui";

interface TemplateMiniPreviewProps {
  layoutComponent: string;
  templateName: string;
  className?: string;
  componentProps?: Record<string, unknown>;
}

export const TemplateMiniPreview = React.memo(
  ({ templateName, className }: TemplateMiniPreviewProps) => {
    return (
      <div
        className={cn(
          "w-full aspect-[16/9] bg-white/40 flex items-center justify-center text-gray-400 text-xs rounded-xl border border-gray-100",
          className,
        )}
      >
        {templateName}
      </div>
    );
  },
);

TemplateMiniPreview.displayName = "TemplateMiniPreview";
