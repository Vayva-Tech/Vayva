"use client";

import React, { useId, useState } from "react";
import { PLANS, FEES, formatNGN, type Plan, type PlanKey } from "@/config/pricing";
import { Button } from "@vayva/ui";
import { cn } from "@/lib/utils";

export function PlanComparisonMobile({
  plans = PLANS,
}: {
  /** Use flag-aware display plans from pricing (e.g. Starter trial/promo). */
  plans?: Plan[];
}): React.JSX.Element {
  const tabListId = useId();
  const list = plans.length > 0 ? plans : PLANS;
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>(
    list[0]?.key ?? "starter",
  );

  const selected = list.find((p) => p.key === selectedPlan);

  return (
    <div className="space-y-8">
      <div
        role="tablist"
        aria-label="Select plan to compare"
        className="flex flex-wrap sm:flex-nowrap p-1 bg-muted rounded-xl gap-1"
      >
        {list.map((plan) => (
          <Button
            key={plan.key}
            type="button"
            variant="ghost"
            role="tab"
            id={`${tabListId}-${plan.key}`}
            aria-selected={selectedPlan === plan.key}
            tabIndex={selectedPlan === plan.key ? 0 : -1}
            onClick={() => setSelectedPlan(plan.key)}
            className={cn(
              "flex-1 min-w-[88px] h-auto py-3 px-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all",
              selectedPlan === plan.key
                ? "bg-background text-foreground shadow-sm hover:bg-background"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50",
            )}
          >
            {plan.name}
          </Button>
        ))}
      </div>

      <div
        role="tabpanel"
        aria-labelledby={`${tabListId}-${selectedPlan}`}
        className="bg-background rounded-3xl border border-border p-6 sm:p-8 shadow-xl"
      >
        <h3 className="text-xl font-black text-foreground mb-6">
          {selected?.name} — what&apos;s included
        </h3>
        <div className="space-y-6">
          {[
            {
              name: "Monthly price",
              val: selected != null ? formatNGN(selected.monthlyAmount) : "—",
            },
            {
              name: "Staff seats",
              val:
                selectedPlan === "starter"
                  ? "1"
                  : selectedPlan === "pro"
                    ? "3"
                    : "5",
            },
            {
              name: "Products",
              val:
                selectedPlan === "starter"
                  ? "Up to 100"
                  : selectedPlan === "pro"
                    ? "Up to 300"
                    : "Up to 500",
            },
            {
              name: "WhatsApp capture",
              val: true,
            },
            {
              name: "Industry dashboards",
              val: selectedPlan !== "starter",
            },
            {
              name: "Merged industry view",
              val: selectedPlan === "pro_plus",
            },
            {
              name: "Workflow builder",
              val: selectedPlan === "pro_plus",
            },
            {
              name: "API access",
              val: selectedPlan !== "starter",
            },
            { name: "Withdrawal fee", val: `${FEES.WITHDRAWAL_PERCENTAGE}%` },
          ].map((feat) => (
            <div
              key={feat.name}
              className="flex justify-between items-center gap-4 py-4 border-b border-border/40 last:border-0"
            >
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                {feat.name}
              </span>
              <div className="text-sm font-black text-foreground text-right shrink-0">
                {typeof feat.val === "boolean" ? (
                  feat.val ? (
                    <span className="inline-flex items-center gap-1 text-primary">
                      <svg
                        className="w-5 h-5 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="sr-only">Included</span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground/40 font-semibold normal-case tracking-normal">
                      Not included
                    </span>
                  )
                ) : (
                  feat.val
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
