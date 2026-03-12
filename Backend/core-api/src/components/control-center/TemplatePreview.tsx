"use client";

import React, { useState } from "react";
import { Icon, cn, Button } from "@vayva/ui";
import { Template } from "@/types/templates";

interface TemplatePreviewProps {
  template: Template;
  onClose: () => void;
  onUse: (template: Template) => void;
  userPlan: "starter" | "growth" | "pro";
}

export const TemplatePreview = ({
  template,
  onClose,
  onUse,
  userPlan,
}: TemplatePreviewProps) => {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [loading, setLoading] = useState(true);

  // Determine lock state
  const planLevels = ["starter", "growth", "pro"];
  const userLevelIndex = planLevels.indexOf(userPlan);
  const requiredLevelIndex = planLevels.indexOf(template.tier);
  const isLocked = requiredLevelIndex > userLevelIndex;

  // Point to internal renderer page
  const iframeSrc = `/preview/${template.id}?mode=${viewMode}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="h-16 bg-background border-b border-border flex items-center justify-between px-6 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="hover:bg-white/40"
            aria-label="Close preview"
            title="Close preview"
          >
            <Icon name="X" size={20} />
          </Button>
          <div>
            <h2 className="font-bold text-text-primary text-lg leading-none">
              {template.displayName}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/40 p-1 rounded-xl">
          <Button
            onClick={() => setViewMode("desktop")}
            className={cn(
              "p-2 rounded-lg transition-all",
              viewMode === "desktop"
                ? "bg-background text-black shadow-sm"
                : "text-text-tertiary hover:text-text-secondary",
            )}
          >
            <Icon name="Monitor" size={20} />
          </Button>
          <Button
            onClick={() => setViewMode("mobile")}
            className={cn(
              "p-2 rounded-lg transition-all",
              viewMode === "mobile"
                ? "bg-background text-black shadow-sm"
                : "text-text-tertiary hover:text-text-secondary",
            )}
          >
            <Icon name="Smartphone" size={20} />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {isLocked ? (
            <div className="flex items-center gap-2 text-sm font-bold text-text-tertiary bg-white/40 px-3 py-1.5 rounded-lg">
              <Icon name="Lock" size={14} /> Available on {template.tier}
            </div>
          ) : (
            <Button
              onClick={() => onUse(template)}
              variant="primary"
              className="px-6 py-2.5 text-sm shadow-lg"
            >
              Use Template
            </Button>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-white/40 overflow-hidden flex items-center justify-center relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        )}

        <div
          className={cn(
            "transition-all duration-500 ease-in-out bg-background shadow-2xl overflow-hidden",
            viewMode === "mobile"
              ? "w-[375px] h-[812px] rounded-[40px] border-[8px] border-border"
              : "w-full h-full",
          )}
        >
          <iframe
            src={iframeSrc}
            className="w-full h-full border-0"
            title="Template Preview"
            onLoad={() => setLoading(false)}
          />
        </div>
      </div>
    </div>
  );
};
