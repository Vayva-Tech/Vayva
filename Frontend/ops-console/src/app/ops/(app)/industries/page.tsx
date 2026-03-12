"use client";

import React from "react";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { Globe, Storefront as Store, CurrencyDollar as DollarSign, TrendUp as TrendingUp, ArrowCounterClockwise as RefreshCw } from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import Link from "next/link";

interface IndustryData {
  industry: string;
  count: number;
  gmv: number;
  activeCount: number;
  avgOrderValue: number;
}

export default function IndustriesPage(): React.JSX.Element {
  const { data, isLoading, refetch } = useOpsQuery<{
    industries: IndustryData[];
    total: number;
  }>(["industries-breakdown"], () =>
    fetch("/api/ops/industries").then((res: any) => res.json()),
  );

  const industries = data?.industries || [];
  const maxGMV = Math.max(...industries.map((i: any) => i.gmv), 1);

  return (
    <OpsPageShell
      title="Industry Breakdown"
      description="Merchant distribution and performance by industry"
      headerActions={
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          className="rounded-full"
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      }
    >

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i: any) => (
            <div
              key={i}
              className="h-20 bg-white rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-medium">Industry</th>
                  <th className="px-6 py-3 font-medium">Merchants</th>
                  <th className="px-6 py-3 font-medium">Avg Revenue</th>
                  <th className="px-6 py-3 font-medium">Growth</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {industries.map((ind: any) => (
                  <tr key={ind.industry}>
                    <td className="px-6 py-3">{ind?.industry?.replace(/_/g, " ")}</td>
                    <td className="px-6 py-3">{ind.count} merchants</td>
                    <td className="px-6 py-3">₦{ind?.avgOrderValue?.toLocaleString()}</td>
                    <td className="px-6 py-3">₦{(ind.gmv / 1000000).toFixed(1)}M</td>
                    <td className="px-6 py-3 text-right">
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${(ind.gmv / maxGMV) * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {industries.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No industry data available
            </div>
          )}
        </div>
      )}
    </OpsPageShell>
  );
}
