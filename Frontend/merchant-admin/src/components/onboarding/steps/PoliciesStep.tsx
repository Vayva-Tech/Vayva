"use client";

import { useEffect, useMemo, useState } from "react";
import { useOnboarding } from "../OnboardingContext";
import { Button, cn } from "@vayva/ui";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client-shared";

type PolicyType = "TERMS" | "PRIVACY" | "RETURNS" | "REFUNDS" | "SHIPPING_DELIVERY";

type MerchantPolicy = {
  id: string;
  type: string;
  status: string;
  title?: string;
};

type PoliciesListResponse = {
  policies?: MerchantPolicy[];
  error?: string;
};

type PublishDefaultsResponse = {
  success?: boolean;
  published?: PolicyType[];
  skipped?: PolicyType[];
  error?: string;
};

const REQUIRED: Array<{ type: PolicyType; label: string; description: string }> = [
  { type: "TERMS", label: "Terms", description: "Basic terms for ordering from your store." },
  { type: "PRIVACY", label: "Privacy", description: "How you handle customer data." },
  { type: "RETURNS", label: "Returns", description: "When customers can return items." },
  { type: "REFUNDS", label: "Refunds", description: "When and how refunds are processed." },
  { type: "SHIPPING_DELIVERY", label: "Delivery", description: "How you deliver or handle pickup." },
];

export default function PoliciesStep() {
  const { nextStep, isSaving } = useOnboarding();

  const [isLoading, setIsLoading] = useState(true);
  const [policies, setPolicies] = useState<MerchantPolicy[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  const statusByType = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of policies) {
      map.set(String(p.type), String(p.status));
    }
    return map;
  }, [policies]);

  const doneCount = useMemo(() => {
    return REQUIRED.filter((r) => statusByType.get(r.type) === "PUBLISHED").length;
  }, [statusByType]);

  const refresh = async () => {
    const res = await apiJson<PoliciesListResponse>("/api/merchant/policies");
    if (res.error) throw new Error(res.error);
    setPolicies(Array.isArray(res.policies) ? res.policies : []);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        await refresh();
      } catch (e: unknown) {
        toast.error("Failed to load policies");
        if (mounted) setPolicies([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const publishDefaults = async () => {
    try {
      setIsPublishing(true);
      const res = await apiJson<PublishDefaultsResponse>("/api/merchant/policies/publish-defaults", {
        method: "POST",
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Policies published");
      await refresh();
    } catch (e: unknown) {
      toast.error("Failed to publish policies");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-black text-text-primary tracking-tight">
          Publish your store policies
        </h2>
        <p className="text-text-secondary max-w-xl mx-auto">
          These policies are required to go live. We can generate defaults for you now.
        </p>
      </div>

      <div className="bg-background border border-border rounded-[32px] p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-text-primary">Progress</p>
          <p className="text-sm font-black text-text-secondary">
            {doneCount}/{REQUIRED.length}
          </p>
        </div>

        {isLoading ? (
          <div className="text-sm text-text-tertiary">Loading policies…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {REQUIRED.map((r) => {
              const status = statusByType.get(r.type) || "MISSING";
              const isOk = status === "PUBLISHED";
              return (
                <div
                  key={r.type}
                  className={cn(
                    "p-4 rounded-2xl border",
                    isOk ? "border-vayva-green bg-vayva-green/10" : "border-border bg-white/30",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-text-primary">{r.label}</p>
                      <p className="text-[11px] text-text-tertiary mt-1">{r.description}</p>
                    </div>
                    <p
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        isOk ? "text-vayva-green" : "text-text-tertiary",
                      )}
                    >
                      {isOk ? "Published" : status}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={publishDefaults}
            disabled={isLoading || isPublishing}
            className="h-11 rounded-xl font-bold"
          >
            Publish defaults
          </Button>
          <p className="text-[11px] text-text-tertiary sm:self-center">
            You can edit wording anytime in Settings.
          </p>
          <a
            className={cn(
              "h-11 px-4 rounded-xl font-bold inline-flex items-center justify-center",
              "border border-border bg-background hover:bg-surface-2/50 text-text-secondary",
            )}
            href="/dashboard/settings/store-policies"
          >
            Edit policies
          </a>
        </div>
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
