"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { Button, Input } from "@vayva/ui";
import { ArrowDownLeft, ArrowUpRight, Copy, Funnel, MagnifyingGlass } from "@phosphor-icons/react";
import { toast } from "sonner";

type ActivityKind = "CHARGE" | "WITHDRAWAL" | "REFUND" | "AFFILIATE_PAYOUT";

type ActivityItem = {
  id: string;
  kind: ActivityKind;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
  direction: "in" | "out";
  counterparty?: string;
  provider?: string;
};

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

function statusPill(status: string) {
  const s = (status || "").toLowerCase();
  if (s === "completed" || s === "success" || s === "paid") return "bg-green-50 text-green-700";
  if (s === "pending" || s === "processing" || s === "approval_required") return "bg-amber-50 text-amber-700";
  if (s === "failed" || s === "cancelled") return "bg-red-50 text-red-700";
  return "bg-gray-50 text-gray-700";
}

function kindLabel(kind: ActivityKind) {
  if (kind === "CHARGE") return "Incoming payment";
  if (kind === "WITHDRAWAL") return "Withdrawal";
  if (kind === "REFUND") return "Refund";
  return "Affiliate payout";
}

export default function FinanceActivityPage() {
  const { data, isLoading, error, mutate } = useSWR<{ data: ActivityItem[] }>(
    "/finance/activity?limit=200",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 30000 },
  );

  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<"all" | ActivityKind>("all");
  const [direction, setDirection] = useState<"all" | "in" | "out">("all");
  const [status, setStatus] = useState<"all" | "completed" | "pending" | "failed">("all");

  const items = useMemo(() => {
    const list = Array.isArray(data?.data) ? data?.data : [];
    const q = query.trim().toLowerCase();
    return list.filter((it) => {
      if (kind !== "all" && it.kind !== kind) return false;
      if (direction !== "all" && it.direction !== direction) return false;
      if (status !== "all") {
        const s = (it.status || "").toLowerCase();
        if (status === "completed" && !(s === "completed" || s === "paid" || s === "success")) return false;
        if (status === "pending" && !(s === "pending" || s === "processing" || s === "approval_required")) return false;
        if (status === "failed" && !(s === "failed" || s === "cancelled")) return false;
      }
      if (!q) return true;
      return (
        it.reference.toLowerCase().includes(q) ||
        it.kind.toLowerCase().includes(q) ||
        String(it.amount).includes(q) ||
        (it.counterparty || "").toLowerCase().includes(q) ||
        (it.provider || "").toLowerCase().includes(q)
      );
    });
  }, [data, query, kind, direction, status]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="p-12 flex justify-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
          <div className="font-semibold text-red-700">Failed to load activity</div>
          <div className="text-sm text-red-600">Please try again.</div>
        </div>
        <Button onClick={() => mutate()} className="bg-green-600 hover:bg-green-700 text-white px-4 h-10 rounded-xl font-semibold">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Activity</h1>
          <p className="text-sm text-gray-500 mt-1">All inflows and outflows in one place.</p>
        </div>
        <Button onClick={() => mutate()} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 h-10 rounded-xl font-semibold">
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full">
          <div className="relative w-full sm:w-auto">
            <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search reference, bank, provider…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 w-full sm:w-72 bg-white border-gray-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 w-full sm:w-auto">
            <Funnel size={16} />
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as any)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 flex-1 sm:flex-none"
            >
              <option value="all">All</option>
              <option value="CHARGE">Incoming payments</option>
              <option value="WITHDRAWAL">Withdrawals</option>
              <option value="REFUND">Refunds</option>
              <option value="AFFILIATE_PAYOUT">Affiliate payouts</option>
            </select>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as any)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 flex-1 sm:flex-none"
            >
              <option value="all">All directions</option>
              <option value="in">In</option>
              <option value="out">Out</option>
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 flex-1 sm:flex-none"
            >
              <option value="all">All status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <Button
          onClick={() => {
            setQuery("");
            setKind("all");
            setDirection("all");
            setStatus("all");
          }}
          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 h-10 rounded-xl font-semibold w-full sm:w-auto"
        >
          Reset
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {items.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Funnel size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No activity found</h3>
            <p className="text-sm text-gray-500 max-w-sm">Try changing your filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((it) => (
              <div key={`${it.kind}-${it.id}`} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        it.direction === "in" ? "bg-green-50" : "bg-blue-50"
                      }`}
                    >
                      {it.direction === "in" ? (
                        <ArrowUpRight size={18} className="text-green-600" />
                      ) : (
                        <ArrowDownLeft size={18} className="text-blue-600" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-semibold text-gray-900">{kindLabel(it.kind)}</div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${statusPill(it.status)}`}>
                          {(it.status || "").replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(it.date).toLocaleString("en-NG")}
                        {it.counterparty ? ` • ${it.counterparty}` : ""}
                        {it.provider ? ` • ${it.provider}` : ""}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 truncate max-w-[200px] sm:max-w-[320px]">
                          {it.reference}
                        </code>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(it.reference);
                              toast.success("Reference copied");
                            } catch {
                              toast.error("Could not copy");
                            }
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900"
                        >
                          <Copy size={14} />
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-lg font-bold ${it.direction === "in" ? "text-green-700" : "text-gray-900"}`}>
                      {it.direction === "in" ? "+" : "-"}₦{Number(it.amount || 0).toLocaleString("en-NG")}
                    </div>
                    <div className="text-xs text-gray-500">{it.currency}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

