// @ts-nocheck
"use client";

import { useEffect, useMemo, useState } from "react";
import { useOnboarding } from "../OnboardingContext";
import { Button, cn, Label } from "@vayva/ui";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client-shared";
import { IndustrySlug } from "@/lib/templates/types";
import { CheckCircle, Building, ForkKnife as Utensils, ShoppingBag, Barbell as Dumbbell, GraduationCap, House, Palette, Briefcase, Stethoscope, Ticket } from "@phosphor-icons/react/ssr";

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

const INDUSTRY_ICONS: Record<string, any> = {
  retail: ShoppingBag,
  fashion: ShoppingBag,
  food: Utensils,
  restaurant: Utensils,
  grocery: ShoppingBag,
  healthcare: Stethoscope,
  fitness: Dumbbell,
  education: GraduationCap,
  real_estate: House,
  professional_services: Briefcase,
  beauty_wellness: Palette,
  events: Ticket,
  nightlife: Ticket,
};

const REQUIRED: Array<{ type: PolicyType; label: string; description: string }> = [
  { type: "TERMS", label: "Terms of Service", description: "Rules for using your service" },
  { type: "PRIVACY", label: "Privacy Policy", description: "How you protect customer data" },
  { type: "RETURNS", label: "Return Policy", description: "Product return conditions" },
  { type: "REFUNDS", label: "Refund Policy", description: "Money back guarantee terms" },
  { type: "SHIPPING_DELIVERY", label: "Shipping & Delivery", description: "Delivery timelines and costs" },
];

export default function PoliciesStep() {
  const { nextStep, isSaving, state } = useOnboarding();

  const [isLoading, setIsLoading] = useState(true);
  const [policies, setPolicies] = useState<MerchantPolicy[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const industrySlug = (state.industrySlug as IndustrySlug) || "retail";
  
  const IndustryIcon = INDUSTRY_ICONS[industrySlug] || ShoppingBag;

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
        body: JSON.stringify({ industry: industrySlug }),
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`${industrySlug.charAt(0).toUpperCase() + industrySlug.slice(1)}-specific policies generated!`);
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
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-vayva-green/10 mb-2">
          <IndustryIcon className="w-7 h-7 text-vayva-green" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
          {industrySlug.charAt(0).toUpperCase() + industrySlug.slice(1)} Industry Policies
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          We'll generate legal templates tailored for your industry. You can customize them later.
        </p>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-teal-50 border border-green-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
            <CheckCircle className="w-6 h-6 text-vayva-green" />
          </div>
          <div>
            <p className="text-sm font-bold text-green-900">Industry-Specific Templates</p>
            <p className="text-xs text-green-700 mt-1">
              Each policy includes clauses specific to {industrySlug.replace('_', ' ')} businesses, 
              ensuring compliance with industry regulations.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[32px] p-6  space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-gray-900">Required Policies</p>
          <p className="text-sm font-black text-gray-500">
            {doneCount}/{REQUIRED.length}
          </p>
        </div>

        {isLoading ? (
          <div className="text-sm text-gray-400">Loading policies…</div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {REQUIRED.map((r) => {
              const status = statusByType.get(r.type) || "MISSING";
              const isOk = status === "PUBLISHED";
              return (
                <div
                  key={r.type}
                  className={cn(
                    "p-4 rounded-2xl border transition-all hover:shadow-md",
                    isOk 
                      ? "border-vayva-green bg-vayva-green/10" 
                      : "border-gray-100 bg-white/30 hover:bg-white/50",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-900">{r.label}</p>
                        {isOk && (
                          <CheckCircle className="w-4 h-4 text-vayva-green" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">{r.description}</p>
                      {isOk && (
                        <p className="text-[10px] text-vayva-green/80 mt-2">
                          ✓ Generated with {industrySlug}-specific clauses
                        </p>
                      )}
                    </div>
                    <p
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full",
                        isOk 
                          ? "bg-vayva-green/20 text-vayva-green" 
                          : "bg-border/30 text-gray-400",
                      )}
                    >
                      {isOk ? "Ready" : status}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={publishDefaults}
            disabled={isLoading || isPublishing}
            className="h-12 rounded-xl font-bold text-base"
          >
            {isPublishing ? (
              <>
                <CheckCircle className="w-5 h-5 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Generate {industrySlug.charAt(0).toUpperCase() + industrySlug.slice(1)} Policies
              </>
            )}
          </Button>
          <p className="text-[11px] text-gray-400 sm:self-center">
            Takes ~30 seconds. You can edit wording anytime in Settings.
          </p>
          <a
            className={cn(
              "h-12 px-4 rounded-xl font-bold inline-flex items-center justify-center",
              "border border-gray-100 bg-white hover:bg-gray-50 text-gray-500",
            )}
            href="/dashboard/settings/store-policies"
          >
            Edit Later
          </a>
        </div>
      </div>

      <div className="pt-3 flex gap-3">
        <Button
          variant="outline"
          onClick={() => nextStep()}
          disabled={isSaving}
          className="h-12 px-6 rounded-xl font-bold"
        >
          Skip for Now
        </Button>
        <Button
          onClick={() => nextStep()}
          disabled={isSaving || isPublishing}
          className="flex-1 h-12 bg-text-green-500 hover:bg-zinc-800 text-white rounded-xl font-bold text-lg shadow-xl transition-all active:scale-[0.98]"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
