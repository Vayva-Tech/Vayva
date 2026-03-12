"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ArrowBendUpLeft as RefundIcon,
  Check,
  X,
  Spinner as Loader2,
} from "@phosphor-icons/react/ssr";
import { formatDate, formatCurrency, logger } from "@vayva/shared";
import { Button } from "@vayva/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-text-tertiary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Refund Requests</h1>
          <p className="text-muted-foreground">
            Manage and process customer refund requests.
          </p>
        </div>
      </div>

      {refunds.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <RefundIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No refund requests</h3>
            <p className="text-sm text-muted-foreground mt-2">
              When customers request refunds, they will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {refunds.map((refund) => (
            <Card key={refund.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Order #{refund?.orderId?.slice(-6)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {refund.customerName} · {refund.customerEmail}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-semibold">{formatCurrency(refund.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Requested</p>
                    <p className="font-semibold">{formatDate(refund.requestedAt)}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">Reason</p>
                  <p className="text-sm">{refund.reason}</p>
                </div>
                {refund.status?.toUpperCase() === "PENDING" && (
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedRefund(refund);
                        setActionType("approve");
                      }}
                    >
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRefund(refund);
                        setActionType("reject");
                      }}
                    >
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
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
