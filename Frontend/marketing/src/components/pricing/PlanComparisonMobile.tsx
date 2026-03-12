"use client";

import React, { useState } from "react";
import { PLANS, FEES } from "@/config/pricing";
import { Button } from "@vayva/ui";
import { cn } from "@/lib/utils";

export const PlanComparisonMobile = (): React.JSX.Element => {
  const [selectedPlan, setSelectedPlan] = useState<"free" | "starter" | "pro">(
    "starter",
  );

  return (
    <div className="space-y-8">
      {/* Plan Selector */}
      <div className="flex p-1 bg-muted rounded-xl">
        {PLANS.map((plan: { key: "free" | "starter" | "pro"; name: string; monthlyAmount: number }) => (
          <Button
            key={plan.key}
            onClick={() => setSelectedPlan(plan.key)}
            variant="ghost"
            className={cn(
              "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-lg transition-all h-auto",
              selectedPlan === plan.key
                ? "bg-background text-foreground shadow-sm hover:bg-background"
                : "text-muted-foreground hover:text-foreground hover:bg-transparent",
            )}
          >
            {plan.key === "free" ? "Free" : `₦${plan.monthlyAmount / 1000}k`}
          </Button>
        ))}
      </div>

      {/* Feature List */}
      <div className="bg-background rounded-3xl border border-border p-8 shadow-xl">
        <h3 className="text-xl font-black text-foreground mb-6">
          {PLANS.find((p: any) => p.key === selectedPlan)?.name} Plan — What's
          Included
        </h3>
        <div className="space-y-6">
          {[
            {
              name: "Monthly Orders",
              val:
                selectedPlan === "free"
                  ? "100"
                  : selectedPlan === "starter"
                    ? "1,000"
                    : "Unlimited",
            },
            {
              name: "Products / SKUs",
              val:
                selectedPlan === "free"
                  ? "50"
                  : selectedPlan === "starter"
                    ? "500"
                    : "Unlimited",
            },
            { name: "Team Seats", val: selectedPlan === "pro" ? "5" : "1" },
            {
              name: "Blueprint Templates",
              val: selectedPlan === "free" ? "Basic" : "All",
            },
            { name: "Inventory tracking", val: selectedPlan !== "free" },
            { name: "Audit Logs", val: selectedPlan === "pro" },
            { name: "Priority Support", val: selectedPlan === "pro" },
            { name: "Withdrawal Fee", val: `${FEES.WITHDRAWAL_PERCENTAGE}%` },
          ].map((feat) => (
            <div
              key={feat.name}
              className="flex justify-between items-center py-4 border-b border-border/40 last:border-0"
            >
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                {feat.name}
              </span>
              <div className="text-sm font-black text-foreground">
                {typeof feat.val === "boolean" ? (
                  feat.val ? (
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span className="text-muted-foreground/40">
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
};
