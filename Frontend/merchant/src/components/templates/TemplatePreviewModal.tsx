"use client";

import React, { useState } from "react";
import { Button, Icon } from "@vayva/ui";
import { TEMPLATES } from "@/lib/templates/index";

interface TemplatePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId: string;
}

interface TemplateData {
  id: string;
  slug: string;
  name: string;
}

export function TemplatePreviewModal({ open, onOpenChange, templateId }: TemplatePreviewModalProps) {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const template = TEMPLATES.find(
    (t: any) => t.id === templateId || t.slug === templateId,
  ) as TemplateData | undefined;

  if (!open || !template) return null;

  const previewUrl = `/store/preview/${template.slug}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60  p-4 overflow-y-auto"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="bg-white rounded-2xl max-w-6xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-gray-900">
              {template.name}
            </h2>
            <span className="text-xs bg-white/40 text-gray-400 px-2 py-0.5 rounded-full font-medium">
              {template.slug}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-white/40 rounded-lg p-0.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewport("desktop")}
                className={`h-7 w-7 rounded-md ${viewport === "desktop" ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-500"}`}
                aria-label="Desktop preview"
              >
                <Icon name="Monitor" className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewport("mobile")}
                className={`h-7 w-7 rounded-md ${viewport === "mobile" ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-500"}`}
                aria-label="Mobile preview"
              >
                <Icon name="Smartphone" className="w-4 h-4" />
              </Button>
            </div>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-gray-400 hover:text-gray-500 transition-colors"
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
            className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 h-full ${
              viewport === "mobile" ? "w-[375px]" : "w-full"
            }`}
          >
            {!iframeLoaded && (
              <div className="flex items-center justify-center h-full text-gray-400 gap-2">
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
