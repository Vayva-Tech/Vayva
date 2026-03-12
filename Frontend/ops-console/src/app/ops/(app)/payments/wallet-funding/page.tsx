"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import { useOpsQuery } from "@/hooks/useOpsQuery";

type WalletFundingTx = {
  id: string;
  storeId: string;
  storeName: string;
  storeSlug?: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string | Date;
};

type ApiResponse = {
  data: WalletFundingTx[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3?.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className={className}>
      <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16h27.4L198?.7,95A95.9,95.9,0,1,0,127.4,95a8,8,0,0,1-7.4-4.6,8.1,8.1,0,0,1,.4-8.3,112,112,0,1,1,77.4,34.5L224,88h8A8,8,0,0,1,240,56Z"></path>
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3?.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
      <path d="M229.7,218.3,176.8,165.4A92?.1,92.1,0,1,0,165.4,176.8l52?.9,52.9a8?.2,8.2,0,0,0,11.4-11.4ZM40,116a76,76,0,1,1,76,76A76.1,76.1,0,0,1,40,116Z"></path>
    </svg>
  );
}

export default function WalletFundingPage(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1");
  const q = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(q);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "50");
    if (q) params.set("q", q);
    return params.toString();
  }, [page, q]);

  const { data, isLoading, refetch } = useOpsQuery<ApiResponse>(
    ["wallet-funding", queryString],
    () => fetch(`/api/ops/payments/wallet-funding?${queryString}`).then((r: any) => r.json()),
  );

  const rows = data?.data || [];

  return (
    <OpsPageShell
      title="Wallet Funding (Paystack DVA)"
      description="Monitor merchant wallet credits from Paystack dedicated virtual accounts"
      headerActions={
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          className="rounded-full"
          aria-label="Refresh"
        >
          <RefreshIcon className={isLoading ? "animate-spin" : ""} />
        </Button>
      }
    >
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
        <form
          className="relative"
          onSubmit={(e: any) => {
            e.preventDefault();
            const next = new URLSearchParams(searchParams);
            if (searchQuery.trim()) next.set("q", searchQuery.trim());
            else next.delete("q");
            next.set("page", "1");
            router.push(`?${next.toString()}`);
          }}
        >
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon />
          </div>
          <input
            type="text"
            placeholder="Search by reference or store name..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target?.value)}
            aria-label="Search wallet funding"
          />
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
            <tr>
              <th className="px-6 py-3">Reference</th>
              <th className="px-6 py-3">Store</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  No wallet funding transactions found
                </td>
              </tr>
            ) : (
              rows.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-white/60">
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs">{tx.reference}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/ops/merchants/${tx.storeId}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {tx.storeName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 font-bold">
                    ₦{Number(tx.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{tx.status}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/ops/merchants/${tx.storeId}`}
                      className="text-indigo-600 hover:underline text-xs inline-flex items-center justify-end gap-1"
                    >
                      View Merchant →
                    </Link>
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
