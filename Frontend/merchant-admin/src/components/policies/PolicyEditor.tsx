"use client";

import { logger } from "@vayva/shared";
import React, { useState, useEffect } from "react";
import { Button, Input, Textarea } from "@vayva/ui"; // Assuming these exist
import { getLegalDocument } from "@vayva/content";
import {
  Spinner as Loader2,
  ArrowLeft,
  FloppyDisk as Save,
  Globe,
  ArrowCounterClockwise as RefreshCcw,
  FileText,
} from "@phosphor-icons/react/ssr";
import { useRouter } from "next/navigation";
import { buildLiveStorefrontUrl } from "@/lib/storefront/urls";

interface PolicyEditorProps {
  type: "returns" | "shipping" | "privacy" | "terms";
  initialContent?: string;
  onSave: (content: string) => Promise<void>;
  storeSlug: string;
}

export const PolicyEditor: React.FC<PolicyEditorProps> = ({
  type,
  initialContent,
  onSave,
  storeSlug,
}) => {
  const [content, setContent] = useState(initialContent || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (initialContent) setContent(initialContent);
  }, [initialContent]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(content);
      setIsDirty(false);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("Failed to save policies", {
        error: _errMsg,
        app: "merchant",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    // Get default content from registry
    const defaultDoc = getLegalDocument(
      type === "returns"
        ? "store-return-policy"
        : type === "shipping"
          ? "store-shipping-policy"
          : type === "privacy"
            ? "store-privacy-policy"
            : "store-terms-of-service",
    );
    if (defaultDoc) {
      // Extract plain text or simple markdown from sections
      // This is a simplification; ideally we'd have a 'raw' export or similar
      // For now, let's just use a placeholder or try to reconstruct
      const text = defaultDoc.sections
        .map((s) => `## ${s.heading}\n\n${s.content.join("\n\n")}`)
        .join("\n\n");
      setContent(text);
      setIsDirty(true);
    }
  };

  const handleViewOnStorefront = () => {
    window.open(
      `${buildLiveStorefrontUrl(storeSlug)}/policies/${type}`,
      "_blank",
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] relative">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/40">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-xl font-bold capitalize">{type} Policy</h2>
            <p className="text-sm text-text-tertiary">
              Edit the {type} policy for your store.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            title="Reset to Template"
          >
            <RefreshCcw size={14} className="mr-2" />
            Reset
          </Button>
          <Button variant="outline" size="sm" onClick={handleViewOnStorefront}>
            <Globe size={14} className="mr-2" />
            Storefront
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 w-full flex gap-6 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-bold text-text-tertiary uppercase">
              Markdown Editor
            </label>
            <span className="text-xs text-text-tertiary">
              Supports Basic Markdown (**bold**, - list, # heading)
            </span>
          </div>
          <Textarea
            className="flex-1 w-full p-6 border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-black/5 font-mono text-sm leading-relaxed"
            value={content}
            onChange={handleChange}
            placeholder={`Enter your ${type} policy here...`}
          />
        </div>

        {/* Preview (Simple non-rendered for now or we could try to render) */}
        <div className="hidden lg:flex flex-1 flex-col bg-white/40 rounded-xl border border-border/40 p-6 overflow-y-auto">
          <div className="mb-4 flex items-center justify-between">
            <label className="text-xs font-bold text-text-tertiary uppercase">
              Preview
            </label>
          </div>
          <div className="prose prose-sm max-w-none">
            {/* Very basic render for preview feel */}
            {content.split("\n").map((line, i) => (
              <p
                key={i}
                className={
                  line.startsWith("#")
                    ? "font-bold text-lg mb-2"
                    : "mb-2 text-text-secondary"
                }
              >
                {line.replace(/^#+\s/, "")}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur border-t border-border/40 flex items-center justify-end gap-3 rounded-b-xl">
        {isDirty && (
          <span className="text-xs text-amber-600 font-medium mr-auto">
            Unsaved changes
          </span>
        )}
        <Button
          variant="ghost"
          onClick={() => setContent(initialContent || "")}
          disabled={!isDirty}
        >
          Discard
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          className="bg-black text-white hover:bg-text-primary"
        >
          {isSaving ? (
            <Loader2 className="animate-spin mr-2" size={16} />
          ) : (
            <Save className="mr-2" size={16} />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
};
