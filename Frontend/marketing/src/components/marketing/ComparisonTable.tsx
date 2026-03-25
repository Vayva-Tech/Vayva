"use client";

import React from "react";
import { IconCheck as Check, IconX as X } from "@tabler/icons-react";

export function ComparisonTable(): React.JSX.Element {
  return (
    <section className="py-24 px-4">
      <div className="max-w-[1400px] mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          The arithmetic doesn't lie.
        </h2>

        <div className="overflow-hidden border border-border rounded-2xl shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="p-6 text-muted-foreground font-medium">
                  Feature
                </th>
                <th className="p-6 text-foreground font-bold text-xl w-1/3">
                  Vayva 🇳🇬
                </th>
                <th className="p-6 text-muted-foreground font-medium w-1/3">
                  Shopify 🇺🇸
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              <tr>
                <td className="p-6 font-medium text-foreground">
                  Monthly Cost
                </td>
                <td className="p-6 text-green-600 font-bold bg-green-50/30">
                  ₦0{" "}
                  <span className="text-xs text-muted-foreground font-normal">
                    / month
                  </span>
                </td>
                <td className="p-6 text-muted-foreground">
                  ~$29{" "}
                  <span className="text-xs text-muted-foreground">
                    / month (~₦45k)
                  </span>
                </td>
              </tr>
              <tr>
                <td className="p-6 font-medium text-foreground">
                  Transaction Fees
                </td>
                <td className="p-6 text-green-600 font-bold bg-green-50/30">
                  3% Flat
                </td>
                <td className="p-6 text-muted-foreground">2.0% + $0.30</td>
              </tr>
              <tr>
                <td className="p-6 font-medium text-foreground">Payments</td>
                <td className="p-6 text-green-600 font-bold bg-green-50/30">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" /> Native Paystack
                  </div>
                </td>
                <td className="p-6 text-muted-foreground">
                  Requires third party
                </td>
              </tr>
              <tr>
                <td className="p-6 font-medium text-foreground">
                  WhatsApp Automation
                </td>
                <td className="p-6 text-green-600 font-bold bg-green-50/30">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" /> Built in
                  </div>
                </td>
                <td className="p-6 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <X className="w-4 h-4 text-red-400" /> No
                  </div>
                </td>
              </tr>
              <tr>
                <td className="p-6 font-medium text-foreground">
                  Local Logistics
                </td>
                <td className="p-6 text-green-600 font-bold bg-green-50/30">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" /> Integrated (Kwik)
                  </div>
                </td>
                <td className="p-6 text-muted-foreground">Manual Entry</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
