"use client";

import React from "react";
import { Users, CreditCard, ArrowCounterClockwise as RefreshCw, Link } from "@phosphor-icons/react/ssr";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";

interface PartnerCount {
  referralAttributions: number;
}

interface Partner {
  id: string;
  name: string;
  type: string;
  status: string;
  _count: PartnerCount;
  createdAt: string;
}

export default function PartnersPage(): React.JSX.Element {
  const {
    data: partners,
    isLoading,
    refetch,
  } = useOpsQuery<Partner[]>(["partners-list"], () =>
    fetch("/api/ops/partners").then((res: any) => res.json().then((j: any) => j.data)),
  );

  return (
    <OpsPageShell
      title="Partner Directory"
      description="Manage affiliate partners and referrals"
      headerActions={
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          className="rounded-full h-8 w-8"
          aria-label="Refresh partners directory"
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
              <th className="px-6 py-3 font-medium">Partner Name</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Referrals</th>
              <th className="px-6 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-400">
                  Loading partners...
                </td>
              </tr>
            ) : !partners?.length ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-400">
                  No partners found.
                </td>
              </tr>
            ) : (
              partners.map((p: any) => (
                <tr key={p.id} className="hover:bg-white/60">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {p.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600 uppercase text-xs font-bold">
                    {p.type}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-1 font-mono">
                    <Link size={12} className="text-gray-400" />
                    {p._count?.referralAttributions || 0}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(p.createdAt).toLocaleDateString()}
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
