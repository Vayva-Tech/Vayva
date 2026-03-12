"use client";

import { useOpsQuery } from "@/hooks/useOpsQuery";
import { useState } from "react";
import { Button } from "@vayva/ui";
import { FileText } from "@phosphor-icons/react/ssr";
import { useRouter, useSearchParams } from "next/navigation";
import { OpsPageShell } from "@/components/ops/OpsPageShell";

export default function ApprovalsPage(): React.JSX.Element {
  const [tab, setTab] = useState<"PENDING" | "HISTORY">("PENDING");
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");

  const {
    data: result,
    isLoading,
    refetch,
  } = useOpsQuery(["approvals-list", tab, page.toString()], () => {
    const status = tab === "PENDING" ? "open" : "resolved";
    return fetch(
      `/api/ops/support/escalations?status=${status}&page=${page}&limit=20`,
    ).then((res) => res.json());
  });

  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleStatusUpdate = async (
    ticketId: string,
    newStatus: "OPEN" | "RESOLVED",
  ) => {
    if (!confirm(`Are you sure you want to mark this ticket as ${newStatus}?`))
      return;

    setProcessingId(ticketId);
    try {
      const res = await fetch(`/api/ops/support/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus.toLowerCase() }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        alert(json?.error || "Failed to update status");
        return;
      }

      refetch();
    } catch {
      alert("Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const approvals = result?.data || [];
  const meta = result?.meta;

  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i: any) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  interface ApprovalRequest {
    id: string;
    storeName?: string;
    triggerType?: string | null;
    category?: string | null;
    type?: string | null;
    summary?: string;
    createdAt: string | Date;
    status: string;
    subject?: string;
  }

  return (
    <OpsPageShell
      title="Approval Requests"
      description="Review and authorize sensitive actions"
    >

        <div className="flex gap-2 border-b border-gray-200">
          <Button
            variant="ghost"
            onClick={() => {
              setTab("PENDING");
              handlePageChange(1);
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 rounded-none transition-colors h-auto ${tab === "PENDING" ? "border-amber-500 text-amber-700 bg-amber-50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
            aria-label="Show pending review requests"
          >
            Pending Review
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setTab("HISTORY");
              handlePageChange(1);
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 rounded-none transition-colors h-auto ${tab === "HISTORY" ? "border-indigo-500 text-indigo-700 bg-indigo-50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
            aria-label="Show approval history log"
          >
            ClockCounterClockwise as History Log
          </Button>
        </div>

      {/* Batch Actions Bar */}
      {null}

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <th className="px-6 py-3 font-medium">Escalation</th>
                <th className="px-6 py-3 font-medium">Merchant</th>
                <th className="px-6 py-3 font-medium">Summary</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {approvals.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    <p>No escalations found.</p>
                  </td>
                </tr>
              )}
              {approvals.map((req: ApprovalRequest) => (
                <tr
                  key={req.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {req.triggerType ||
                        req.category ||
                        req.type ||
                        "ESCALATION"}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {req.storeName || "Unknown Store"}
                  </td>
                  <td
                    className="px-6 py-4 text-gray-600 max-w-xs truncate"
                    title={req.summary}
                  >
                    {req.subject
                      ? `${req.subject}${req.summary ? ` — ${req.summary}` : ""}`
                      : req.summary || "No summary provided"}
                  </td>
                  <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/ops/support/${req.id}`)}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 h-auto"
                      >
                        View
                      </Button>
                      {tab === "PENDING" ? (
                        <Button
                          onClick={() => handleStatusUpdate(req.id, "RESOLVED")}
                          disabled={processingId === req.id}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50 h-auto"
                        >
                          Mark Resolved
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => handleStatusUpdate(req.id, "OPEN")}
                          disabled={processingId === req.id}
                          className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 h-auto disabled:opacity-50"
                        >
                          Re-open
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {meta && (
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-medium">
                {(meta.page - 1) * meta.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(meta.page * meta.limit, meta.total)}
              </span>{" "}
              of <span className="font-medium">{meta.total}</span> results
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(meta.page - 1)}
                disabled={meta.page <= 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-600 hover:bg-white disabled:opacity-50 h-auto"
                aria-label="Go to previous page"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePageChange(meta.page + 1)}
                disabled={meta.page >= meta.totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-600 hover:bg-white disabled:opacity-50 h-auto"
                aria-label="Go to next page"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </OpsPageShell>
  );
}
