"use client";

import { useEffect, useMemo, useState } from "react";
import { useOnboarding } from "../OnboardingContext";
import { Button, cn } from "@vayva/ui";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client-shared";
import { Check } from "@phosphor-icons/react/ssr";

type Tool = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  isEnabled: boolean;
  isRequired: boolean;
  canToggle: boolean;
};

type ToolsApiResponse = {
  success: boolean;
  data?: {
    tools: Tool[];
  };
  error?: string;
};

export default function ToolsStep() {
  const { state, updateData, nextStep, isSaving } = useOnboarding();

  const [isLoading, setIsLoading] = useState(true);
  const [tools, setTools] = useState<Tool[]>([]);

  const selected = useMemo(() => {
    const fromState = state.settings?.enabledTools;
    return new Set(Array.isArray(fromState) ? fromState : []);
  }, [state.settings?.enabledTools]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        const res = await apiJson<ToolsApiResponse>("/api/merchant/tools");
        if (!mounted) return;
        if (!res.success || !res.data) {
          toast.error(res.error || "Failed to load tools");
          setTools([]);
          return;
        }
        setTools(res.data.tools);

        // Prefill selection from API if state is empty
        if (!state.settings?.enabledTools || state.settings.enabledTools.length === 0) {
          const enabled = res.data.tools
            .filter((t: Tool) => t.isEnabled || t.isRequired)
            .map((t: Tool) => t.id);
          updateData({ settings: { enabledTools: enabled } });
        }
      } catch (e: unknown) {
        toast.error("Failed to load tools");
        setTools([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [state.settings?.enabledTools, updateData]);

  const toggle = (toolId: string, enabled: boolean) => {
    const next = new Set(selected);
    if (enabled) next.add(toolId);
    else next.delete(toolId);
    updateData({ settings: { enabledTools: Array.from(next) } });
  };

  const onContinue = async () => {
    const enabledTools = Array.from(selected);
    if (enabledTools.length === 0) {
      toast.error("Please select at least one tool.");
      return;
    }

    try {
      // Persist each non-required tool setting to DB.
      // Core tools are enforced on the API anyway.
      await Promise.all(
        tools
          .filter((t) => t.canToggle)
          .map((t) =>
            apiJson("/api/merchant/tools", {
              method: "POST",
              body: JSON.stringify({
                toolId: t.id,
                enabled: selected.has(t.id),
              }),
            }),
          ),
      );

      await nextStep({ settings: { enabledTools } });
    } catch (e: unknown) {
      toast.error("Failed to save tools. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight">
          Pick the tools you want
        </h2>
        <p className="text-text-secondary max-w-xl mx-auto">
          This controls what shows up in your dashboard. You can change this later.
        </p>
      </div>

      <div className="bg-background border border-border rounded-[32px] p-6 shadow-card">
        {isLoading ? (
          <div className="text-sm text-text-tertiary">Loading tools…</div>
        ) : tools.length === 0 ? (
          <div className="text-sm text-text-tertiary">No tools found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tools.map((t) => {
              const isChecked = t.isRequired ? true : selected.has(t.id);
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={isChecked}
                  onClick={() => {
                    if (!t.canToggle) return;
                    toggle(t.id, !isChecked);
                  }}
                  className={cn(
                    "text-left p-4 rounded-2xl border transition-all",
                    isChecked
                      ? "border-vayva-green bg-vayva-green/10"
                      : "border-border bg-white/30 hover:bg-white",
                    !t.canToggle && "opacity-70 cursor-default",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-text-primary truncate">
                        {t.name}
                      </p>
                      <p className="text-[11px] text-text-tertiary leading-snug mt-1">
                        {t.description || ""}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0",
                        isChecked
                          ? "bg-vayva-green border-vayva-green"
                          : "bg-transparent border-border",
                      )}
                      aria-hidden
                    >
                      {isChecked ? (
                        <Check size={12} className="text-white" />
                      ) : null}
                    </div>
                  </div>
                  {t.isRequired ? (
                    <p className="mt-2 text-[10px] font-black text-text-tertiary uppercase tracking-widest">
                      Required (core)
                    </p>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Button
        onClick={onContinue}
        disabled={isLoading || isSaving}
        className="w-full h-14 bg-text-primary hover:bg-zinc-800 text-white rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-[0.98]"
      >
        Continue
      </Button>
    </div>
  );
}
