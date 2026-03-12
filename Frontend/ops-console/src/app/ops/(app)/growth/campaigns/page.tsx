"use client";

import React from "react";
import { Lightning as Zap, Clock, Ticket as TicketPercent, ArrowCounterClockwise as RefreshCw, ShoppingCart } from "@phosphor-icons/react/ssr";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";

interface Campaign {
  id: string;
  code: string;
  discount: number;
  targetType: string;
  expiresAt: string;
}

const NOW_TIMESTAMP = Date.now();

export default function CampaignsPage(): React.JSX.Element {
  const {
    data: campaigns,
    isLoading,
    refetch,
  } = useOpsQuery<Campaign[]>(["promo-campaigns"], () =>
    fetch("/api/ops/growth/campaigns").then((res: any) =>
      res.json().then((j: any) => j.data),
    ),
  );

  return (
    <OpsPageShell
      title="Live Campaigns"
      description="Real-time monitor of active merchant flash sales"
      headerActions={
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          className="rounded-full h-8 w-8"
          aria-label="Refresh active campaigns"
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
              <th className="px-6 py-3 font-medium">Campaign Code</th>
              <th className="px-6 py-3 font-medium">Discount</th>
              <th className="px-6 py-3 font-medium">Target</th>
              <th className="px-6 py-3 font-medium">Ends In</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-400">
                  Loading campaigns...
                </td>
              </tr>
            ) : !campaigns?.length ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-400">
                  No active campaigns.
                </td>
              </tr>
            ) : (
              campaigns.map((c: any) => {
                const diff = Math.ceil(
                  (new Date(c.expiresAt).getTime() - NOW_TIMESTAMP) /
                    (1000 * 60 * 60),
                );

                return (
                  <tr key={c.id} className="hover:bg-white/60">
                    <td className="px-6 py-4 font-mono text-xs text-purple-600 font-bold">
                      {c.code}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">
                        -{c.discount}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-500">
                      {c.targetType}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-1 text-amber-600 font-medium">
                      <Clock size={14} />
                      {diff} hours
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </OpsPageShell>
  );
}
