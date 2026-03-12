"use client";

import React, { useState, useEffect, useRef } from "react";
import { logger } from "@vayva/shared";
import { useRouter } from "next/navigation";
import { Button } from "@vayva/ui";
import { BackButton } from "@/components/ui/BackButton";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ThemeCustomizer } from "@/components/control-center/ThemeCustomizer";
import { toast } from "sonner";
import {
  Spinner as Loader2,
  Monitor,
  DeviceMobile as Smartphone,
  Globe,
} from "@phosphor-icons/react/ssr";
import { buildPreviewStorefrontUrl } from "@/lib/storefront/urls";

import { Template, ThemeConfig } from "@/types/templates";

interface StorefrontDraft {
  store: {
    slug: string;
  } | null;
  template: Template | null;
  themeConfig: ThemeConfig;
}

import { apiJson } from "@/lib/api-client-shared";

interface DraftResponse {
  draft: StorefrontDraft | null;
}

export default function StorefrontCustomizePage() {
  const router = useRouter();
  const [draft, setDraft] = useState<StorefrontDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [isSaving, setIsSaving] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    void loadDraft();
  }, []);

  const loadDraft = async () => {
    try {
      setLoading(true);
      const data = await apiJson<DraftResponse>("/api/storefront/draft");
      setDraft(data?.draft || null);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[LOAD_DRAFT_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error(
        _errMsg || "Could not load unpublished storefront configuration",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (newConfig: ThemeConfig) => {
    // 1. Sync local status
    if (draft) {
      setDraft({ ...draft, themeConfig: newConfig });
    }

    // 2. Send message to iframe for instant preview
    if (iframeRef.current?.contentWindow) {iframeRef?.current?.contentWindow.postMessage(
        {
          type: "VAYVA_PREVIEW_UPDATE",
          config: newConfig,
        },
        "*",
      );
    }

    // 3. Persist to DB (Debounced or on Blur? For now simple patch)
    try {
      await apiJson<{ success: boolean }>("/api/storefront/draft", {
        method: "PATCH",
        body: JSON.stringify({ themeConfig: newConfig }),
      });
    } catch (e: any) {
      const _errMsg = e instanceof Error ? e.message : String(e);
      logger.error("[AUTO_SAVE_ERROR]", { error: _errMsg, app: "merchant" });
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      await apiJson<{ success: boolean }>("/api/storefront/publish", {
        method: "POST",
      });
      toast.success("Storefront Published Live!");
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[PUBLISH_ERROR]", { error: _errMsg, app: "merchant" });
      toast.error("Failed to publish");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10 text-text-tertiary" />
      </div>
    );

  if (!draft)
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <p className="text-text-tertiary">
          Pick a template before customizing.
        </p>
        <Button onClick={() => router.push("/dashboard/control-center")}>
          View Gallery
        </Button>
      </div>
    );

  const storefrontUrl = draft.store?.slug
    ? buildPreviewStorefrontUrl(draft.store?.slug)
    : "";

  return (
    <div className="h-screen flex flex-col bg-background/70 backdrop-blur-xl overflow-hidden">
      {/* Toolbar */}
      <div className="h-14 bg-background/70 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-4">
          <BackButton />
          <Breadcrumbs />
          <div>
            <h1 className="font-bold text-sm leading-none">
              {draft.template?.displayName}
            </h1>
            <p className="text-[10px] text-text-tertiary mt-1 uppercase tracking-widest font-bold">
              Theme Editor
            </p>
          </div>
        </div>

        <div className="flex bg-background/30 p-1 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("desktop")}
            className={`p-1.5 h-auto rounded ${viewMode === "desktop" ? "bg-background/70 backdrop-blur-xl shadow-sm" : "hover:bg-border text-text-tertiary"}`}
            title="Desktop View"
          >
            <Monitor size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("mobile")}
            className={`p-1.5 h-auto rounded ${viewMode === "mobile" ? "bg-background/70 backdrop-blur-xl shadow-sm" : "hover:bg-border text-text-tertiary"}`}
            title="Mobile View"
          >
            <Smartphone size={16} />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex"
            onClick={() =>
              storefrontUrl && window.open(storefrontUrl, "_blank")
            }
            disabled={!storefrontUrl}
          >
            <Globe size={14} className="mr-2" /> View Live
          </Button>
          <Button onClick={handlePublish} disabled={isSaving} size="sm">
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Publish Live"
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Customizer Sidebar */}
        <ThemeCustomizer
          draft={draft}
          onUpdate={handleUpdate}
          onReset={() => loadDraft()}
        />

        {/* Preview Area */}
        <div className="flex-1 bg-background/30 p-8 flex justify-center overflow-auto relative">
          <div
            className={`bg-background/70 backdrop-blur-xl shadow-2xl transition-all duration-300 overflow-hidden ${
              viewMode === "desktop"
                ? "w-full h-full"
                : "w-[375px] h-[667px] rounded-[32px] border-[8px] border-black"
            }`}
          >
            <iframe
              ref={iframeRef}
              src={storefrontUrl}
              className="w-full h-full border-none"
              title="Storefront Preview"
            />
          </div>

          {/* Floating Helper */}
          <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur shadow-sm border border-border/40 px-3 py-1.5 rounded-full text-[10px] font-bold text-text-tertiary flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Live Synchronized
          </div>
        </div>
      </div>
    </div>
  );
}
