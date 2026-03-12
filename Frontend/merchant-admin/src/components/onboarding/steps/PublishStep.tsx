"use client";

import { useEffect, useMemo, useState } from "react";
import { useOnboarding } from "../OnboardingContext";
import { Button, cn } from "@vayva/ui";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client-shared";

type DraftResponse = {
  found?: boolean;
  draft?: {
    id: string;
    storeId: string;
    activeTemplateId: string;
    publishedAt?: string | null;
  };
  error?: string;
};

type CreateDraftResponse = {
  success?: boolean;
  draft?: unknown;
  error?: string;
};

type PublishResponse = {
  success?: boolean;
  published?: unknown;
  error?: string;
};

const DEFAULT_TEMPLATE_ID = "standard";

export default function PublishStep() {
  const { nextStep, isSaving } = useOnboarding();

  const [isLoading, setIsLoading] = useState(true);
  const [hasDraft, setHasDraft] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const canPublish = useMemo(
    () => hasDraft && !isPublished && !isPublishing && !isLoading,
    [hasDraft, isPublished, isPublishing, isLoading],
  );

  const loadDraft = async () => {
    const res = await apiJson<DraftResponse>("/api/storefront/draft");
    if (res.error) throw new Error(res.error);
    setHasDraft(Boolean(res.found));
    setIsPublished(Boolean(res.draft?.publishedAt));
  };

  const ensureDraft = async () => {
    try {
      const res = await apiJson<DraftResponse>("/api/storefront/draft");
      if (res.found) return;

      const created = await apiJson<CreateDraftResponse>("/api/storefront/draft", {
        method: "POST",
        body: JSON.stringify({
          activeTemplateId: DEFAULT_TEMPLATE_ID,
          themeConfig: {},
          sectionConfig: {},
          sectionOrder: [],
          assets: {},
        }),
      });

      if (!created.success) {
        toast.error(created.error || "Failed to create draft");
        return;
      }

      await loadDraft();
    } catch (e: unknown) {
      toast.error("Failed to prepare storefront draft");
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        await ensureDraft();
        if (!mounted) return;
        await loadDraft();
      } catch (e: unknown) {
        toast.error("Failed to load storefront status");
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const publish = async () => {
    try {
      setIsPublishing(true);
      const res = await apiJson<PublishResponse>("/api/storefront/publish", { method: "POST" });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      if (!res.success) {
        toast.error("Failed to publish storefront");
        return;
      }
      toast.success("Storefront published");
      await loadDraft();
    } catch (e: unknown) {
      toast.error("Failed to publish storefront");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight">
          Publish your storefront
        </h2>
        <p className="text-text-secondary max-w-xl mx-auto">
          Publishing is required before you can go live. You can update design later from Control Center.
        </p>
      </div>

      <div className="bg-background border border-border rounded-[32px] p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-text-primary">Status</p>
          <p
            className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              isPublished
                ? "text-vayva-green"
                : hasDraft
                  ? "text-text-secondary"
                  : "text-text-tertiary",
            )}
          >
            {isPublished ? "Published" : hasDraft ? "Draft ready" : "No draft"}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/30 border border-border/40">
          <p className="text-sm font-bold text-text-primary">What this does</p>
          <p className="text-sm text-text-secondary mt-1">
            It takes your saved draft (template + design settings) and makes it live for customers.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={publish}
            disabled={!canPublish}
            className="h-11 rounded-xl font-bold"
          >
            {isPublished ? "Published" : "Publish storefront"}
          </Button>
          <a
            href="/dashboard/control-center"
            className={cn(
              "h-11 px-4 rounded-xl font-bold inline-flex items-center justify-center",
              "border border-border bg-background hover:bg-surface-2/50 text-text-secondary",
            )}
          >
            Open Control Center
          </a>
        </div>

        <p className="text-[11px] text-text-tertiary">
          If you don’t want to publish right now, you can still finish onboarding and come back later.
        </p>
      </div>

      <Button
        onClick={() => nextStep()}
        disabled={isSaving || isPublishing}
        className="w-full h-14 bg-text-primary hover:bg-zinc-800 text-white rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-[0.98]"
      >
        Continue
      </Button>
    </div>
  );
}
