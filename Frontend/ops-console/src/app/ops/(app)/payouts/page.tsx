"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Bank as Landmark, ArrowUpRight, CheckCircle, Clock, Warning as AlertTriangle, ArrowCounterClockwise as RefreshCw, XCircle } from "@phosphor-icons/react/ssr";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { toast } from "sonner";
import { formatCurrency } from "@vayva/shared";
import { Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";

interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

interface Store {
  name: string;
  slug: string;
}

interface Withdrawal {
  id: string;
  referenceCode: string;
  store: Store;
  amountNetKobo: string;
  feeKobo: string;
  feePercent: string;
  bankDetails?: BankDetails;
  hasWalletPin?: boolean;
  status: string;
  createdAt: string;
}

export default function PayoutsPage(): React.JSX.Element {
  const _router = useRouter();
  const [filter, setFilter] = useState("PENDING");

  const {
    data: withdrawals,
    isLoading,
    refetch,
  } = useOpsQuery<Withdrawal[]>(["payouts-list", filter], () =>
    fetch(`/api/ops/financials/payouts?status=${filter}`).then((res: Response) =>
      res.json().then((j: { data: Withdrawal[] }) => j.data),
    ),
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case "PROCESSED":
        return (
          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Processed
          </span>
        );
      case "FAILED":
        return (
          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Failed
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <OpsPageShell
      title="Payouts Operation Center"
      description="Audit and process merchant withdrawal requests"
      headerActions={
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          className="rounded-full h-8 w-8 text-gray-500 hover:bg-gray-100"
          aria-label="Refresh payouts list"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      }
    >

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        {["PENDING", "PROCESSED", "FAILED", "ALL"].map((s: string) => (
          <Button
            key={s}
            variant="ghost"
            onClick={() => setFilter(s)}
            className={`px-4 py-3 text-sm font-medium border-b-2 rounded-none transition-colors -mb-1.5 h-auto hover:bg-transparent ${filter === s ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            aria-label={`Filter by ${s} status`}
          >
            {s}
          </Button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-medium">Reference</th>
              <th className="px-6 py-4 font-medium">Merchant</th>
              <th className="px-6 py-4 font-medium">Amount (Net)</th>
              <th className="px-6 py-4 font-medium">Fee</th>
              <th className="px-6 py-4 font-medium">Bank Details</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-gray-400">
                  Loading payouts...
                </td>
              </tr>
            ) : !withdrawals?.length ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-gray-400">
                  No withdrawal requests found.
                </td>
              </tr>
            ) : (
              withdrawals.map((w: Withdrawal) => (
                <tr key={w.id} className="hover:bg-white/60 group">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">
                    {w.referenceCode}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div className="flex flex-col">
                      <span>{w.store?.name || "Unknown"}</span>
                      <span className="text-[10px] text-gray-400">
                        {w.store?.slug}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {formatCurrency(parseInt(w.amountNetKobo) / 100)}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {formatCurrency(parseInt(w.feeKobo) / 100)}
                    <span className="block text-[10px] text-gray-400">
                      ({w.feePercent}%)
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {w.bankDetails ? (
                      <div className="flex flex-col text-xs">
                        <span className="font-bold text-gray-900">
                          {w?.bankDetails?.bankName}
                        </span>
                        <span className="font-mono text-gray-600">
                          {w?.bankDetails?.accountNumber}
                        </span>
                        <span
                          className="text-gray-400 truncate max-w-[150px]"
                          title={w?.bankDetails?.accountName}
                        >
                          {w?.bankDetails?.accountName}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded w-fit">
                        <AlertTriangle size={14} />
                        <span className="text-xs font-bold">
                          MISSING BENEFICIARY
                        </span>
                      </div>
                    )}
                    {w.hasWalletPin && (
                      <div className="mt-1 flex items-center gap-1 text-amber-600">
                        <AlertTriangle size={10} />
                        <span className="text-[10px]">No Security PIN</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(w.status)}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(w.createdAt).toLocaleDateString()}
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
