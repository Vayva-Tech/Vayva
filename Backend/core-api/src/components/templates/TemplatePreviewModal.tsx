"use client";

import React, { useState } from "react";
import { Button, Icon } from "@vayva/ui";
import { TEMPLATES } from "@/lib/templates/index";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function TemplatePreviewModal({ open, onOpenChange, templateId }: any) {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const template = TEMPLATES.find(
    (t) => t.id === templateId || t.slug === templateId,
  );

  if (!open || !template) return null;

  const previewUrl = `/store/preview/${template.slug}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="bg-background rounded-2xl max-w-6xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-text-primary">
              {template.name}
            </h2>
            <span className="text-xs bg-white/40 text-text-tertiary px-2 py-0.5 rounded-full font-medium">
              {template.slug}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-white/40 rounded-lg p-0.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewport("desktop")}
                className={`h-7 w-7 rounded-md ${viewport === "desktop" ? "bg-background shadow-sm text-text-primary" : "text-text-tertiary hover:text-text-secondary"}`}
                aria-label="Desktop preview"
              >
                <Icon name="Monitor" className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewport("mobile")}
                className={`h-7 w-7 rounded-md ${viewport === "mobile" ? "bg-background shadow-sm text-text-primary" : "text-text-tertiary hover:text-text-secondary"}`}
                aria-label="Mobile preview"
              >
                <Icon name="Smartphone" className="w-4 h-4" />
              </Button>
            </div>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-text-tertiary hover:text-text-secondary transition-colors"
              aria-label="Open preview in new tab"
            >
              <Icon name="ArrowUpRight" className="w-4 h-4" />
            </a>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <Icon name="X" className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 bg-white/40 flex items-center justify-center p-4 overflow-hidden">
          <div
            className={`bg-background rounded-lg shadow-lg overflow-hidden transition-all duration-300 h-full ${
              viewport === "mobile" ? "w-[375px]" : "w-full"
            }`}
          >
            {!iframeLoaded && (
              <div className="flex items-center justify-center h-full text-text-tertiary gap-2">
                <Icon name="Spinner" className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading preview...</span>
              </div>
            )}
            <iframe
              src={previewUrl}
              title={`Preview: ${template.name}`}
              className={`w-full h-full border-0 ${iframeLoaded ? "" : "hidden"}`}
              style={{ minHeight: "600px" }}
              onLoad={() => setIframeLoaded(true)}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
