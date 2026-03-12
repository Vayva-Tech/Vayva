"use client";

import React, { useState } from "react";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { CurrencyDollar as DollarSign, CheckCircle, XCircle, Clock, MagnifyingGlass as Search, ArrowCounterClockwise as RefreshCw, ArrowUpRight } from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";
import { toast } from "sonner";
import Link from "next/link";
import { OpsPageShell } from "@/components/ops/OpsPageShell";

interface RefundRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  status: string;
  reason: string;
  storeName: string;
  storeId: string;
  customerEmail: string;
  createdAt: string;
}

interface RefundStats {
  requested: number;
  approved: number;
  processing: number;
  success: number;
  failed: number;
  cancelled: number;
}

export default function RefundsPage(): React.JSX.Element {
  const [statusFilter, setStatusFilter] = useState<string>("REQUESTED");

  const { data, isLoading, refetch } = useOpsQuery<{
    refunds: RefundRequest[];
    stats: RefundStats;
  }>(["refunds-list", statusFilter], () =>
    fetch(`/api/ops/refunds?status=${statusFilter}`).then((res) => res.json()),
  );

  const refunds = data?.refunds || [];
  const stats = data?.stats || {
    requested: 0,
    approved: 0,
    processing: 0,
    success: 0,
    failed: 0,
    cancelled: 0,
  };

  const handleAction = async (
    id: string,
    action: "approve" | "reject" | "execute" | "cancel",
  ) => {
    try {
      let url = `/api/ops/refunds/${id}`;
      if (action === "approve") url += "/approve";
      if (action === "execute") url += "/execute";
      if (action === "cancel") url += "/cancel";
      // 'reject' is currently not implemented as a dedicated endpoint if it maps to cancel or fail.
      // Let's assume 'reject' maps to 'cancel' for now or we add a reject endpoint.
      if (action === "reject") url += "/cancel";

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Processed via Ops Console" }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Action failed");
      toast.success(`Refund ${action}d successfully`);
      refetch();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : String(error) || "Failed to process refund",
      );
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; icon: React.ReactNode }> = {
      REQUESTED: {
        bg: "bg-yellow-100 text-yellow-700",
        icon: <Clock size={12} />,
      },
      APPROVED: {
        bg: "bg-blue-100 text-blue-700",
        icon: <CheckCircle size={12} />,
      },
      PROCESSING: {
        bg: "bg-indigo-100 text-indigo-700",
        icon: <RefreshCw size={12} className="animate-spin" />,
      },
      SUCCESS: {
        bg: "bg-green-100 text-green-700",
        icon: <CheckCircle size={12} />,
      },
      FAILED: { bg: "bg-red-100 text-red-700", icon: <XCircle size={12} /> },
      CANCELLED: {
        bg: "bg-gray-100 text-gray-700",
        icon: <XCircle size={12} />,
      },
    };
    const style = styles[status] || styles.REQUESTED;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${style.bg}`}
      >
        {style.icon} {status}
      </span>
    );
  };

  return (
    <OpsPageShell
      title="Refund Management"
      description="Review and execute refund requests"
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

      {/* Stats */}
      <div className="grid grid-cols-6 gap-6 mb-6">
        <Button
          variant="ghost"
          onClick={() => setStatusFilter("REQUESTED")}
          className={`p-5 rounded-xl border-2 text-left ${statusFilter === "REQUESTED" ? "bg-yellow-50 border-yellow-300" : "bg-white border-gray-100 shadow-sm"}`}
        >
          <div className="text-2xl font-black text-yellow-600">
            {stats.requested}
          </div>
          <div className="text-[10px] text-gray-500">Requested</div>
        </Button>
        <Button
          variant="ghost"
          onClick={() => setStatusFilter("APPROVED")}
          className={`p-5 rounded-xl border-2 text-left ${statusFilter === "APPROVED" ? "bg-blue-50 border-blue-300" : "bg-white border-gray-100 shadow-sm"}`}
        >
          <div className="text-2xl font-black text-blue-600">
            {stats.approved}
          </div>
          <div className="text-[10px] text-gray-500">Approved</div>
        </Button>
        <Button
          variant="ghost"
          onClick={() => setStatusFilter("PROCESSING")}
          className={`p-5 rounded-xl border-2 text-left ${statusFilter === "PROCESSING" ? "bg-indigo-50 border-indigo-300" : "bg-white border-gray-100 shadow-sm"}`}
        >
          <div className="text-2xl font-black text-indigo-600">
            {stats.processing}
          </div>
          <div className="text-[10px] text-gray-500">Processing</div>
        </Button>
        <Button
          variant="ghost"
          onClick={() => setStatusFilter("SUCCESS")}
          className={`p-5 rounded-xl border-2 text-left ${statusFilter === "SUCCESS" ? "bg-green-50 border-green-300" : "bg-white border-gray-100 shadow-sm"}`}
        >
          <div className="text-2xl font-black text-green-600">
            {stats.success}
          </div>
          <div className="text-[10px] text-gray-500">Success</div>
        </Button>
        <Button
          variant="ghost"
          onClick={() => setStatusFilter("FAILED")}
          className={`p-5 rounded-xl border-2 text-left ${statusFilter === "FAILED" ? "bg-red-50 border-red-300" : "bg-white border-gray-100 shadow-sm"}`}
        >
          <div className="text-2xl font-black text-red-600">{stats.failed}</div>
          <div className="text-[10px] text-gray-500">Failed</div>
        </Button>
        <Button
          variant="ghost"
          onClick={() => setStatusFilter("CANCELLED")}
          className={`p-5 rounded-xl border-2 text-left ${statusFilter === "CANCELLED" ? "bg-gray-100 border-gray-300" : "bg-white border-gray-100 shadow-sm"}`}
        >
          <div className="text-2xl font-black text-gray-600">
            {stats.cancelled}
          </div>
          <div className="text-[10px] text-gray-500">Cancelled</div>
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
            <tr>
              <th className="px-6 py-3">Order</th>
              <th className="px-6 py-3">Store</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Reason</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-gray-400"
                >
                  Loading...
                </td>
              </tr>
            ) : refunds.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-gray-400"
                >
                  No refund requests found
                </td>
              </tr>
            ) : (
              refunds.map((refund: RefundRequest) => (
                <tr key={refund.id} className="hover:bg-white/60">
                  <td className="px-6 py-4">
                    <div className="font-medium">{refund.orderNumber}</div>
                    <div className="text-xs text-gray-500">
                      {refund.customerEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/ops/merchants/${refund.storeId}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {refund.storeName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 font-bold text-red-600">
                    ₦{refund?.amount?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                    {refund.reason}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(refund.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {refund.status === "REQUESTED" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAction(refund.id, "approve")}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs h-8"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(refund.id, "cancel")}
                            className="text-xs h-8"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {refund.status === "APPROVED" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAction(refund.id, "execute")}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8"
                          >
                            Execute
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAction(refund.id, "cancel")}
                            className="text-red-600 hover:bg-red-50 text-xs h-8"
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
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
