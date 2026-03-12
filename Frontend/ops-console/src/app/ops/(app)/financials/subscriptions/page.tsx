"use client";

import React from "react";
import { CreditCard, Calendar, CheckCircle, ArrowCounterClockwise as RefreshCw } from "@phosphor-icons/react/ssr";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";

interface Store {
  name: string;
}

interface Subscription {
  id: string;
  store: Store;
  planKey: string;
  status: string;
  provider: string;
  currentPeriodEnd: string;
}

export default function BillingPage(): React.JSX.Element {
  const {
    data: subs,
    isLoading,
    refetch,
  } = useOpsQuery<Subscription[]>(["billing-subs"], () =>
    fetch("/api/ops/financials/subscriptions").then((res: Response) =>
      res.json().then((j: { data: Subscription[] }) => j.data),
    ),
  );

  return (
    <OpsPageShell
      title="Billing Monitor"
      description="Track active SaaS subscriptions and revenue"
      headerActions={
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          className="rounded-full h-8 w-8"
          aria-label="Refresh billing subscriptions"
        >
          <RefreshCw
            className={`w-5 h-5 text-gray-500 ${isLoading ? "animate-spin" : ""}`}
          />
        </Button>
      }
    >
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium">Store</th>
              <th className="px-6 py-3 font-medium">Plan</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Provider</th>
              <th className="px-6 py-3 font-medium">Renews</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-400">
                  Loading subscriptions...
                </td>
              </tr>
            ) : !subs?.length ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-400">
                  No active subscriptions.
                </td>
              </tr>
            ) : (
              subs.map((s: Subscription) => (
                <tr key={s.id} className="hover:bg-white/60">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {s.store?.name || "Unknown Store"}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-purple-600 font-bold">
                    {s.planKey}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${s.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : s.status === "TRIALING"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {s.provider}
                  </td>
                  <td className="px-6 py-4 flex items-center gap-1 text-gray-600">
                    <Calendar size={14} className="text-gray-400" />
                    {new Date(s.currentPeriodEnd).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </OpsPageShell>
  );
}
