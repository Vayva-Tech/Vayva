"use client";

import React from "react";
import { PLANS, FEES, type PlanKey } from "@/config/pricing";

interface FeatureRow {
  name: string;
  values: Record<PlanKey, string | boolean>;
  tooltip?: string;
}

const MONTHLY_PRICE_ROW: FeatureRow = {
  name: "Monthly price (NGN)",
  values: PLANS.reduce(
    (acc, plan) => {
      acc[plan.key] = plan.monthlyAmount.toLocaleString("en-NG");
      return acc;
    },
    {} as Record<PlanKey, string>,
  ),
};

const COMPARISON_DATA: FeatureRow[] = [
  MONTHLY_PRICE_ROW,
  {
    name: "Staff seats",
    values: {
      starter: "1",
      pro: "3",
      pro_plus: "5",
    },
  },
  {
    name: "Products / SKUs",
    values: {
      starter: "Up to 100",
      pro: "Up to 300",
      pro_plus: "Up to 500",
    },
  },
  {
    name: "WhatsApp order capture",
    values: { starter: true, pro: true, pro_plus: true },
    tooltip: "Automated extraction of orders from WhatsApp chats.",
  },
  {
    name: "Industry dashboards",
    values: {
      starter: false,
      pro: true,
      pro_plus: true,
    },
  },
  {
    name: "Merged industry view",
    values: {
      starter: false,
      pro: false,
      pro_plus: true,
    },
  },
  {
    name: "Visual workflow builder",
    values: {
      starter: false,
      pro: false,
      pro_plus: true,
    },
  },
  {
    name: "API access",
    values: {
      starter: false,
      pro: true,
      pro_plus: true,
    },
  },
  {
    name: "Withdrawal transaction fee",
    values: {
      starter: `${FEES.WITHDRAWAL_PERCENTAGE}%`,
      pro: `${FEES.WITHDRAWAL_PERCENTAGE}%`,
      pro_plus: `${FEES.WITHDRAWAL_PERCENTAGE}%`,
    },
    tooltip: "Charged on every payout to your bank account.",
  },
];

export const PlanComparisonTable = (): React.JSX.Element => {
  return (
    <div className="hidden lg:block w-full overflow-hidden rounded-3xl border border-border bg-background shadow-2xl shadow-border/30">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-muted/50 border-b border-border">
            <th className="p-8 text-sm font-black text-muted-foreground uppercase tracking-widest w-1/4">
              Features
            </th>
            {PLANS.map((plan) => (
              <th
                key={plan.key}
                className={`p-8 text-xl font-black text-foreground text-center ${plan.featured ? "bg-primary/5" : ""}`}
              >
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {COMPARISON_DATA.map((row) => (
            <tr key={row.name} className="hover:bg-muted/30 transition-colors">
              <td className="p-6">
                <div className="flex items-center gap-2 group relative px-2">
                  <span className="text-sm font-bold text-foreground/80">
                    {row.name}
                  </span>
                  {row.tooltip && (
                    <div className="relative">
                      <span className="cursor-help text-muted-foreground/40 hover:text-primary transition-colors">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </span>
                    </div>
                  )}
                </div>
              </td>
              {PLANS.map((plan) => (
                <td
                  key={plan.key}
                  className={`p-6 text-center ${plan.featured ? "bg-primary/5" : ""}`}
                >
                  {renderValue(row.values[plan.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

function renderValue(val: string | boolean) {
  if (typeof val === "boolean") {
    return val ? (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary mx-auto">
        <svg
          className="w-5 h-5"
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
      </span>
    ) : (
      <span className="text-muted-foreground/40 text-xs">Not available</span>
    );
  }
  return <span className="text-sm font-black text-foreground">{val}</span>;
}
