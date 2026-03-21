"use client";
import { logger, formatCurrency, formatDate } from "@vayva/shared";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  FileText,
  Spinner as Loader2,
  CheckCircle,
} from "@phosphor-icons/react/ssr";
import { apiJson } from "@/lib/api-client-shared";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@vayva/ui";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/FileUpload";

interface Dispute {
  id: string;
  amount: number;
  currency: string;
  status: string;
  reason: string;
  dueAt: string | null;
  orderNumber: string;
  customerEmail: string;
  createdAt: string;
}

interface DisputesResponse {
  data: Dispute[];
}

export default function DisputesPage() {
  const [loading, setLoading] = useState(true);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(
    null,
  );
  const [evidenceText, setEvidenceText] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const result = await apiJson<DisputesResponse>("/api/disputes");
      setDisputes(result?.data || []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_DISPUTES_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Could not load disputes");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEvidence = (id: string) => {
    setSelectedDisputeId(id);
    setEvidenceText("");
    setFileUrl("");
    setEvidenceOpen(true);
  };

  const handleSubmitEvidence = async () => {
    if (!selectedDisputeId) return;
    if (!evidenceText.trim() && !fileUrl) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      if (evidenceText.trim()) formData.set("text", evidenceText.trim());

      // If FileUpload was used, it produces a URL. We attach it as text so ops can correlate,
      // and keep the backend as the source of truth for file handling.
      if (fileUrl) {
        formData.set("fileUrl", fileUrl);
        if (evidenceText.trim()) {
          formData.set(
            "text",
            `${(evidenceText || "").trim()}\n\nFile: ${fileUrl}`.trim(),
          );
        }
      }

      const res = await fetch(`/api/disputes/${selectedDisputeId}/evidence`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Failed to submit evidence");
      }

      logger.info("[SUBMIT_EVIDENCE_SUCCESS]", {
        disputeId: selectedDisputeId,
        app: "merchant",
      });
      toast.success("Evidence submitted successfully");
      setEvidenceOpen(false);
      void fetchDisputes();
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[SUBMIT_EVIDENCE_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Failed to upload evidence");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Disputes & Chargebacks
        </h1>
        <p className="text-gray-500">
          Manage payment disputes and submit evidence.
        </p>
      </div>

      <div className="bg-white  rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          </div>
        ) : disputes.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="h-12 w-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Zero disputes
            </h3>
            <p className="text-gray-500 max-w-sm">
              You have no active chargebacks or disputes requiring attention.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white  text-gray-700 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">Order / Customer</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Reason</th>
                  <th className="px-6 py-3">Evidence Due</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {disputes.map((dispute) => (
                  <tr key={dispute.id} className="hover:bg-white group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        #{dispute.orderNumber}
                      </div>
                      <div className="text-xs text-gray-500">
                        {dispute.customerEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {formatCurrency(dispute.amount)}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {dispute.reason}
                    </td>
                    <td className="px-6 py-4">
                      {dispute.dueAt ? (
                        <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded">
                          {formatDate(dispute.dueAt)}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${dispute.status === "OPENED"
                            ? "bg-red-500 text-red-500"
                            : (dispute as any).status === "WON"
                              ? "bg-green-50 text-green-600"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {dispute.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {dispute.status === "OPENED" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEvidence(dispute.id)}
                          className="text-green-600 hover:text-green-600 hover:bg-green-500/10 h-8"
                        >
                          <FileText className="h-3.5 w-3.5 mr-1.5" />
                          Submit Evidence
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={evidenceOpen} onOpenChange={setEvidenceOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Submit Dispute Evidence</DialogTitle>
            <DialogDescription>
              Provide detailed information to contest this dispute. This will be
              sent to the payment provider.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Explanation & Timeline
              </label>
              <Textarea
                placeholder="Describe the service/product provided, tracking details, and communication history..."
                value={evidenceText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setEvidenceText(e.target?.value)
                }
                className="min-h-[150px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Supporting Documents
              </label>
              <FileUpload
                value={fileUrl}
                onChange={setFileUrl}
                label="Upload proof of service, tracking, or communication"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                purpose="DISPUTE_EVIDENCE"
                entityId={selectedDisputeId || undefined}
                maxSizeMB={10}
              />
              <p className="text-xs text-gray-500">
                Provide screenshots of delivery confirmation, invoices, or
                customer chats.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEvidenceOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitEvidence}
              disabled={submitting || (!evidenceText.trim() && !fileUrl)}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Submit Evidence
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
