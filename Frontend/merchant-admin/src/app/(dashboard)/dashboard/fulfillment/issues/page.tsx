"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Warning as AlertTriangle,
  Phone,
  ArrowCounterClockwise as RefreshCw,
  Spinner as Loader2,
  CheckCircle,
  Package,
} from "@phosphor-icons/react/ssr";
import { formatDate, logger } from "@vayva/shared";
import Link from "next/link";
import { Button, Input, Textarea } from "@vayva/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Shipment {
  id: string;
  orderId: string;
  orderNumber: string;
  status: string;
  provider: string;
  trackingCode: string | null;
  courierName: string | null;
  recipientName: string | null;
  updatedAt: string;
}

import { apiJson } from "@/lib/api-client-shared";

interface ShipmentsResponse {
  data: Shipment[];
}

export default function DeliveryIssuesPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [issues, setIssues] = useState<Shipment[]>([]);
  const [forbidden, setForbidden] = useState(false);

  // Evidence State
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null,
  );
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidenceNote, setEvidenceNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void fetchIssues({ showLoader: true });
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      void fetchIssues({ showLoader: false });
    }, 25000);

    return () => window.clearInterval(id);
  }, []);

  const fetchIssues = async ({ showLoader }: { showLoader: boolean }) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);
    try {
      const result = await apiJson<ShipmentsResponse>(
        "/api/fulfillment/shipments?issue=true",
      );
      setForbidden(false);
      setIssues(Array.isArray(result?.data) ? result.data : []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        (error as any).status === 403
      ) {
        setForbidden(true);
        setIssues([]);
      } else {
        logger.error("[FETCH_ISSUES_ERROR]", {
          error: _errMsg,
          app: "merchant",
        });
        toast.error(_errMsg || "Could not load delivery issues");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAction = async (
    action: "Retry" | "Support Call",
    shipment: Shipment,
  ) => {
    const toastId = toast.loading(`${action} initiating...`);
    try {
      if (action === "Retry") {
        await apiJson<{ success: boolean }>(
          `/api/fulfillment/shipments/${shipment.id}/retry`,
          {
            method: "POST",
          },
        );

        toast.success("Retry initiated successfully", { id: toastId });
        void fetchIssues({ showLoader: false });
        return;
      }

      // Support Call remains as Ticket for now
      const subject = `Support Call Request - #${shipment.orderNumber}`;
      const description = `Merchant requested a support call regarding shipment for order #${shipment.orderNumber}. Issue: ${shipment.status}`;

      await apiJson<{ success: boolean }>("/api/support/tickets", {
        method: "POST",
        body: JSON.stringify({
          type: "FULFILLMENT_ISSUE",
          subject,
          description,
          priority: "high",
          metadata: {
            shipmentId: shipment.id,
            orderId: shipment.orderId,
            orderNumber: shipment.orderNumber,
          },
        }),
      });

      toast.success("Support call request submitted", { id: toastId });
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[HANDLE_ACTION_ERROR]", {
        error: _errMsg,
        action,
        shipmentId: shipment.id,
        app: "merchant",
      });
      toast.error("Action failed");
    }
  };

  const handleOpenEvidence = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setEvidenceFile(null);
    setEvidenceNote("");
    setIsEvidenceOpen(true);
  };

  const handleSubmitEvidence = async () => {
    if (!selectedShipment || !evidenceFile) return;
    setIsSubmitting(true);
    const toastId = toast.loading("Uploading evidence...");

    try {
      // 1. Upload File
      const formData = new FormData();
      formData.append("file", evidenceFile);
      formData.append("folder", "evidence");

      const uploadRes = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json().catch(() => null);

      if (!uploadRes.ok) {
        throw new Error(
          uploadData?.error || uploadData?.message || "Upload failed",
        );
      }

      const url = uploadData.url;

      // 2. Submit Ticket
      await apiJson<{ success: boolean }>("/api/support/tickets", {
        method: "POST",
        body: JSON.stringify({
          type: "FULFILLMENT_EVIDENCE",
          subject: `Evidence for Order #${selectedShipment.orderNumber}`,
          description: evidenceNote || "Attached evidence for delivery issue.",
          priority: "high",
          metadata: {
            shipmentId: selectedShipment.id,
            orderId: selectedShipment.orderId,
            evidenceUrl: url,
          },
        }),
      });

      toast.success("Evidence submitted successfully", { id: toastId });
      setIsEvidenceOpen(false);
      void fetchIssues({ showLoader: false });
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[SUBMIT_EVIDENCE_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Failed to upload evidence");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Delivery Issues
          </h1>
          <p className="text-slate-500">
            Resolve delivery exceptions and failed attempts.
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => fetchIssues({ showLoader: false })}
          disabled={loading || refreshing}
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      <div className="bg-background/70 backdrop-blur-xl rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : forbidden ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="h-12 w-12 bg-background/40 backdrop-blur-sm text-slate-600 rounded-lg flex items-center justify-center mb-4">
              <Package className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">
              You don’t have access to Delivery Issues
            </h3>
            <p className="text-slate-500 max-w-sm">
              Ask the store owner/admin to grant you Fulfillment access.
            </p>
          </div>
        ) : issues.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">
              All clear!
            </h3>
            <p className="text-slate-500 max-w-sm">
              There are no active delivery exceptions or failed shipments.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-background/40 backdrop-blur-sm text-slate-600 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Order</th>
                  <th className="px-6 py-3">Issue Type</th>
                  <th className="px-6 py-3">Carrier</th>
                  <th className="px-6 py-3">Last Update</th>
                  <th className="px-6 py-3 text-right">Resolution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {issues.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-white/60 group">
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/orders/${shipment.orderId}`}
                        className="font-medium text-indigo-600 hover:underline"
                      >
                        #{shipment.orderNumber}
                      </Link>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {shipment.recipientName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                        <AlertTriangle className="h-3 w-3" />
                        {shipment.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {shipment.courierName || shipment.provider}
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {shipment.trackingCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {formatDate(shipment.updatedAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction("Retry", shipment)}
                          className="text-slate-600 hover:text-indigo-600 hover:bg-slate-100 flex items-center gap-1.5 text-xs font-medium border-slate-200 h-8"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Retry
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleAction("Support Call", shipment)}
                          className="text-slate-600 hover:text-indigo-600 hover:bg-slate-100 border-slate-200 h-8 w-8"
                          title="Contact Support"
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleOpenEvidence(shipment)}
                          className="text-slate-600 hover:text-indigo-600 hover:bg-slate-100 border-slate-200 h-8 w-8"
                          title="Provide Evidence"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={isEvidenceOpen} onOpenChange={setIsEvidenceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Evidence</DialogTitle>
            <DialogDescription>
              Upload proof of delivery or screenshots to resolve this issue.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-text-secondary">
                Additional Notes
              </label>
              <Textarea
                className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-background/70 backdrop-blur-xl px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Describe the evidence..."
                value={evidenceNote}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setEvidenceNote(e.target?.value)
                }
              />
            </div>
            <div className="grid gap-2">
              <label
                htmlFor="evidence-file"
                className="text-sm font-medium text-text-secondary"
              >
                Attachment
              </label>
              <Input id="evidence-file"
                type="file"
                accept="image/*,.pdf"
                title="Upload Evidence"
                aria-label="Upload Evidence"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEvidenceFile(e.target?.files?.[0] || null)
                }
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsEvidenceOpen(false)}
              disabled={isSubmitting}
              className="text-slate-700 hover:bg-slate-100 font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitEvidence}
              disabled={isSubmitting || !evidenceFile}
              className="text-white bg-indigo-600 hover:bg-indigo-700 font-medium flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Evidence
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
