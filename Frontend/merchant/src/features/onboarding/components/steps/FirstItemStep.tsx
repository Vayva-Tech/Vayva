"use client";

import { useMemo } from "react";
import { useOnboarding } from "../OnboardingContext";
import { Button, cn } from "@vayva/ui";

function getSuggestedLink(industrySlug?: string) {
  // Keep it simple: point to existing creation routes.
  switch (industrySlug) {
    case "food":
      return { href: "/dashboard/menu-items/new", label: "Create menu item" };
    case "services":
      return { href: "/dashboard/services/new", label: "Create service" };
    default:
      return { href: "/dashboard/products/new", label: "Create product" };
  }
}

export default function FirstItemStep() {
  const { state, nextStep, isSaving } = useOnboarding();

  const industrySlug =
    (state.industrySlug as string | undefined) ||
    (state.business?.industry as string | undefined);

  const suggestion = useMemo(() => getSuggestedLink(industrySlug), [industrySlug]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
          Add your first item
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          Add one item now to see how your storefront looks. You can also skip and do this later.
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-[32px] p-6  space-y-4">
        <div className="p-4 rounded-2xl bg-white/30 border border-gray-100">
          <p className="text-sm font-bold text-gray-900">Recommended next step</p>
          <p className="text-sm text-gray-500 mt-1">
            {suggestion.label} to unlock your catalog and test checkout.
          </p>

          <a
            href={suggestion.href}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "mt-4 inline-flex items-center justify-center h-11 px-4 rounded-xl font-bold",
              "bg-vayva-green text-white hover:bg-vayva-green/90",
            )}
          >
            {suggestion.label}
          </a>

          <p className="text-[11px] text-gray-400 mt-3">
            This opens in the dashboard. Come back here afterwards to continue onboarding.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-50 border border-gray-100">
          <p className="text-sm font-bold text-gray-900">Shortcut</p>
          <p className="text-sm text-gray-500 mt-1">
            If you want to finish onboarding first, you can skip this and add items later.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={() => nextStep()}
          disabled={isSaving}
          className="flex-1 h-14 bg-text-green-500 hover:bg-zinc-800 text-white rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-[0.98]"
        >
          Continue
        </Button>
        <Button
          variant="outline"
          onClick={() => nextStep()}
          disabled={isSaving}
          className="h-14 rounded-2xl font-bold"
        >
          Skip for now
        </Button>
      </div>
    </div>
  );
}
