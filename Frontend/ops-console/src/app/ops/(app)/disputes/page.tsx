"use client";

import React, { useState, useEffect } from "react";
import _Link from "next/link";
import { Pulse as Activity, Warning as AlertTriangle, CheckCircle, Clock, CurrencyDollar as DollarSign, Funnel as Filter, ArrowCounterClockwise as RefreshCw, MagnifyingGlass as Search, ShieldWarning as ShieldAlert, XCircle, Gavel } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import { AdvancedSearchInput } from "@/components/ops/AdvancedSearchInput";
import { buildSearchParams, type SearchQuery } from "@/lib/search/queryParser";
import { logger } from "@vayva/shared";

interface Dispute {
  id: string;
  amount: number;
  currency: string;
  status: string;
  reasonCode: string | null;
  store: { name: string; slug: string };
  order: { orderNumber: string } | null;
  createdAt: string;
  evidenceDueAt: string | null;
}

export default function DisputesPage(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filters
  const status = searchParams.get("status") || "OPENED";

  const [data, setData] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [advancedSearch, setAdvancedSearch] = useState(searchParams.get("q") || "");

  useEffect(() => {
    fetchDisputes();
  }, [status]);

  const fetchDisputes = async () => {
    setLoading(true);
    const q = searchParams.get("q") || "";
    try {
      const res = await fetch(
        `/api/ops/disputes?status=${status}${q ? `&q=${q}` : ""}`,
      );
      const json = await res.json();
      if (res.ok) {
        setData(json.data || []);
      }
    } catch (e) {
      logger.error("[DISPUTES_FETCH_ERROR]", { error: e });
    } finally {
      setLoading(false);
    }
  };

  const handleAdvancedSearch = (query: SearchQuery) => {
    const params = buildSearchParams(query);
    router.push(`?status=${status}&${params.toString()}`);
  };

  const handleAction = async (
    id: string,
    action: string,
    payload: Record<string, unknown> = {},
  ) => {
    if (
      !confirm(
        `Are you sure you want to ${action.replace(/_/g, " ").toLowerCase()}?`,
      )
    )
      return;

    setActionLoading(id);
    try {
      let url = `/api/ops/disputes/${id}`;
      const method = "POST";

      if (action === "CLOSE") url += "/close";
      else if (action === "REJECT") url += "/reject";
      else if (action === "APPROVE_REFUND") url += "/approve-refund";
      else if (action === "ESCALATE") url += "/escalate";
      else if (action === "SUBMIT_EVIDENCE")
        url += "/evidence"; // Real evidence submission endpoint
      else if (action === "ACCEPT_LIABILITY")
        url += "/approve-refund"; // Accept liability maps to approve refund
      else if (action === "REFUND") url += "/approve-refund"; // Explicit refund button also maps to approve refund

      if (action === "SUBMIT_EVIDENCE") {
        payload = { notes: "Evidence submitted via ops console" };
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Action failed");
      }

      toast.success("Dispute Updated");
      fetchDisputes();
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e instanceof Error
            ? e.message
            : String(e)
          : "Failed to update dispute",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "OPENED":
        return (
          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Action Required
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" /> Reviewing
          </span>
        );
      case "WON":
        return (
          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Won
          </span>
        );
      case "LOST":
        return (
          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Lost
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">
            {s}
          </span>
        );
    }
  };

  return (
    <OpsPageShell
      title="Disputes & Chargebacks"
      description="Manage financial disputes and evidence submission"
      headerActions={
        <div className="flex items-center gap-4">
          <AdvancedSearchInput
            value={advancedSearch}
            onChange={setAdvancedSearch}
            onSearch={handleAdvancedSearch}
            placeholder="Search disputes (try: status:OPENED amount:>1000)"
            className="w-80"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchDisputes}
            className="rounded-full h-10 w-10 flex items-center justify-center"
            aria-label="Refresh disputes list"
          >
            <RefreshCw
              className={`w-5 h-5 text-gray-400 ${loading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      }
    >

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        {["OPENED", "UNDER_REVIEW", "WON", "LOST"].map((s: string) => (
          <Button
            key={s}
            variant="ghost"
            onClick={() => router.push(`?status=${s}`)}
            className={`px-4 py-2 text-sm font-medium border-b-2 rounded-none transition-colors h-auto ${
              status === s
                ? "border-indigo-600 text-indigo-600 bg-transparent hover:bg-transparent"
                : "border-transparent text-gray-500 hover:text-gray-700 bg-transparent hover:bg-transparent"
            }`}
            aria-label={`Filter by ${s.replace("_", " ")} status`}
          >
            {s.replace("_", " ")}
          </Button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Dispute / Date</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Reason</th>
              <th className="px-6 py-4">Merchant</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-400">
                  Loading disputes...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-400">
                  No disputes found in this category.
                </td>
              </tr>
            ) : (
              data.map((d: Dispute) => (
                <tr key={d.id} className="hover:bg-white/60">
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs text-gray-500">
                      {d?.id?.slice(0, 8)}...
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {d.currency} {d.amount}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {d.reasonCode || "General"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {d.store?.name}
                    </div>
                    <div className="text-xs text-indigo-600">
                      {d.order?.orderNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(d.status)}</td>
                  <td className="px-6 py-4 text-right">
                    {(d.status === "OPENED" || d.status === "UNDER_REVIEW") && (
                      <div className="flex justify-end gap-2 flex-wrap">
                        {d.status === "OPENED" && (
                          <>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleAction(d.id, "ACCEPT_LIABILITY")
                              }
                              disabled={!!actionLoading}
                              className="h-8 px-3 text-xs font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 shadow-none"
                              aria-label={`Accept liability for dispute ${d.id}`}
                            >
                              Accept Liability
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() =>
                                handleAction(d.id, "SUBMIT_EVIDENCE")
                              }
                              disabled={!!actionLoading}
                              className="h-8 px-3 text-xs font-bold whitespace-nowrap"
                              aria-label={`Submit evidence for dispute ${d.id}`}
                            >
                              Submit Evidence
                            </Button>
                          </>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleAction(d.id, "REFUND")}
                          disabled={!!actionLoading}
                          className="h-8 px-3 text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100"
                          aria-label={`Refund dispute ${d.id}`}
                        >
                          Refund
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleAction(d.id, "REJECT")}
                          disabled={!!actionLoading}
                          className="h-8 px-3 text-xs font-bold bg-green-50 text-green-600 border border-green-200 hover:bg-green-100"
                          aria-label={`Force win dispute ${d.id}`}
                        >
                          Force Win
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAction(d.id, "CLOSE")}
                          disabled={!!actionLoading}
                          className="h-8 px-3 text-xs font-bold text-gray-600 hover:bg-gray-100"
                          aria-label={`Close dispute ${d.id}`}
                        >
                          Close
                        </Button>
                      </div>
                    )}
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
