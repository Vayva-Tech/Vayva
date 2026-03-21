"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowBendUpLeft as RefundIcon, Check, X, CurrencyDollar as DollarSign, ClockCounterClockwise } from "@phosphor-icons/react";
import { formatDate, formatCurrency, logger } from "@vayva/shared";
import { Button } from "@vayva/ui";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiJson } from "@/lib/api-client-shared";

interface RefundRequest {
  id: string;
  orderId: string;
  amount: number;
  reason: string;
  status: "pending" | "APPROVED" | "REJECTED" | "PROCESSED";
  requestedAt: string;
  processedAt?: string;
  customerName: string;
  customerEmail: string;
}

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    void fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const data = await apiJson<{ refunds: RefundRequest[] }>("/api/refunds");
      setRefunds(data?.refunds || []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[REFUNDS_FETCH_ERROR]", { error: _errMsg });
      toast.error("Failed to load refund requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedRefund || !actionType) return;

    try {
      setProcessing(true);
      await apiJson(`/api/refunds/${selectedRefund.id}/${actionType}`, {
        method: "POST",
      });
      toast.success(`Refund ${actionType === "approve" ? "approved" : "rejected"}`);
      void fetchRefunds();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[REFUND_ACTION_ERROR]", { error: _errMsg });
      toast.error("Failed to process refund");
    } finally {
      setProcessing(false);
      setSelectedRefund(null);
      setActionType(null);
    }
  };

  // Calculate metrics
  const totalRefunds = refunds.length;
  const pending = refunds.filter(r => r.status === 'pending').length;
  const approved = refunds.filter(r => r.status === 'APPROVED' || r.status === 'PROCESSED').length;
  const rejected = refunds.filter(r => r.status === 'REJECTED').length;
  const totalAmount = refunds.reduce((sum, r) => sum + r.amount, 0);
  const pendingAmount = refunds.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Refund Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and process customer refund requests</p>
        </div>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <SummaryWidget
          icon={<RefundIcon size={18} />}
          label="Total Refunds"
          value={String(totalRefunds)}
          trend={`${pending} pending`}
          positive
        />
        <SummaryWidget
          icon={<ClockCounterClockwise size={18} />}
          label="Pending"
          value={String(pending)}
          trend="needs action"
          positive={pending === 0}
        />
        <SummaryWidget
          icon={<Check size={18} />}
          label="Approved"
          value={String(approved)}
          trend="processed"
          positive
        />
        <SummaryWidget
          icon={<X size={18} />}
          label="Rejected"
          value={String(rejected)}
          trend="declined"
          positive
        />
        <SummaryWidget
          icon={<DollarSign size={18} />}
          label="Pending Amount"
          value={formatCurrency(pendingAmount)}
          trend="at risk"
          positive={pendingAmount === 0}
        />
      </div>

      {/* Refunds Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : refunds.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <RefundIcon size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No refund requests</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              When customers request refunds, they will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {refunds.map((refund) => (
                  <tr key={refund.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{refund.customerName}</div>
                        <div className="text-xs text-gray-500">{refund.customerEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{refund.orderId}</code>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {formatCurrency(refund.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 max-w-xs truncate" title={refund.reason}>
                        {refund.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          refund.status === 'pending'
                            ? "bg-orange-50 text-orange-600"
                            : refund.status === 'APPROVED' || refund.status === 'PROCESSED'
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {refund.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {formatDate(refund.requestedAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {refund.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setSelectedRefund(refund); setActionType('approve'); }}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => { setSelectedRefund(refund); setActionType('reject'); }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Dialog */}
      <Dialog open={!!selectedRefund && !!actionType} onOpenChange={() => {
        setSelectedRefund(null);
        setActionType(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Refund" : "Reject Refund"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {actionType} this refund request for{" "}
              {formatCurrency(selectedRefund?.amount || 0)}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedRefund(null);
                setActionType(null);
              }}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === "approve" ? "primary" : "destructive"}
              onClick={handleAction}
              disabled={processing}
            >
              {processing ? (
                <div className="w-4 h-4 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
              ) : actionType === "approve" ? (
                <Check className="h-4 w-4 mr-1" />
              ) : (
                <X className="h-4 w-4 mr-1" />
              )}
              {actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Summary Widget Component
function SummaryWidget({
  icon,
  label,
  value,
  trend,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  positive: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
            {value}
          </p>
          <p className={`text-xs mt-1 ${positive ? 'text-green-600' : 'text-orange-600'}`}>
            {trend}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-100 text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
